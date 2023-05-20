import cn from 'classnames';

export const Table = <Column extends string>({ data, columns, input, className, ...props }: React.ComponentPropsWithoutRef<'table'> & {
    data: Array<Record<Column, string>>
    columns: Array<Column>
    input?: Record<Column, React.VFC> 
}) => {
    return (
        <table {...props} className={cn(className, 'border-collapse')}>
            <thead>
                <tr>
                    {columns.map((column, i) => (
                        <th key={i}>{column}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, i) => (
                    <tr key={i}>
                        {columns.map((column, j) => (
                            <td key={j} className="border border-solid p-4">{row[column]}</td>
                        ))}
                    </tr>
                ))}
                {input && (
                    <tr>
                        {columns.map((column, j) => (
                            <td key={j} className="border border-solid p-4">{input[column]}</td>
                        ))}
                    </tr>
                )}
            </tbody>
        </table>
    );
};
