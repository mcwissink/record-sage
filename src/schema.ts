export const schema = {
    'application': {
        columns: ['id', 'title', 'date', 'applicator', 'certification', 'note'],
        cache: false,
    },
    'chemical-application': {
        columns: ['id', 'application', 'field', 'crop', 'acres', 'chemical', 'registration', 'amount', 'unit'],
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
