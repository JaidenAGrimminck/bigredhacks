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

function PhotoGame({ websocket, startTime, playerName, classifications }) {
    const videoPhotoRef = React.useRef(null);
    const galleryRef = React.useRef(null);
    const timerRef = React.useRef(null);

    const [onMobile, setOnMobile] = React.useState(false);

    const [photosTaken, setPhotosTaken] = React.useState([]);

    const setup = async () => {
        const video = document.createElement('video');
        const canvas = document.getElementById('photoCanvas');
        const context = canvas.getContext('2d');
        
        // Access the device camera and stream to video element
        // Set canvas dimensions
        canvas.width = 640;
        canvas.height = 480;
        
        // Check if getUserMedia is available and if we're in a secure context
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error("getUserMedia is not supported");
            context.fillStyle = "#f0f0f0";
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = "#000";
            context.font = "20px Arial";
            context.textAlign = "center";
            context.fillText("Camera not supported on this device", canvas.width/2, canvas.height/2);
            return;
        }

        if (!window.isSecureContext && location.hostname !== 'localhost') {
            console.error("getUserMedia requires HTTPS on mobile devices");
            context.fillStyle = "#f0f0f0";
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = "#000";
            context.font = "20px Arial";
            context.textAlign = "center";
            context.fillText("Camera requires HTTPS connection", canvas.width/2, canvas.height/2);
            return;
        }
        
        navigator.mediaDevices.getUserMedia({ 
            'audio': false,
            'video': {
            facingMode: 'user',
            height: {ideal:640},
            width: {ideal:480},
            },
        })
            .then((stream) => {
                video.srcObject = stream;
                video.play();

                // Draw video frame to canvas
                const draw = () => {
                    if (video.readyState === video.HAVE_ENOUGH_DATA) {
                        context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    }
                    requestAnimationFrame(draw);
                };
                requestAnimationFrame(draw);
            })
            .catch((error) => {
                console.error("Error accessing camera:", error);
                context.fillStyle = "#f0f0f0";
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.fillStyle = "#000";
                context.font = "20px Arial";
                context.textAlign = "center";
                context.fillText("Camera not available", canvas.width/2, canvas.height/2);
            });
    };

    React.useEffect(() => {
        // check what device we're on
        const ua = navigator.userAgent;
        // if mobile:
        if (/Mobi|Android/i.test(ua)) {
            setOnMobile(true);
        } else {
            setup();
        }
    }, []);

    React.useEffect(() => {
        // update the timer
        const interval = setInterval(() => {
            if (!startTime) return;
            const now = Date.now();
            const diff = startTime + 5 * 60 * 1000 - now;
            if (diff <= 0) {
                timerRef.current.innerText = "0:00";
                clearInterval(interval);
                return;
            }
            const minutes = Math.floor(diff / (60 * 1000));
            const seconds = Math.floor((diff % (60 * 1000)) / 1000);
            timerRef.current.innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
        , 1000);
        
        return () => clearInterval(interval);
    }, [startTime]);

    function GalleryItem({ photo, classification={correct: false, item: '', photo: ''} }) {
        return (
            <div className="flex flex-col justify-center items-center border border-black p-4 m-2 bg-white">
                <img src={photo} className="w-60 h-48 object-cover border border-black" />

                <h1 className="text-black font-['Freckle_Face']">Classified as: <span style={{ color: classification.correct ? 'green' : 'red' }}>{ classification.item == "" ? "I'm thinking..." : classification.item }</span></h1>
            </div>
        );
    }

    const takePhoto = () => {
        const canvas = document.getElementById('photoCanvas');
        const dataURL = canvas.toDataURL('image/png');
        setPhotosTaken([...photosTaken, dataURL]);
        console.log("Photo taken");
        if (websocket()) {
            websocket().send(JSON.stringify({
                type: 'photo',
                photo: dataURL,
                name: playerName,
                id: photosTaken.length,
            }));
        }
    }

    const swapToGallery = () => {
        videoPhotoRef.current.style.display = 'none';
        galleryRef.current.style.display = 'flex';
    }

    const swapToCamera = () => {
        galleryRef.current.style.display = 'none';
        videoPhotoRef.current.style.display = 'flex';
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        // convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotosTaken([...photosTaken, reader.result]);
            if (websocket()) {
                websocket().send(JSON.stringify({
                    type: 'photo',
                    photo: reader.result,
                    name: playerName,
                    id: photosTaken.length,
                }));
            }
        }
        if (file) {
            reader.readAsDataURL(file);
        }
    }

    return (
        <div className="w-[100vw] h-[100vh] flex flex-col justify-center items-center text-5xl text-black bg-cover bg-center" style={{ backgroundImage: "url('/images/bg.svg')" }}>
            <div className="mb-4 text-center text-2xl p-4 rounded bg-black text-white bg-opacity-50 font-['Freckle_Face']">
                <h1>You have: <span className="text-red" ref={timerRef}>5:00</span></h1>
            </div>
            <div className="flex flex-col justify-center items-center" ref={videoPhotoRef}>
                <h1 className="text-white font-['Freckle_Face']">I need...</h1>
                <div className="flex flex-col justify-center items-center mt-4">
                    {!onMobile && <>
                    <canvas id="photoCanvas" className="border border-black bg-white w-[80vw] h-[60vh]"></canvas>
                    <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 active:bg-blue-700 mt-4 font-['Freckle_Face']" onClick={takePhoto}>Take Photo</button>
                    </>}
                    {
                        onMobile && 
                        <div>
                        <input type="file" accept="image/png" capture="camera" className="bg-white w-[90vw] text-center text-[20px] p-2 rounded" onChange={handleFileChange} />
                        </div>
                    }
                    <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 active:bg-blue-700 mt-4 font-['Freckle_Face']" onClick={swapToGallery}>See Gallery</button>
                </div>
            </div>
            <div className="flex flex-col justify-center items-center w-full" ref={galleryRef} style={{ display: 'none' }}>
                <div className="flex flex-row items-center mt-4 w-[100vw] overflow-x-scroll">
                    {photosTaken.length === 0 && <h1 className="text-white font-['Freckle_Face']">No photos taken yet.</h1>}
                    {photosTaken.map((photo, index) => (
                        <GalleryItem photo={photo} key={index} classification={classifications.find(cls => cls.id === index)} />
                    ))}
                </div>
                <div className="text-white font-['Freckle_Face'] mt-4">Scroll to see more</div>
                <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 active:bg-blue-700 mt-4 font-['Freckle_Face']" onClick={swapToCamera}>Back to Camera</button>
            </div>
        </div>
    )
}

function ReelReview({ questions, qref }) {
    return (
        <div className="w-[100vw] h-[100vh] flex flex-col items-center text-5xl text-black">
            <div className="bg-white bg-opacity-75 p-8 rounded-lg shadow-lg max-w-4xl">
                <h1 className="text-4xl mb-6 font-['Freckle_Face']">Review Questions</h1>
                <ul className="list-disc list-inside space-y-4 text-2xl" ref={qref}>
                    {questions.map((question, index) => (
                        <>
                        <li key={index} className="font-['Freckle_Face']">{question}</li>
                        <div key={index + "-input"}>
                            <textarea type="text" rows={5} className="border border-gray-300 p-2 rounded w-full mt-2 text-2xl font-['Freckle_Face']" placeholder="Your answer..." />
                        </div>
                        </>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default function Game() {
    let testing = false;
    let [state, setState] = React.useState('wait'); // wait, play

    let [socket, setSocket] = React.useState(null);
    let [name, setName] = React.useState("");
    let [classifications, setClassifications] = React.useState([]);
    let [startTime, setStartTime] = React.useState(Date.now());
    let [reelQuestions, setReelQuestions] = React.useState([
        "What is the main theme of the reel?",
        "Describe the setting of the reel.",
        "Who are the main characters in the reel?",
        "What is the conflict or problem presented in the reel?",
        "How is the conflict resolved?",
        "What emotions did the reel evoke?",
        "What was your favorite part of the reel and why?",
        "Did you notice any symbols or motifs in the reel? If so, what do you think they represent?",
        "How does the reel relate to real-life situations or experiences?",
        "What message or lesson do you think the reel is trying to convey?"
    ]);

    let questionsRef = React.useRef(null);

    const f = async () => {
        await new Promise(resolve => setTimeout(resolve, 100)); // wait for next tick to ensure search params are available
        if (testing) return;

        const searchParams = new URLSearchParams(window.location.search);

        const gameID = searchParams.get('gameid');
        const userID = decodeURIComponent(searchParams.get('userid'));
        
        // validate gameID and userID here
        if (!gameID || !userID) {
            alert("Invalid game ID or user ID");
            window.location.href = "/temp/join";
            return;
        }

        setName(userID);

        // connect to websocket here
        const ws = new WebSocket(`${API_BASE_URL}/ws/player`);

        setSocket(ws);

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
                //alert(data.message);
                window.location.href = "/temp/join";
            } else if (data.type === 'switch_to_game') {
                setState(data.state)
                console.log("Switching to game state: " + data.state);
                setStartTime(Date.now());
            } else if (data.type === 'get_reel_responses') {
                if (questionsRef.current) {
                    let answers = [];
                    for (let child of questionsRef.current.children) {
                        if (child.tagName === "DIV" && child.children[0] && child.children[0].tagName === "TEXTAREA") {
                            answers.push(child.children[0].value);
                        }
                    }
                    ws.send(JSON.stringify({
                        type: 'submit_reel_responses',
                        answers,
                    }));
                }
            } else if (data.type === 'detection') {
                const cls = {
                    correct: data.correct,
                    item: data.item,
                    id: data.id,
                }

                console.log(cls)
                setClassifications(old => [...old, cls]);
            } else if (data.type === 'update_time') {
                setStartTime(data.startTime);
            } else if (data.type === 'reel_questions') {
                setReelQuestions(data.questions);
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
        <>
            {state === 'wait' && <Wait />}
            {state === 'takephotos' && <PhotoGame websocket={() => { return socket; }} startTime={startTime} playerName={name} classifications={classifications} />}
            { state === 'reelreview_resp' && <ReelReview questions={reelQuestions} qref={questionsRef}/> }
        </>
    );
}