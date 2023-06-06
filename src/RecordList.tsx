import React, { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom";
import { Paginated, Rows } from "./records"
import { useRecords } from "./records-store";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Pagination } from './ui/Pagination';
import { Progress } from "./ui/Progress";
import { Stringify } from "./ui/Stringify";
import { useLoading } from "./use-loading";

export const RecordList: React.VFC = () => {
    const [params] = useSearchParams();
    const { isLoading, loading } = useLoading();
    const [applications, setApplications] = useState<Paginated<Rows<'application'>>>({
        rows: {},
        total: 0,
        limit: 0,
        offset: 0,
    });
    const [pendingApplications, setPendingApplications] = useState<Paginated<Rows<'application'>>>({
        rows: {},
        total: 0,
        limit: 0,
        offset: 0,
    });
    const { records } = useRecords();
    const limit = Number(params.get('limit') ?? 20);
    const offset = Number(params.get('offset') ?? 0);

    useEffect(() => {
        loading(records.query)('application', `SELECT * ORDER BY B DESC LIMIT ${limit} OFFSET ${offset}`).then(setApplications);
        records.cache.get('application').then(setPendingApplications);
    }, [records, params, limit, offset, loading]);

    // const onDuplicateRows = (rows: Rows<'application'>) => () => {
    //     navigate('records/add', { state: { rows } });
    // };

    const rowsByDate = Object.entries(applications.rows).reduce<Record<string, Rows<'application'>>>((acc, [id, row]) => {
        if (acc[row.date]) {
            acc[row.date][id] = row;
        } else {
            acc[row.date] = { [id]: row };
        }
        return acc;
    }, {});

    return (
        <div className="flex flex-col gap-4">
            <Link to="/records/add">
                <Button className="w-full md:w-36">add</Button>
            </Link>
            <Progress active={isLoading} />
            {!!pendingApplications.total && (
                <>
                    <div className="flex flex-col gap-4">
                        <b>pending</b>
                        {Object.entries(pendingApplications.rows).map(([id, row]) => (
                            <Card key={id} className="flex items-center opacity-75">
                                <Stringify data={row} />
                            </Card>
                        ))}
                    </div>
                    {!!applications.total && <hr className="w-full col-span-full" />}
                </>
            )}
            <div className="flex flex-col gap-4">
                {Object.entries(rowsByDate).map(([date, rows]) => (
                    <React.Fragment key={date}>
                        <div className="flex items-end">
                            <b className="grow">{date}</b>
                        </div>
                        {Object.entries(rows).map(([id, row]) => (
                            <Link key={id} to={`/records/${id}`} className="no-underline">
                                <Card className="flex items-center hover:bg-gray-200 cursor-pointer">
                                    <Stringify data={row} />
                                </Card>
                            </Link>
                        ))}
                    </React.Fragment>
                ))}
                <Pagination
                    offset={offset}
                    total={applications.total}
                    limit={limit}
                />
            </div>
        </div>
    )
}
