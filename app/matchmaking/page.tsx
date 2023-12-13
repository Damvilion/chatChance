'use client';
import React, { useEffect, useState } from 'react';
import { pusherClient } from '@/app/lib/pusher';
import axios from 'axios';

const Page = () => {
    const [players, setPlayers] = useState<number | string>(0);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // ALL Users are subscribed to this channel
        const channel = pusherClient.subscribe('online_users');
        // Keeps track of the number of users subscribed to the channel
        channel.bind('pusher:subscription_count', (data: { subscription_count: React.SetStateAction<string | number> }) => {
            setPlayers(data.subscription_count);
        });

        pusherClient.connection.bind('disconnected', () => {
            console.log('you have been disconnected');
        });
    }, []);

    const startmatch = async () => {
        setLoading(true);
        // Subscribe to the matchmaking channel
        const matching = pusherClient.subscribe('matchmaking');

        // Fires a post request when pusherjs validates all users | This updates the redis database
        matching.bind('Validating all Users', async (data: string) => {
            await axios.post('/api/updateRedis', {
                socket_id: pusherClient.connection.socket_id,
            });
        });

        // API endpoint to validate all users
        const res = await axios.post('/api/startmatch', {});
        // Matchmaking has started | This will continue to run until a match is found
        const findMatch = async () => {
            while (true) {
                const Users = await axios.post('/api/getplayers');
                // This returns an array of all users
                const ALL_USERS = Users.data.allUsers;

                if (ALL_USERS.length < 2) {
                    console.log('Not enough players');
                } else {
                    // Matchmake them
                    const randomUser = ALL_USERS[Math.floor(Math.random() * ALL_USERS.length)];
                    if (randomUser !== pusherClient.connection.socket_id) {
                        // MATCH FOUND
                        console.log('Your Socket ID: ' + pusherClient.connection.socket_id);
                        console.log('Random User: ' + randomUser);
                        setLoading(false);
                        pusherClient.unsubscribe('matchmaking'); // Unsubscribe from the matchmaking channel
                        break; // Exit the loop when a match is found
                    }
                }

                await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second before checking again
            }
        };
        findMatch();
    };

    const logSocketID = () => {
        console.log(pusherClient.connection.socket_id);
    };

    return (
        <div>
            <h1>Page</h1>
            <div className='flex flex-col gap-4 justify-center items-center'>
                {players}
                <button className='bg-blue-400 p-3 rounded-lg' onClick={startmatch}>
                    Start Match
                </button>
                <button className='bg-red-500 p-3 rounded-lg' onClick={logSocketID}>
                    Log Socket_id
                </button>
            </div>
        </div>
    );
};

export default Page;
