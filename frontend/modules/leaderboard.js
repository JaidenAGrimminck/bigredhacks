import React from "react";

class NoRepeater {
    static a = 0;
}

class NoRepeater2 {
    static a = 0;
}

export default function Leaderboard({ leaderboard, onFinish, secondLeaderboard=false }) {
    const onFinishRef = React.useRef(onFinish);
    React.useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);

    let d = false;
    if (NoRepeater.a === 0) {
        NoRepeater.a = 1;
        d = true;
    }

    if (secondLeaderboard && NoRepeater2.a === 0) {
        NoRepeater2.a = 1;
        d = true;
    }

    let congratsRef = React.useRef(null);
    let secondTaskRef = React.useRef(null);
    let endRef = React.useRef(null);

    React.useEffect(() => {
        const tm = setTimeout(() => onFinishRef.current(), 15000);
        return () => clearTimeout(tm);
    }, []);

    React.useEffect(() => {
        if (!secondLeaderboard) return;
        if (!d) return;
        
        setTimeout(() => {
            if (endRef.current) {
                endRef.current.play();
                // stop it from looping
                endRef.current.loop = false;
            }
        })
    }, [secondLeaderboard]);

    React.useEffect(() => {
        if (secondLeaderboard) return;
        if (!d) return;
        
        setTimeout(() => {
            if (congratsRef.current) {
                congratsRef.current.play();
                // stop it from looping
                congratsRef.current.loop = false;
            }
        }, 500);

        setTimeout(() => {
            if (secondTaskRef.current) {
                secondTaskRef.current.play();
                // stop it from looping
                secondTaskRef.current.loop = false;
            }
        }, 4000);
    }, []);

    return (
        <div className="w-[100vw] h-[100vh] flex flex-col justify-center items-center text-5xl text-black font-['Freckle_Face']">
            <div className="absolute top-0 left-0 w-[100vw] h-[100vh] bg-cover bg-center z-0" style={{ backgroundImage: "url('/images/bg.svg')" }} />
            
            <div className="w-[100vw] h-[100vh] z-100 flex flex-col justify-center items-center text-5xl text-white font-['Freckle_Face']">
                <h1 className="mb-10">Leaderboard</h1>
                <div className="flex flex-col space-y-4">
                    {leaderboard.map((entry, index) => (
                        <div key={index} className="flex flex-row justify-between w-96 px-4">
                            <span>{index + 1}. {entry.name}</span>
                            <span>{entry.points} pt{entry.points === 1 ? '' : 's'}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* button in bottom right corner */}
            {!secondLeaderboard && <div className="absolute bottom-4 right-4">
                <button className="bg-red-500 text-white font-['Freckle_Face'] px-4 py-2 rounded" onClick={() => {
                    onFinish();
                }}>
                    Next
                </button>
            </div>}

            <audio src="/audio/secondtask.mp3" ref={secondTaskRef} />
            <audio src="/audio/greatjob.mp3" ref={congratsRef} />
            <audio src="/audio/end.mp3" ref={endRef} />
        </div>
    );
}