export const schema = {
    'chemical-application': {
        columns: ['id', 'date', 'field', 'crop', 'acres', 'chemical', 'registration', 'amount', 'unit', 'applicator', 'certification', 'note'],
        cache: false,
    },
    'chemical': {
        columns: ['id', 'name', 'unit', 'registration', 'default'],
        cache: true,
    },
    'field': {
        columns: ['id', 'name'],
        cache: true,
    },
    'crop': {
        columns: ['id', 'name'],
        cache: true,
    },
    'applicator': {
        columns: ['id', 'name', 'certification'],
        cache: true,
    },
} as const;

export type Schema = typeof schema;
