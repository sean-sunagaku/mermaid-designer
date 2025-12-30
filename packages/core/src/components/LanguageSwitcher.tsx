import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <select
      value={i18n.language}
      onChange={handleLanguageChange}
      className="px-2 py-1 bg-slate-700 text-slate-200 text-sm rounded border border-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
    >
      <option value="en">{t('languageSwitcher.en')}</option>
      <option value="ja">{t('languageSwitcher.ja')}</option>
    </select>
  );
};
