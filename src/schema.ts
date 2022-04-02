import { Schema } from "./records";

export const schema: Schema = {
    'chemical-application': {
        columns: ['id', 'date', 'field', 'crop', 'acres', 'chemical', 'amount']
    },
    'chemical': {
        columns: ['id', 'name']
    },
    'field': {
        columns: ['id', 'name']
    },
    'crop': {
        columns: ['id', 'name']
    },
};
