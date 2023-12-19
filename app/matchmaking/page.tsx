'use client';
import React, { useEffect, useRef, useState } from 'react';
import { pusherClient } from '@/app/lib/pusher';
import axios from 'axios';
// Live Kit imports
import '@livekit/components-styles';
import { LiveKitRoom } from '@livekit/components-react';
import VideoRoom from '@/app/components/VideoRoom';
// UUId
import { v4 as uuidv4 } from 'uuid';
import { match_found_type } from '../types/types';

const Page = () => {
    // Live Players
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [players, setPlayers] = useState<number | string>(0);

    const [loading, setLoading] = useState<boolean>(false);
    const [matchmaking, setMatchmaking] = useState<boolean>(false);
    const [matched_user, setMatched_user] = useState<string>('');

    // This state is used to determine whether or not to connect to the LiveKit Room
    const [connectToLiveKit, setConnectToLiveKit] = useState<boolean>(true);

    // intervalID is used as a reference to the setInterval function

    const intervalID = useRef<NodeJS.Timeout | null>(null);

    // Initialize LiveKit Connection
    const init = async () => {
        try {
            const resp = await fetch(`/api/get-participant-token?room=${uuidv4()}&username=initial`);
            const data = await resp.json();
            setConnectToLiveKit(true);
            setToken(data.token);
        } catch (e) {
            console.error(e);
        }
    };
    useEffect(() => {
        init();
    }, []);

    // This function is used to stop the matchmaking process
    const stopMatching = () => {
        setMatchmaking(false);
        setLoading(false);
        clearInterval(intervalID.current!);
        pusherClient.unsubscribe('matchmaking');
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
            pusherClient.unsubscribe('matchmaking');
            return;
        }

        const matching = pusherClient.subscribe('matchmaking');

        // Fires a post request when pusherjs validates all users | This updates the redis database
        matching.bind('Validating all Users', async () => {
            await axios.post('/api/matchmaking/updateRedis', {
                socket_id: pusherClient.connection.socket_id,
            });
        });

        matching.bind('match_found', (data: match_found_type) => {
            if (data.user1 === pusherClient.connection.socket_id || data.user2 === pusherClient.connection.socket_id) {
                const roomName = data.room;
                connectToRoom(roomName);
                delteFromRedis();
                stopMatching();
                pusherClient.unsubscribe('matchmaking');
                if (data.user1 === pusherClient.connection.socket_id) {
                    setMatched_user(data.user2);
                } else {
                    setMatched_user(data.user1);
                }
            }
        });

        const findMatch = async () => {
            if (matchmaking) {
                const Users = await axios.post('/api/matchmaking/getplayers');
                // This returns an array of all users
                const ALL_USERS = Users.data.allUsers;

                if (ALL_USERS.length < 2) {
                    console.log('Not enough players');
                } else {
                    console.log('finding valid match');
                    // Matchmake them
                    const randomUser = ALL_USERS[Math.floor(Math.random() * ALL_USERS.length)];
                    if (randomUser !== pusherClient.connection.socket_id) {
                        // MATCH FOUND
                        // Send a post request to the server to trigger pusherjs to send a match_found event
                        pusherClient.unsubscribe('matchmaking');
                        const room = uuidv4();
                        connectToRoom(room);
                        await axios.post('/api/matchmaking/messageConnectedUsers', {
                            socket_id: pusherClient.connection.socket_id,
                            randomUser: randomUser,
                            room,
                        });
                        delteFromRedis();
                        setMatchmaking(false);
                        setLoading(false);
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

    // This function is used to disconnnect from livekit and stop the matchmaking process
    const stopAllMatching = () => {
        setMatchmaking(false);
        setLoading(false);
        setConnectToLiveKit(false);
        clearInterval(intervalID.current!);
        pusherClient.unsubscribe('matchmaking');
        init();
    };

    // LIVE KIT
    const [token, setToken] = useState('');

    const connectToRoom = async (room: string) => {
        setConnectToLiveKit(false);
        try {
            const resp = await fetch(`/api/get-participant-token?room=${room}&username=${pusherClient.connection.socket_id}`);
            const data = await resp.json();
            if (data) {
                setConnectToLiveKit(true);
                setToken(data.token);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className='flex flex-col md:flex-row p-1'>
            <LiveKitRoom
                video={true}
                audio={true}
                token={token}
                connect={connectToLiveKit}
                serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                data-lk-theme='disable'

                // className='h-[500px] w-[500px] flex justify-center sm:max-h-[500px] sn:max-w-[500px]  md:max-h-[600px] md:max-w-[600px] lg:max-h-[700px] lg:max-w-[700px]'
            >
                <VideoRoom loading={loading} startMatch={startmatch} stopMatching={stopAllMatching} matched_user={matched_user} />
            </LiveKitRoom>

            <div className='w-full flex justify-center'>
                <h1>CHAT BOX</h1>
            </div>
        </div>
    );
};

export default Page;
