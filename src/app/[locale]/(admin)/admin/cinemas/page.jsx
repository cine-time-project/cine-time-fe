//import ModuleList from "../_ModuleList";
"use client"
import React, { useEffect, useState } from "react";
import { CinemaTable } from "./CinemaTable";
import { listCinemas } from "@/services/cinema-service";

export default function AdminCinemasPage({ params }) {
  const { locale } = React.use(params);
  const [cinemas, setCinemas] = useState([]);

  useEffect(() => {
    const fetchCinemas = async () => {
      const data = await listCinemas();
      const extractedCinemaArray = data?.returnBody?.content || [];
      console.log(extractedCinemaArray);
      setCinemas(extractedCinemaArray);
    };
    fetchCinemas();
  }, []);

  return(
  <CinemaTable data={cinemas}/>
  //<ModuleList title="Cinemas" basePath={`/${locale}/admin/cinemas`} showNew />;
  )
}
