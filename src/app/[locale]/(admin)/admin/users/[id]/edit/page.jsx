"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EditPlaceholderPage() {
  const router = useRouter();

  // Kullanıcı yanlışlıkla buraya gelirse ana kullanıcı listesine yönlendir
  useEffect(() => {
    router.replace("../"); // Bir üst klasöre (users listesine) gider
  }, [router]);

  return (
    <div className="p-4 text-center text-muted">
      <h2>Bu sayfa artık kullanılmıyor.</h2>
      <p>Kullanıcı düzenleme sayfasına yönlendiriliyorsunuz...</p>
    </div>
  );
}
