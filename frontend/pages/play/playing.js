
import { API_BASE_URL } from "@/app/constants";
import "@/app/globals.css";
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
    //let [state, setState] = useState('intro'); // intro, countdown, leaderboard, play/ineed, play/reelreview

    let parentRef = React.useRef(null);
    let stateRef = React.useRef('intro');
    
    let [state, setState] = useState('intro'); // intro, countdown, leaderboard, play/ineed, play/reelreview
    
    let [leaderboard, setLeaderboard] = useState([]);
    let [gameStart, setGameStart] = useState(Date.now());
    let [reel, setReel] = useState(null);
    let [items, setItems] = useState([]);
    let [doneReelReview, setDoneReelReview] = useState(false);
    let [doneCountdown, setDoneCountdown] = useState(false);

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
            } else if (data.type === 'error') {
                if (data.message === 'Game not found') {
                    window.location.href = "/";
                }
            } else if (data.type === 'switch_to_game') {
                if (stateRef.current === 'takephotos' && data.state === 'countdown') return; // don't go backwards
                
                setState(data.state);
                stateRef.current = data.state;

                if (data.state === 'reelreview') {
                    setDoneReelReview(true);
                }
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
    
    const nextState = React.useCallback(() => {
        if (state === 'intro') {
            if (doneCountdown) return;

            setState('countdown');
            stateRef.current = 'countdown';

            setDoneCountdown(true);
        } else if (state === 'countdown') {
            console.log(websocket)
            setDoneCountdown(true);

            if (websocket) {
                websocket.send(JSON.stringify({
                    type: 'forward_state',
                    state: 'takephotos',
                }));
            }
            
            setGameStart(Date.now());
            setState('takephotos');
            stateRef.current = 'takephotos';
        } else if (state === 'takephotos') {
            if (websocket) {
                websocket.send(JSON.stringify({
                    type: 'forward_state',
                    state: 'leaderboard',
                }));
            }
            
            setState('leaderboard');
            stateRef.current = 'leaderboard';
        } else if (state === 'leaderboard') {
            if (doneReelReview) return;

            if (websocket) {
                setState('reelreview');
                stateRef.current = 'reelreview';
            }
        } else if (state === 'reelreview') {
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
    });

    React.useEffect(() => {
        if (state === 'reelreview') {
            setDoneReelReview(true);
        }
    }, [state]);

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
        <div ref={parentRef}>
            { state === 'intro' && <Intro playerNames={[]} onFinish={nextState}/>}
            { state === 'countdown' && <Countdown onFinish={nextState} />}
            { state === 'takephotos' && <INeed leaderboard={leaderboard} gameStart={gameStart} items={items} onFinish={nextState} />}
            { state === 'leaderboard' && <Leaderboard leaderboard={leaderboard} onFinish={nextState}/> }
            { state === 'reelreview' && <ReelReview websocket={websocket} leaderboard={leaderboard} gameStart={gameStart} reel={reel} /> }
            { state === 'leaderboard2' && <Leaderboard leaderboard={leaderboard} onFinish={nextState} secondLeaderboard={true} /> }
        </div>
    );
}