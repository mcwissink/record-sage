import React from 'react';
import cn from 'classnames';
import { Link, useNavigate  } from 'react-router-dom';

export const Pagination: React.VFC<React.ComponentPropsWithoutRef<'span'> & {
    offset: number;
    limit: number;
    total: number;
}> = ({ total, limit, offset, ...props }) => {
    const navigate = useNavigate();
    if (!total) {
        return null;
    }
    const page = Math.ceil(offset / limit);
    const pages = new Array(Math.ceil(total / limit)).fill(0);
    return (
        <span {...props}>
            <div className="inline-flex gap-4">
                <Link
                    className={cn({ 'invisible': !page })}
                    to={`?limit=${limit}&offset=${offset - limit}`}
                >
                    prev
                </Link>
                <div>
                <select onChange={(e) => navigate(`?limit=${limit}&offset=${limit * Number(e.target.value)}`)} value={page}>
                        {pages.map((_, index) => (
                            <option key={index} value={index}>
                                {index + 1}
                            </option>
                        ))}
                    </select>
                    {' '}of {pages.length}
                </div>
                <Link
                    className={cn({ 'invisible': page === pages.length - 1 })}
                    to={`?limit=${limit}&offset=${offset + limit}`}
                >
                    next
                </Link>
            </div>
        </span>
    );
}
