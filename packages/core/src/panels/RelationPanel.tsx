import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ERRelation, Cardinality } from '../types/ast';
import { useERStore } from '../store';

interface RelationPanelProps {
  relation: ERRelation;
}

type CardinalityOption = {
  value: Cardinality;
  labelKey: string;
  symbol: string;
};

const CARDINALITY_OPTIONS: CardinalityOption[] = [
  { value: 'EXACTLY_ONE', labelKey: 'relationPanel.exactlyOne', symbol: '||' },
  { value: 'ZERO_OR_ONE', labelKey: 'relationPanel.zeroOrOne', symbol: '|o' },
  { value: 'ONE_OR_MORE', labelKey: 'relationPanel.oneOrMore', symbol: '|{' },
  { value: 'ZERO_OR_MORE', labelKey: 'relationPanel.zeroOrMore', symbol: 'o{' },
];

export const RelationPanel: React.FC<RelationPanelProps> = ({ relation }) => {
  const { t } = useTranslation();
  const { entities, updateRelation, deleteRelation } = useERStore();

  const sourceEntity = entities.find((e) => e.id === relation.sourceEntityId);
  const targetEntity = entities.find((e) => e.id === relation.targetEntityId);

  const handleSourceCardinalityChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateRelation(relation.id, { sourceCardinality: e.target.value as Cardinality });
    },
    [relation.id, updateRelation]
  );

  const handleTargetCardinalityChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateRelation(relation.id, { targetCardinality: e.target.value as Cardinality });
    },
    [relation.id, updateRelation]
  );

  const handleLabelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateRelation(relation.id, { label: e.target.value || undefined });
    },
    [relation.id, updateRelation]
  );

  const handleIdentifyingChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateRelation(relation.id, { identifying: e.target.checked });
    },
    [relation.id, updateRelation]
  );

  const handleDeleteRelation = useCallback(() => {
    if (confirm(t('relationPanel.deleteConfirm'))) {
      deleteRelation(relation.id);
    }
  }, [relation.id, deleteRelation, t]);

  return (
    <div className="side-panel__content">
      {/* エンティティ表示 */}
      <div className="side-panel__section px-4 py-3 border-b border-slate-100">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-600">
            {sourceEntity?.name || t('relationPanel.unknown')}
          </span>
          <span className="text-slate-400">→</span>
          <span className="font-medium text-slate-600">
            {targetEntity?.name || t('relationPanel.unknown')}
          </span>
        </div>
      </div>

      {/* Source Cardinality */}
      <div className="side-panel__section px-4 py-3 border-b border-slate-100">
        <label className="side-panel__label block text-sm font-medium text-slate-600 mb-1">
          {t('relationPanel.sourceCardinality', { name: sourceEntity?.name })}
        </label>
        <select
          value={relation.sourceCardinality}
          onChange={handleSourceCardinalityChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {CARDINALITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.symbol} - {t(opt.labelKey)}
            </option>
          ))}
        </select>
      </div>

      {/* Target Cardinality */}
      <div className="side-panel__section px-4 py-3 border-b border-slate-100">
        <label className="side-panel__label block text-sm font-medium text-slate-600 mb-1">
          {t('relationPanel.targetCardinality', { name: targetEntity?.name })}
        </label>
        <select
          value={relation.targetCardinality}
          onChange={handleTargetCardinalityChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {CARDINALITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.symbol} - {t(opt.labelKey)}
            </option>
          ))}
        </select>
      </div>

      {/* Label */}
      <div className="side-panel__section px-4 py-3 border-b border-slate-100">
        <label className="side-panel__label block text-sm font-medium text-slate-600 mb-1">
          {t('relationPanel.labelOptional')}
        </label>
        <input
          type="text"
          value={relation.label || ''}
          onChange={handleLabelChange}
          placeholder={t('relationPanel.labelPlaceholder')}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Identifying Relationship */}
      <div className="side-panel__section px-4 py-3 border-b border-slate-100">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={relation.identifying}
            onChange={handleIdentifyingChange}
            className="rounded border-slate-300 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-600">{t('relationPanel.identifyingRelation')}</span>
        </label>
        <p className="text-xs text-slate-400 mt-1">{t('relationPanel.nonIdentifyingHint')}</p>
      </div>

      {/* 削除ボタン */}
      <div className="side-panel__section px-4 py-3">
        <button
          onClick={handleDeleteRelation}
          className="w-full px-3 py-2 bg-red-50 text-red-600 rounded-md text-sm font-medium hover:bg-red-100 transition-colors"
        >
          {t('relationPanel.deleteRelation')}
        </button>
      </div>
    </div>
  );
};
