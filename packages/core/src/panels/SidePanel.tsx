import React from 'react';
import { useERStore } from '../store';
import { EntityPanel } from './EntityPanel';
import { RelationPanel } from './RelationPanel';

export const SidePanel: React.FC = () => {
  const { entities, relations, selectedEntityId, selectedRelationId } = useERStore();

  const selectedEntity = entities.find((e) => e.id === selectedEntityId);
  const selectedRelation = relations.find((r) => r.id === selectedRelationId);

  if (!selectedEntity && !selectedRelation) {
    return (
      <div className="side-panel bg-white border-l border-slate-200 w-80 h-full">
        <div className="side-panel__header px-4 py-3 border-b border-slate-200 font-semibold text-slate-800">
          Properties
        </div>
        <div className="p-4 text-sm text-slate-500">
          Select an entity or relation to edit its properties.
        </div>
      </div>
    );
  }

  return (
    <div className="side-panel bg-white border-l border-slate-200 w-80 h-full overflow-y-auto">
      <div className="side-panel__header px-4 py-3 border-b border-slate-200 font-semibold text-slate-800">
        {selectedEntity ? `Entity: ${selectedEntity.name}` : 'Relation'}
      </div>

      {selectedEntity && <EntityPanel entity={selectedEntity} />}
      {selectedRelation && <RelationPanel relation={selectedRelation} />}
    </div>
  );
};
