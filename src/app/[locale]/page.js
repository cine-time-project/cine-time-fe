"use client";
import {useTranslations, useLocale} from 'next-intl';

export default function HomePage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  return <div style={{padding:24}}>{t('login')} – {locale}</div>;
}