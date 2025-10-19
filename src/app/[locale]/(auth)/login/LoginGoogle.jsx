"use client";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/components/providers/AuthProvider";
import styles from "./login.module.scss";

export default function LoginGoogle({ onSuccess, pending }) {
  const { loginWithGoogle } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse?.credential;
      if (!idToken) {
        alert("Google authentication failed.");
        return;
      }

      await loginWithGoogle(idToken);

      if (onSuccess) onSuccess(idToken);
    } catch (error) {
      console.error("Google login error:", error);
      alert(error?.message || "Google login failed.");
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
        onError={() => alert("Google login failed.")}
      />
    </div>
  );
}
