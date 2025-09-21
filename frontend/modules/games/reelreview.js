import "@/app/globals.css";
import { Freckle_Face } from "next/font/google";
import React from "react";
import Reel from "../reel";
import { REELREVIEW_TIME } from "@/app/constants";

const freckleFace = Freckle_Face({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-freckle-face",
});


function WatchPhase({ onFinish, url }) {
    return (
        <div className="w-[100vw] h-[100vh] absolute overflow-hidden flex flex-row justify-center text-left text-5xl text-black font-['Freckle_Face'] pt-[50px]">
            {/* <div className="w-[1307px] h-[580px] left-[-27px] top-[68px] absolute bg-black/25" /> */}
            <Reel onFinish={onFinish} url={url} />
        </div>
    );
}

function Review({ onFinish, startTime }) {
    let docSize = document.body.getBoundingClientRect();
    let handRef = React.useRef(null);
    let worksheetRef = React.useRef(null);
    let timerRef = React.useRef(null);

    const time = REELREVIEW_TIME * 1000;//2 * 60 * 1000; // 2 minutes

    React.useEffect(() => {
        const animateHand = () => {
            const hand = handRef.current;
            const worksheet = worksheetRef.current;
            
            if (!hand || !worksheet) return;
            
            const worksheetRect = worksheet.getBoundingClientRect();
            const startY = worksheetRect.top + 100; // Start near top of worksheet
            const endY = worksheetRect.bottom - 100; // End near bottom of worksheet
            const centerX = worksheetRect.left + worksheetRect.width / 2 + 450;
            
            const duration = time; // 2 minute
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Vertical movement from top to bottom
                const currentY = startY + (endY - startY) * progress;
                
                // Horizontal shake for writing effect
                const shakeX = Math.sin(elapsed * 0.02) * 15;
                
                // Small vertical shake
                const shakeY = Math.sin(elapsed * 0.025) * 8;
                
                hand.style.left = `${centerX + shakeX - worksheetRect.left}px`;
                hand.style.top = `${currentY + shakeY - worksheetRect.top}px`;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    console.log("finished!")
                    onFinish();
                }
            };
            
            animate();
        };

        animateHand();
    }, []);

    React.useEffect(() => {
        // update the timer
        const interval = setInterval(() => {
            if (!startTime) return;
            const now = Date.now();
            const diff = startTime + time - now;
            if (diff <= 0) {
                timerRef.current.innerText = "0:00";
                clearInterval(interval);
                return;
            }
            const minutes = Math.floor(diff / (60 * 1000));
            const seconds = Math.floor((diff % (60 * 1000)) / 1000);
            timerRef.current.innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
        , 500);
        
        return () => clearInterval(interval);
    }, [startTime]);

    const imgSize = {
        w: 1062 / 2,
        h: 1293 / 2
    }

    return (
        <div className="w-[100vw] h-[100vh] absolute overflow-hidden flex flex-row justify-center text-left text-5xl text-black font-['Freckle_Face'] pt-[50px]">
            <div className="w-[100vw] h-[100vh] absolute bg-black/25" />
            <img style={{ width: `${imgSize.w}px`, height: `${imgSize.h}px` }} className={`w-[${imgSize.w}px] h-[${imgSize.h}px]`} src="/images/worksheet.png" ref={worksheetRef} />
            <img className="absolute left-[487px] top-[76px]" src="/images/hand.png" ref={handRef}/>

            <div className="left-[80px] top-[128.47px] absolute origin-top-left rotate-[-2.91deg] justify-start text-red-600 text-9xl font-normal font-['Freckle_Face']">
                <span id="timer" className="text-red" ref={timerRef}>{ "2:00" }</span>
            </div>
            <audio src="/audio/scribble.mp3" autoPlay loop />
            <audio src="/audio/jazz.mp3" autoPlay loop volume={0.5} />
        </div>
    );
}


export default function ReelReview({ websocket, reel, responses }) {
    let [state, setState] = React.useState('watchphase'); // watchphase, voting, results
    let [startTime, setStartTime] = React.useState(Date.now());
    let [toKnowOverlay, setToKnowOverlay] = React.useState(false);
    let lettersParent = React.useRef(null);

    const changeState = () => {
        if (state === 'watchphase') {
            setState('explain');
        } else if (state === 'explain') {
            setStartTime(Date.now());
            setState('review');
            websocket.send(JSON.stringify({
                type: "forward_state",
                state: "reelreview_resp"
            }))
        } else if (state === 'review') {
            setToKnowOverlay(true);

            websocket.send(JSON.stringify({
                type: 'request_responses',
                responses: responses
            }));
        }
    }

    React.useEffect(() => {
        if (!toKnowOverlay) return;
        const tm = setInterval(() => {
            for (let i = 0; i < lettersParent.current.children.length; i++) {
                const child = lettersParent.current.children[i];

                if (child.src == undefined) continue;

                if (child.src.includes("letters/")) {
                    child.src = child.src.replace("letters/", "letters2/");
                } else if (child.src.includes("letters2/")) {
                    child.src = child.src.replace("letters2/", "letters/");
                }
            }
        }, 100);
        return () => clearInterval(tm);
    }, [toKnowOverlay]);

    return (
        <>
        <div className="w-[100vw] h-[100vh] bg-white overflow-hidden flex flex-col justify-center text-left text-5xl text-black font-['Freckle_Face']">
            <img className="w-[100vw] h-[100vh]" src="/images/movie.jpg" />
            {state === 'watchphase' && <WatchPhase url={reel !== null ? reel.reel : null} onFinish={changeState} />}
            { state === 'review' && <Review onFinish={changeState} startTime={startTime} />}
            { state === 'explain' && 
                <div>
                    <audio src="/audio/thirdtask.mp3" autoPlay onEnded={changeState} />
                </div> 
            }
            { toKnowOverlay && 
                <div className="w-[100vw] h-[100vh] absolute top-0 left-0 bg-black/75 z-50 flex flex-col justify-center items-center text-white text-5xl font-['Freckle_Face']">
                    <div className="w-3/4 flex flex-row justify-center items-center" ref={lettersParent}>
                    {"Reviewing Your Responses".toLowerCase().split("").map((char, index) => (
                        char == " " ? 
                        <div key={index} className="w-[30px]"></div> : 
                        <img key={index} className={`w-[40px] z-52`} src={`/images/letters/${char === " " ? "space" : char}.svg`} />
                    ))}
                    </div>
                    <img className="relative top-[-90px] z-51" src="/images/largebg.svg" />
                </div>
            }
        </div>
        </>
    );
}