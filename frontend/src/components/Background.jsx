import React from 'react';

const Background = ({ children }) => {
    return (
        <div className="relative min-h-screen w-full bg-white font-sans text-black">
            <div className="relative z-10 flex min-h-screen flex-col">
                {children}
            </div>
        </div>
    );
};

export default Background;
