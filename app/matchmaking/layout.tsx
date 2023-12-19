'use client';
import * as React from 'react';
import { NextUIProvider } from '@nextui-org/react';

export default function MatchMakingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className='h-screen flex flex-col justify-center md:justify-start bg-slate-700'>
            <NextUIProvider>{children}</NextUIProvider>
        </div>
    );
}
