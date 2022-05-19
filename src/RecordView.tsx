import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom";
import { useRecords } from "./records-store";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";

const TABLE = 'chemical-application';

export const RecordView: React.VFC = () => {
    const navigate = useNavigate();
    const { recordId } = useParams();
    const [data, setData] = useState<string[]>([]);
    const { records } = useRecords();
    useEffect(() => {
        if (recordId) {
            records.find(TABLE, recordId).then(setData);
        }
    }, [records, recordId]);

    if (!recordId) {
        return <div>Missing ID</div>
    }

    if (!data.length) {
        return <div>Loading</div>
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
