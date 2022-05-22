import React, { useEffect, useState } from 'react'
import cn from 'classnames';
import { format } from 'date-fns';
import { useRecords } from './records-store';
import { useFieldArray, useForm } from 'react-hook-form';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { useNavigate } from 'react-router-dom';
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
}

export const RecordEntry: React.VFC = () => {
    const navigate = useNavigate();
    const [fields, setFields] = useState<string[]>([]);
    const [crops, setCrops] = useState<string[]>([]);
    const [chemicals, setChemicals] = useState<string[]>([]);
    const {
        records,
    } = useRecords();

    const {
        register,
        control,
        handleSubmit,
        watch,
        formState: { isSubmitting }
    } = useForm<Form>({
        defaultValues: {
            date: format(new Date(), 'yyyy-MM-dd'),
            applications: [{}],
        }
    });
    const formData = watch();

    const { fields: formFields, append, remove } = useFieldArray({
        control,
        name: 'applications',
    });

    const onSubmit = handleSubmit(async ({ date, field, crop, acres, applications }: Form) => {
        for (const { chemical, amount } of applications) {
            await records.insert('chemical-application', [
                date,
                field,
                crop,
                acres,
                chemical,
                amount,
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
            setFields(fields.rows.map(([_id, name]: any) => name));
            setCrops(crops.rows.map(([_id, name]: any) => name));
            setChemicals(chemicals.rows.map(([_id, name]: any) => name));
        })();
    }, [records, setFields, setCrops]);

    return (
        <div>
            <form onSubmit={onSubmit} className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <div
                    className={cn('contents', {
                    })}
                >
                    <Title>Application</Title>
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
                    {formFields.map((item, index) => (
                        <Card key={item.id} className="col-span-2">
                            <FormEntry
                                label="chemical"
                                action={<Button onClick={() => remove(index)}>remove</Button>}
                            >
                                <Select defaultValue="" className="w-full" {...register(`applications.${index}.chemical`)}>
                                    <option disabled value="">
                                        Select a chemical
                                    </option>
                                    {chemicals.map(chemical => (
                                        <option key={chemical} value={chemical}>{chemical}</option>
                                    ))}
                                </Select>
                            </FormEntry>
                            <FormEntry
                                label="amount"
                                className="col-span-2"
                            >
                                <Input type="number" className="w-full" {...register(`applications.${index}.amount`)} />
                            </FormEntry>
                        </Card>
                    ))}
                    <Card className="col-span-2 flex items-center justify-center" onClick={() => append({})}>add</Card>
                    <hr className="w-full col-span-full" />
                </div>
                <div
                    className={cn('contents', {
                    })}
                >
                    <Title>Confirmation</Title>
                    <div className="col-span-2">
                        <span>{formData.date} {formData.field} {formData.crop} {formData.acres}</span>
                        <ul>
                            {formData.applications.map((application, index) => (
                                <li key={index}>
                                    <span>{application.chemical} {application.amount}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <hr className="w-full col-span-full" />
                    <Button
                        type="submit"
                        loading={isSubmitting}
                        className="col-span-2"
                    >
                        complete
                    </Button>
                </div>
            </form>
        </div>
    )
}

export const FormEntry: React.FC<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
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
