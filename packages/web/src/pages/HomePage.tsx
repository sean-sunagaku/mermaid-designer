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
        <div className="max-w-4xl text-center">
          <h1 className="text-5xl font-bold text-slate-800 mb-4">
            Mermaid Diagram Editor
          </h1>
          <p className="text-xl text-slate-600 mb-12">
            ER図、フローチャート、シーケンス図をビジュアルに編集
          </p>

          {/* 図タイプ選択カード */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <DiagramTypeCard
              to="/editor"
              icon="🗃️"
              title="ER図"
              description="エンティティとリレーションを視覚的に設計"
              color="blue"
            />
            <DiagramTypeCard
              to="/flowchart"
              icon="📊"
              title="フローチャート"
              description="プロセスやアルゴリズムをフロー図で表現"
              color="green"
            />
            <DiagramTypeCard
              to="/sequence"
              icon="🔀"
              title="シーケンス図"
              description="オブジェクト間のメッセージのやり取りを可視化"
              color="purple"
            />
          </div>

          {/* 機能紹介 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

interface DiagramTypeCardProps {
  to: string;
  icon: string;
  title: string;
  description: string;
  color: 'blue' | 'green' | 'purple';
}

const DiagramTypeCard: React.FC<DiagramTypeCardProps> = ({
  to,
  icon,
  title,
  description,
  color,
}) => {
  const colorClasses = {
    blue: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50',
    green: 'border-green-200 hover:border-green-400 hover:bg-green-50',
    purple: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50',
  };

  const buttonClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
  };

  return (
    <Link
      to={to}
      className={`bg-white rounded-xl p-6 shadow-lg border-2 transition-all hover:shadow-xl ${colorClasses[color]}`}
    >
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm mb-4">{description}</p>
      <span
        className={`inline-block px-4 py-2 text-white rounded-lg text-sm font-medium ${buttonClasses[color]}`}
      >
        エディターを開く
      </span>
    </Link>
  );
};

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => (
  <div className="bg-white rounded-xl p-6 shadow-md">
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600 text-sm">{description}</p>
  </div>
);
