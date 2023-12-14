'use client';
import React, { useEffect, useRef, useState } from 'react';
import { pusherClient } from '@/app/lib/pusher';
import axios from 'axios';

const Page = () => {
    const [players, setPlayers] = useState<number | string>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [matchmaking, setMatchmaking] = useState<boolean>(false);
    // intervalID is used to clear the interval when the component unmounts
    let intervalID = useRef<NodeJS.Timeout | null>(null);

    const logChannels = () => {
        console.log(pusherClient.channels.channels);
    };

    // This function is used to stop the matchmaking process
    const stopMatching = () => {
        setMatchmaking(false);
        setLoading(false);
        clearInterval(intervalID.current!);
        pusherClient.unsubscribe('matchmaking');
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
        // When a user disconnects from the online_users channel
        pusherClient.connection.bind('disconnected', () => {
            console.log('you have been disconnected');
        });
    }, []);

    // Subscribe to the matchmaking channel | When matchmaking is true | handles matchmaking logic
    useEffect(() => {
        if (!matchmaking && intervalID.current) {
            clearInterval(intervalID.current);
            return;
        }

        const matching = pusherClient.subscribe('matchmaking');

        console.log('subscribed to matchmaking channel');

        // Fires a post request when pusherjs validates all users | This updates the redis database
        matching.bind('Validating all Users', async (data: string) => {
            await axios.post('/api/updateRedis', {
                socket_id: pusherClient.connection.socket_id,
            });
        });

        matching.bind('match_found', (data: { user1: string; user2: string }) => {
            // When a match is found | This will only run for the two users that are matched
            if (data.user1 === pusherClient.connection.socket_id || data.user2 === pusherClient.connection.socket_id) {
                pusherClient.unsubscribe('matchmaking');
                stopMatching();
                console.log("user1's socket_id: " + data.user1);
                console.log("user2's socket_id: " + data.user2);
            }
        });

        const findMatch = async () => {
            if (matchmaking) {
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
                        // Emit an event to the matchmaking channel
                        matching.emit('match_found', {
                            user1: pusherClient.connection.socket_id,
                            user2: randomUser,
                        });
                        setMatchmaking(false);
                        setLoading(false);
                        pusherClient.unsubscribe('matchmaking'); // Unsubscribe from the matchmaking channel
                        // Exit the loop when a match is found
                    }
                }
            }
        };
        // Keeps checking for a match every 2 seconds
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
        await axios.post('/api/startmatch', {});
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
            </div>
        </div>
    );
};

export default Page;
