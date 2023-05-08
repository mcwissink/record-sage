import React, { useEffect, useState } from 'react'
import cn from 'classnames';
import { format } from 'date-fns';
import { useRecords } from './records-store';
import { Rows } from './records';
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
        chemical: string;
        amount: string;
    }>
    note: string;
}

const DEFAULT_FIELDS = {
    date: format(new Date(), 'yyyy-MM-dd'),
    applications: [{}],
}

const isRows = (state: any): state is { rows: Rows<'chemical-application'>} => state && 'rows' in state;

export const RecordEntry: React.VFC = () => {
    const navigate = useNavigate();
    const [isAdding, setIsAdding] = useState(false);
    const [chemicalApplications, setChemicalApplications] = useState<any[]>([]);
    const { state } = useLocation();
    const [fields, setFields] = useState<Rows<'field'>>({});
    const [crops, setCrops] = useState<Rows<'crop'>>({});
    const [chemicals, setChemicals] = useState<Rows<'chemical'>>({});
    const {
        records,
    } = useRecords();

    const {
        reset,
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { isSubmitting, errors }
    } = useForm<Form>({
        defaultValues: {
            ...DEFAULT_FIELDS,
            ...(isRows(state) ? {
                field: state.rows[0].field,
                crop: state.rows[0].crop,
                acres: state.rows[0].acres,
                applications: Object.values(state.rows).map((row) => ({
                    chemical: row.chemical,
                    amount: row.amount,
                })) ?? [{
                    chemical: state.rows[0].chemical,
                    amount: state.rows[0].amount,
                }],
            } : {})
        }
    });

    const onSubmit = handleSubmit(async ({ date, field, crop, acres, applications, note }) => {
        const application = await records.insert('application', {
            date,
            title: 'application', 
            applicator: 'applicator',
            certification: 'certification',
            note,
        });
        for (const { chemical, amount } of applications) {
            
            await records.insert('chemical-application', {
                application: application.id,
                field: fields[field].name,
                crop: crops[crop].name,
                acres,
                chemical: chemicals[chemical].name,
                registration: chemicals[chemical].registration,
                amount,
                unit: chemicals[chemical].unit,
            });
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
            setFields(fields.rows);
            setCrops(crops.rows);
            setChemicals(chemicals.rows);
        })();
    }, [records, setFields, setCrops]);

    if (isAdding) {
        return (
            <ChemicalApplicationForm
                fields={fields}
                crops={crops}
                chemicals={chemicals}
                onCancel={() => setIsAdding(false)}
                onSubmit={({ applications, ...data }) => {
                    setChemicalApplications([
                        ...applications.map((application: any) => ({
                            ...application,
                            data,
                        })),
                        ...chemicalApplications,
                    ]);
                    setIsAdding(false);
                }}
            />
        );
    }

    return (
        <form onSubmit={(e) => e.preventDefault()} className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <div className={cn('contents')}>
                <div className="flex justify-between items-end col-span-full">
                    <b>Application</b>
                    <Button
                        type="button"
                        onClick={() => {
                            if (window.confirm('Reset')) {
                                reset(
                                    {
                                        ...DEFAULT_FIELDS,
                                        acres: '',
                                        field: '',
                                        crop: '',
                                    },
                                );
                            }
                        }}>
                        reset
                    </Button>
                </div>
                <FormEntry className="col-span-2" label="date">
                    <Input type="date" className="w-full" {...register('date', { required: 'Missing date' })} />
                </FormEntry>
                <hr className="w-full col-span-full" />
            </div>
            <div className={cn('contents')}>
                <Title>Chemical Applications</Title>
                <Button onClick={() => setIsAdding(!isAdding)}>add</Button>
                {chemicalApplications.map((chemicalApplication) => (
                    <Card>
                        {JSON.stringify(chemicalApplication)}
                    </Card>
                ))}
                <hr className="w-full col-span-full" />
            </div>
            <div
                className={cn('contents', {
                })}
            >
                <Title>Note</Title>
                <textarea className="col-span-full" {...register('note')} />
                <hr className="w-full col-span-full" />
            </div>
            <div className="col-span-full text-red-700">
                {Object.entries(errors).map(([field, error]) => (
                    <div key={field}>{error.message}</div>
                ))}
            </div>
            <Button
                onClick={onSubmit}
                type="submit"
                loading={isSubmitting}
                className="col-span-full md:w-36"
            >
                complete
            </Button>
        </form>
    )
}

interface Props {
    fields: Rows<'field'>
    crops: Rows<'crop'>
    chemicals: Rows<'chemical'>
    onCancel: () => void;
    onSubmit: (data: any) => void;
}

export const ChemicalApplicationForm: React.VFC<Props> = ({
    fields,
    crops,
    chemicals,
    onCancel,
    onSubmit,
}) => {
    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors }
    } = useForm<Form>();

    const formData = watch();

    const { fields: formFields, append, remove } = useFieldArray({
        control,
        name: 'applications',
    });

    const onChange = (index: number) => (e: any) => {
        setValue(`applications.${index}.amount`, chemicals[e.target.value].default);
    }

    return (
        <form onSubmit={(e) => e.preventDefault()} className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <div
                className={cn('contents', {
                })}
            >
                <FormEntry className="col-span-2" label="field">
                    <Select defaultValue="" className="w-full" {...register('field', { required: 'Missing field' })}>
                        <option disabled value="">
                            Select a field
                        </option>
                        {Object.entries(fields).map(([id, field]) => (
                            <option key={id} value={id}>{field.name}</option>
                        ))}
                    </Select>
                </FormEntry>
                <FormEntry className="col-span-2" label="crop">
                    <Select defaultValue="" className="w-full" {...register('crop', { required: 'Missing crop' })}>
                        <option disabled value="">
                            Select a crop
                        </option>
                        {Object.entries(crops).map(([id, crop]) => (
                            <option key={id} value={id}>{crop.name}</option>
                        ))}
                    </Select>
                </FormEntry>
                <FormEntry className="col-span-2" label="acres">
                    <Input type="number" className="w-full" {...register('acres', { required: 'Missing acres' })} />
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
                        <Select defaultValue="" className="w-full" {...register(`applications.${index}.chemical`, { required: 'Missing chemical', onChange: onChange(index) })}>
                                    <option disabled value="">
                                        Select a chemical
                                    </option>
                                    {Object.entries(chemicals).map(([id, chemical]) => (
                                        <option key={id} value={id}>{chemical.name}</option>
                                    ))}
                                </Select>
                            </div>
                        </FormEntry>
                        <FormEntry
                            label="amount"
                            className="col-span-2"
                        >
                            <div className="flex">
                                <Input type="number" className="w-full" {...register(`applications.${index}.amount`, { required: 'Missing amount' })} />

                                <Input readOnly value={chemicals[formData.applications[index].chemical]?.unit ?? ''} />
                            </div>
                        </FormEntry>
                    </Card>
                ))}
                <Card className="relative col-span-2" onClick={() => append({ chemical: '', amount: '' })}>
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
            <div className="col-span-full text-red-700">
                {Object.entries(errors).map(([field, error]) => (
                    <div key={field}>{error.message}</div>
                ))}
            </div>
            <Button
                onClick={handleSubmit(onSubmit)}
                type="button"
                className="col-span-full md:w-36"
            >
                submit 
            </Button>
            <Button
                onClick={onCancel}
                type="button"
                className="col-span-full md:w-36"
            >
                cancel
            </Button>
        </form>
    );
};

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
