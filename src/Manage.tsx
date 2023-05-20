import React, { useCallback, useEffect, useState } from 'react'
import { Rows, Row } from './records';
import { useRecords } from './records-store';
import { schema, Schema } from './schema';
import { useLoading } from './use-loading';
import { Button } from './ui/Button';
import { useFieldArray, useForm } from 'react-hook-form';
import { Progress } from './ui/Progress';
import { Select } from './ui/Select';
import { Paginated } from './records';
import { Pagination } from './ui/Pagination';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface Form {
    columns: Array<{
        value: string
    }>
}

const flatten = <T extends keyof Schema>(rows: Rows<T>): string[][] => Object.values(rows).map(Object.values);

export const Manage: React.VFC = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const table: keyof Schema = params.get('table') as keyof Schema ?? 'chemical-application';
    const [data, setDataWrapped] = useState<Paginated<string[][]>>({
        rows: [],
        total: 0,
        limit: 0,
        offset: 0,
    });

    const setData = <T extends keyof Schema>(data: Paginated<Rows<T>>) => setDataWrapped({
        ...data,
        rows: flatten(data.rows),
    });

    const parameters = {
        limit: Number(params.get('limit') ?? 5),
        offset: Number(params.get('offset') ?? 0),
    }

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
            loading(records.get)(table, parameters).then(setData);
            resetForm();
        }
    }, [records, table, loading, resetForm, params]);

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
        await records.insert(table, form.columns.reduce<Record<string, string>>((acc, column, index) => {
            acc[schema[table].columns[index + 1]] = column.value;
            return acc;
        }, {}) as Row<typeof table>);
        records.get(table, parameters).then(setData);
        resetForm();
    };

    const onDelete = (row: string[]) => async () => {
        if (window.confirm(`Delete: ${JSON.stringify(row.slice(1))}`)) {
            await records.delete(table, row[0]);
            records.get(table, parameters).then(setData);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="w-full">
                <Select defaultValue={'empty'} className="w-full md:w-auto" onChange={e => {
                    navigate({ search: new URLSearchParams({ table: e.target.value }).toString() })
                }}>
                    {Object.keys(schema).map((table) => (
                        <option key={table} value={table}>{table}</option>
                    ))}
                </Select>
            </div>
            <Progress active={isSyncing || isLoading} />
            <form className="w-max md:w-full max-w-full" onSubmit={handleSubmit(onSubmit)}>
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
                        {data.rows.map((row) => (
                            <tr key={row[0]} className="contents">
                                {row.map((cell, index) =>
                                    <td key={index} className="truncate">{index ? cell : cell.slice(0, 8)}</td>
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
            <Pagination
                offset={data.offset}
                total={data.total}
                limit={data.limit}
            />
        </div >
    );
}
