const Stub = ({ title, note }: { title: string; note: string }) => (
  <section><h1 className="text-3xl mb-2">{title}</h1><p>{note}</p></section>
);
export const Dashboard = () => <Stub title="Dashboard" note="Score, findings by priority, progress and trend (Phase 6)." />;
export const Assessment = () => <Stub title="Assessment" note="Guided questionnaire (Phase 4)." />;
export const Findings = () => <Stub title="Findings" note="Risk register and remediation tracking (Phase 5)." />;
export const FirmSettings = () => <Stub title="Firm settings" note="Firm details and members (Phase 3)." />;
