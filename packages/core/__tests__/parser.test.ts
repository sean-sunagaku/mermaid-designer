import { describe, it, expect } from 'vitest';
import { parseERDiagram } from '../src/parser';

describe('parseERDiagram', () => {
  it('should parse simple entity', () => {
    const code = `
erDiagram
    CUSTOMER {
        int id PK
        string name
    }
`;
    const result = parseERDiagram(code);

    expect(result.success).toBe(true);
    expect(result.diagram?.entities).toHaveLength(1);
    expect(result.diagram?.entities[0].name).toBe('CUSTOMER');
    expect(result.diagram?.entities[0].attributes).toHaveLength(2);
  });

  it('should parse entity with multiple keys', () => {
    const code = `
erDiagram
    USERS {
        int id PK
        string email UK
        int role_id FK
    }
`;
    const result = parseERDiagram(code);

    expect(result.success).toBe(true);
    const entity = result.diagram?.entities[0];
    expect(entity?.name).toBe('USERS');

    const idAttr = entity?.attributes.find((a) => a.name === 'id');
    expect(idAttr?.isPrimaryKey).toBe(true);

    const emailAttr = entity?.attributes.find((a) => a.name === 'email');
    expect(emailAttr?.isUnique).toBe(true);

    const roleIdAttr = entity?.attributes.find((a) => a.name === 'role_id');
    expect(roleIdAttr?.isForeignKey).toBe(true);
  });

  it('should parse relationship', () => {
    const code = `
erDiagram
    CUSTOMER ||--o{ ORDER : places
`;
    const result = parseERDiagram(code);

    expect(result.success).toBe(true);
    expect(result.diagram?.relations).toHaveLength(1);

    const relation = result.diagram?.relations[0];
    expect(relation?.sourceCardinality).toBe('EXACTLY_ONE');
    expect(relation?.targetCardinality).toBe('ZERO_OR_MORE');
    expect(relation?.label).toBe('places');
    expect(relation?.identifying).toBe(true);
  });

  it('should parse non-identifying relationship (dotted line)', () => {
    const code = `
erDiagram
    CUSTOMER |o..o| PREFERENCES : has
`;
    const result = parseERDiagram(code);

    expect(result.success).toBe(true);
    const relation = result.diagram?.relations[0];
    expect(relation?.identifying).toBe(false);
  });

  it('should parse multiple entities and relationships', () => {
    const code = `
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE_ITEM : contains
    CUSTOMER {
        int id PK
        string name
    }
    ORDER {
        int id PK
        int customer_id FK
    }
    LINE_ITEM {
        int id PK
        int order_id FK
    }
`;
    const result = parseERDiagram(code);

    expect(result.success).toBe(true);
    expect(result.diagram?.entities).toHaveLength(3);
    expect(result.diagram?.relations).toHaveLength(2);
  });

  it('should handle empty erDiagram', () => {
    const code = 'erDiagram';
    const result = parseERDiagram(code);

    expect(result.success).toBe(true);
    expect(result.diagram?.entities).toHaveLength(0);
    expect(result.diagram?.relations).toHaveLength(0);
  });

  it('should parse one-or-more cardinality', () => {
    const code = `
erDiagram
    A |{--}| B : relation
`;
    const result = parseERDiagram(code);

    expect(result.success).toBe(true);
    const relation = result.diagram?.relations[0];
    expect(relation?.sourceCardinality).toBe('ONE_OR_MORE');
    expect(relation?.targetCardinality).toBe('ONE_OR_MORE');
  });

  it('should assign initial positions to entities', () => {
    const code = `
erDiagram
    A {
        int id PK
    }
    B {
        int id PK
    }
`;
    const result = parseERDiagram(code);

    expect(result.success).toBe(true);
    result.diagram?.entities.forEach((entity) => {
      expect(entity.position.x).toBeGreaterThanOrEqual(0);
      expect(entity.position.y).toBeGreaterThanOrEqual(0);
    });
  });
});
