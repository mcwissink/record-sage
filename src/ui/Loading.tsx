import React from 'react'
import cn from 'classnames';

interface Props {
    loading: boolean;
}

export const Login: React.VFC<Props> = ({ loading }) => {
    return (
        <progress className={cn('w-full transition-all', {
            'opacity-0': !loading,
        })} />
    );
}
