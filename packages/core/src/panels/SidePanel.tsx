import React from 'react';
import { useTranslation } from 'react-i18next';
import { useERStore } from '../store';
import { EntityPanel } from './EntityPanel';
import { RelationPanel } from './RelationPanel';

export const SidePanel: React.FC = () => {
  const { t } = useTranslation();
  const { entities, relations, selectedEntityId, selectedRelationId } =
    useERStore();

  const selectedEntity = entities.find((e) => e.id === selectedEntityId);
  const selectedRelation = relations.find((r) => r.id === selectedRelationId);

  if (!selectedEntity && !selectedRelation) {
    return (
      <div className="side-panel bg-white border-l border-slate-200 w-80 h-full">
        <div className="side-panel__header px-4 py-3 border-b border-slate-200 font-semibold text-slate-800">
          {t('sidePanel.properties')}
        </div>
        <div className="p-4 text-sm text-slate-500">
          {t('sidePanel.selectHint')}
        </div>
      </div>
    );
  }

  return (
    <div className="side-panel bg-white border-l border-slate-200 w-80 h-full overflow-y-auto">
      <div className="side-panel__header px-4 py-3 border-b border-slate-200 font-semibold text-slate-800">
        {selectedEntity
          ? t('sidePanel.entity', { name: selectedEntity.name })
          : t('sidePanel.relation')}
      </div>

      {selectedEntity && <EntityPanel entity={selectedEntity} />}
      {selectedRelation && <RelationPanel relation={selectedRelation} />}
    </div>
  );
};
