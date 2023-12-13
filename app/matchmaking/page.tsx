'use client';
import React, { useEffect, useState } from 'react';
import { pusherClient } from '@/app/lib/pusher';
import axios from 'axios';

const Page = () => {
    const [players, setPlayers] = useState<number | string>(0);

    useEffect(() => {
        // ALL Users are subscribed to this channel
        const channel = pusherClient.subscribe('online_users');
        // Keeps track of the number of users subscribed to the channel
        channel.bind('pusher:subscription_count', (data: { subscription_count: React.SetStateAction<string | number> }) => {
            setPlayers(data.subscription_count);
        });
        // Fires a post response when pusherjs validates all users
        channel.bind('Validating all Users', async (data: string) => {
            await axios.post('/api/updateRedis', {
                socket_id: pusherClient.connection.socket_id,
            });
        });
        pusherClient.connection.bind('disconnected', () => {
            console.log('you have been disconnected');
        });
    }, []);

    const startmatch = async () => {
        // API endpoint to validate all users
        const res = await axios.post('/api/startmatch', {});

        // Get the list of all curent users

        // Matchmake them
    };

    return (
        <div>
            <h1>Page</h1>
            <div className='flex flex-col gap-4 justify-center items-center'>
                {players}
                <button className='bg-blue-400 p-3 rounded-lg' onClick={startmatch}>
                    Start Match
                </button>
            </div>
        </div>
    );
};

export default Page;
