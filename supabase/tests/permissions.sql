-- SecureStart permission tests. Run in the Supabase SQL Editor (or psql).
-- Everything happens inside a transaction that is rolled back, so no test data is left behind.
-- Result: "Success. No rows returned" means every test passed. An error starting with FAIL: names the broken rule.

begin;

do $$
declare
  a1 uuid := gen_random_uuid();  -- owner of firm A
  a2 uuid := gen_random_uuid();  -- administrator added to firm A
  b1 uuid := gen_random_uuid();  -- owner of firm B
  org_a uuid; asm uuid; asm2 uuid; f uuid; fq uuid;
  n int; sc int; failed boolean;
begin
  -- Sign-ups: the trigger must create profiles with the chosen roles.
  insert into auth.users (id, email, raw_user_meta_data) values
    (a1, 'owner-a@test.local', '{"full_name":"Owner A","role":"owner"}'),
    (a2, 'admin-a@test.local', '{"full_name":"Admin A","role":"administrator"}'),
    (b1, 'owner-b@test.local', '{"full_name":"Owner B","role":"owner"}');
  select count(*) into n from profiles where (id = a1 and role = 'owner') or (id = a2 and role = 'administrator') or (id = b1 and role = 'owner');
  if n <> 3 then raise exception 'FAIL: sign up did not create profiles with the right roles'; end if;

  -- Owner A creates firm A and adds the administrator.
  perform set_config('request.jwt.claims', json_build_object('sub', a1, 'role', 'authenticated')::text, true);
  set local role authenticated;
  org_a := create_organization('Firm A', 'Accounting', '6-20');
  perform add_administrator(org_a, 'admin-a@test.local');

  -- Owner A starts an assessment.
  insert into assessments (org_id, started_by) values (org_a, a1) returning id into asm;

  -- Owner B: cannot see or touch firm A.
  perform set_config('request.jwt.claims', json_build_object('sub', b1, 'role', 'authenticated')::text, true);
  perform create_organization('Firm B', 'Legal', '1-5');
  select count(*) into n from organizations where id = org_a;
  if n <> 0 then raise exception 'FAIL: owner B can read firm A'; end if;
  select count(*) into n from assessments where id = asm;
  if n <> 0 then raise exception 'FAIL: owner B can read firm A assessments'; end if;
  failed := false;
  begin insert into assessments (org_id, started_by) values (org_a, b1); exception when others then failed := true; end;
  if not failed then raise exception 'FAIL: owner B can create an assessment in firm A'; end if;
  failed := false;
  begin perform add_administrator(org_a, 'admin-a@test.local'); exception when others then failed := true; end;
  if not failed then raise exception 'FAIL: owner B can add administrators to firm A'; end if;

  -- Owner A answers every question and submits.
  perform set_config('request.jwt.claims', json_build_object('sub', a1, 'role', 'authenticated')::text, true);
  insert into answers (assessment_id, question_id, response)
    select asm, id, case when sort_order = 1 then 'yes'::response_type else 'no'::response_type end from questions;
  sc := submit_assessment(asm);
  if sc is null or sc < 1 or sc > 99 then raise exception 'FAIL: unexpected score %', sc; end if;
  select count(*) into n from findings where org_id = org_a;
  if n <> 29 then raise exception 'FAIL: expected 29 findings, got %', n; end if;

  -- A submitted assessment cannot be edited.
  update answers set response = 'yes' where assessment_id = asm;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: answers editable after submit'; end if;
  update assessments set score = 100 where id = asm;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: submitted assessment editable'; end if;

  -- Owner: may change status, not assignee or due date.
  select id into f from findings where org_id = org_a order by priority limit 1;
  failed := false;
  begin update findings set assignee_id = a2 where id = f; exception when others then failed := true; end;
  if not failed then raise exception 'FAIL: owner can change the assignee'; end if;
  update findings set status = 'in_progress' where id = f;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL: owner cannot change status'; end if;

  -- Owner cannot change their own role.
  failed := false;
  begin update profiles set role = 'administrator' where id = a1; exception when others then failed := true; end;
  if not failed then raise exception 'FAIL: user can change their own role'; end if;

  -- Administrator: can set assignee and due date, cannot change priority.
  perform set_config('request.jwt.claims', json_build_object('sub', a2, 'role', 'authenticated')::text, true);
  update findings set assignee_id = a2, due_date = current_date + 7 where id = f;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL: administrator cannot assign a finding'; end if;
  failed := false;
  begin update findings set priority = 'low' where id = f; exception when others then failed := true; end;
  if not failed then raise exception 'FAIL: priority can be changed directly'; end if;

  -- Firm B cannot change firm A findings.
  perform set_config('request.jwt.claims', json_build_object('sub', b1, 'role', 'authenticated')::text, true);
  update findings set status = 'accepted' where id = f;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: owner B can update firm A findings'; end if;

  -- The status change was logged.
  reset role;
  select count(*) into n from finding_events where finding_id = f and to_status = 'in_progress';
  if n <> 1 then raise exception 'FAIL: status change not logged'; end if;

  -- A later assessment auto-resolves a fixed finding.
  select question_id into fq from findings where id = f;
  perform set_config('request.jwt.claims', json_build_object('sub', a1, 'role', 'authenticated')::text, true);
  set local role authenticated;
  insert into assessments (org_id, started_by) values (org_a, a1) returning id into asm2;
  insert into answers (assessment_id, question_id, response)
    select asm2, id, case when id = fq then 'yes'::response_type else 'no'::response_type end from questions;
  perform submit_assessment(asm2);
  reset role;
  select count(*) into n from findings where id = f and status = 'resolved';
  if n <> 1 then raise exception 'FAIL: fixed finding was not auto-resolved'; end if;

  -- Questions are read-only for signed-in users.
  perform set_config('request.jwt.claims', json_build_object('sub', a1, 'role', 'authenticated')::text, true);
  set local role authenticated;
  failed := false;
  begin
    insert into questions (category, text, guidance, remediation, severity, weight, sort_order)
      values ('x', 'x', 'x', 'x', 'low', 1, 999);
  exception when others then failed := true; end;
  if not failed then raise exception 'FAIL: users can write to questions'; end if;

  -- Anonymous visitors read nothing.
  reset role;
  set local role anon;
  failed := false;
  begin perform 1 from questions limit 1; exception when others then failed := true; end;
  if not failed then raise exception 'FAIL: anonymous users can read questions'; end if;
  reset role;
end $$;

rollback;
