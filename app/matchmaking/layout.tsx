import React from 'react';

export default function MatchMakingLayout({ children }: { children: React.ReactNode }) {
    return <div className='h-screen flex flex-col justify-center md:justify-start'>{children}</div>;
}
