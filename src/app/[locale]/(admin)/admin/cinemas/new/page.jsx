"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Card, Container } from "react-bootstrap";
import { CinemaForm } from "@/components/dashboard/cinema/new/CinemaForm";
import { useAuth } from "@/lib/auth/useAuth";
import { PageHeader } from "@/components/common/page-header/PageHeader";
import { BackButton } from "@/components/common/form-fields/BackButton";
import { useTranslations } from "next-intl";

export default function CreateCinemaPage() {
  const { locale } = useParams();
  const { token } = useAuth();
  const tCinemas = useTranslations("cinemas");
  return (
    <Container>
      <PageHeader title={tCinemas("addNewCinema")} leftActions={<BackButton title={tCinemas("back")} />} />
      {/* Step 1: Form */}

      <Card>
        <CinemaForm token={token} locale={locale} tCinemas={tCinemas}/>
      </Card>
    </Container>
  );
}
