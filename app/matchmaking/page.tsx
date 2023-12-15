'use client';
import React, { useEffect, useRef, useState } from 'react';
import { pusherClient } from '@/app/lib/pusher';
import axios from 'axios';

const Page = () => {
    const [players, setPlayers] = useState<number | string>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [matchmaking, setMatchmaking] = useState<boolean>(false);
    // intervalID is used as a reference to the setInterval function
    let intervalID = useRef<NodeJS.Timeout | null>(null);

    const logChannels = () => {
        console.log(pusherClient.channels.channels);
    };

    const addToRedis = async () => {
        console.log('adding to redis');
        await axios.post('/api/matchmaking/updateRedis', {
            socket_id: pusherClient.connection.socket_id,
        });
    };

    // This function is used to stop the matchmaking process
    const stopMatching = () => {
        setMatchmaking(false);
        setLoading(false);
        clearInterval(intervalID.current!);
        pusherClient.unsubscribe('matchmaking');
        console.log('unsubscribed from matchmaking channel');
    };
    // This function is used to delete the user from the redis database
    const delteFromRedis = async () => {
        await axios.post('/api/matchmaking/deleteFromRedis', { socket_id: pusherClient.connection.socket_id });
    };
    // This useEffect hook is used to subscribe to the online_users channel
    useEffect(() => {
        // ALL Users are subscribed to this channel
        const channel = pusherClient.subscribe('online_users');

        // Keeps track of the number of users subscribed to the online_users channel

        channel.bind('pusher:subscription_count', (data: { subscription_count: React.SetStateAction<string | number> }) => {
            // update the number of players
            setPlayers(data.subscription_count);
        });

        channel.bind('match_found', (data: match_found_type) => {
            if (data.user1 === pusherClient.connection.socket_id || data.user2 === pusherClient.connection.socket_id) {
                delteFromRedis();
                pusherClient.unsubscribe('matchmaking');
                stopMatching();
                console.log("user1's socket_id: " + data.user1);
                console.log("user2's socket_id: " + data.user2);
            }
        });
        // When a user disconnects from the online_users channel
        pusherClient.connection.bind('disconnected', () => {
            console.log('you have been disconnected');
        });
    }, []);

    // Subscribe to the matchmaking channel | When matchmaking is true | handles matchmaking logic
    useEffect(() => {
        // If matchmaking is false | clear the interval
        if (!matchmaking && intervalID.current) {
            clearInterval(intervalID.current);
            return;
        }

        const matching = pusherClient.subscribe('matchmaking');

        // Fires a post request when pusherjs validates all users | This updates the redis database
        matching.bind('Validating all Users', async (data: string) => {
            await axios.post('/api/matchmaking/updateRedis', {
                socket_id: pusherClient.connection.socket_id,
            });
        });

        const findMatch = async () => {
            if (matchmaking) {
                const Users = await axios.post('/api/matchmaking/getplayers');
                // This returns an array of all users
                const ALL_USERS = Users.data.allUsers;

                if (ALL_USERS.length < 2) {
                    console.log('Not enough players');
                } else {
                    // Matchmake them
                    const randomUser = ALL_USERS[Math.floor(Math.random() * ALL_USERS.length)];
                    if (randomUser !== pusherClient.connection.socket_id) {
                        pusherClient.unsubscribe('matchmaking');
                        setMatchmaking(false);
                        setLoading(false);
                        // MATCH FOUND
                        // Send a post request to the server to trigger pusherjs to send a match_found event
                        await axios.post('/api/matchmaking/messageConnectedUsers', {
                            socket_id: pusherClient.connection.socket_id,
                            randomUser: randomUser,
                        });
                    }
                }
            }
        };
        // Keeps checking for a match every 1 second
        intervalID.current = setInterval(findMatch, 1000);

        return () => {
            if (intervalID.current) {
                clearInterval(intervalID.current);
            }
            pusherClient.unsubscribe('matchmaking');
        };
    }, [matchmaking]);

    // This function is used to start the matchmaking process
    const startmatch = async () => {
        setLoading(true);
        setMatchmaking(true);

        // API endpoint to validate all users
        await axios.post('/api/matchmaking/startmatch', {});
        // Matchmaking has started | This will continue to run until a match is found
    };

    const logSocketID = () => {
        console.log(pusherClient.connection.socket_id);
    };

    return (
        <div>
            <h1>Page</h1>
            <div className='flex flex-col gap-4 justify-center items-center'>
                {players}
                <button className={`${loading ? 'bg-slate-500' : 'bg-blue-400'} p-3 rounded-lg`} onClick={startmatch}>
                    Start Match
                </button>
                <button className='bg-red-500 p-3 rounded-lg' onClick={logSocketID}>
                    Log Socket_id
                </button>
                <button className='bg-red-500 p-3 rounded-lg' onClick={stopMatching}>
                    stop matching
                </button>
                <button className='bg-teal-500 p-3 rounded-lg' onClick={logChannels}>
                    log Channels
                </button>

                <button className='bg-amber-300 p-3 rounded-lg' onClick={addToRedis}>
                    add to redis
                </button>
            </div>
        </div>
    );
};

export default Page;
