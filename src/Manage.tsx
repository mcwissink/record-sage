import React, { useEffect } from 'react'
import { Rows, Row } from './records';
import { useGet, useRecords } from './records-store';
import { schema, Schema } from './schema';
import { Button } from './ui/Button';
import { useFieldArray, useForm } from 'react-hook-form';
import { Progress } from './ui/Progress';
import { Select } from './ui/Select';
import { Pagination } from './ui/Pagination';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface Form {
    columns: Array<{
        value: string
    }>
}

const flatten = <T extends keyof Schema>(rows: Rows<T>): string[][] => Object.values(rows).map(Object.values);

const getColumnsFromTable = (table: keyof Schema) => ({
    columns: schema[table].columns.slice(OFFSET).map(() => ({ value: '' })),
});

const OFFSET = 2;

export const Manage: React.VFC = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const table: keyof Schema = params.get('table') as keyof Schema ?? 'application';

    const { data, mutate, isLoading } = useGet(table, {
        limit: Number(params.get('limit') ?? 5),
        offset: Number(params.get('offset') ?? 0),
    });

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { isSubmitting }
    } = useForm<Form>({
        defaultValues: getColumnsFromTable(table),
    });
    const { fields } = useFieldArray<Form>({
        control,
        name: 'columns',
    });

    const { records, isSyncing } = useRecords();

    useEffect(() => reset(getColumnsFromTable(table)), [table]);

    const onSubmit = async (form: Form) => {
        await records.insert(table, form.columns.reduce<Record<string, string>>((acc, column, index) => {
            acc[schema[table].columns[index + OFFSET]] = column.value;
            return acc;
        }, {}) as Row<typeof table>);
        mutate();
        reset(getColumnsFromTable(table));
    };

    const onDelete = (row: string[]) => async () => {
        if (window.confirm(`Delete: ${JSON.stringify(row.slice(OFFSET))}`)) {
            await records.delete(table, row[0]);
            mutate();
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="w-full">
                <Select
                    className="w-full md:w-auto"
                    value={table}
                    onChange={e => {
                        navigate({ search: new URLSearchParams({ table: e.target.value }).toString() })
                    }}
                >
                    {Object.keys(schema).map((table) => (
                        <option key={table} value={table}>{table}</option>
                    ))}
                </Select>
            </div>
            <Progress active={isSyncing || isLoading} />
            {!isLoading && (
                <>
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
                                {flatten(data?.rows ?? {}).map((row) => (
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
                                    <td><i>DATE</i></td>
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
                    {!!data && (
                        <Pagination
                            offset={data.offset}
                            total={data.total}
                            limit={data.limit}
                        />
                    )}
                </>
            )}
        </div >
    );
}
