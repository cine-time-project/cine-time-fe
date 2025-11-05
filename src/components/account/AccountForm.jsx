"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, Form, Row, Col, Button, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";
import {
  fetchMyInfoAction,
  updateMyInfoAction,
  deleteMyAccountAction,
  changeMyPasswordAction,
} from "@/action/account-actions";

/* ------------- helpers ------------- */

// Boş stringleri eleyerek payload üret
function buildPayload(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== undefined && v !== null && String(v).trim() !== ""
    )
  );
}

// Sadece gelen alanları kullan (parçalama yok)
function readNames(u = {}) {
  return {
    firstName: (u.firstName ?? u.name ?? "").trim(),
    lastName: (u.lastName ?? u.surname ?? "").trim(),
  };
}

// Phone (BE @Pattern ile uyumlu)
const PHONE_REGEX = /^(?:\+?[1-9]\d{7,14}|\(\d{3}\)\s\d{3}-\d{4})$/;

function Labeled({ label, children }) {
  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      {children}
    </Form.Group>
  );
}

/* ------------- component ------------- */

export default function AccountForm({ showTitle = false }) {
  const tAccount = useTranslations("account");
  const tCommon = useTranslations("common");
  const tAlerts = useTranslations("alerts");
  const tSwal = useTranslations("swal");

  const [isPending, startTransition] = useTransition();

  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);

  // Profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Password form state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Initial load
  useEffect(() => {
    (async () => {
      const res = await fetchMyInfoAction();
      if (!res.ok) {
        Swal.fire(
          tCommon("error", { default: "Hata" }),
          res.error ?? "Bilgiler alınamadı.",
          "error"
        );
        setLoading(false);
        return;
      }
      const u = res.data ?? {};
      setMe(u);
      const names = readNames(u);
      setFirstName(names.firstName);
      setLastName(names.lastName);
      setEmail(u?.email ?? "");
      setPhone(u?.phone ?? u?.phoneNumber ?? "");
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Profile save
  function onSubmitProfile(e) {
    e.preventDefault();

    const v = (phone || "").trim();
    if (v && !PHONE_REGEX.test(v)) {
      const msg = tAccount("validations.phone", {
        default: "Geçersiz telefon",
      });
      setPhoneError(msg);
      Swal.fire(tCommon("error", { default: "Hata" }), msg, "error");
      return;
    }

    startTransition(async () => {
      const f = (firstName ?? "").trim();
      const l = (lastName ?? "").trim();

      const payload = buildPayload({
        email: (email ?? "").trim(),
        phone: v,
        // Geriye dönük uyumluluk için; istersen kaldır
        phoneNumber: v,
        firstName: f,
        lastName: l,
      });

      const res = await updateMyInfoAction(payload);
      if (res.ok) {
        const u = res.data ?? {};
        setMe(u);
        const names = readNames(u);
        setFirstName(names.firstName || f);
        setLastName(names.lastName || l);
        setEmail(u?.email ?? email);
        setPhone(u?.phone ?? u?.phoneNumber ?? phone);

        Swal.fire(
          tCommon("success", { default: "Başarılı" }),
          tAccount("saved", { default: "Profil güncellendi." }),
          "success"
        );
      } else {
        Swal.fire(
          tCommon("error", { default: "Hata" }),
          res.error ?? "Güncelleme başarısız.",
          "error"
        );
      }
    });
  }

  // Password save
  function onSubmitPassword(e) {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      Swal.fire(
        tCommon("error", { default: "Hata" }),
        tAlerts("warnings.enterPasswords", {
          default: "Lütfen mevcut ve yeni şifreyi girin.",
        }),
        "warning"
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      Swal.fire(
        tCommon("error", { default: "Hata" }),
        tAlerts("warnings.passwordsMustMatch", {
          default: "Yeni şifre ile doğrulama şifresi aynı olmalı.",
        }),
        "warning"
      );
      return;
    }

    startTransition(async () => {
      const res = await changeMyPasswordAction(newPassword);
      if (res.ok) {
        Swal.fire(
          tCommon("success", { default: "Başarılı" }),
          tAlerts("pwdUpdated", { default: "Şifren başarıyla güncellendi." }),
          "success"
        );
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        Swal.fire(
          tCommon("error", { default: "Hata" }),
          res.error ?? "Şifre güncelleme başarısız.",
          "error"
        );
      }
    });
  }

  // Delete account
  function onDelete() {
    Swal.fire({
      icon: "warning",
      title: tAlerts("deleteTitle", { default: "Emin misin?" }),
      text: tAlerts("deleteText", {
        default: "Hesabın kalıcı olarak silinecek.",
      }),
      showCancelButton: true,
      confirmButtonText: tCommon("yes", { default: "Evet" }),
      cancelButtonText: tCommon("cancel", { default: "İptal" }),
    }).then(async (r) => {
      if (!r.isConfirmed) return;

      const res = await deleteMyAccountAction();

      if (res.ok) {
        Swal.fire(
          tCommon("success", { default: "Başarılı" }),
          tAlerts("deleted", { default: "Hesabın silindi. Çıkış yapılıyor…" }),
          "success"
        );
        try {
          localStorage.removeItem("token");
          localStorage.removeItem("authToken");
          localStorage.removeItem("authUser");
          document.cookie = "authRoles=; Max-Age=0; path=/";
        } catch {}
        window.location.href = "/";
        return;
      }

      const msg = String(res.error || "");
      const isBuiltIn =
        /built[-_ ]?in/i.test(msg) ||
        /BUILT_IN_USER_DELETE_NOT_ALLOWED/.test(msg);

      if (isBuiltIn) {
        Swal.fire(
          tSwal("errorTitle", { default: "Hata" }),
          tAlerts("errors.deleteFailedBuiltIn", {
            default: "Yerleşik (built-in) admin silinemez.",
          }),
          "error"
        );
      } else {
        Swal.fire(
          tSwal("errorTitle", { default: "Hata" }),
          msg ||
            tAlerts("errors.deleteFailed", {
              default: "Hesap silme başarısız.",
            }),
          "error"
        );
      }
    });
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <>
    

      <div className="container py-4">
       

        <Row className="g-4">
          {/* Profil Kartı */}
          <Col md={7}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title className="mb-3">
                  {tAccount("profile", { default: "Profil" })}
                </Card.Title>

                <Form onSubmit={onSubmitProfile}>
                  <Row>
                    <Col md={6}>
                      <Labeled
                        label={tAccount("fields.firstName", { default: "Ad" })}
                      >
                        <Form.Control
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder={tAccount("fields.firstName", {
                            default: "Ad",
                          })}
                        />
                      </Labeled>
                    </Col>
                    <Col md={6}>
                      <Labeled
                        label={tAccount("fields.lastName", { default: "Soyad" })}
                      >
                        <Form.Control
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder={tAccount("fields.lastName", {
                            default: "Soyad",
                          })}
                        />
                      </Labeled>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Labeled
                        label={tAccount("fields.email", { default: "E-posta" })}
                      >
                        <Form.Control
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          type="email"
                          placeholder="ornek@site.com"
                        />
                      </Labeled>
                    </Col>
                    <Col md={6}>
  <Labeled label={tAccount("fields.phone", { default: "Telefon" })}>
    <Form.Control
      value={phone}
      onChange={(e) => {
        const v = e.target.value;
        setPhone(v);
        const ok = !v || PHONE_REGEX.test(v.trim());
        setPhoneError(
          ok ? "" : tAccount("validations.phone", { default: "Geçersiz telefon" })
        );
      }}
      placeholder="+905551112233"
      isInvalid={!!phoneError}
      isValid={!!phone && !phoneError}
    />
    {phoneError ? (
      <Form.Control.Feedback type="invalid">
        {phoneError}
      </Form.Control.Feedback>
    ) : null}
  </Labeled>
</Col>

                  </Row>

                  <div className="d-flex gap-2">
                 <Button
  type="submit"
  disabled={isPending}
  className="w-25"   // örn. yarım genişlik
>
  {isPending ? <Spinner size="sm" /> : tCommon("save", { default: "Kaydet" })}
</Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Güvenlik Kartı */}
          <Col md={5}>
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <Card.Title className="mb-3">
                  {tAccount("security", { default: "Güvenlik" })}
                </Card.Title>

                <Form onSubmit={onSubmitPassword}>
                  <Labeled
                    label={tAccount("fields.oldPassword", {
                      default: "Mevcut Şifre",
                    })}
                  >
                    <Form.Control
                      type="password"
                      autoComplete="current-password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                  </Labeled>

                  <Labeled
                    label={tAccount("fields.newPassword", {
                      default: "Yeni Şifre",
                    })}
                  >
                    <Form.Control
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </Labeled>

                  <Labeled
                    label={tAccount("fields.confirmPassword", {
                      default: "Yeni Şifre (Tekrar)",
                    })}
                  >
                    <Form.Control
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </Labeled>

                  <Button type="submit" variant="secondary" disabled={isPending}>
                    {isPending ? (
                      <Spinner size="sm" />
                    ) : (
                      tAccount("actions.resetPassword", {
                        default: "Şifreyi Güncelle",
                      })
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>

            <Card className="shadow-sm border-danger">
              <Card.Body>
                <Card.Title className="text-danger">
                  {tAccount("dangerZone", { default: "Tehlikeli Bölge" })}
                </Card.Title>
                <p className="mb-3">
                  {tAccount("delete.warn", {
                    default:
                      "Hesabınızı silerseniz tüm verileriniz kalıcı olarak kaldırılır.",
                  })}
                </p>
                <Button variant="danger" onClick={onDelete}>
                  {tAccount("actions.deleteAccount", {
                    default: "Hesabımı Sil",
                  })}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}
