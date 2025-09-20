
export default function Intro({
    onFinish, playerNames=[]
}) {
    setTimeout(() => {
        onFinish();
    }, 5000);

    return (
        <div className="w-[100vw] h-[100vh] flex flex-col justify-center items-center text-5xl text-black font-['Freckle_Face']">
            <div className="absolute top-0 left-0 w-[100vw] h-[100vh] bg-cover bg-center z-0" style={{ backgroundImage: "url('/images/bg.svg')" }} />

            <div className="w-[100vw] h-[100vh] z-100 flex flex-col justify-center items-center text-5xl text-white font-['Freckle_Face']">
                <div className="flex flex-row justify-around items-center w-full px-20 mb-[200px]">
                    <h1 className="rotate-[-20deg]">{playerNames.length > 0 ? playerNames[0] : "Player 1"}</h1>
                    <h1 className="rotate-[20deg]">{playerNames.length > 1 ? playerNames[1] : "Player 2"}</h1>
                </div>
                <div className="flex flex-row justify-around items-center w-full px-20 mt-[150px]">
                    <h1 className="rotate-[20deg]">{playerNames.length > 2 ? playerNames[2] : "Player 3"}</h1>
                    <h1 className="rotate-[-20deg]">{playerNames.length > 3 ? playerNames[3] : "Player 4"}</h1>
                </div>
            </div>
            {/* overlay with logo in center */}
            <div className="absolute top-0 left-0 w-[100vw] h-[100vh] flex flex-col justify-center items-center">
            <img src="/Logo.png" className="w-1/3 h-1/3 object-contain" />
            </div>
            {/* button in bottom right corner */}
            <button className="absolute bottom-4 right-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 active:bg-blue-700 z-1000" onClick={onFinish}>Skip Intro</button>

            {/* audio */}
            <audio autoPlay>
                <source src="/audio/intro.mp3" type="audio/mpeg" />
            </audio>
        </div>
        );
}