'use client';
import React, { useEffect, useRef, useState } from 'react';
import { pusherClient } from '@/app/lib/pusher';
import axios from 'axios';
// Live Kit imports
// import '@livekit/components-styles';
import { LiveKitRoom } from '@livekit/components-react';
import VideoRoom from '@/app/components/VideoRoom';
// UUId
import { v4 as uuidv4 } from 'uuid';
import { match_found_type } from '../types/types';

const Page = () => {
    // Live Players
    const [players, setPlayers] = useState<number | string>(0);

    const [loading, setLoading] = useState<boolean>(false);
    const [matchmaking, setMatchmaking] = useState<boolean>(false);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    // This function is used to start the matchmaking process
    const startmatch = async () => {
        setLoading(true);
        setMatchmaking(true);

        // API endpoint to validate all users
        await axios.post('/api/matchmaking/startmatch', {});
        // Matchmaking has started | This will continue to run until a match is found
    };

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
        getMedia();
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

    // Handles matchmaking logic | Subscribe to the matchmaking channel When matchmaking is true
    useEffect(() => {
        // If matchmaking is false | clear the interval | unsubscribe from the matchmaking channel
        if (!matchmaking && intervalID.current) {
            clearInterval(intervalID.current);
            pusherClient.unsubscribe('matchmaking');
            return;
        }

        if (matchmaking) {
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
        }

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

    // This function is used to disconnnect from livekit and stop the matchmaking process
    const stopAllMatching = (withLiveKit: boolean) => {
        if (withLiveKit) {
            getMedia();
            setConnectToLiveKit(false);
        }
        setMatchmaking(false);
        setLoading(false);
        clearInterval(intervalID.current!);
        pusherClient.unsubscribe('matchmaking');
    };
    // LIVE KIT

    const [token, setToken] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const [mediaStream, setMediaStream] = React.useState<MediaStream | null>(null);

    const getMedia = async () => {
        try {
            const res = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            if (res) {
                setMediaStream(res);
                videoRef.current!.srcObject = res;
            }
        } catch (e) {
            console.error(e);
        }
    };

    const connectToRoom = async (room: string) => {
        getMedia();
        setConnectToLiveKit(false);
        try {
            const resp = await fetch(`/api/get-participant-token?room=${room}&username=${pusherClient.connection.socket_id}`);
            const data = await resp.json();
            if (data) {
                setConnectToLiveKit(true);
                setToken(data.token);
                getMedia();
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className='flex flex-col justify-center items-center lg:flex-row lg:justify-start p-1'>
            <div className='flex flex-col items-center p-3 gap-5'>
                <div className='h-[275px] w-[200px] sm:h-[315px] sm:w-[315px] md:min-h-[300px] md:w-[300px] lg:h-[400px] lg:w-[500px]'>
                    <LiveKitRoom
                        video={false}
                        audio={true}
                        token={token}
                        connect={connectToLiveKit}
                        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                        className='w-full h-full'
                        data-lk-theme='disable'>
                        <VideoRoom loading={loading} startMatch={startmatch} stopAllMatching={stopAllMatching} mediaStream={mediaStream} />
                    </LiveKitRoom>
                </div>
                <div className='h-[300px] w-[200px] sm:h-[315px] sm:w-[315px] md:min-h-[300px] md:w-[300px] lg:h-[400px] lg:w-[500px]'>
                    <video
                        ref={videoRef}
                        className='object-cover h-full w-full bg-slate-800 rounded-sm'
                        autoPlay
                        muted
                        autoFocus={false}
                        controls={false}
                        playsInline></video>
                </div>

                <p className='text-white'>There are {players} players online</p>
            </div>
        </div>
    );
};

export default Page;
