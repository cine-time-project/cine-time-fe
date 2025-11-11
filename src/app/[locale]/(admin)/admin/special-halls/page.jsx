import Link from "next/link";
import { Suspense } from "react";
import SpecialHallListTable from "@/components/dashboard/special-hall/SpecialHallListTable";
import { PageHeader } from "@/components/common/page-header/PageHeader";
import Spacer from "@/components/common/Spacer";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const tSH = await getTranslations("specialHall");
  return { title: tSH("list.title") }; 
}

export default async function SpecialHallsPage() {
  const tSH = await getTranslations("specialHall");
  const tCommon = await getTranslations("common");

  return (
    <>
      <PageHeader title={tSH("list.title")} />
      <Spacer />

      <Suspense fallback={<div>{tCommon("loading")}</div>}>
        <SpecialHallListTable />
      </Suspense>
    </>
  );
}
