import React from "react";

const reels = [
    "/reels/reel1.mp4",
]

export default function Reel({ onFinish, url }) {
    let [clicked, setClicked] = React.useState(false);
    let [reelStart, setReelStart] = React.useState(Date.now());
    
    React.useEffect(() => {
        const onClick = () => {
            setClicked(true);
        }

        //onFinish();

        onClick();
        
        window.addEventListener('click', onClick);
        return () => {
            window.removeEventListener('click', onClick);
        }
    }, []);

    const tryFinish = () => {
        console.log("try finish reel ", Date.now() - reelStart)
        if (Date.now() - reelStart > 1000 * 4) { // 8 seconds
            onFinish();
        }
    }

    console.log("watching reel ", url)

    return (
        <div className="w-80 h-[542px] bg-black flex flex-col items-center justify-center text-white font-['Freckle_Face'] text-2xl">
            { clicked && <video className="w-80 items-center justify-center" autoPlay onEnded={tryFinish}>
                <source src={url || reels[0]} type="video/mp4" />
                Your browser does not support the video tag.
            </video> }

            { !clicked && <span>Click to Start Reel</span> }
        </div>
    );
}