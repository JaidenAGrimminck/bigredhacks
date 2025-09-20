import "@/app/globals.css";
import { Freckle_Face } from "next/font/google";
import React from "react";

import { API_BASE_URL } from "@/app/constants";

const freckleFace = Freckle_Face({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-freckle-face",
});


export default function Home() {

    const getUser = async () => {
        const res = await fetch(`${API_BASE_URL}/users/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include',
            redirect: 'follow'
        });

        return res.status === 200 || res.status === 201;
    };

    React.useEffect(() => {
        const checkUser = async () => {
            let isLoggedIn;
            try {
                isLoggedIn = await getUser();
            } catch (error) {
                isLoggedIn = false;
                console.log(error)
            }
            
            if (!isLoggedIn) {
                window.location.href = "/signin";
            } else {
                console.log("User is logged in");
            }
        };

        checkUser();
    }, []);

    const signOut = async () => {
        await fetch(`${API_BASE_URL}/users/signout`, {
            method: "POST",
            credentials: 'include',
            redirect: 'follow'
        });
        
        window.location.href = "/signin";
    }

    const startGame = async () => {
        window.location.href = "/play/join";
    }

    return (
        <div className="w-[100vw] h-[100vh] bg-white overflow-hidden flex flex-col justify-center items-center text-left text-5xl text-black font-['Freckle_Face']">
            <div className="w-[474px] h-20 text-center justify-center text-black text-6xl font-normal font-['Freckle_Face'] mb-[20px]">Touch Grass???</div>
            <div className="w-[553px] h-28 bg-zinc-300 rounded-[60px] flex items-center justify-center mb-10 hover:bg-zinc-400 cursor-pointer transition-colors duration-300">
                <div className="w-[553px] text-center justify-center text-black text-6xl font-normal font-['Freckle_Face']">How To Play</div>
            </div>
            <div className="w-[553px] h-28 bg-zinc-300 rounded-[60px] flex items-center justify-center mb-10 hover:bg-zinc-400 cursor-pointer transition-colors duration-300">
                <div className="w-[553px] text-center justify-center text-black text-6xl font-normal font-['Freckle_Face']" onClick={startGame}>Start New Game</div>
            </div>
            <div className="w-[553px] h-28 bg-zinc-300 rounded-[60px] flex items-center justify-center mb-10 hover:bg-zinc-400 cursor-pointer transition-colors duration-300">
                <div className="w-[553px] text-center justify-center text-black text-6xl font-normal font-['Freckle_Face']" onClick={signOut}>Sign Out</div>
            </div>
        </div>
    );
}