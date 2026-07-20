import React from 'react';

const Background = ({ children }) => {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Abstract Background Shapes */}
            <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-[100px] mix-blend-multiply animate-blob filter dark:bg-blue-900/20"></div>
            <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-purple-400/20 blur-[100px] mix-blend-multiply animate-blob animation-delay-2000 filter dark:bg-purple-900/20"></div>
            <div className="absolute bottom-[-20%] left-[20%] h-[500px] w-[500px] rounded-full bg-pink-400/20 blur-[100px] mix-blend-multiply animate-blob animation-delay-4000 filter dark:bg-pink-900/20"></div>

            <div className="relative z-10 flex min-h-screen flex-col">
                {children}
            </div>
        </div>
    );
};

export default Background;
