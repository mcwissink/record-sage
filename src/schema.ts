import { Schema } from "./records";

export const schema: Schema = [
    {
        table: 'chemical-application',
        columns: ['id', 'date', 'field', 'crop', 'acres', 'chemical', 'amount']
    },
    {
        table: 'chemical',
        columns: ['id', 'name']
    },
    {
        table: 'field',
        columns: ['id', 'name']
    },
    {
        table: 'crop',
        columns: ['id', 'name']
    },
];
