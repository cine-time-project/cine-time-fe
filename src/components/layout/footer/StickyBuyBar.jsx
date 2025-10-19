import TicketSelector from "@/components/tickets/TicketSelector";

export default function StickyBuyBar() {
  return (
    <div className="sticky-buybar">
      <div className="sticky-buybar__inner container">
        <div className="sticky-buybar__title">🎟️ Bilet Al</div>
        <div className="sticky-buybar__selector">
          <TicketSelector />
        </div>
      </div>
    </div>
  );
}
