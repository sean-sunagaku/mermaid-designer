import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useTranslation } from 'react-i18next';
import { EntityNodeData } from '../types/flow';

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

export const EntityNode = memo(({ data, selected }: NodeProps<EntityNodeData>) => {
  const { t } = useTranslation();
  const { entity } = data;

  return (
    <div
      className={`entity-node min-w-[200px] bg-white rounded-lg shadow-md border-2 transition-all ${
        selected ? 'border-blue-500 shadow-lg' : 'border-slate-200'
      }`}
    >
      {/* ヘッダー（テーブル名） */}
      <div className="entity-node__header bg-blue-500 text-white px-3 py-2 rounded-t-md font-semibold text-sm">
        {entity.name}
      </div>

      {/* 属性一覧 */}
      <div className="entity-node__body bg-white rounded-b-md">
        {entity.attributes.length === 0 ? (
          <div className="px-3 py-2 text-slate-400 text-sm italic">
            {t('entityNode.noAttributes')}
          </div>
        ) : (
          entity.attributes.map((attr) => {
            const icon = getAttributeIcon(attr.isPrimaryKey, attr.isForeignKey, attr.isUnique);
            return (
              <div
                key={attr.id}
                className="entity-node__attribute px-3 py-1.5 border-b border-slate-100 last:border-b-0 text-sm flex items-center gap-2"
              >
                {icon && <span className="entity-node__attribute-icon w-4">{icon}</span>}
                {!icon && <span className="entity-node__attribute-icon w-4" />}
                <span className="entity-node__attribute-name font-medium text-slate-700">
                  {attr.name}
                </span>
                <span className="entity-node__attribute-type text-slate-500 ml-auto text-xs">
                  {attr.type}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* 接続ハンドル - 全方向から接続可能（ConnectionMode.Looseで双方向接続） */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
      />
    </div>
  );
});

EntityNode.displayName = 'EntityNode';
