import Link from "next/link";
import { Suspense } from "react";
import SpecialHallListTable from "@/components/dashboard/special-hall/SpecialHallListTable";

export const metadata = { title: "Special Halls" };

export default function SpecialHallsPage() {
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Special Halls</h2>
        <Link className="btn btn-primary" href="./special-halls/new">
          + New
        </Link>
      </div>

      <Suspense fallback={<div>Loading…</div>}>
        <SpecialHallListTable />
      </Suspense>
    </div>
  );
}
