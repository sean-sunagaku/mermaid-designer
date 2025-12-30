import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useTranslation } from 'react-i18next';
import { EntityNodeData } from '../types/flow';
import { useERStore } from '../store';
import { COMMON_ATTRIBUTE_TYPES } from '../types/ast';

const getAttributeIcon = (
  isPrimaryKey: boolean,
  isForeignKey: boolean,
  isUnique: boolean
): string | null => {
  if (isPrimaryKey) return '🔑';
  if (isForeignKey) return '🔗';
  if (isUnique) return '✨';
  return null;
};

// 属性行コンポーネント（インライン編集対応）
const CUSTOM_TYPE_VALUE = '__custom__';

const AttributeRow = memo(({
  attr,
  entityId,
  updateAttribute,
}: {
  attr: { id: string; name: string; type: string; isPrimaryKey: boolean; isForeignKey: boolean; isUnique: boolean };
  entityId: string;
  updateAttribute: (entityId: string, attrId: string, updates: { name?: string; type?: string }) => void;
}) => {
  const isCommonType = COMMON_ATTRIBUTE_TYPES.includes(attr.type as typeof COMMON_ATTRIBUTE_TYPES[number]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingType, setIsEditingType] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(!isCommonType && attr.type !== '');
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    if (isEditingType && !isCustomMode && selectRef.current) {
      selectRef.current.focus();
    }
  }, [isEditingType, isCustomMode]);

  useEffect(() => {
    if (isEditingType && isCustomMode && customInputRef.current) {
      customInputRef.current.focus();
      customInputRef.current.select();
    }
  }, [isEditingType, isCustomMode]);

  const handleNameDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditName(attr.name);
    setIsEditingName(true);
  };

  const handleNameSave = () => {
    if (editName.trim()) {
      updateAttribute(entityId, attr.id, { name: editName.trim() });
    }
    setIsEditingName(false);
  };

  const handleTypeDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditType(attr.type);
    setIsEditingType(true);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === CUSTOM_TYPE_VALUE) {
      setIsCustomMode(true);
      setEditType('');
    } else {
      updateAttribute(entityId, attr.id, { type: value });
      setIsEditingType(false);
    }
  };

  const handleCustomSave = () => {
    if (editType.trim()) {
      updateAttribute(entityId, attr.id, { type: editType.trim() });
    }
    setIsEditingType(false);
  };

  const icon = getAttributeIcon(attr.isPrimaryKey, attr.isForeignKey, attr.isUnique);

  return (
    <div className="entity-node__attribute px-3 py-1.5 border-b border-slate-100 last:border-b-0 text-sm flex items-center gap-2">
      {icon && <span className="entity-node__attribute-icon w-4">{icon}</span>}
      {!icon && <span className="entity-node__attribute-icon w-4" />}

      {isEditingName ? (
        <input
          ref={nameInputRef}
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleNameSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleNameSave();
            else if (e.key === 'Escape') setIsEditingName(false);
          }}
          onClick={(e) => e.stopPropagation()}
          className="px-1 bg-blue-50 border border-blue-300 rounded text-slate-800 outline-none text-sm w-24"
        />
      ) : (
        <span
          className="entity-node__attribute-name font-medium text-slate-700 cursor-pointer hover:bg-slate-100 px-1 rounded"
          onDoubleClick={handleNameDoubleClick}
        >
          {attr.name}
        </span>
      )}

      {isEditingType ? (
        isCustomMode ? (
          <input
            ref={customInputRef}
            type="text"
            value={editType}
            onChange={(e) => setEditType(e.target.value)}
            onBlur={handleCustomSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCustomSave();
              else if (e.key === 'Escape') {
                setIsCustomMode(false);
                setIsEditingType(false);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder="カスタム型"
            className="ml-auto px-1 bg-blue-50 border border-blue-300 rounded text-slate-800 outline-none text-xs w-24"
          />
        ) : (
          <select
            ref={selectRef}
            value={isCommonType ? attr.type : ''}
            onChange={handleSelectChange}
            onBlur={() => setIsEditingType(false)}
            onClick={(e) => e.stopPropagation()}
            className="ml-auto px-1 bg-white border border-blue-300 rounded text-slate-800 outline-none text-xs w-24"
          >
            {COMMON_ATTRIBUTE_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
            <option value={CUSTOM_TYPE_VALUE}>カスタム...</option>
          </select>
        )
      ) : (
        <span
          className="entity-node__attribute-type text-slate-500 ml-auto text-xs cursor-pointer hover:bg-slate-100 px-1 rounded"
          onDoubleClick={handleTypeDoubleClick}
        >
          {attr.type}
        </span>
      )}
    </div>
  );
});
AttributeRow.displayName = 'AttributeRow';

export const EntityNode = memo(({ data, selected }: NodeProps<EntityNodeData>) => {
  const { t } = useTranslation();
  const { entity, isNewlyCreated, onClearNewlyCreated } = data;
  const updateEntity = useERStore((state) => state.updateEntity);
  const addAttribute = useERStore((state) => state.addAttribute);
  const updateAttribute = useERStore((state) => state.updateAttribute);
  const addEntityStore = useERStore((state) => state.addEntity);
  const addRelation = useERStore((state) => state.addRelation);
  const selectEntityStore = useERStore((state) => state.selectEntity);

  // ハンドルダブルクリックで新しいエンティティを作成
  const handleHandleDoubleClick = useCallback((position: 'top' | 'right' | 'bottom' | 'left') => (e: React.MouseEvent) => {
    e.stopPropagation();
    const offset = 300;
    let newPosition = { x: entity.position.x, y: entity.position.y };
    let targetHandle: 'top' | 'right' | 'bottom' | 'left' = 'bottom';

    switch (position) {
      case 'top':
        newPosition = { x: entity.position.x, y: entity.position.y - offset };
        targetHandle = 'bottom'; // 上からなら、新エンティティの下に接続
        break;
      case 'right':
        newPosition = { x: entity.position.x + offset, y: entity.position.y };
        targetHandle = 'left'; // 右からなら、新エンティティの左に接続
        break;
      case 'bottom':
        newPosition = { x: entity.position.x, y: entity.position.y + offset };
        targetHandle = 'top'; // 下からなら、新エンティティの上に接続
        break;
      case 'left':
        newPosition = { x: entity.position.x - offset, y: entity.position.y };
        targetHandle = 'right'; // 左からなら、新エンティティの右に接続
        break;
    }

    const newEntityId = addEntityStore({ position: newPosition });
    addRelation({
      sourceEntityId: entity.id,
      targetEntityId: newEntityId,
      sourceHandle: position,
      targetHandle: targetHandle,
    });
    selectEntityStore(newEntityId);
  }, [entity.id, entity.position, addEntityStore, addRelation, selectEntityStore]);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(entity.name);
  const inputRef = useRef<HTMLInputElement>(null);

  // 新規作成時は自動で編集モードに
  useEffect(() => {
    if (isNewlyCreated) {
      setEditName(entity.name);
      setIsEditing(true);
      onClearNewlyCreated?.();
    }
  }, [isNewlyCreated, entity.name, onClearNewlyCreated]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setEditName(entity.name);
    setIsEditing(true);
  }, [entity.name]);

  const handleSave = useCallback(() => {
    if (editName.trim() && editName !== entity.name) {
      updateEntity(entity.id, { name: editName.trim() });
    }
    setIsEditing(false);
  }, [editName, entity.id, entity.name, updateEntity]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  }, [handleSave]);

  return (
    <div
      className={`entity-node min-w-[240px] bg-white rounded-lg shadow-md border-2 transition-all ${
        selected ? 'border-blue-500 shadow-lg' : 'border-slate-200'
      }`}
    >
      {/* ヘッダー（テーブル名） */}
      <div
        className="entity-node__header bg-blue-500 text-white px-3 py-2 rounded-t-md font-semibold text-sm cursor-pointer"
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full bg-white text-slate-800 px-1 rounded outline-none"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          entity.name
        )}
      </div>

      {/* 属性一覧 */}
      <div className="entity-node__body bg-white rounded-b-md">
        {entity.attributes.length === 0 ? (
          <div
            className="px-3 py-2 text-slate-400 text-sm italic cursor-pointer hover:bg-slate-50"
            onDoubleClick={(e) => {
              e.stopPropagation();
              addAttribute(entity.id);
            }}
            title="ダブルクリックで属性を追加"
          >
            {t('entityNode.noAttributes')}
          </div>
        ) : (
          entity.attributes.map((attr) => (
            <AttributeRow
              key={attr.id}
              attr={attr}
              entityId={entity.id}
              updateAttribute={updateAttribute}
            />
          ))
        )}
        {/* カラム追加ボタン */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            addAttribute(entity.id);
          }}
          className="w-full px-3 py-1 text-xs text-slate-400 hover:text-blue-500 hover:bg-slate-50 transition-colors border-t border-slate-100 flex items-center justify-center gap-1"
        >
          <span>+</span> カラム追加
        </button>
      </div>

      {/* 接続ハンドル - 全方向から接続可能（ConnectionMode.Looseで双方向接続） */}
      {/* ダブルクリックで新しいエンティティを作成 */}
      <div onDoubleClick={handleHandleDoubleClick('top')} className="absolute -top-2 left-1/2 -translate-x-1/2 p-1 cursor-pointer">
        <Handle
          type="source"
          position={Position.Top}
          id="top"
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !relative !transform-none !top-0 !left-0"
        />
      </div>
      <div onDoubleClick={handleHandleDoubleClick('right')} className="absolute top-1/2 -right-2 -translate-y-1/2 p-1 cursor-pointer">
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !relative !transform-none !top-0 !left-0"
        />
      </div>
      <div onDoubleClick={handleHandleDoubleClick('bottom')} className="absolute -bottom-2 left-1/2 -translate-x-1/2 p-1 cursor-pointer">
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !relative !transform-none !top-0 !left-0"
        />
      </div>
      <div onDoubleClick={handleHandleDoubleClick('left')} className="absolute top-1/2 -left-2 -translate-y-1/2 p-1 cursor-pointer">
        <Handle
          type="source"
          position={Position.Left}
          id="left"
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !relative !transform-none !top-0 !left-0"
        />
      </div>
    </div>
  );
});

EntityNode.displayName = 'EntityNode';
