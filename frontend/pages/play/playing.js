
import { API_BASE_URL } from "@/app/constants";
import "@/app/globals.css";
import { Freckle_Face } from "next/font/google";
import React from "react";

import Countdown from "@/modules/countdown";
import Intro from "@/modules/intro";
import { useState } from "react";

export default function Playing() {
    const testing = false;
    let websocket;
    let [state, setState] = useState('intro'); // intro, countdown, leaderboard, play/ineed, play/reelreview

    const f = async () => {
        if (testing) return;

        const searchParams = new URLSearchParams(window.location.search);
        
        const code = searchParams.get('gameid');

        

        // start websocket connection here
        websocket = new WebSocket(`${API_BASE_URL}/ws/game`);
        
        websocket.onopen = () => {
            console.log("WebSocket connection established");
            
            websocket.send(JSON.stringify({ // reestablish connection as host
                type: 'reestablish',
                code,
            }));
        }
        
        websocket.onmessage = (event) => {
            let data;
            try {
                data = JSON.parse(event.data);
            }
            catch (e) {
                return;
            }
        }

        websocket.onclose = () => {
            console.log("WebSocket connection closed");
        }
    }
    
    React.useEffect(() => {
        f();
    }, []);

    return (
        <div>
            {state === 'intro' && <Intro onFinish={() => {}}/>}
            {state === 'countdown' && <Countdown onFinish={() => {}} />}
            
        </div>
    );
}