import { Schema } from "./records";

export const schema: Schema = {
    'chemical-application': {
        columns: ['id', 'date', 'field', 'crop', 'acres', 'chemical', 'registration', 'amount', 'unit', 'applicator', 'certification'],
    },
    'chemical': {
        columns: ['id', 'name', 'unit', 'registration'],
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
};
