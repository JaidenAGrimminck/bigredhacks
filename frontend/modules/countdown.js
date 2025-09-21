import "@/app/globals.css";
import { Freckle_Face } from "next/font/google";
import React from "react";

import { API_BASE_URL } from "@/app/constants";

const freckleFace = Freckle_Face({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-freckle-face",
});

// todo: fix.

class ImToLazyToFigureOutTheIssue {
    static a = 0;
}

export default function Countdown({ onFinish }) {
    const onFinishRef = React.useRef(onFinish);
    React.useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);

    let threeRef = React.useRef(null);
    let twoRef = React.useRef(null);
    let oneRef = React.useRef(null);
    let goRef = React.useRef(null);

    let threeAudio = React.useRef(null);
    let twoAudio = React.useRef(null);
    let oneAudio = React.useRef(null);
    let goAudio = React.useRef(null);

    const startedRef = React.useRef(false);
    React.useEffect(() => {
        if (startedRef.current) return;          // guard StrictMode / re-renders
        startedRef.current = true;

        const finishId = setTimeout(() => onFinishRef.current(), 3700);
        const t1 = setTimeout(() => { 
            if (threeRef.current) threeRef.current.style.opacity = 1;
            if (threeAudio.current) threeAudio.current.play();
        }, 50);
        const t2 = setTimeout(() => { 
            if (twoRef.current) twoRef.current.style.opacity = 1;
            if (twoAudio.current) twoAudio.current.play();
        }, 1250);
        const t3 = setTimeout(() => { 
            if (oneRef.current) oneRef.current.style.opacity = 1;
            if (oneAudio.current) oneAudio.current.play();
        }, 2250);
        const t4 = setTimeout(() => { 
            if (goRef.current) goRef.current.style.opacity = 1;
            if (goAudio.current) goAudio.current.play();
        }, 3250);
        return () => {
            clearTimeout(finishId);
            clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
        };
    }, []); // <-- run once; parent re-renders won't cancel timers

    React.useEffect(() => {
        console.log("countdown mounted")
    }, [])

    return (
        <div className="w-[100vw] h-[100vh] overflow-hidden">
            <img className="w-[100vw] max-h-[100vh] absolute top-0 left-0 -z-10" src="/images/stage.jpeg" />
            <div className="w-[100vw] h-[100vh] flex justify-center items-center absolute top-0 left-0 -z-5 opacity-100">
                <div className="left-[60.35px] top-[-300px] relative origin-top-left rotate-[7.17deg] justify-start text-white text-9xl font-normal font-['Freckle_Face'] opacity-0" ref={threeRef}>3 </div>
                <div className="left-[151.38px] top-[-150px] relative origin-top-left rotate-[7.68deg] justify-start text-white text-9xl font-normal font-['Freckle_Face'] opacity-0" ref={twoRef}>2</div>
                <div className="left-[-150px] top-[000px] relative origin-top-left rotate-[-16.22deg] justify-start text-white text-9xl font-normal font-['Freckle_Face'] opacity-0" ref={oneRef}>1</div>
                <div className="left-[-120px] top-[200px] relative origin-top-left rotate-[-6.72deg] justify-start text-white text-9xl font-normal font-['Freckle_Face'] opacity-0" ref={goRef}>GO!</div>
            </div>

            <audio src="/audio/countdown.mp3" autoPlay />
            <audio src="/audio/go.mp3" ref={goAudio} />
            <audio src="/audio/three.mp3" ref={threeAudio} />
            <audio src="/audio/two.mp3" ref={twoAudio} />
            <audio src="/audio/one.mp3" ref={oneAudio} />
        </div>
    )
}