import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@mermaid-er-editor/core';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* ヘッダー */}
      <header className="absolute top-4 right-4">
        <LanguageSwitcher />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl text-center">
          <h1 className="text-5xl font-bold text-slate-800 mb-4">{t('homePage.title')}</h1>
          <p className="text-xl text-slate-600 mb-8">{t('homePage.description')}</p>

          <div className="flex gap-4 justify-center">
            <Link
              to="/editor"
              className="px-8 py-3 bg-blue-500 text-white rounded-lg font-medium text-lg hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl"
            >
              {t('homePage.startEditing')}
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon="🎨"
              title={t('homePage.visualEditing')}
              description={t('homePage.visualEditingDesc')}
            />
            <FeatureCard
              icon="🔄"
              title={t('homePage.bidirectionalSync')}
              description={t('homePage.bidirectionalSyncDesc')}
            />
            <FeatureCard
              icon="📦"
              title={t('homePage.exportReady')}
              description={t('homePage.exportReadyDesc')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-white rounded-xl p-6 shadow-md">
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600 text-sm">{description}</p>
  </div>
);
