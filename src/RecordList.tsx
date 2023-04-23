import React, { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom";
import { Paginated, Rows } from "./records"
import { useRecords } from "./records-store";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Progress } from "./ui/Progress";
import { useLoading } from "./use-loading";
import { useNavigate } from "react-router-dom";
import { Label } from "./RecordView";

export const RecordList: React.VFC = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const { isLoading, loading } = useLoading();
    const [data, setData] = useState<Paginated<Rows<'chemical-application'>>>({
        rows: {},
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

    const onDuplicateRows = (rows: Rows<'chemical-application'>) => () => {
        navigate('records/add', { state: { rows } });
    };

    const rowsByDate = Object.entries(data.rows).reduce<Record<string, Rows<'chemical-application'>>>((acc, [id, row]) => {
        if (acc[row.date]) {
            acc[row.date][id] = row;
        } else {
            acc[row.date] = { [id]: row };
        }
        return acc;
    }, {});

    return (
        <div>
            <Link to="/records/add">
                <Button className="mb-4 mt-2 w-full md:w-36">Add</Button>
            </Link>
            <Progress active={isLoading} />
            <div className="flex flex-col gap-4">
                {Object.entries(rowsByDate).map(([date, rows]) => (
                    <React.Fragment key={date}>
                        <div className="flex items-end">
                            <b className="grow">{date}</b>
                            <Button onClick={onDuplicateRows(rows)}>duplicate</Button>
                        </div>
                        {Object.entries(rows).map(([id, row]) => (
                            <Link key={id} to={`/records/${id}`} className="no-underline">
                                <Card className="flex items-center hover:bg-gray-200 cursor-pointer">
                                    <div className="grid gap-1 grid-cols-1 md:grid-cols-2 w-full">
                                        <Label label="field">{row.field}</Label>
                                        <Label label="crop">{row.crop}</Label>
                                        <Label label="acres">{row.acres}</Label>
                                        <Label label="chemical">{row.chemical} [{row.registration}]</Label>
                                        <Label label="amount">{row.amount}</Label>
                                        <Label label="note">{row.note}</Label>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}
