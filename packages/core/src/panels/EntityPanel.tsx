import React, { useCallback } from 'react';
import { EREntity, ERAttribute } from '../types/ast';
import { useERStore } from '../store';

interface EntityPanelProps {
  entity: EREntity;
}

export const EntityPanel: React.FC<EntityPanelProps> = ({ entity }) => {
  const { updateEntity, addAttribute, updateAttribute, deleteAttribute, deleteEntity } =
    useERStore();

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateEntity(entity.id, { name: e.target.value });
    },
    [entity.id, updateEntity]
  );

  const handleAddAttribute = useCallback(() => {
    addAttribute(entity.id);
  }, [entity.id, addAttribute]);

  const handleDeleteEntity = useCallback(() => {
    if (confirm(`Delete entity "${entity.name}"?`)) {
      deleteEntity(entity.id);
    }
  }, [entity.id, entity.name, deleteEntity]);

  return (
    <div className="side-panel__content">
      {/* エンティティ名 */}
      <div className="side-panel__section px-4 py-3 border-b border-slate-100">
        <label className="side-panel__label block text-sm font-medium text-slate-600 mb-1">
          Entity Name
        </label>
        <input
          type="text"
          value={entity.name}
          onChange={handleNameChange}
          className="side-panel__input w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 属性一覧 */}
      <div className="side-panel__section px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <label className="side-panel__label text-sm font-medium text-slate-600">
            Attributes
          </label>
          <button
            onClick={handleAddAttribute}
            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            + Add
          </button>
        </div>

        <div className="space-y-2">
          {entity.attributes.map((attr) => (
            <AttributeRow
              key={attr.id}
              attribute={attr}
              entityId={entity.id}
              onUpdate={(updates) => updateAttribute(entity.id, attr.id, updates)}
              onDelete={() => deleteAttribute(entity.id, attr.id)}
            />
          ))}

          {entity.attributes.length === 0 && (
            <p className="text-sm text-slate-400 italic">No attributes defined</p>
          )}
        </div>
      </div>

      {/* 削除ボタン */}
      <div className="side-panel__section px-4 py-3 border-t border-slate-100">
        <button
          onClick={handleDeleteEntity}
          className="w-full px-3 py-2 bg-red-50 text-red-600 rounded-md text-sm font-medium hover:bg-red-100 transition-colors"
        >
          Delete Entity
        </button>
      </div>
    </div>
  );
};

interface AttributeRowProps {
  attribute: ERAttribute;
  entityId: string;
  onUpdate: (updates: Partial<ERAttribute>) => void;
  onDelete: () => void;
}

const AttributeRow: React.FC<AttributeRowProps> = ({ attribute, onUpdate, onDelete }) => {
  return (
    <div className="p-2 bg-slate-50 rounded-md space-y-2">
      {/* 名前と型 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={attribute.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="name"
          className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <input
          type="text"
          value={attribute.type}
          onChange={(e) => onUpdate({ type: e.target.value })}
          placeholder="type"
          className="w-24 px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* キーチェックボックス */}
      <div className="flex items-center gap-3 text-xs">
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={attribute.isPrimaryKey}
            onChange={(e) => onUpdate({ isPrimaryKey: e.target.checked })}
            className="rounded border-slate-300 text-blue-500 focus:ring-blue-500"
          />
          <span>PK</span>
        </label>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={attribute.isForeignKey}
            onChange={(e) => onUpdate({ isForeignKey: e.target.checked })}
            className="rounded border-slate-300 text-blue-500 focus:ring-blue-500"
          />
          <span>FK</span>
        </label>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={attribute.isUnique}
            onChange={(e) => onUpdate({ isUnique: e.target.checked })}
            className="rounded border-slate-300 text-blue-500 focus:ring-blue-500"
          />
          <span>UK</span>
        </label>
        <button
          onClick={onDelete}
          className="ml-auto text-red-500 hover:text-red-700"
          title="Delete attribute"
        >
          ×
        </button>
      </div>
    </div>
  );
};
