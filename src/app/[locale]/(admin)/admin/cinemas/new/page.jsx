"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Card, Container } from "react-bootstrap";
import { CinemaForm } from "@/components/dashboard/cinema/new/CinemaForm";
import { useAuth } from "@/lib/auth/useAuth";
import { PageHeader } from "@/components/common/page-header/PageHeader";
import { BackButton } from "@/components/common/form-fields/BackButton";

export default function CreateCinemaPage() {
  const { locale } = useParams();
  const { token } = useAuth();

  return (
    <Container>
      <PageHeader title="Create New Cinema" leftActions={<BackButton />} />
      {/* Step 1: Form */}

      <Card>
        <CinemaForm token={token} locale={locale} />
      </Card>
    </Container>
  );
}
