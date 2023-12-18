'use client';
import React, { useEffect, useState } from 'react';
import '@livekit/components-styles';
import { LiveKitRoom, VideoConference, GridLayout, ParticipantTile, useTracks, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';

interface VideoRoomProps {
    matched_user: string;
}

const VideoRoom = ({ matched_user }: VideoRoomProps) => {
    const trackRefs = useTracks([Track.Source.Camera]);
    // const audioTrack = useTracks([Track.Source.Microphone]);
    const cameraTracks = trackRefs[0];
    const user2CameraTrack = trackRefs[1] ? trackRefs[1] : null;

    const logMatchedUser = () => {
        console.log('matched user: ', matched_user);
    };
    return (
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
            <button className='bg-slate-800 p-3 rounded-lg' onClick={logMatchedUser}>
                Log Matched User
            </button>
        </div>
    );
};

export default VideoRoom;
