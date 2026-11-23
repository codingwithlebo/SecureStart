# SecureStart — Stitch design export

This folder contains the original Google Stitch export for the SecureStart capstone.

## Included screens
- `compliance-dashboard/` — dashboard screen (HTML and PNG)
- `popia-assessment/` — assessment screen (HTML and PNG)
- `findings-remediation/` — findings list screen (HTML and PNG)
- `finding-detail-remediation/` — finding detail screen (HTML and PNG)
- `visual-identity/DESIGN.md` — palette, typography, spacing and brand guidance
- `dashboard-app-code.html` — additional standalone dashboard HTML export

## Important implementation notes
These are design references and generated standalone HTML exports, not the finished React + TypeScript application.
The HTML files should not be copied directly over the React app. Rebuild the screens as React components using the existing project stack and connect them to Supabase.

The designs currently show sample content (including Mokoena & Partners, scores, counts, people and dates). Treat all of that as placeholder/demo content. Replace it with clearly labelled seed data from the app database before the capstone demo.

Align product wording with `docs/PRD.md`: SecureStart is a guided cybersecurity assessment and remediation tracker based on CIS Controls v8 Implementation Group 1, mapped to relevant POPIA safeguards. It is not a regulator registry, automated scanner, certification, or legal compliance guarantee.

## Screens still needed
The export does not include dedicated landing, sign-up/login, first-time firm setup, or administrator home screens. Add these designs if time allows; prioritise the four required working product features in the PRD.
