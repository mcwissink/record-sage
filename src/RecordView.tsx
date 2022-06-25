import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom";
import { useRecords } from "./records-store";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { useLoading } from "./use-loading";
import { Progress } from "./ui/Progress";

const TABLE = 'chemical-application';

export const RecordView: React.VFC = () => {
    const navigate = useNavigate();
    const { isLoading, loading } = useLoading();
    const { recordId } = useParams();
    const [data, setData] = useState<string[]>([]);
    const { records } = useRecords();
    useEffect(() => {
        if (recordId) {
            loading(records.find)(TABLE, recordId).then(setData);
        }
    }, [records, recordId, loading]);

    if (!recordId) {
        return <div>Missing ID</div>
    }

    if (isLoading) {
        return <Progress />
    }

    if (!data.length) {
        return <div>404</div>
    }

    const onDelete = (row: string[]) => async () => {
        if (window.confirm(`Delete: ${JSON.stringify(row.slice(1))}`)) {
            await records.delete(TABLE, row[0]);
            navigate(-1);
        }
    };

    return (
        <div>
            {data.map((value, index) => <div key={index}>{value}</div>)}
            <Button type="button" onClick={onDelete(data)}>delete</Button>
        </div>
    )
}
