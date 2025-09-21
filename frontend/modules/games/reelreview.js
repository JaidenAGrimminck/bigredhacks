import "@/app/globals.css";
import { Freckle_Face } from "next/font/google";
import React from "react";
import Reel from "../reel";

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

    React.useEffect(() => {
        const animateHand = () => {
            const hand = handRef.current;
            const worksheet = worksheetRef.current;
            
            if (!hand || !worksheet) return;
            
            const worksheetRect = worksheet.getBoundingClientRect();
            const startY = worksheetRect.top + 100; // Start near top of worksheet
            const endY = worksheetRect.bottom - 100; // End near bottom of worksheet
            const centerX = worksheetRect.left + worksheetRect.width / 2 + 450;
            
            const duration = 60000 * 2; // 2 minute
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
            const diff = startTime + 2 * 60 * 1000 - now;
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
        </div>
    );
}


export default function ReelReview({ websocket, reel, responses }) {
    let [state, setState] = React.useState('watchphase'); // watchphase, voting, results
    let [startTime, setStartTime] = React.useState(Date.now());

    const changeState = () => {
        if (state === 'watchphase') {
            setState('review');
            setStartTime(Date.now());
            websocket.send(JSON.stringify({
                type: "forward_state",
                state: "reelreview_resp"
            }))
        } else if (state === 'review') {
            setState('review_responses');
            websocket.send(JSON.stringify({
                type: 'request_responses',
                responses: responses
            }));
        }
    }

    return (
        <>
        <div className="w-[100vw] h-[100vh] bg-white overflow-hidden flex flex-col justify-center text-left text-5xl text-black font-['Freckle_Face']">
            <img className="w-[100vw] h-[100vh]" src="/images/movie.jpg" />
            {state === 'watchphase' && <WatchPhase url={reel !== null ? reel.reel : null} onFinish={changeState} />}
            { state === 'review' && <Review onFinish={changeState} startTime={startTime} />}
        </div>
        </>
    );
}