'use client';
import React, { useEffect, useState } from 'react';
import { pusherClient } from '@/app/lib/pusher';
import axios from 'axios';

const Page = () => {
    const [players, setPlayers] = useState<number | string>(0);
    const getTotalPlayers = async () => {
        const res = await axios.get('/api/getTotalPlayers');
        if (!res) {
            setPlayers('Error finding number of user');
        } else {
            setPlayers(res.data.channelsInfo.channel.subscription_count);
        }
    };
    pusherClient.subscribe('online_users');

    useEffect(() => {
        getTotalPlayers();
        // pusherClient.subscribe('channel');

        return pusherClient.unsubscribe('online_users');
    }, []);

    return (
        <div>
            <h1>Page</h1>
            <p>There are {players} Online!</p>
        </div>
    );
};

export default Page;
