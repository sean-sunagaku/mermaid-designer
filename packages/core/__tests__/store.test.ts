import { describe, it, expect, beforeEach } from 'vitest';
import { useERStore } from '../src/store';

describe('useERStore', () => {
  beforeEach(() => {
    useERStore.getState().reset();
  });

  describe('Entity operations', () => {
    it('should add entity', () => {
      const id = useERStore.getState().addEntity({ name: 'TestEntity' });

      const state = useERStore.getState();
      expect(state.entities).toHaveLength(1);
      expect(state.entities[0].id).toBe(id);
      expect(state.entities[0].name).toBe('TestEntity');
    });

    it('should update entity', () => {
      const id = useERStore.getState().addEntity({ name: 'OldName' });
      useERStore.getState().updateEntity(id, { name: 'NewName' });

      const state = useERStore.getState();
      expect(state.entities[0].name).toBe('NewName');
    });

    it('should delete entity', () => {
      const id = useERStore.getState().addEntity({ name: 'ToDelete' });
      useERStore.getState().deleteEntity(id);

      const state = useERStore.getState();
      expect(state.entities).toHaveLength(0);
    });

    it('should delete related relations when entity is deleted', () => {
      const id1 = useERStore.getState().addEntity({ name: 'Entity1' });
      const id2 = useERStore.getState().addEntity({ name: 'Entity2' });
      useERStore.getState().addRelation({
        sourceEntityId: id1,
        targetEntityId: id2,
      });

      expect(useERStore.getState().relations).toHaveLength(1);

      useERStore.getState().deleteEntity(id1);

      expect(useERStore.getState().relations).toHaveLength(0);
    });

    it('should move entity', () => {
      const id = useERStore.getState().addEntity({ name: 'Movable' });
      useERStore.getState().moveEntity(id, { x: 100, y: 200 });

      const state = useERStore.getState();
      expect(state.entities[0].position).toEqual({ x: 100, y: 200 });
    });
  });

  describe('Attribute operations', () => {
    it('should add attribute to entity', () => {
      const entityId = useERStore.getState().addEntity({ name: 'TestEntity' });
      useERStore.getState().addAttribute(entityId, { name: 'id', type: 'int' });

      const state = useERStore.getState();
      expect(state.entities[0].attributes).toHaveLength(1);
      expect(state.entities[0].attributes[0].name).toBe('id');
    });

    it('should update attribute', () => {
      const entityId = useERStore.getState().addEntity({ name: 'TestEntity' });
      useERStore.getState().addAttribute(entityId, { name: 'old_name' });

      const attrId = useERStore.getState().entities[0].attributes[0].id;
      useERStore.getState().updateAttribute(entityId, attrId, { name: 'new_name' });

      const state = useERStore.getState();
      expect(state.entities[0].attributes[0].name).toBe('new_name');
    });

    it('should delete attribute', () => {
      const entityId = useERStore.getState().addEntity({ name: 'TestEntity' });
      useERStore.getState().addAttribute(entityId, { name: 'to_delete' });

      const attrId = useERStore.getState().entities[0].attributes[0].id;
      useERStore.getState().deleteAttribute(entityId, attrId);

      const state = useERStore.getState();
      expect(state.entities[0].attributes).toHaveLength(0);
    });
  });

  describe('Relation operations', () => {
    it('should add relation', () => {
      const id1 = useERStore.getState().addEntity({ name: 'Entity1' });
      const id2 = useERStore.getState().addEntity({ name: 'Entity2' });

      useERStore.getState().addRelation({
        sourceEntityId: id1,
        targetEntityId: id2,
        label: 'relates',
      });

      const state = useERStore.getState();
      expect(state.relations).toHaveLength(1);
      expect(state.relations[0].label).toBe('relates');
    });

    it('should update relation', () => {
      const id1 = useERStore.getState().addEntity({ name: 'Entity1' });
      const id2 = useERStore.getState().addEntity({ name: 'Entity2' });

      const relationId = useERStore.getState().addRelation({
        sourceEntityId: id1,
        targetEntityId: id2,
      });

      useERStore.getState().updateRelation(relationId, {
        sourceCardinality: 'ONE_OR_MORE',
      });

      const state = useERStore.getState();
      expect(state.relations[0].sourceCardinality).toBe('ONE_OR_MORE');
    });

    it('should delete relation', () => {
      const id1 = useERStore.getState().addEntity({ name: 'Entity1' });
      const id2 = useERStore.getState().addEntity({ name: 'Entity2' });

      const relationId = useERStore.getState().addRelation({
        sourceEntityId: id1,
        targetEntityId: id2,
      });

      useERStore.getState().deleteRelation(relationId);

      const state = useERStore.getState();
      expect(state.relations).toHaveLength(0);
    });
  });

  describe('Selection operations', () => {
    it('should select entity', () => {
      const id = useERStore.getState().addEntity({ name: 'Selectable' });
      useERStore.getState().selectEntity(id);

      const state = useERStore.getState();
      expect(state.selectedEntityId).toBe(id);
      expect(state.selectedRelationId).toBeNull();
    });

    it('should clear relation selection when selecting entity', () => {
      const id1 = useERStore.getState().addEntity({ name: 'Entity1' });
      const id2 = useERStore.getState().addEntity({ name: 'Entity2' });
      const relationId = useERStore.getState().addRelation({
        sourceEntityId: id1,
        targetEntityId: id2,
      });

      useERStore.getState().selectRelation(relationId);
      useERStore.getState().selectEntity(id1);

      const state = useERStore.getState();
      expect(state.selectedEntityId).toBe(id1);
      expect(state.selectedRelationId).toBeNull();
    });

    it('should clear selection', () => {
      const id = useERStore.getState().addEntity({ name: 'Selectable' });
      useERStore.getState().selectEntity(id);
      useERStore.getState().clearSelection();

      const state = useERStore.getState();
      expect(state.selectedEntityId).toBeNull();
      expect(state.selectedRelationId).toBeNull();
    });
  });

  describe('Code synchronization', () => {
    it('should sync changes to code', () => {
      const entityId = useERStore.getState().addEntity({ name: 'TestEntity' });
      useERStore.getState().addAttribute(entityId, { name: 'id', type: 'int', isPrimaryKey: true });

      const state = useERStore.getState();
      expect(state.mermaidCode).toContain('erDiagram');
      expect(state.mermaidCode).toContain('TestEntity');
    });

    it('should update from code', () => {
      const code = `
erDiagram
    CUSTOMER {
        int id PK
        string name
    }
`;
      useERStore.getState().updateFromCode(code);

      const state = useERStore.getState();
      expect(state.entities).toHaveLength(1);
      expect(state.entities[0].name).toBe('CUSTOMER');
      expect(state.parseErrors).toHaveLength(0);
    });

    it('should preserve positions when updating from code', () => {
      useERStore.getState().addEntity({ name: 'CUSTOMER' });
      useERStore.getState().moveEntity(useERStore.getState().entities[0].id, { x: 500, y: 300 });

      const code = `
erDiagram
    CUSTOMER {
        int id PK
    }
`;
      useERStore.getState().updateFromCode(code);

      const state = useERStore.getState();
      expect(state.entities[0].position).toEqual({ x: 500, y: 300 });
    });
  });

  describe('Import/Export', () => {
    it('should export diagram', () => {
      useERStore.getState().addEntity({ name: 'ExportTest' });

      const diagram = useERStore.getState().exportDiagram();
      expect(diagram.entities).toHaveLength(1);
      expect(diagram.entities[0].name).toBe('ExportTest');
    });

    it('should import diagram', () => {
      const diagram = {
        entities: [
          {
            id: 'imported-1',
            name: 'ImportedEntity',
            attributes: [],
            position: { x: 0, y: 0 },
          },
        ],
        relations: [],
      };

      useERStore.getState().importDiagram(diagram);

      const state = useERStore.getState();
      expect(state.entities).toHaveLength(1);
      expect(state.entities[0].name).toBe('ImportedEntity');
    });

    it('should reset store', () => {
      useERStore.getState().addEntity({ name: 'ToReset' });
      useERStore.getState().reset();

      const state = useERStore.getState();
      expect(state.entities).toHaveLength(0);
      expect(state.relations).toHaveLength(0);
    });
  });
});
