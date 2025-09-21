import React from "react";

const reels = [
    "/reels/reel1.mp4",
]

export default function Reel({ onFinish, url }) {
    let [clicked, setClicked] = React.useState(false);
    
    React.useEffect(() => {
        const onClick = () => {
            setClicked(true);
        }
        
        window.addEventListener('click', onClick);
        return () => {
            window.removeEventListener('click', onClick);
        }
    }, []);

    return (
        <div className="w-80 h-[542px] bg-black flex flex-col items-center justify-center text-white font-['Freckle_Face'] text-2xl">
            { clicked && <video className="w-80 items-center justify-center" autoPlay onEnded={onFinish}>
                <source src={url || reels[0]} type="video/mp4" />
                Your browser does not support the video tag.
            </video> }

            { !clicked && <span>Click to Start Reel</span> }
        </div>
    );
}