'use client';
import React, { useEffect, useState } from 'react';
import { pusherClient } from '@/app/lib/pusher';
import { redisClient } from '@/app/lib/redis';

const Page = () => {
    const [players, setPlayers] = useState<number | string>(0);

    useEffect(() => {
        const channel = pusherClient.subscribe('online_users');
        channel.bind('pusher:subscription_count', (data: { subscription_count: React.SetStateAction<string | number> }) => {
            setPlayers(data.subscription_count);
        });
        pusherClient.connection.bind('disconnected', () => {
            console.log('you have been disconnected');
        });
    }, []);

    // const HandleDisconnect = () => {
    //     pusherClient.disconnect();
    // };

    const logPusherUser = () => {
        console.log(pusherClient.connection.socket_id);
    };
    return (
        <div>
            <h1>Page</h1>
            <button onClick={logPusherUser}>Disconnect</button>
            {players}
        </div>
    );
};

export default Page;
