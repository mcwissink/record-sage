import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom";
import { useRecords } from "./records-store";
import { Row } from "./records";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { useLoading } from "./use-loading";
import { Progress } from "./ui/Progress";

const TABLE = 'chemical-application';

export const RecordView: React.VFC = () => {
    const navigate = useNavigate();
    const { isLoading, loading } = useLoading();
    const { recordId } = useParams();
    const [row, setRow] = useState<Row<'chemical-application'> | undefined>();
    const { records } = useRecords();
    useEffect(() => {
        if (recordId) {
            loading(records.query)(TABLE, `SELECT * WHERE A = '${recordId}'`).then(({ rows }) => setRow(rows[recordId]));
        }
    }, [records, recordId, loading]);

    if (!recordId) {
        return <div>Missing ID</div>
    }

    if (isLoading) {
        return <Progress />
    }

    if (!row) {
        return <div>404</div>
    }

    const onDelete = (row: Row<'chemical-application'>) => async () => {
        if (window.confirm(`Delete: ${JSON.stringify(row.id)}`)) {
            await records.delete(TABLE, row.id);
            navigate(-1);
        }
    };

    return (
        <div className="grid gap-2">
            <div className="flex items-end">
                <b className="grow">{row.date}</b>
                <Button type="button" onClick={onDelete(row)}>delete</Button>
            </div>
            <div className="flex flex-col gap-1">
                <Label label="field">{row.field}</Label>
                <Label label="crop">{row.crop}</Label>
                <Label label="acres">{row.acres}</Label>
                <Label label="chemical">{row.chemical} [{row.registration}]</Label>
                <Label label="amount">{row.amount}</Label>
                <Label label="unit">{row.unit}</Label>
                <Label label="applicator">{row.applicator}</Label>
                <Label label="certification">{row.certification}</Label>
                <Label label="note">{row.note}</Label>
            </div>
        </div>
    )
}

export const Label: React.FC<{ label: string }> = ({ label, children, ...props }) => (
    <div {...props}>
        <b>{label}: </b>
        {children}
    </div>
);
