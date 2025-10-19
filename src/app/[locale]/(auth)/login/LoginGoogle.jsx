"use client";
import { GoogleLogin } from "@react-oauth/google";
import styles from "./login.module.scss";

export default function LoginGoogle() {
  return (
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
              alert(data?.message || "Google ile giriş başarısız oldu.");
              return;
            }

            const token = data?.returnBody?.token;
            const user = data?.returnBody;
            if (!token) {
              alert("Sunucudan geçerli bir token alınamadı.");
              return;
            }

            localStorage.setItem("authToken", token);
            localStorage.setItem("authUser", JSON.stringify(user));
            alert("Google ile giriş başarılı!");
            window.location.href = "/";
          } catch (error) {
            console.error("Google login hatası:", error);
            alert("Google girişi sırasında bir hata oluştu.");
          }
        }}
        onError={() => alert("Google girişi başarısız oldu!")}
      />
    </div>
  );
}
