export const schema = {
    'application': {
        columns: ['_id', '_created', 'title', 'date', 'applicator', 'certification', 'note'],
        cache: false,
    },
    'chemical-application': {
        columns: ['_id', '_created', '_application', 'field', 'crop', 'acres', 'chemical', 'registration', 'amount', 'unit'],
        cache: false,
    },
    'chemical': {
        columns: ['_id', '_created', 'name', 'unit', 'registration', 'default'],
        cache: true,
    },
    'field': {
        columns: ['_id', '_created', 'name'],
        cache: true,
    },
    'crop': {
        columns: ['_id', '_created', 'name'],
        cache: true,
    },
    'applicator': {
        columns: ['_id', '_created', 'name', 'certification'],
        cache: true,
    },
} as const;

export type Schema = typeof schema;
