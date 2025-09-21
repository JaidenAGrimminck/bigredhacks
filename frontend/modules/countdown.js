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

export default function Countdown({ onFinish }) {

    setTimeout(() => {
        onFinish();
    }, 2000); // TODO: change to 3000
    
    return (
        <div className="w-[100vw] h-[100vh] overflow-hidden">
            <img className="w-[100vw] max-h-[100vh] absolute top-0 left-0 -z-10" src="/images/stage.jpeg" />
            <div className="w-[100vw] h-[100vh] flex justify-center items-center absolute top-0 left-0 -z-5 opacity-100">
                <div className="left-[60.35px] top-[-300px] relative origin-top-left rotate-[7.17deg] justify-start text-white text-9xl font-normal font-['Freckle_Face']">3 </div>
                <div className="left-[151.38px] top-[-150px] relative origin-top-left rotate-[7.68deg] justify-start text-white text-9xl font-normal font-['Freckle_Face']">2</div>
                <div className="left-[-150px] top-[000px] relative origin-top-left rotate-[-16.22deg] justify-start text-white text-9xl font-normal font-['Freckle_Face']">1</div>
                <div className="left-[-120px] top-[200px] relative origin-top-left rotate-[-6.72deg] justify-start text-white text-9xl font-normal font-['Freckle_Face']">GO!</div>
            </div>
            
        </div>
    )
}