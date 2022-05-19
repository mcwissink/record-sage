import React, { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom";
import { Paginated } from "./records"
import { useRecords } from "./records-store";
import { Button } from "./ui/Button";
import { Progress } from "./ui/Progress";
import { useLoading } from "./use-loading";

export const RecordList: React.VFC = () => {
    const [params] = useSearchParams();
    const { isLoading, loading } = useLoading();
    const [data, setData] = useState<Paginated<string[][]>>({
        rows: [],
        total: 0,
        limit: 0,
        offset: 0,
    });
    const { records } = useRecords();
    const parameters = {
        limit: Number(params.get('limit') ?? 20),
        offset: Number(params.get('offset') ?? 0),
    }

    useEffect(() => {
        loading(records.get)('chemical-application', parameters).then(setData);
    }, [records, params]);

    return (
        <div>
            <Link to="/records/add">
                <Button className="mb-4 mt-2 w-full md:w-36">Add</Button>
            </Link>
            <Progress active={isLoading} />
            <div className="flex flex-col gap-4">
                {data.rows.map(([id, date, field, crop, acres, chemical, amount], index) => {
                    const [_, previousDate] = data.rows[index - 1] ?? [];
                    return (
                        <React.Fragment key={id}>
                            {date === previousDate ? null : (
                                <div className="flex items-center">
                                    <b className="grow">{date}</b>
                                    <Button>duplicate</Button>
                                </div>
                            )}
                            <Link to={`/records/${id}`} className="no-underline">
                                <div className="flex items-center shadow p-4 bg-gray-100 rounded">
                                    <div className="grow flex flex-col gap-2">
                                        <span><b>Location: </b>{field} - {crop} - {acres}</span>
                                        <span><b>Chemical: </b>{chemical} - {amount}</span>
                                    </div>
                                    <div className="text-4xl">
                                        &rsaquo;
                                    </div>
                                </div>
                            </Link>
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    )
}
