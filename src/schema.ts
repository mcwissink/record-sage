import { Schema } from "./records";

export const schema: Schema = {
    'chemical-application': {
        columns: ['id', 'date', 'field', 'crop', 'acres', 'chemical', 'registration', 'amount', 'applicator', 'certification'],
    },
    'chemical': {
        columns: ['id', 'name', 'registration'],
        offline: true,
    },
    'field': {
        columns: ['id', 'name'],
        offline: true,
    },
    'crop': {
        columns: ['id', 'name'],
        offline: true,
    },
    'applicator': {
        columns: ['id', 'name', 'certification'],
        offline: true,
    },
};
