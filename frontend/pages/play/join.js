import { API_BASE_URL } from "@/app/constants";
import "@/app/globals.css";
import { Freckle_Face } from "next/font/google";
import React from "react";

const freckleFace = Freckle_Face({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-freckle-face",
});

function UserIcon({ title, indx, r }) {
        const rots = [0, 135, 45, 180];

        function getSepEles() {
            return [
                (<h1 className={`text-black text-4xl lg:text-7xl font-normal font-['Freckle_Face'] ${
                        indx === 0 ? 'rotate-[5.38deg]' : 
                        indx === 1 ? 'rotate-[10.11deg]' :
                        indx === 2 ? 'rotate-[-9.75deg]' : 'rotate-[-10.08deg]'
                }`} key={indx * 100 + 51}>
                    {title}
                </h1>),
                (<img 
                    className={`w-60 h-48 lg:w-80 lg:h-72 rotate-[${rots[indx]}deg]`} 
                    src="/images/splat.png" 
                    alt="Player splat"
                    key={indx * 1050 + 52}
                />)
            ]
        }

        return (
            <div className={`flex flex-col items-center`} ref={r}>
                        
                {indx % 2 === 0 ? getSepEles() : getSepEles().reverse()}
            </div>
        );
}

export default function Join() {
        const gameCode = React.useRef(null);
        const playerOne = React.useRef(null);
        const playerTwo = React.useRef(null);
        const playerThree = React.useRef(null);
        const playerFour = React.useRef(null);
        const handPlacerRef = React.useRef(null);

        const letterOne = React.useRef(null);
        const letterTwo = React.useRef(null);
        const letterThree = React.useRef(null);
        const letterFour = React.useRef(null);

        const clickRef = React.useRef(null);

        const plopRef = React.useRef(null);

        let [clicked, setClicked] = React.useState(false);

        const players = [playerOne, playerTwo, playerThree, playerFour];

        let playerIndex = [0, 1, 2, 3];

        let websocket;
        
        const letters = []; // TODO: handrawn letters A-Z
        
        let [code, setCode] = React.useState("");

        let playersJoined = 0;

        React.useEffect(() => {
            for (let player of players) {
                player.current.style = "opacity: 20%";
            }
        }, []);

        React.useEffect(() => {
            // start websocket connection here
            websocket = new WebSocket(`${API_BASE_URL}/ws/game`);

            websocket.onopen = () => {
                console.log("WebSocket connection established");

                websocket.send(JSON.stringify({
                    type: 'establish',
                }));
            };

            websocket.onmessage = (event) => {
                let data;
                try {
                    data = JSON.parse(event.data);
                } catch (e) {
                    return;
                }

                if (data.type === 'established') {
                    setCode(data.code);
                    console.log(`Game established with code: ${data.code}`);
                    for (let i = 0; i < 4; i++) {
                        if (gameCode.current && gameCode.current.children[i]) {
                            gameCode.current.children[i].src = `/images/letters/${data.code.charAt(i)}.svg`;
                            //gameCode.current.children[i].classList.add("animate-pulse");
                            gameCode.current.children[i].style.color = "#000000";
                        }
                    }
                } else if (data.type === 'player_joined') {
                    const indx = playerIndex[0] + 1 - 1;
                    setTimeout(() => {
                        players[indx].current.style = "opacity: 100%";
                        for (let child of players[indx].current.children) {
                            if (child.tagName === "H1") {
                                child.textContent = data.name;
                            }
                        }
                    }, 800)
                    
                    // when this occurs, animate the handOutstrechedRTef to move towards the player icon and then back down
                    if (handPlacerRef.current) {
                        const finalPos = {
                            x: players[playerIndex[0]].current.getBoundingClientRect().left - 150,
                            y: players[playerIndex[0]].current.getBoundingClientRect().bottom - 650,
                        }

                        handPlacerRef.current.style.left = `${finalPos.x}px`;
                        handPlacerRef.current.style.bottom = `${-1000}px`;

                        handPlacerRef.current.style.transition = "bottom 0.8s ease-out";
                        handPlacerRef.current.style.bottom = `${finalPos.y}px`;

                        setTimeout(() => {
                            if (plopRef.current) {
                                plopRef.current.play();
                            }
                        }, 700);
                        
                        setTimeout(() => {
                            

                            if (handPlacerRef.current) {
                                handPlacerRef.current.style.bottom = `-1000px`;
                            }
                        }, 1000);
                    }

                    playerIndex.shift();
                    playersJoined++;
                    console.log(`Player joined: ${data.name}`);
                } else if (data.type === 'player_left') {
                    // figure out index of player who left
                    let leftIndex = -1;
                    for (let i = 0; i < 4; i++) {
                        if (players[i].current && players[i].current.children) {
                            for (let child of players[i].current.children) {
                                if (child.tagName === "H1" && child.textContent === data.name) {
                                    leftIndex = i;
                                    break;
                                }
                            }
                        }
                        if (leftIndex !== -1) break;
                    }

                    console.log(data.name + " for left index " + leftIndex);
                    
                    // add to beginning of playerIndex
                    if (leftIndex !== -1) {
                        playerIndex.unshift(leftIndex);
                        playerIndex.sort();
                        playersJoined--;

                        players[leftIndex].current.style = "opacity: 20%";
                    }
                    
                    console.log(`Player left: ${data.name}`);
                }
            };

            websocket.onclose = () => {
                console.log("WebSocket connection closed");
                    
            };

            return () => {
                websocket.close();
            };
        }, []);

        const startGame = async () => {
            // if (playersJoined < 1) {
            //     alert("At least one player is required to start the game.");
            //     return;
            // }

            const response = await fetch(`${API_BASE_URL}/games/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "X-Session-ID": document.cookie.split('; ').find(row => row.startsWith('sessionID=')).split('=')[1],
                },
                body: JSON.stringify({ gameId: code }),
            });
            
            if (!response.ok) {
                alert("Failed to start game. Please try again.");
                return;
            } 

            window.location.href = `/play/playing?gameid=${encodeURIComponent(code)}`; // redirect to playing page
        }

        React.useEffect(() => {
            let c = [letterOne, letterTwo, letterThree, letterFour].map(ref => ref.current);

            const int = setInterval(() => {
                for (let child of c) {
                    if (child.src !== "" && child.src != null) {
                        if (child.src.includes("letters/")) {
                            child.src = child.src.replace("letters/", "letters2/");
                        } else if (child.src.includes("letters2/")) {
                            child.src = child.src.replace("letters2/", "letters/");
                        }
                    }
                }
            }, 100)
            return () => clearInterval(int);
        })

        return (
            <div className={`min-h-screen w-full h-[100vh] bg-white overflow-hidden relative ${freckleFace.variable} overflow-y-hidden flex flex-col`}>
                        {/* Background */}
                        <img 
                                className="absolute inset-0 w-full h-full object-cover" 
                                src="/images/beachbg.gif" 
                                alt="Beach background"
                        />
                        
                        {/* Header Section */}
                        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start p-4 lg:p-8 pb-0">
                                <h1 className="text-black text-6xl lg:text-9xl font-normal font-['Freckle_Face'] transform -rotate-[2.91deg] lg:mb-0">
                                        Join now!
                                </h1>
                                
                                <div className="flex flex-col items-center lg:items-start">
                                        <div className="text-black text-4xl lg:text-7xl font-normal font-['Freckle_Face'] transform rotate-[5.38deg] mb-4">
                                                Code:
                                        </div>
                                        <div className="flex gap-2 lg:gap-4" ref={gameCode}>
                                                {[...Array(4)].map((_, i) => (
                                                        <img 
                                                                key={i}
                                                                className="w-16 h-20 lg:w-20 lg:h-24 outline-offset-[-1px]"
                                                                ref={i === 0 ? letterOne : i === 1 ? letterTwo : i === 2 ? letterThree : letterFour}
                                                        />
                                                ))}
                                                <img src="/images/letters/smallbg.svg" className="absolute top-[75px] right-[0px] opacity-100 -z-10" />
                                        </div>
                                </div>
                        </div>

                        <div className="relative flex-1 mx-4 lg:mx-16 my-8 lg:my-16">
                                <div className="flex flex-row justify-around w-full">
                                        <UserIcon title="Player 1" indx={0} key={10} r={playerOne} />
                                        <UserIcon title="Player 2" indx={1} key={11} r={playerTwo} />
                                        <UserIcon title="Player 3" indx={2} key={12} r={playerThree} />
                                        <UserIcon title="Player 4" indx={3} key={13} r={playerFour} />
                                </div>
                        </div>

                        {/* GO Button */}
                        <div className="relative z-10 flex justify-center pb-8 lg:pb-16">
                                <button className="bg-green-500 rounded-[50px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] px-8 py-4 lg:px-12 lg:py-6 flex items-center gap-4 hover:bg-green-600 transition-colors duration-300 cursor-pointer">
                                        <span className="text-white text-4xl lg:text-7xl font-normal font-['Freckle_Face']" onClick={() => {
                                            
                                            startGame();
                                        }} onMouseEnter={() => {
                                            clickRef.current.currentTime = 0;
                                            clickRef.current.play();
                                        }}>
                                                GO!
                                        </span>
                                </button>
                        </div>

                        <img className="absolute bottom-[-1000px] left-0 w-[700px] rotate-[45deg]" src="/images/hand_outstreched.png" alt="hand" ref={handPlacerRef} />
                        
                        { !clicked && <div className="absolute top-0 left-0 w-[100vw] h-[100vh] z-1000 bg-black/25 flex items-center justify-center" onClick={
                            () => setClicked(true)
                        }>
                            <h1>Click to continue.</h1>
                        </div> }

                        {
                            clicked && <audio src="/audio/beach.mp3" autoPlay loop />
                        }

                        <audio src="/audio/splash.mp3" ref={plopRef}/>
                        <audio src="/audio/click.mp3" ref={clickRef} />
                </div>
        );
}