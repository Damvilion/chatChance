'use client';
import React, { useEffect, useState } from 'react';
import { pusherClient } from '@/app/lib/pusher';
import axios from 'axios';

const Page = () => {
    const [players, setPlayers] = useState<number | string>(0);
    const getTotalPlayers = async () => {
        const res = await axios.get('/api/getTotalPlayers');
        console.log(res);
        if (!res) {
            setPlayers('Error finding number of user');
        } else {
            setPlayers(res.data.channelsInfo.online_users.subscription_count);
        }
    };
    pusherClient.subscribe('online_users');

    useEffect(() => {
        getTotalPlayers();
    }, []);

    return (
        <div>
            <h1>Page</h1>
            <p>There are {players} Online!</p>
            <button onClick={getTotalPlayers}>Get Players</button>
        </div>
    );
};

export default Page;
