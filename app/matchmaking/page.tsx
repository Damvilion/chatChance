'use client';
import React, { useEffect, useRef, useState } from 'react';
import { pusherClient } from '@/app/lib/pusher';
import axios from 'axios';
// Live Kit imports
import '@livekit/components-styles';
import { LiveKitRoom, VideoConference, GridLayout, ParticipantTile } from '@livekit/components-react';
import VideoRoom from '@/app/components/VideoRoom';
// UUId
import { v4 as uuidv4 } from 'uuid';

const Page = () => {
    // Live Players
    const [players, setPlayers] = useState<number | string>(0);

    const [loading, setLoading] = useState<boolean>(false);
    const [matchmaking, setMatchmaking] = useState<boolean>(false);
    const [matched_user, setMatched_user] = useState<string>('');
    // const [room, setRoom] = useState<string>(uuidv4());
    const startingRoom = uuidv4();

    // intervalID is used as a reference to the setInterval function

    let intervalID = useRef<NodeJS.Timeout | null>(null);

    // Initialize LiveKit Connection
    useEffect(() => {
        (async () => {
            try {
                const resp = await fetch(`/api/get-participant-token?room=${startingRoom}&username=initial`);
                const data = await resp.json();
                setToken(data.token);
            } catch (e) {
                console.error(e);
            }
        })();
    }, []);

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
                    if (randomUser !== pusherClient.connection.socket_id && randomUser > 80) {
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

    // Manual Connection
    const [fakeRoom, setFakeRoom] = useState<string>('1');
    const [connectToLiveKit, setConnectToLiveKit] = useState<boolean>(true);

    const forceConnection = async () => {
        console.log('forcing connection, room: ', +fakeRoom);
        setConnectToLiveKit(false);
        try {
            const resp = await fetch(`/api/get-participant-token?room=${fakeRoom}&username=${pusherClient.connection.socket_id}`);
            const data = await resp.json();
            setConnectToLiveKit(true);
            setToken(data.token);
        } catch (e) {
            console.error(e);
        }
    };
    return (
        <div>
            <LiveKitRoom
                video={true}
                audio={true}
                token={token}
                connect={connectToLiveKit}
                serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                data-lk-theme='default'
                style={{ height: '50dvh' }}>
                <div className='flex flex-col items-start gap-3 mt-5'>
                    <VideoRoom matched_user={matched_user} />
                    <div className='flex gap-4 justify-center items-end'>
                        <button className='bg-red-500 p-3 rounded-lg' onClick={stopMatching}>
                            stop matching
                        </button>
                        <button className={`${loading ? 'bg-slate-500' : 'bg-blue-400'} p-3 rounded-lg`} onClick={startmatch}>
                            Start Match
                        </button>
                    </div>

                    <input type='text' name='' id='' onChange={(e) => setFakeRoom(e.target.value)} />
                    <button className='border-l-orange-800 p-3 rounded-lg' onClick={forceConnection}>
                        Force Connection
                    </button>
                </div>
            </LiveKitRoom>
        </div>
    );
};

export default Page;
