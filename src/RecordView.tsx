import React, { useEffect, useState } from "react"
import { useParams, useSearchParams } from "react-router-dom";
import { Paginated } from "./records"
import { useRecords } from "./records-store";

export const RecordView: React.VFC = () => {
    const { recordId } = useParams();
    const [data, setData] = useState<string[]>([]);
    const { records } = useRecords();
    useEffect(() => {
        if (recordId) {
            records.find('chemical-application', recordId).then(setData);
        }
    }, [records, recordId]);

    if (!recordId) {
        return <div>Missing ID</div>
    }

    if (!data.length) {
        return <div>Loading</div>
    }

    return (
        <div>
            {data.map((value, index) => <div key={index}>{value}</div>)}
        </div>
    )
}
