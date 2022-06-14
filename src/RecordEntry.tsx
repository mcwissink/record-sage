import React, { useEffect, useState } from 'react'
import cn from 'classnames';
import { format } from 'date-fns';
import { useRecords } from './records-store';
import { useFieldArray, useForm } from 'react-hook-form';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from './ui/Card';

interface Form {
    date: string;
    field: string;
    crop: string;
    acres: string;
    applications: Array<{
        chemicalId: string;
        amount: string;
    }>
}

const DEFAULT_FIELDS = {
    date: format(new Date(), 'yyyy-MM-dd'),
    applications: [{}],
}
const isRows = (state: any): state is { rows: string[][] } => state && 'rows' in state;
export const RecordEntry: React.VFC = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [fields, setFields] = useState<string[]>([]);
    const [crops, setCrops] = useState<string[]>([]);
    const [chemicals, setChemicals] = useState<Record<string, string[]>>({});
    const {
        records,
    } = useRecords();

    const {
        reset,
        register,
        control,
        handleSubmit,
        watch,
        formState: { isSubmitting }
    } = useForm<Form>({
        defaultValues: {
            ...DEFAULT_FIELDS,
            ...(isRows(state) ? {
                field: state.rows[0][2],
                crop: state.rows[0][3],
                acres: state.rows[0][4],
                applications: state.rows.map((row) => ({
                    chemical: row[5],
                    amount: row[6],
                })) ?? [{
                    chemicalId: state.rows[0][5],
                    amount: state.rows[0][6],
                }],
            } : {})
        }
    });
    const formData = watch();

    const { fields: formFields, append, remove } = useFieldArray({
        control,
        name: 'applications',
    });

    const onSubmit = handleSubmit(async ({ date, field, crop, acres, applications }: Form) => {
        for (const { chemicalId, amount } of applications) {
            const [chemical, registration] = chemicals[chemicalId];
            await records.insert('chemical-application', [
                date,
                field,
                crop,
                acres,
                chemical,
                registration,
                amount,
                'applicator',
                'certification'
            ]);
        }
        navigate('/');
    });

    useEffect(() => {
        (async () => {
            const [
                fields,
                crops,
                chemicals,
            ] = await Promise.all([
                records.get('field'),
                records.get('crop'),
                records.get('chemical'),
            ]);
            setFields(fields.rows.map(([_, name]) => name));
            setCrops(crops.rows.map(([_, name]) => name));
            setChemicals(chemicals.rows.reduce<Record<string, string[]>>((acc, [id, ...rest]) => {
                acc[id] = rest;
                return acc;
            }, {}));
        })();
    }, [records, setFields, setCrops]);

    return (
        <form onSubmit={onSubmit} className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <div
                className={cn('contents', {
                })}
            >
                <div className="flex justify-between col-span-full">
                    <b>Application</b>
                    <Button
                        type="button"
                        onClick={() => {
                            reset(
                                {
                                    ...DEFAULT_FIELDS,
                                    acres: '',
                                    field: '',
                                    crop: '',
                                },
                            );
                        }}>
                        reset
                    </Button>
                </div>
                <FormEntry className="col-span-2" label="date">
                    <Input type="date" className="w-full" {...register('date')} />
                </FormEntry>
                <FormEntry className="col-span-2" label="field">
                    <Select defaultValue="" className="w-full" {...register('field')}>
                        <option disabled value="">
                            Select a field
                        </option>
                        {fields.map(field => (
                            <option key={field} value={field}>{field}</option>
                        ))}
                    </Select>
                </FormEntry>
                <FormEntry className="col-span-2" label="crop">
                    <Select defaultValue="" className="w-full" {...register('crop')}>
                        <option disabled value="">
                            Select a crop
                        </option>
                        {crops.map(crop => (
                            <option key={crop} value={crop}>{crop}</option>
                        ))}
                    </Select>
                </FormEntry>
                <FormEntry className="col-span-2" label="acres">
                    <Input type="number" className="w-full" {...register('acres')} />
                </FormEntry>
                <hr className="w-full col-span-full" />
            </div>
            <div
                className={cn('contents', {
                })}
            >
                <Title>Chemicals</Title>
                {formFields.map((application, index) => (
                    <Card key={application.id} className="col-span-2">
                        <FormEntry
                            label="chemical"
                            action={<Button onClick={() => remove(index)}>remove</Button>}
                        >
                            <div className="flex">
                                <Select defaultValue="" className="w-full" {...register(`applications.${index}.chemicalId`)}>
                                    <option disabled value="">
                                        Select a chemical
                                    </option>
                                    {Object.entries(chemicals).map(([id, [chemical]]) => (
                                        <option key={id} value={id}>{chemical}</option>
                                    ))}
                                </Select>
                                <Input readOnly value={chemicals[formData.applications[index].chemicalId]?.[1] ?? ''} />
                            </div>
                        </FormEntry>
                        <FormEntry
                            label="amount"
                            className="col-span-2"
                        >
                            <Input type="number" className="w-full" {...register(`applications.${index}.amount`)} />
                        </FormEntry>
                    </Card>
                ))}
                <Card className="relative col-span-2" onClick={() => append({})}>
                    <span className="inset-0 absolute flex justify-center items-center">add</span>

                    <FormEntry label="chemical" className="invisible">
                        <div className="flex">
                            <Select defaultValue="" className="w-full" />
                            <Input />
                        </div>
                    </FormEntry>
                    <FormEntry label="amount" className="invisible">
                        <Input type="number" />
                    </FormEntry>
                </Card>
                <hr className="w-full col-span-full" />
            </div>
            <div>
                <Button
                    type="submit"
                    loading={isSubmitting}
                    className="col-span-2"
                >
                    complete
                </Button>
            </div>
        </form>
    )
}

export const FormEntry: React.FC<React.ComponentPropsWithoutRef<'div'> & {
    label: string;
    action?: React.ReactNode;
}> = ({
    children,
    action,
    label,
    ...props
}) => {
        return (
            <div {...props}>
                <div className="flex justify-between items-end pb-1">
                    {label}:
                    {action ? action : null}
                </div>
                {children}
            </div>
        );
    };

export const Title: React.FC = (props) => (
    <b className="col-span-full" {...props} />
)
