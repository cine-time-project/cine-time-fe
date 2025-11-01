import { Card } from "primereact/card";

export function CardGroup({ title, children }) {
  return (
    <Card
      title={title}
      className="shadow-2 border-round-2xl p-4 mb-4"
      style={{ border: "1px solid var(--surface-border)" }}
    >
      {children}
    </Card>
  );
}
