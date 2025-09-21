
import { API_BASE_URL } from "@/app/constants";
import "@/app/globals.css";
import { Freckle_Face } from "next/font/google";
import React from "react";

import Countdown from "@/modules/countdown";
import Intro from "@/modules/intro";
import { useState } from "react";
import INeed from "@/modules/games/ineed";
import ReelReview from "@/modules/games/reelreview";
import Leaderboard from "@/modules/leaderboard";

export default function Playing() {
    const testing = false;
    let [websocket, setWebsocket] = useState(null);
    let [state, setState] = useState('intro'); // intro, countdown, leaderboard, play/ineed, play/reelreview
    let [leaderboard, setLeaderboard] = useState([]);
    let [gameStart, setGameStart] = useState(Date.now());
    let [reel, setReel] = useState(null);
    let [items, setItems] = useState([]);

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

            ws.send(JSON.stringify({
                type: 'get_reel',
            }));

            ws.send(JSON.stringify({
                type: 'leaderboard_request',
            }));

            console.log("req-ing items")
            ws.send(JSON.stringify({
                type: "get_items",
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
                console.log(data.leaderboard)
            } else if (data.type === 'error') {
                if (data.message === 'Game not found') {
                    window.location.href = "/";
                }
            } else if (data.type === 'switch_to_game') {
                setState(data.state);
            } else if (data.type === 'reel_data') {
                //console.log(data.reel)
                setReel(data.reel);
            } else if (data.type === 'game_items') {
                console.log(data.items);
                setItems(data.items);
            }
        }

        ws.onclose = () => {
            console.log("WebSocket connection clxosed");
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
                    state: 'takephotos',
                }));
            }
            
            setGameStart(Date.now());
            setState('takephotos');
        } else if (state === 'takephotos') {
            if (websocket) {
                websocket.send(JSON.stringify({
                    type: 'forward_state',
                    state: 'leaderboard',
                }));
            }
            setState('leaderboard');
        } else if (state === 'leaderboard') {
            if (websocket) {
                websocket.send(JSON.stringify({
                    type: 'forward_state',
                    state: 'reelreview',
                }));
            }
            setState('reelreview');
        } else if (state === 'reelreview') {
            if (websocket) {
                websocket.send(JSON.stringify({
                    type: 'forward_state',
                    state: 'TODO', // TODO MEEEEEEE
                }));
            }
            //setState('TODO'); // TODO MEEEEEEE
        }
    }

    React.useEffect(() => {
        if (testing) return;
        if (state !== 'takephotos') return;
        if (!websocket) return;

        let intv = setInterval(() => {
            if (state !== 'takephotos') {
                clearInterval(intv);
                return;
            }

            websocket.send(JSON.stringify({
                type: 'time_update',
                startTime: gameStart,
            }))
        }, 10000)

        return () => clearInterval(intv);
    }, [state, websocket, gameStart]);

    return (
        <div>
            {state === 'intro' && <Intro playerNames={leaderboard ? leaderboard.map(entry => entry.name) : ["jaiden", "test", "abab", "ahliushfdlkasj"]} onFinish={nextState}/>}
            {state === 'countdown' && <Countdown onFinish={nextState} />}
            { state === 'takephotos' && <INeed leaderboard={leaderboard} gameStart={gameStart} items={items} onFinish={nextState} />}
            { state === 'leaderboard' && <Leaderboard leaderboard={leaderboard} onFinish={nextState}/> }
            { state === 'reelreview' && <ReelReview websocket={websocket} leaderboard={leaderboard} gameStart={gameStart} reel={reel} /> }
        </div>
    );
}