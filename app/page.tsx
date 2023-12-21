'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@nextui-org/button';

export default function Home() {
    const router = useRouter();
    const pushToMatchmaking = () => {
        router.push('/matchmaking');
    };

    return (
        <main className='flex min-h-screen flex-col items-center justify-center p-24 bg-gray-600 gap-3'>
            <h1>HELLO</h1>
            <h2>This Page is still in production</h2>
            <Button onClick={pushToMatchmaking}> Click Here for Matchmaking Page</Button>
        </main>
    );
}
