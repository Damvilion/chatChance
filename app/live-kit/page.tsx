'use client';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import '@livekit/components-styles';
import { LiveKitRoom, VideoConference, GridLayout, ParticipantTile, useTracks, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';

function SampleRoom() {
    const [loading, setLoading] = useState<boolean>(true);
    const [track, setTrack] = useState<MediaStreamTrack | null>(null);
    const trackRefs = useTracks([Track.Source.Camera]);
    const cameraTracks = trackRefs[0];
    const user2CameraTrack = trackRefs[1] ? trackRefs[1] : null;

    return (
        <div>
            <h1>Sample Room</h1>
            <div className='flex flex-col gap-4'>
                {user2CameraTrack ? (
                    <VideoTrack style={{ width: '700px' }} trackRef={user2CameraTrack} />
                ) : (
                    <video style={{ width: '700px', backgroundColor: 'gray' }}></video>
                )}

                {cameraTracks ? (
                    <VideoTrack style={{ width: '700px' }} trackRef={cameraTracks} />
                ) : (
                    <video style={{ width: '700px', backgroundColor: 'gray' }}></video>
                )}
            </div>
        </div>
    );
}

const Page = () => {
    const room = 'quickstart-room';
    const name = uuidv4();
    const [token, setToken] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const resp = await fetch(`/api/get-participant-token?room=${room}&username=${name}`);
                const data = await resp.json();
                setToken(data.token);
                console.log(data.token);
            } catch (e) {
                console.error(e);
            }
        })();
    }, []);

    return (
        <div className='flex flex-col items-center justify-center'>
            <h1>PAGE</h1>
            <h2>Live Kit</h2>
            <LiveKitRoom
                video={true}
                audio={true}
                token={token}
                connect={true}
                serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                data-lk-theme='default'
                style={{ height: '100dvh' }}>
                <SampleRoom />
            </LiveKitRoom>
        </div>
    );
};

export default Page;
