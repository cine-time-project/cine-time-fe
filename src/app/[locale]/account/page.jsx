import AccountForm from "@/components/account/AccountForm";
import SectionTitle from "@/components/common/SectionTitle";
import {getTranslations} from "next-intl/server"; // ⬅️ server i18n

// (İsteğe bağlı ama doğru) Başlığı da yerelleştirmek için:
export async function generateMetadata({params}) {
  const t = await getTranslations({locale: params.locale, namespace: "account"});
  return { title: t("title", {default: "My Account"}) };
}

export default async function AccountPage({params}) {
  const t = await getTranslations({locale: params.locale, namespace: "account"});

  return (
    <div className="container py-4">
      <SectionTitle level={2} align="start" padding="" textColor="text-white">
        {t("title", {default: "My Account"})}
      </SectionTitle>

      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <AccountForm showTitle={false} />
        </div>
      </div>
    </div>
  );
}
