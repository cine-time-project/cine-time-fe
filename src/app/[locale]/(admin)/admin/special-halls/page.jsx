import Link from "next/link";
import { Suspense } from "react";
import SpecialHallListTable from "@/components/dashboard/special-hall/SpecialHallListTable";
import { PageHeader } from "@/components/common/page-header/PageHeader";
import Spacer from "@/components/common/Spacer";

export const metadata = { title: "Special Halls" };

export default function SpecialHallsPage() {
  return (
    <>
      
        <PageHeader title="Special Halls" />
              <Spacer/>
       

      <Suspense fallback={<div>Loading…</div>}>
        <SpecialHallListTable />
      </Suspense>
    </>
  );
}
