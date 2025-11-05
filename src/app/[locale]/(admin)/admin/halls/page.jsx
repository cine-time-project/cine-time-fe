"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getHalls } from "@/service/hall-service";
import { HallList } from "@/components/dashboard/hall/HallList";
import { getToken } from "@/lib/utils/http";
import { swAlert } from "@/helpers/sweetalert";
import { PageHeader } from "@/components/common/page-header/PageHeader";
import Spacer from "@/components/common/Spacer";

export default function AdminHallsPage() {
  const locale = useLocale();
  const t = useTranslations("hall");

  const [data, setData] = useState(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [token, setToken] = useState("");

  // Token yükle
  useEffect(() => {
    setToken(getToken());
  }, []);

  // Salon verilerini getir
  const loadData = async (pageIndex = 0, q = "") => {
    try {
      const res = await getHalls(pageIndex, 10, token);
      setData(res);
    } catch (err) {
      console.error("Failed to fetch halls:", err);
      swAlert(t("loadError"), "error");
    }
  };

  useEffect(() => {
    if (token) loadData(page, search);
  }, [token, page, search]);

  // Event handlerlar
  const handlePageChange = (nextPage) => setPage(nextPage);
  const handleSearch = (query) => {
    setSearch(query);
    setPage(0);
  };
  const handleDeleted = () => loadData(page, search);

  return (
    <>
      <PageHeader title={t("listTitle")} />
      <Spacer />
      <div className="p-4">
        <HallList
          data={data}
          locale={locale}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          onDeleted={handleDeleted}
        />
      </div>
      <Spacer />
    </>
  );
}
