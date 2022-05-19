import React, { useEffect, useState } from 'react'
import cn from 'classnames';
import { format } from 'date-fns';
import { useRecords } from './records-store';
import { useFieldArray, useForm } from 'react-hook-form';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { useNavigate } from 'react-router-dom';

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
    const [step, setStep] = useState(1);
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
            <form onSubmit={onSubmit} className="grid gap-4 grid-cols-2">
                <div
                    className={cn('contents', {
                        'hidden': step !== 1
                    })}
                >
                    <div className="col-span-2">
                        <div>
                            date:{' '}
                            <Input type="date" {...register('date')} />
                        </div>
                    </div>
                    <div className="col-span-2">
                        field:{' '}
                        <Select defaultValue="" {...register('field')}>
                            <option disabled value="">
                                Select a field
                            </option>
                            {fields.map(field => (
                                <option key={field} value={field}>{field}</option>
                            ))}
                        </Select>
                    </div>
                    <div className="col-span-2">
                        crop:{' '}
                        <Select defaultValue="" {...register('crop')}>
                            <option disabled value="">
                                Select a crop
                            </option>
                            {crops.map(crop => (
                                <option key={crop} value={crop}>{crop}</option>
                            ))}
                        </Select>
                    </div>
                    <div className="col-span-2">
                        acres:{' '}
                        <Input type="number" {...register('acres')} />
                    </div>
                    <hr className="w-full col-span-2" />
                    <Button className="col-start-2" type="button" onClick={() => setStep(2)}>next</Button>
                </div>
                <div
                    className={cn('contents', {
                        'hidden': step !== 2
                    })}
                >
                    {formFields.map((item, index) => (
                        <React.Fragment key={item.id}>
                            {index ? <hr className="w-full col-span-2" /> : null}
                            <div className="col-span-2">
                                chemical:{' '}
                                <Select defaultValue="" {...register(`applications.${index}.chemical`)}>
                                    <option disabled value="">
                                        Select a chemical
                                    </option>
                                    {chemicals.map(chemical => (
                                        <option key={chemical} value={chemical}>{chemical}</option>
                                    ))}
                                </Select>
                            </div>
                            <div className="col-span-2">
                                amount:{' '}
                                <Input type="number" {...register(`applications.${index}.amount`)} />
                            </div>
                            {formFields.length > 1 ? <Button onClick={() => remove(index)}>remove</Button> : null}
                        </React.Fragment>
                    ))}
                    <Button className="col-start-1 col-span-2" type="button" onClick={() => append({})}>add</Button>
                    <hr className="w-full col-span-2" />
                    <Button type="button" onClick={() => setStep(1)}>back</Button>
                    <Button type="button" onClick={() => setStep(3)}>next</Button>
                </div>
                <div
                    className={cn('contents', {
                        'hidden': step !== 3
                    })}
                >
                    <div>
                        <span>{formData.date} {formData.field} {formData.crop} {formData.acres}</span>
                        <ul>
                            {formData.applications.map((application, index) => (
                                <li key={index}>
                                    <span>{application.chemical} {application.amount}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <hr className="w-full col-span-2" />
                    <button type="button" onClick={() => setStep(1)}>back</button>
                    <Button type="submit" loading={isSubmitting}>complete</Button>
                </div>
            </form>
        </div>
    )
}
