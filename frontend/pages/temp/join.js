
import "@/app/globals.css";
import { Freckle_Face } from "next/font/google";
import React, { use } from "react";

import { API_BASE_URL } from "@/app/constants";

const freckleFace = Freckle_Face({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-freckle-face",
});

export default function Join() {
    const gameRef = React.useRef(null);
    const nameRef = React.useRef(null);

    const join = async () => {
        "use server";

        const gameId = gameRef.current.value;
        const userId = nameRef.current.value;
        if (!gameId || !userId) {
            alert("Please enter both game ID and your name.");
            return;
        }

        const res = await fetch(`${API_BASE_URL}/games/join`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ gameId, name: userId }),
        });
        if (!res.ok) {
            throw new Error("Failed to join game");
        }
        // Handle successful join (e.g., redirect to game page)
        window.location.href = `/temp/game?gameid=${encodeURIComponent(gameId)}&userid=${encodeURIComponent(userId)}`; // redirect to waiting page
    }

    return (
        <div className={`${freckleFace.variable} font-['Freckle_Face'] w-[100vw] h-[100vh] relative bg-white overflow-hidden flex flex-col justify-center items-center text-5xl text-black`}>
            <h1>Join a Game</h1>
            <div className="flex flex-col gap-5 w-[50vw] mt-10">
            <input type="text" className="border border-gray-300 p-2 rounded" placeholder="Game ID" name="gameId" ref={gameRef} />
            <input type="text" className="border border-gray-300 p-2 rounded" placeholder="Your Name" name="userId" ref={nameRef} />
            <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 active:bg-blue-700" onClick={join}>Join Game</button>
            </div>
        </div>
    );
}