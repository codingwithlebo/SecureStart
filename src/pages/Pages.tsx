const Stub = ({ title, note }: { title: string; note: string }) => (
  <section><h1 className="text-3xl mb-2">{title}</h1><p>{note}</p></section>
);
export const Dashboard = () => <Stub title="Dashboard" note="Score, findings by priority, progress and trend (Phase 6)." />;
export const FirmSettings = () => <Stub title="Firm settings" note="Firm details and members (Phase 3)." />;
