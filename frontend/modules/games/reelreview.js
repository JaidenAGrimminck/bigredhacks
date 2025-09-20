import "@/app/globals.css";
import { Freckle_Face } from "next/font/google";
import React from "react";
import Reel from "../reel";

const freckleFace = Freckle_Face({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-freckle-face",
});


function WatchPhase() {
    return (
        <div className="w-[100vw] h-[100vh] absolute overflow-hidden flex flex-row items-center justify-center text-left text-5xl text-black font-['Freckle_Face']">
            {/* <div className="w-[1307px] h-[580px] left-[-27px] top-[68px] absolute bg-black/25" /> */}
            <Reel />
        </div>
    );
}

function Review() {
    return (
        <div className="w-[1280px] h-[832px] relative overflow-hidden">
            <div className="w-[1307px] h-[580px] left-[-27px] top-[68px] absolute bg-black/25" />
            <img className="w-80 h-[542px] left-[487px] top-[76px] absolute" src="https://placehold.co/305x542" />
        </div>
    );
}


export default function ReelReview() {
    let [state, setState] = React.useState('watchphase'); // watchphase, voting, results

    return (
        <>
        <div className="w-[100vw] h-[100vh] bg-white overflow-hidden flex flex-col justify-center text-left text-5xl text-black font-['Freckle_Face']">
            <img className="w-[100vw] h-[100vh]" src="/images/movie.jpg" />
            {state === 'watchphase' && <WatchPhase />}
            { state === 'review' && <Review />}
        </div>
        <script async src="//www.instagram.com/embed.js"></script>
        </>
    );
}