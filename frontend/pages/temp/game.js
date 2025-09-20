'use client';

import { API_BASE_URL } from "@/app/constants";
import "@/app/globals.css";
import { Freckle_Face } from "next/font/google";
import React from "react";

const freckleFace = Freckle_Face({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-freckle-face",
});


function Wait() {
    return (
        <div className="w-[100vw] h-[100vh] flex flex-col justify-center items-center text-5xl text-black">
            {/* Make color white */}
            <h1 className="text-white font-['Freckle_Face']">Waiting for host to start...</h1>
        </div>
    );
}

export default function Game() {
    let state = 'wait';

    const f = async () => {
        await new Promise(resolve => setTimeout(resolve, 100)); // wait for next tick to ensure search params are available

        const searchParams = new URLSearchParams(window.location.search);

        const gameID = searchParams.get('gameid');
        const userID = searchParams.get('userid');

        
        // validate gameID and userID here
        if (!gameID || !userID) {
            alert("Invalid game ID or user ID");
            window.location.href = "/temp/join";
            return;
        }

        // connect to websocket here
        const ws = new WebSocket(`${API_BASE_URL}/ws/player`);

        ws.onopen = () => {
            console.log("WebSocket connection established");
            
            ws.send(JSON.stringify({
                type: 'join',
                gameID,
                userID,
            }));
        }
        ws.onmessage = (event) => {
            let data;
            try {
                data = JSON.parse(event.data);
            } catch (e) {
                return;
            }
            
            if (data.type === 'joined') {
                state = 'play';
            }
            if (data.type === 'error') {
                alert(data.message);
                window.location.href = "/temp/join";
            }
        }
        
        ws.onclose = () => {
            console.log("WebSocket connection closed");
        }
    }

    React.useEffect(() => {
        f();
    }, []);
        

    return (
        state === 'wait' ? <Wait /> : <div>Game</div>
    );
}