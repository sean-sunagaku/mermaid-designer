import { describe, it, expect } from 'vitest';
import { generateERDiagram } from '../src/generator';
import { ERDiagram, EREntity, ERRelation } from '../src/types';

describe('generateERDiagram', () => {
  it('should generate empty erDiagram', () => {
    const diagram: ERDiagram = {
      entities: [],
      relations: [],
    };

    const result = generateERDiagram(diagram);
    expect(result).toBe('erDiagram');
  });

  it('should generate entity with attributes', () => {
    const diagram: ERDiagram = {
      entities: [
        {
          id: '1',
          name: 'CUSTOMER',
          attributes: [
            {
              id: 'a1',
              name: 'id',
              type: 'int',
              isPrimaryKey: true,
              isForeignKey: false,
              isUnique: false,
              isNullable: false,
            },
            {
              id: 'a2',
              name: 'name',
              type: 'string',
              isPrimaryKey: false,
              isForeignKey: false,
              isUnique: false,
              isNullable: true,
            },
          ],
          position: { x: 0, y: 0 },
        },
      ],
      relations: [],
    };

    const result = generateERDiagram(diagram);
    expect(result).toContain('erDiagram');
    expect(result).toContain('CUSTOMER');
    expect(result).toContain('int id PK');
    expect(result).toContain('string name');
  });

  it('should generate entity with multiple keys', () => {
    const diagram: ERDiagram = {
      entities: [
        {
          id: '1',
          name: 'USERS',
          attributes: [
            {
              id: 'a1',
              name: 'id',
              type: 'int',
              isPrimaryKey: true,
              isForeignKey: false,
              isUnique: false,
              isNullable: false,
            },
            {
              id: 'a2',
              name: 'email',
              type: 'string',
              isPrimaryKey: false,
              isForeignKey: false,
              isUnique: true,
              isNullable: false,
            },
            {
              id: 'a3',
              name: 'role_id',
              type: 'int',
              isPrimaryKey: false,
              isForeignKey: true,
              isUnique: false,
              isNullable: true,
            },
          ],
          position: { x: 0, y: 0 },
        },
      ],
      relations: [],
    };

    const result = generateERDiagram(diagram);
    expect(result).toContain('int id PK');
    expect(result).toContain('string email UK');
    expect(result).toContain('int role_id FK');
  });

  it('should generate relationship', () => {
    const diagram: ERDiagram = {
      entities: [
        {
          id: '1',
          name: 'CUSTOMER',
          attributes: [],
          position: { x: 0, y: 0 },
        },
        {
          id: '2',
          name: 'ORDER',
          attributes: [],
          position: { x: 0, y: 0 },
        },
      ],
      relations: [
        {
          id: 'r1',
          sourceEntityId: '1',
          targetEntityId: '2',
          sourceCardinality: 'EXACTLY_ONE',
          targetCardinality: 'ZERO_OR_MORE',
          label: 'places',
          identifying: true,
        },
      ],
    };

    const result = generateERDiagram(diagram);
    expect(result).toContain('CUSTOMER ||--o{ ORDER : places');
  });

  it('should generate non-identifying relationship', () => {
    const diagram: ERDiagram = {
      entities: [
        {
          id: '1',
          name: 'A',
          attributes: [],
          position: { x: 0, y: 0 },
        },
        {
          id: '2',
          name: 'B',
          attributes: [],
          position: { x: 0, y: 0 },
        },
      ],
      relations: [
        {
          id: 'r1',
          sourceEntityId: '1',
          targetEntityId: '2',
          sourceCardinality: 'ZERO_OR_ONE',
          targetCardinality: 'ZERO_OR_ONE',
          label: 'relates',
          identifying: false,
        },
      ],
    };

    const result = generateERDiagram(diagram);
    expect(result).toContain('A o|..|o B : relates');
  });

  it('should sort entities alphabetically', () => {
    const diagram: ERDiagram = {
      entities: [
        {
          id: '3',
          name: 'ZEBRA',
          attributes: [
            {
              id: 'a1',
              name: 'id',
              type: 'int',
              isPrimaryKey: true,
              isForeignKey: false,
              isUnique: false,
              isNullable: false,
            },
          ],
          position: { x: 0, y: 0 },
        },
        {
          id: '1',
          name: 'APPLE',
          attributes: [
            {
              id: 'a2',
              name: 'id',
              type: 'int',
              isPrimaryKey: true,
              isForeignKey: false,
              isUnique: false,
              isNullable: false,
            },
          ],
          position: { x: 0, y: 0 },
        },
        {
          id: '2',
          name: 'MANGO',
          attributes: [
            {
              id: 'a3',
              name: 'id',
              type: 'int',
              isPrimaryKey: true,
              isForeignKey: false,
              isUnique: false,
              isNullable: false,
            },
          ],
          position: { x: 0, y: 0 },
        },
      ],
      relations: [],
    };

    const result = generateERDiagram(diagram);
    const appleIndex = result.indexOf('APPLE');
    const mangoIndex = result.indexOf('MANGO');
    const zebraIndex = result.indexOf('ZEBRA');

    expect(appleIndex).toBeLessThan(mangoIndex);
    expect(mangoIndex).toBeLessThan(zebraIndex);
  });
});
