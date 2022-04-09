import React, { useCallback, useEffect, useState } from 'react'
import { useRecords } from './records-store';
import { schema } from './schema';
import { useLoading } from './use-loading';
import { Button } from './ui/Button';
import { useFieldArray, useForm } from 'react-hook-form';
import { Progress } from './ui/Progress';
import { Paginated } from './records';

interface Form {
    columns: Array<{
        value: string
    }>
}

export const Manage: React.VFC = () => {
    const [table, setTable] = useState(Object.keys(schema)[0]);
    const [{ rows }, setData] = useState<Paginated<string[][]>>({
        rows: [],
        total: 0,
    });
    const [isSyncing, setIsSyncing] = useState(false);
    const { isLoading, loading } = useLoading();
    const { register, control, handleSubmit, reset, formState: { isSubmitting } } = useForm<Form>();
    const { fields } = useFieldArray<Form>({
        control,
        name: 'columns',
    });
    const {
        records,
    } = useRecords();

    const resetForm = useCallback(() => reset({
        columns: schema[table].columns.slice(1).map(() => ({ value: '' })),
    }), [table, reset]);

    useEffect(() => {
        if (table) {
            loading(records.get)(table, { limit: 2, offset: 1 }).then(setData);
            resetForm();
        }
    }, [records, table, loading, resetForm]);

    useEffect(() => {
        const onSyncing = () => setIsSyncing(true);
        const onSynced = () => {
            setIsSyncing(false);
            records.get(table).then(setData);
        };
        window.addEventListener('records:syncing', onSyncing);
        window.addEventListener('records:synced', onSynced);
        return () => {
            window.removeEventListener('records:syncing', onSyncing);
            window.removeEventListener('records:synced', onSynced);
        }
    }, [records, table, setData, setIsSyncing]);

    const onSubmit = async (form: Form) => {
        await records.insert(table, form.columns.map((column) => column.value));
        records.get(table).then(setData);
        resetForm();
    };

    const onDelete = (row: string[]) => async () => {
        if (window.confirm(`Delete: ${JSON.stringify(row.slice(1))}`)) {
            await records.delete(table, row[0]);
            records.get(table).then(setData);
        }
    };

    return (
        <div>
            <div>
                <select defaultValue={'empty'} onChange={e => setTable(e.target.value)}>
                    {Object.keys(schema).map((table) => (
                        <option key={table} value={table}>{table}</option>
                    ))}
                </select>
            </div>
            <Progress active={isSyncing || isLoading} />
            <form onSubmit={handleSubmit(onSubmit)}>
                <table className="grid gap-4" style={{ gridTemplateColumns: `repeat(${schema[table].columns.length + 1}, minmax(0, max-content))` }}>
                    <thead className="contents">
                        <tr className="contents">
                            {schema[table].columns.map((column) =>
                                <td key={column}><b>{column}</b></td>
                            )}
                            <td><b>actions</b></td>
                        </tr>
                    </thead>
                    <tbody className="contents">
                        {rows.map((row) => (

                            <tr key={row[0]} className="contents">
                                {row.map((cell, j) =>
                                    <td key={j}>{cell} </td>
                                )}
                                <td>
                                    <Button type="button" onClick={onDelete(row)}>delete</Button>
                                </td>
                            </tr>
                        ))}
                        <tr className="contents">
                            <td><i>ID</i></td>
                            {fields.map((field, index) => (
                                <td key={field.id}>
                                    <input className="w-full" {...register(`columns.${index}.value`)} />
                                </td>
                            ))}
                            <td><Button loading={isSubmitting}>submit</Button></td>
                        </tr>
                    </tbody>
                </table>
            </form>
        </div >
    );
}
