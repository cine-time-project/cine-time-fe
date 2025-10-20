"use client";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRef } from "react";
import styles from "./login.module.scss";

export default function LoginGoogle({ onSuccess, pending }) {
  const { loginWithGoogle } = useAuth();
  const hasHandled = useRef(false); // ✅ Tek seferlik flag

  const handleGoogleSuccess = async (credentialResponse) => {
    if (hasHandled.current) return; // Eğer zaten çalıştıysa çık
    hasHandled.current = true;

    const idToken = credentialResponse?.credential;
    if (!idToken) {
      alert("Google oturumu doğrulanamadı.");
      return;
    }

    try {
      const authUser = await loginWithGoogle(idToken);
      console.log("✅ Google login başarılı:", authUser);

      if (onSuccess) onSuccess(idToken);
    } catch (error) {
      console.error("Google login hatası:", error);
      alert(error?.message || "Google login başarısız oldu.");
    }
  };

  return (
    <div className="text-center mt-4">
      <GoogleLogin
        shape="pill"
        text="continue_with"
        size="large"
        logo_alignment="center"
        theme="outline"
        onSuccess={handleGoogleSuccess}
        onError={() => alert("Google login başarısız oldu.")}
      />
    </div>
  );
}
