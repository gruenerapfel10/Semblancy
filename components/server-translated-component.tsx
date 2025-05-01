import { getTranslations } from '@/lib/i18n/server';

export async function ServerTranslatedComponent() {
  const { t } = await getTranslations();
  
  return (
    <div>
      <h2>{t('common.changeLanguage')}</h2>
      <p>{t('sidebar.title')}</p>
    </div>
  );
} 