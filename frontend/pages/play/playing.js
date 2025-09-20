
import { API_BASE_URL } from "@/app/constants";
import "@/app/globals.css";
import { Freckle_Face } from "next/font/google";
import React from "react";

import Countdown from "@/modules/countdown";
import Intro from "@/modules/intro";
import { useState } from "react";
import INeed from "@/modules/games/ineed";
import ReelReview from "@/modules/games/reelreview";

export default function Playing() {
    const testing = true;
    let [websocket, setWebsocket] = useState(null);
    let [state, setState] = useState('intro'); // intro, countdown, leaderboard, play/ineed, play/reelreview
    let [leaderboard, setLeaderboard] = useState([]);
    let [gameStart, setGameStart] = useState(Date.now());

    const f = async () => {
        if (testing) return;

        const searchParams = new URLSearchParams(window.location.search);
        
        const code = searchParams.get('gameid');

        // start websocket connection here
        let ws = new WebSocket(`${API_BASE_URL}/ws/game`);
        setWebsocket(ws);
        
        ws.onopen = () => {
            console.log("WebSocket connection established");
            
            ws.send(JSON.stringify({ // reestablish connection as host
                type: 'reestablish',
                code,
            }));

            setInterval(() => {
                ws.send(JSON.stringify({
                    type: 'leaderboard_request',
                }))
                //.log("Requested leaderboard update");
            }, 2000)

        }
        
        ws.onmessage = (event) => {
            let data;
            try {
                data = JSON.parse(event.data);
            }
            catch (e) {
                return;
            }

            if (data.type === 'leaderboard_update') {
                setLeaderboard(data.leaderboard);
            } else if (data.type === 'error') {
                if (data.message === 'Game not found') {
                    window.location.href = "/";
                }
            } else if (data.type === 'switch_to_game') {
                setState(data.state);
            }
        }

        ws.onclose = () => {
            console.log("WebSocket connection closed");
        }
    }
    
    React.useEffect(() => {
        f();
    }, []);

    const nextState = () => {
        if (state === 'intro') {
            setState('countdown');
        } else if (state === 'countdown') {
            console.log(websocket)

            if (websocket) {
                websocket.send(JSON.stringify({
                    type: 'forward_state',
                    state: 'reelreview',
                }));
            }

            setState('reelreview');
        }
    }

    return (
        <div>
            {state === 'intro' && <Intro playerNames={["jaiden", "test", "abab", "ahliushfdlkasj"]} onFinish={nextState}/>}
            {state === 'countdown' && <Countdown onFinish={nextState} />}
            { state === 'takephotos' && <INeed leaderboard={leaderboard} gameStart={gameStart} />}
            { state === 'reelreview' && <ReelReview leaderboard={leaderboard} gameStart={gameStart} />}
        </div>
    );
}