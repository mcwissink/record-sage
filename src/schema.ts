import { Schema } from "./records";

export const schema: Schema = {
    'chemical-application': {
        columns: ['id', 'date', 'field', 'crop', 'acres', 'chemical', 'amount'],
    },
    'chemical': {
        columns: ['id', 'name'],
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
};
