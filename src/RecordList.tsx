import React, { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom";
import { Paginated } from "./records"
import { useRecords } from "./records-store";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Progress } from "./ui/Progress";
import { useLoading } from "./use-loading";
import { useAppStore } from './app-store';
import { useNavigate } from "react-router-dom";

export const RecordList: React.VFC = () => {
    const navigate = useNavigate();
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

    const onDuplicateRows = (rows: string[][]) => () => {
        navigate('records/add', { state: { rows } });
    };

    return (
        <div>
            <Link to="/records/add">
                <Button className="mb-4 mt-2 w-full md:w-36">Add</Button>
            </Link>
            <Progress active={isLoading} />
            <div className="flex flex-col gap-4">
                {data.rows.map((row, index) => {
                    const [id, date, field, crop, acres, chemical, amount] = row;
                    const [_, previousDate] = data.rows[index - 1] ?? [];
                    return (
                        <React.Fragment key={id}>
                            {date === previousDate ? null : (
                                <div className="flex items-end">
                                    <b className="grow">{date}</b>
                                    <Button onClick={onDuplicateRows([row])}>duplicate</Button>
                                </div>
                            )}
                            <Link to={`/records/${id}`} className="no-underline">
                                <Card className="flex items-center">
                                    <div className="grow flex flex-col gap-2">
                                        <span><b>Location: </b>{field} - {crop} - {acres}</span>
                                        <span><b>Chemical: </b>{chemical} - {amount}</span>
                                    </div>
                                </Card>
                            </Link>
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    )
}
