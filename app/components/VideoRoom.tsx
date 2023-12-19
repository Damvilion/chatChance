'use client';
import React from 'react';
import '@livekit/components-styles';
import { useTracks, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';

interface VideoRoomProps {
    matched_user: string;
    stopMatching: () => void;
    startMatch: () => void;
    loading: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const VideoRoom = ({ matched_user, stopMatching, startMatch, loading }: VideoRoomProps) => {
    const trackRefs = useTracks([Track.Source.Camera]);
    // const audioTrack = useTracks([Track.Source.Microphone]);
    const cameraTracks = trackRefs[0];
    const user2CameraTrack = trackRefs[1] ? trackRefs[1] : null;

    return (
        <div className='flex flex-col'>
            {user2CameraTrack ? (
                <VideoTrack style={{ width: '100%', height: '100%' }} trackRef={user2CameraTrack} />
            ) : (
                <video style={{ width: '100%', height: '100%', backgroundColor: 'gray' }}></video>
            )}

            {cameraTracks ? (
                <VideoTrack style={{ width: '100%', height: '100%' }} trackRef={cameraTracks} />
            ) : (
                <video style={{ width: '100%', height: '100%', backgroundColor: 'gray' }}></video>
            )}

            <div className='flex gap-4 justify-center items-end p-5'>
                <button className='bg-red-500 p-3 rounded-lg' onClick={stopMatching}>
                    stop matching
                </button>
                <button className={`${loading ? 'bg-slate-500' : 'bg-blue-400'} p-3 rounded-lg`} onClick={startMatch}>
                    Start Match
                </button>
            </div>
        </div>
    );
};

export default VideoRoom;
