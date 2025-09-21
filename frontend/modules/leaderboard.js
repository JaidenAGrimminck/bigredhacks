import React from "react";

export default function Leaderboard({ leaderboard, onFinish }) {
    const tm = setTimeout(() => {
        onFinish();
    }, 5000);

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
            <div className="absolute bottom-4 right-4">
                <button className="bg-red-500 text-white font-['Freckle_Face'] px-4 py-2 rounded" onClick={() => {
                    clearTimeout(tm);
                    onFinish();
                }}>
                    Next
                </button>
            </div>
        </div>
    );
}