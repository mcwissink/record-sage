import React, { useEffect, useState } from 'react'
import { useSearchParams } from "react-router-dom";
import cn from 'classnames';
import { format } from 'date-fns';
import { useGet, useRecords } from './records-store';
import { Rows } from './records';
import { useFieldArray, useForm } from 'react-hook-form';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Stringify } from './ui/Stringify';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from './ui/Card';

interface ChemicalApplication {
    field: string;
    crop: string;
    acres: string;
    chemical: string;
    amount: string;
}

interface Form {
    date: string;
    title: string;
    applicator: string;
    chemicalApplications: ChemicalApplication[];
    note: string;
}

const DEFAULT_FIELDS = {
    date: format(new Date(), 'yyyy-MM-dd'),
    title: 'Application',
    applications: [{}],
}

const isRows = (state: any): state is { rows: Rows<'chemical-application'>} => state && 'rows' in state;

export const RecordEntry: React.VFC = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [params] = useSearchParams();
    const { data: fields } = useGet('field');
    const { data: crops } = useGet('crop');
    const { data: chemicals } = useGet('chemical');
    const { data: applicators } = useGet('applicator');
    console.log(applicators);
    const {
        records,
    } = useRecords();

    const {
        register,
        handleSubmit,
        control,
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

    const { fields: chemicalApplications, prepend, remove } = useFieldArray({
        control,
        name: 'chemicalApplications',
    });

    if (!fields || !crops || !chemicals || !applicators) {
        return null;
    }

    const onSubmit = handleSubmit(async ({ date, title, applicator, chemicalApplications, note }) => {
        const application = await records.insert('application', {
            title, 
            date,
            applicator: applicators.rows[applicator].name,
            certification: applicators.rows[applicator].certification,
            note,
        });
        for (const { chemical, amount, field, crop, acres } of chemicalApplications) {
            await records.insert('chemical-application', {
                _application: application._id,
                field: fields.rows[field].name,
                crop: crops.rows[crop].name,
                acres,
                chemical: chemicals.rows[chemical].name,
                registration: chemicals.rows[chemical].registration,
                amount,
                unit: chemicals.rows[chemical].unit,
            });
        }
        navigate('/');
    });

    if (params.get('chemical')) {
        return (
            <ChemicalApplicationForm
                fields={fields.rows}
                crops={crops.rows}
                chemicals={chemicals.rows}
                onCancel={() => navigate(-1)}
                onSubmit={(data) => {
                    prepend(data);
                    navigate(-1);
                }}
            />
        );
    }

    return (
        <form onSubmit={(e) => e.preventDefault()} className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <div className="contents">
                <Title>Application</Title>
                <FormEntry className="col-span-2" label="date">
                    <Input type="date" className="w-full" {...register('date', { required: 'Missing date' })} />
                </FormEntry>
                <FormEntry className="col-span-2" label="title">
                    <Input type="text" className="w-full" {...register('title')} />
                </FormEntry>
                <FormEntry className="col-span-2" label="applicator">
                    <Select defaultValue="" className="w-full" {...register('applicator', { required: 'Missing applicator' })}>
                        <option disabled value="">
                            Select an applicator 
                        </option>
                        {Object.entries(applicators.rows).map(([id, applicator]) => (
                            <option key={id} value={id}>{applicator.name}</option>
                        ))}
                    </Select>
                </FormEntry>
                <hr className="w-full col-span-full" />
            </div>
            <div className={cn('contents')}>
                <Title>Chemical Applications</Title>
                <Button onClick={() => navigate({ search: new URLSearchParams({ chemical: '1' }).toString() })}>add</Button>
                    
                {chemicalApplications.map(({ id, field, crop, acres, chemical, amount }, index) => (
                    <Card key={id} className="flex items-start gap-2 flex-col md:flex-row md:items-center col-span-full">
                        <Stringify data={{
                            field: fields.rows[field].name,
                            crop: crops.rows[crop].name,
                            acres,
                            chemical: chemicals.rows[chemical].name,
                            registration: chemicals.rows[chemical].registration,
                            amount,
                            unit: chemicals.rows[chemical].unit,
                        }} />
                        <div>
                            <Button onClick={() => remove(index)}>remove</Button>
                        </div>
                    </Card>
                 ))}
                 <hr className="w-full col-span-full" />
            </div>
            <div className="contents">
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
                type="button"
                loading={isSubmitting}
            >
                submit
            </Button>
            <Button
                onClick={() => navigate(-1)}
                type="button"
            >
                cancel 
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

interface ChemicalApplicationFields {
    field: string;
    crop: string;
    acres: string;
    applications: Array<{
        chemical: string;
        amount: string;
    }>
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
    } = useForm<ChemicalApplicationFields>();

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
            <div className="contents">
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
            <div className="contents">
                <Title>Chemicals</Title>
                {formFields.map((application, index) => (
                    <Card key={application.id} className="grid gap-4 col-span-full md:grid-cols-[1fr_1fr_max-content]">
                        <FormEntry label="chemical">
                            <Select className="w-full" {...register(`applications.${index}.chemical`, { required: 'Missing chemical', onChange: onChange(index) })}>
                                <option disabled value="">
                                    Select a chemical
                                </option>
                                {Object.entries(chemicals).map(([id, chemical]) => (
                                    <option key={id} value={id}>{chemical.name}</option>
                                ))}
                            </Select>
                        </FormEntry>
                        <FormEntry label="amount">
                            <div className="flex">
                                <Input type="number" className="grow" {...register(`applications.${index}.amount`, { required: 'Missing amount' })} />

                                <Input readOnly value={chemicals[formData.applications[index].chemical]?.unit ?? ''} />
                            </div>
                        </FormEntry>
                        <FormEntry label="action">
                            <Button onClick={() => remove(index)}>remove</Button>
                        </FormEntry>
                    </Card>
                ))}
                <Button onClick={() => append({ chemical: '', amount: '' })}>add</Button>
                <hr className="w-full col-span-full" />
            </div>
            <div className="col-span-full text-red-700">
                {Object.entries(errors).map(([field, error]) => (
                    <div key={field}>{error.message}</div>
                ))}
            </div>
            <Button
                onClick={handleSubmit((data) => {
                    const {
                        field,
                        crop,
                        acres,
                        applications,
                    } = data;

                    onSubmit(applications.map(({ chemical, amount }) => ({
                        field,
                        crop,
                        acres,
                        chemical,
                        amount,
                    })));
                })}
                type="button"
            >
                submit 
            </Button>
            <Button
                onClick={onCancel}
                type="button"
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
