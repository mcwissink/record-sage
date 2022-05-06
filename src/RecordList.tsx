import React, { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom";
import { Paginated } from "./records"
import { useRecords } from "./records-store";
import { Button } from "./ui/Button";

export const RecordList: React.VFC = () => {
    const [params] = useSearchParams();
    const [data, setData] = useState<Paginated<string[][]>>({
        rows: [],
        total: 0,
        limit: 0,
        offset: 0,
    });
    const { records } = useRecords();
    const parameters = {
        limit: Number(params.get('limit') ?? 5),
        offset: Number(params.get('offset') ?? 0),
    }

    useEffect(() => {
        records.get('chemical-application', parameters).then(setData);
    }, [records, params]);

    return (
        <div>
            <Link to="/records/add">
                <Button className="mb-4 mt-2 w-full md:w-auto">Add</Button>
            </Link>
            {data.rows.map(([id, date, field, crop, acres, chemical, amount]) => (
                <Link to={`/records/${id}`} key={id} className="no-underline">
                    <div className="flex items-center">
                        <div className="grow">
                            <div>{date}</div>
                            <ul>
                                <li>{field} - {crop} - {acres}</li>
                                <li>{chemical} - {amount}</li>
                            </ul>
                        </div>
                        <div className="text-4xl">
                            &rsaquo;
                        </div>
                    </div>
                    <hr />
                </Link>
            ))}
        </div>
    )
}
