import React, { useEffect, useState } from 'react'
import cn from 'classnames';
import { format } from 'date-fns';
import { useRecords } from './records-store';
import { useFieldArray, useForm } from 'react-hook-form';
import { Button } from './ui/Button';

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

    const onSubmit = async ({ date, field, crop, acres, applications }: Form) => {
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
    }

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
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 grid-cols-2">
                <div
                    className={cn('contents', {
                        'hidden': step !== 1
                    })}
                >
                    <div className="col-span-2">
                        date:{' '}
                        <input type="date" {...register('date')} />
                    </div>
                    <div className="col-span-2">
                        field:{' '}
                        <select defaultValue="" {...register('field')}>
                            <option disabled value="">
                                Select a field
                            </option>
                            {fields.map(field => (
                                <option key={field} value={field}>{field}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-span-2">
                        crop:{' '}
                        <select defaultValue="" {...register('crop')}>
                            <option disabled value="">
                                Select a crop
                            </option>
                            {crops.map(crop => (
                                <option key={crop} value={crop}>{crop}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-span-2">
                        acres:{' '}
                        <input type="number" {...register('acres')} />
                    </div>
                    <hr className="w-full col-span-2" />
                    <button className="col-start-2" type="button" onClick={() => setStep(2)}>next</button>
                </div>
                <div
                    className={cn('contents', {
                        'hidden': step !== 2
                    })}
                >
                    {formFields.map((item, index) => (
                        <React.Fragment key={item.id}>
                            <div className="col-span-2">
                                chemical:{' '}
                                <select defaultValue="" {...register(`applications.${index}.chemical`)}>
                                    <option disabled value="">
                                        Select a chemical
                                    </option>
                                    {chemicals.map(chemical => (
                                        <option key={chemical} value={chemical}>{chemical}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-2">
                                amount:{' '}
                                <input {...register(`applications.${index}.amount`)} />
                            </div>
                            {formFields.length > 1 ? <button onClick={() => remove(index)}>remove</button> : null}
                        </React.Fragment>
                    ))}
                    <button className="col-start-1" type="button" onClick={() => append({})}>add</button>
                    <hr className="w-full col-span-2" />
                    <button type="button" onClick={() => setStep(1)}>back</button>
                    <button type="button" onClick={() => setStep(3)}>next</button>
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
                    <Button type="submit" loading={isSubmitting}>compete</Button>
                </div>
            </form>
        </>
    )
}
