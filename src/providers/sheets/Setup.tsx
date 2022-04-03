import React from 'react'
import { useRecords } from '../../use-records';
import { schema } from '../../schema';
import { useForm } from 'react-hook-form';
import { Button } from '../../ui/Button';
import { Progress } from '../../ui/Progress';
import { useLoading } from '../../use-loading';

interface Form {
    spreadsheetId: string;
}

export const Setup: React.VFC = () => {
    const { setup } = useRecords();
    const { isLoading, loading } = useLoading();
    const { register, handleSubmit, formState: { isSubmitting } } = useForm<Form>();

    return (
        <>
            <Progress active={isLoading} />
            <ul>
                <li className="p-2">
                    <div>Link to an existing spreadsheet</div>
                    <form onSubmit={handleSubmit(({ spreadsheetId }) =>
                        loading(setup)({ schema, provider: { spreadsheetId } })
                    )}>
                        <input {...register('spreadsheetId')} />
                        <Button loading={isSubmitting}>Connect</Button>
                    </form>
                </li>
                <li className="p-2">
                    <div>Create new spreadsheet</div>
                    <Button onClick={() => loading(setup)({ schema })}>Create</Button>
                </li>
            </ul>
        </>
    );
}
