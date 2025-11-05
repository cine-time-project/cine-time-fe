import AccountForm from "@/components/account/AccountForm";
import SectionTitle from "@/components/common/SectionTitle";

export const metadata = { title: "My Account" };

export default function AccountPage() {
  return (
    <div className="container py-4">
      <SectionTitle
        level={2}
        align="start"
        padding=""
        textColor="text-white"   // <-- beyaz
      >
        My Account
      </SectionTitle>

      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <AccountForm showTitle={false} /> {/* kart içi başlık kapalı */}
        </div>
      </div>
    </div>
  );
}
