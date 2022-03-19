import React, { useEffect, useState } from 'react'
import cn from 'classnames';
import { format } from 'date-fns';
import { useRecords } from './use-records';
import { useFieldArray, useForm } from 'react-hook-form';

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

    const onSubmit: React.FormEventHandler = (e) => {
        e.preventDefault();
        handleSubmit(async ({ date, field, crop, acres, applications }) => {
            await Promise.all(
                applications.map(async ({ chemical, amount }) =>
                    records.insert('ChemicalApplication', [
                        date,
                        field,
                        crop,
                        acres,
                        chemical,
                        amount,
                    ]))
            );
        })();
    }

    useEffect(() => {
        (async () => {
            const [
                fields,
                crops,
                chemicals,
            ] = await Promise.all([
                records.get('Field'),
                records.get('Crop'),
                records.get('Chemical'),
            ]);
            setFields(fields.map(([_id, name]: any) => name));
            setCrops(crops.map(([_id, name]: any) => name));
            setChemicals(chemicals.map(([_id, name]: any) => name));
        })();
    }, [records, setFields, setCrops]);

    return (
        <>
            <form onSubmit={onSubmit}>
                <div
                    className={cn('flex flex-col gap-4', {
                        'hidden': step !== 1
                    })}
                >
                    <div>
                        date:{' '}
                        <input type="date" {...register('date')} />
                    </div>
                    <div>
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
                    <div>
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
                    <div>
                        acres:{' '}
                        <input type="number" {...register('acres')} />
                    </div>
                    <button type="button" onClick={() => setStep(2)}>Next</button>
                </div>
                <div
                    className={cn('flex flex-col gap-4', {
                        'hidden': step !== 2
                    })}
                >
                    {formFields.map((item, index) => (
                        <React.Fragment key={item.id}>
                            <div>

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
                            <div key={item.id}>
                                amount:{' '}
                                <input {...register(`applications.${index}.amount`)} />
                            </div>
                            {formFields.length > 1 ? <button onClick={() => remove(index)}>Remove</button> : null}
                            <hr />
                        </React.Fragment>
                    ))}
                    <button type="button" onClick={() => append({})}>Add</button>
                    <button type="button" onClick={() => setStep(3)}>Next</button>
                </div>
                <div
                    className={cn('flex flex-col gap-4', {
                        'hidden': step !== 3
                    })}
                >
                    <span>{formData.date} {formData.field} {formData.crop} {formData.acres}</span>
                    <ul>
                        {formData.applications.map((application, index) => (
                            <li key={index}>
                                <span>{application.chemical} {application.amount}</span>
                            </li>
                        ))}
                    </ul>
                    <button type="submit">Compete</button>
                </div>
            </form>
        </>
    )
}
