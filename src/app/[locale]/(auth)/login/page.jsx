"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {Alert,Button,Card,Col,Container,Form,InputGroup,Row,
} from "react-bootstrap";
import { useLocale, useTranslations } from "next-intl";
import { login as loginRequest } from "@/services/auth-service";
import { GoogleLogin } from "@react-oauth/google";
import { config } from "@/helpers/config";
import styles from "./login.module.scss";

export default function LoginPage() {
  const locale = useLocale();
  const router = useRouter();

  const tAuth = useTranslations("auth");
  const tForms = useTranslations("forms");
  const tErrors = useTranslations("errors");
  const tPlaceholders = useTranslations("placeholders");

  const resolveErrorMessage = (error) =>
    error?.message ?? (error?.key ? tErrors(error.key, { default: "" }) : "");

  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [rememberMe, setRememberMe] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [pending, setPending] = useState(false);

  const updateField = (name) => (event) => {
    const value = event?.target?.value ?? "";
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};
    const identifier = formData.identifier.trim();
    const password = formData.password;

    if (!identifier) nextErrors.identifier = { key: "required" };
    if (!password) nextErrors.password = { key: "required" };

    setFieldErrors(nextErrors);
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setAlert(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) return;

    setPending(true);
    try {
      const payload = {
        phoneOrEmail: formData.identifier.trim(),
        password: formData.password,
      };

      const response = await loginRequest(payload);
      const token =
        response?.accessToken ??
        response?.token ??
        response?.access_token ??
        response?.data?.accessToken ??
        response?.data?.token ??
        response?.data?.access_token;

      if (!token)
        throw Object.assign(new Error("Missing token"), { status: 500 });

      localStorage.setItem("authToken", token);
      localStorage.setItem("authRemember", rememberMe ? "1" : "0");

      if (response?.refreshToken ?? response?.data?.refreshToken) {
        const refresh = response.refreshToken ?? response.data?.refreshToken;
        localStorage.setItem("refreshToken", refresh);
      }
      if (response?.user ?? response?.data?.user) {
        const user = response.user ?? response.data?.user;
        localStorage.setItem("authUser", JSON.stringify(user));
      }

      setAlert({ type: "success", message: tAuth("successLogin") });
      setFormData({ identifier: "", password: "" });
      setFieldErrors({});
      router.push(`/${locale}`);
    } catch (error) {
      const status =
        error?.status ??
        error?.response?.status ?? // axios olursa
        0;

      // BE'nin sık döndürdükleri: 401/423
      if (status === 401) {
        setAlert({ type: "danger", message: tAuth("invalidCredentials") });
      } else if (status === 423) {
        setAlert({ type: "danger", message: tAuth("locked") });
      } else {
        // Diğer tüm durumlar için i18n’e map et
        const key =
          status === 400
            ? "invalid"
            : status === 500
            ? "500"
            : status === 0
            ? "network"
            : "unknown";

        // Sunucu anlamlı bir mesaj gönderdiyse onu kullan; yoksa i18n
        const serverMsg =
          (error?.data &&
            typeof error.data === "object" &&
            error.data?.message) ||
          error?.message ||
          "";

        setAlert({ type: "danger", message: serverMsg || tErrors(key) });
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <Container className={styles.loginPageContainer}>
        <Row className="justify-content-center">
          <Col xs={12} md={9} lg={6} xl={5} xxl={4}>
            <Card className={styles.loginCard}>
              <Card.Body>
                <div className={styles.loginCardHeader}>
                  <p className={styles.loginCardEyebrow}>
                    {tAuth("loginEyebrow")}
                  </p>
                  <h1 className={styles.loginCardTitle}>
                    {tAuth("loginWelcome")}
                  </h1>
                  <p className={styles.loginCardSubtitle}>
                    {tAuth("loginDescription")}
                  </p>
                </div>

                <div className={styles.loginCardTabs} role="tablist">
                  <span
                    className={`${styles.loginCardTab} is-active`}
                    aria-current="page"
                  >
                    {tAuth("titleLogin")}
                  </span>
                  <Link
                    href={`/${locale}/register`}
                    className={styles.loginCardTab}
                    role="tab"
                  >
                    {tAuth("register")}
                  </Link>
                </div>

                {alert && (
                  <Alert
                    variant={alert.type === "success" ? "success" : "danger"}
                    dismissible
                    onClose={() => setAlert(null)}
                    className={styles.loginCardAlert}
                  >
                    {alert.message}
                  </Alert>
                )}

                {/* Giriş Formu */}
                <Form
                  noValidate
                  onSubmit={handleSubmit}
                  className={styles.loginCardForm}
                >
                  {/* E-posta / telefon alanı */}
                  <Form.Group className="mb-3" controlId="login-identifier">
                    <Form.Label>{tForms("emailOrPhone")}</Form.Label>
                    <InputGroup hasValidation>
                      <InputGroup.Text aria-hidden="true">
                        <i className="pi pi-user" />
                      </InputGroup.Text>
                      <Form.Control
                        name="identifier"
                        type="text"
                        value={formData.identifier}
                        onChange={updateField("identifier")}
                        placeholder={tPlaceholders("enterEmailOrPhone")}
                        autoComplete="username"
                        required
                        isInvalid={!!fieldErrors.identifier}
                      />
                      <Form.Control.Feedback type="invalid">
                        {resolveErrorMessage(fieldErrors.identifier)}
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>

                  {/* Şifre alanı */}
                  <Form.Group className="mb-3" controlId="login-password">
                    <Form.Label>{tForms("password")}</Form.Label>
                    <InputGroup hasValidation>
                      <InputGroup.Text aria-hidden="true">
                        <i className="pi pi-lock" />
                      </InputGroup.Text>
                      <Form.Control
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={updateField("password")}
                        placeholder={tPlaceholders("enterPassword")}
                        autoComplete="current-password"
                        required
                        isInvalid={!!fieldErrors.password}
                      />
                      <Form.Control.Feedback type="invalid">
                        {resolveErrorMessage(fieldErrors.password)}
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>

                  {/* Hatırlama ve Şifre Unutma */}
                  <div className={styles.loginCardMeta}>
                    <Form.Check
                      id="login-remember"
                      type="checkbox"
                      label={tForms("rememberMe")}
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                    />
                    <Link
                      href={`/${locale}/reset-password`}
                      className={styles.loginCardLink}
                    >
                      {tAuth("forgotPassword")}
                    </Link>
                  </div>

                  {/* Giriş butonu */}
                  <Button
                    type="submit"
                    className={styles.loginCardSubmit}
                    disabled={pending}
                    aria-busy={pending}
                  >
                    {pending && (
                      <span
                        className="spinner-border spinner-border-sm"
                        aria-hidden="true"
                      />
                    )}
                    <span className={styles.loginCardSubmitLabel}>
                      {pending ? tAuth("loggingIn") : tAuth("login")}
                    </span>
                  </Button>
                </Form>

                {/* Google Login Butonu */}
                <div className="text-center mt-4">
                  <GoogleLogin
                    shape="pill"
                    text="continue_with"
                    size="large"
                    logo_alignment="center"
                    theme="outline"
                    onSuccess={async (credentialResponse) => {
                      try {
                        const idToken = credentialResponse?.credential;
                        if (!idToken) {
                          alert("Google kimlik doğrulama başarısız oldu.");
                          return;
                        }

                        // Backend'e gönder
                        const response = await fetch(
                          `${
                            process.env.NEXT_PUBLIC_API_BASE_URL ||
                            "http://localhost:8090/api"
                          }/google`,
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ idToken }),
                          }
                        );

                        const data = await response.json();

                        if (!response.ok) {
                          console.error("Google login backend hatası:", data);
                          alert(
                            data?.message || "Google ile giriş başarısız oldu."
                          );
                          return;
                        }

                        // Backend JWT token ve kullanıcı bilgilerini al
                        const token = data?.returnBody?.token;
                        const user = data?.returnBody;

                        if (!token) {
                          alert("Sunucudan geçerli bir token alınamadı.");
                          return;
                        }

                        // LocalStorage’a kaydet
                        localStorage.setItem("authToken", token);
                        localStorage.setItem("authUser", JSON.stringify(user));

                        alert("Google ile giriş başarılı!");
                        window.location.href = "/"; // veya router.push(`/${locale}`);
                      } catch (error) {
                        console.error("Google login hatası:", error);
                        alert("Google girişi sırasında bir hata oluştu.");
                      }
                    }}
                    onError={() => {
                      alert("Google girişi başarısız oldu!");
                    }}
                  />
                </div>

                {/* Alt Bilgi */}
                <div className={styles.loginCardFooter}>
                  <span>{tAuth("noAccount")}</span>
                  <Link
                    href={`/${locale}/register`}
                    className={styles.loginCardFooterLink}
                  >
                    {tAuth("register")}
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
