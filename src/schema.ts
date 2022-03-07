import { Schema } from "./records";

export const schema: Schema = [
    {
        table: 'ChemicalApplication',
        columns: ['id', 'date', 'field', 'crop', 'acres', 'chemical', 'amount']
    },
    {
        table: 'Chemical',
        columns: ['id', 'name']
    },
    {
        table: 'Field',
        columns: ['id', 'name']
    },
    {
        table: 'Crop',
        columns: ['id', 'name']
    },
];
