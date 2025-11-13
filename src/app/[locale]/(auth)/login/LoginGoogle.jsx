"use client";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRef } from "react";

export default function LoginGoogle({ onSuccess, pending }) {
  const { loginWithGoogle } = useAuth();
  const hasHandled = useRef(false); 
  const handleGoogleSuccess = async (credentialResponse) => {
    if (hasHandled.current) return; 
    hasHandled.current = true;

    const idToken = credentialResponse?.credential;
    if (!idToken) {
      alert("Google oturumu doğrulanamadı.");
      return;
    }

    try {
      const authUser = await loginWithGoogle(idToken);

      if (onSuccess) onSuccess(idToken);
    } catch (error) {
      alert(error?.message || "Google login başarısız oldu.");
    }
  };

  return (
    
      <div
  className="google-btn-outer"
  onMouseEnter={(e) => e.currentTarget.classList.add("is-hover")}
  onMouseLeave={(e) => e.currentTarget.classList.remove("is-hover")}
>
  <div className="google-btn-bg" />
  <div className="google-btn-inner">
    <GoogleLogin
      shape="pill"
      text="continue_with"
      size="large"
      logo_alignment="center"
      theme="outline"
      onSuccess={handleGoogleSuccess}
      onError={() => alert("Google login başarısız oldu.")}
      containerProps={{ style: { width: "auto" } }}
    />
  </div>
</div>
  );
}