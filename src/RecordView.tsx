import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom";
import { useRecords } from "./records-store";
import { Row, Rows } from "./records";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { useLoading } from "./use-loading";
import { Progress } from "./ui/Progress";
import { Card } from "./ui/Card";
import { Stringify } from "./ui/Stringify";


export const RecordView: React.VFC = () => {
    const navigate = useNavigate();
    const { isLoading, loading } = useLoading();
    const { recordId } = useParams();
    const [application, setApplication] = useState<Row<'application'> | undefined>();
    const [chemicalApplications, setChemicalApplications] = useState<Rows<'chemical-application'> | undefined>();
    const { records } = useRecords();
    useEffect(() => {
        if (recordId) {
            loading(async () => {
                setApplication((await records.query('application', `SELECT * WHERE A = '${recordId}'`)).rows[recordId]);
                setChemicalApplications((await records.query('chemical-application', `SELECT * WHERE B = '${recordId}'`)).rows);
            })();
        }
    }, [records, recordId, loading]);

    if (!recordId) {
        return <div>Missing ID</div>
    }

    if (isLoading) {
        return <Progress />
    }

    if (!application || !chemicalApplications) {
        return <div>404</div>
    }

    const onDelete = (row: Row<'application'>) => async () => {
        if (window.confirm(`Delete: ${JSON.stringify(row._id)}`)) {
            await records.delete('application', row._id);
            navigate(-1);
        }
    };

    console.log(chemicalApplications);

    return (
        <div className="grid gap-2">
            <div className="flex items-end">
                <b className="grow">{application.date}</b>
                <Button type="button" onClick={onDelete(application)}>delete</Button>
            </div>
            <div className="flex flex-col gap-1">
                <Label label="applicator">{application._id}</Label>
                <Label label="applicator">{application.applicator}</Label>
                <Label label="certification">{application.certification}</Label>
                <Label label="note">{application.note}</Label>
            </div>
            <hr />
            {Object.entries(chemicalApplications).map(([id, { _application, ...chemicalApplication }]) => (
                <Card key={id} className="flex items-start gap-2 flex-col md:flex-row md:items-center col-span-full">
                    <Stringify data={chemicalApplication as any} />
                </Card>
            ))}
        </div>
    )
}

export const Label: React.FC<{ label: string }> = ({ label, children, ...props }) => (
    <div {...props}>
        <b>{label}: </b>
        {children}
    </div>
);
