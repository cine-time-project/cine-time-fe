"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth/useAuth";
import { filterTilesByRoles, ICONS } from "@/helpers/data/admin-tiles";
import styles from "@/styles/dashboard.module.scss";
import { PageHeader } from "@/components/common/page-header/PageHeader";

export default function DashboardClient({ locale }) {
  const { roles = [], loading } = useAuth();
  const t = useTranslations("dashboard");

  const tiles = useMemo(() => {
    const list = filterTilesByRoles(roles).map((tile) => ({
      ...tile,
      href: `/${locale}${tile.href}`,
    }));
    return list.map((tile) => {
      const titleKey = `tiles.${tile.key}.title`;
      const descKey  = `tiles.${tile.key}.desc`;
      let title = tile.title, desc = tile.desc;
      try { const tt = t(titleKey); if (tt && tt !== titleKey) title = tt; } catch {}
      try { const dd = t(descKey);  if (dd && dd !== descKey)  desc  = dd; } catch {}
      return { ...tile, title, desc };
    });
  }, [roles, locale, t]);

  if (loading) return null;

  let pageTitle = "DASHBOARD";
  try { const tt = t("title"); if (tt && tt !== "title") pageTitle = tt; } catch {}

  return (
    <section className={styles.wrapper}>
      <PageHeader title={pageTitle} />

      <div className={styles.grid}>
        {tiles.map((t) => {
          const Icon = ICONS[t.key] || ICONS.default;
          return (
            <Link key={t.key} href={t.href} className={styles.card}>
              <div className={styles.iconWrap}>
                <Icon width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" />
              </div>
              <div className={styles.meta}>
                <div className={styles.cardTitle}>{t.title}</div>
                <div className={styles.cardDesc}>{t.desc}</div>
              </div>
              <div className={styles.chevron} aria-hidden="true">›</div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
