"use client";
import { useEffect, useState } from "react";
import {
  useRouter,
  useSearchParams,
  usePathname,
  useNavigation,
} from "next/navigation";
import { Container, Card } from "react-bootstrap";
import { useLocale, useTranslations } from "next-intl";
import { register as registerRequest } from "@/services/auth-service";
import { normalizePhoneForApi } from "@/helpers/phone";
import styles from "./register.module.scss";

import RegisterHeader from "./RegisterHeader";
import RegisterTabs from "./RegisterTabs";
import RegisterAlert from "./RegisterAlert";
import RegisterForm from "./RegisterForm";
import RegisterFooter from "./RegisterFooter";

export default function RegisterPage() {
  const locale = useLocale();
  const router = useRouter();
  const tAuth = useTranslations("auth");
  const tErrors = useTranslations("errors");
  const navigation = useNavigation();
  const [preUser, setPreUser] = useState(null);
  const [alert, setAlert] = useState(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (navigation?.state?.preUser) {
      setPreUser(navigation.state.preUser);
    }
  }, [navigation?.state]);

  useEffect(() => {
    if (preUser) {
      console.log("Google pre-register verisi:", preUser);
      // örnek: form alanlarını otomatik doldur
      // setFormData({ email: preUser.email, name: preUser.name, ... })
    }
  }, [preUser]);

  const handleRegister = async (formData, setFieldErrors, resetForm) => {
    setAlert(null);
    setPending(true);

    try {
      const payload = {
        firstName: formData.name.trim(),
        lastName: formData.surname.trim(),
        email: formData.email.trim(),
        phone: normalizePhoneForApi(formData.phone.trim()),
        birthDate: `${formData.birthYear}-${formData.birthMonth}-${formData.birthDay}`,
        gender: (formData.gender || "").toUpperCase(),
        password: formData.password,
        confirmPassword: formData.passwordRepeat,
      };

      await registerRequest(payload);
      setAlert({ type: "success", message: tAuth("successRegister") });
      resetForm();
      router.push(`/${locale}/login`);
    } catch (error) {
      const details =
        error?.data?.errors ||
        error?.data?.fieldErrors ||
        error?.data?.violations;
      if (Array.isArray(details) && details.length) {
        const next = {};
        details.forEach((e) => {
          const field = e.field || e.property || e.path || e.param;
          next[field] = { message: e.defaultMessage || tErrors("invalid") };
        });
        setFieldErrors(next);
        setAlert({ type: "danger", message: tErrors("invalid") });
      } else {
        const status = error?.status ?? 0;
        const fallbackKey =
          status === 409
            ? "accountExists"
            : status === 400
            ? "invalid"
            : status === 500
            ? "500"
            : status === 0
            ? "network"
            : "unknown";
        setAlert({
          type: "danger",
          message: error?.data?.message || tErrors(fallbackKey),
        });
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.registerPage}>
      <Container className={styles.registerPageContainer}>
        <Card className={styles.registerCard}>
          <Card.Body>
            <RegisterHeader />
            <RegisterTabs />
            <RegisterAlert alert={alert} setAlert={setAlert} />
            <RegisterForm
              pending={pending}
              onRegister={handleRegister}
              setAlert={setAlert}
            />
            <RegisterFooter />
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
