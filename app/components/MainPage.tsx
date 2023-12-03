import React from 'react';

const MainPage = ({ pusherClient }: any) => {
    pusherClient.subscribe('channel').bind('text', (msg: any) => {
        console.log(msg);
    });

    const handleClick = () => {};
    return (
        <div className='flex flex-col'>
            <h1>Mian Page</h1>
            <button>CLICK ME!</button>
        </div>
    );
};

export default MainPage;
