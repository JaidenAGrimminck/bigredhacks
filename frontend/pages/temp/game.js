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

function PhotoGame({ websocket }) {
    const videoPhotoRef = React.useRef(null);
    const galleryRef = React.useRef(null);

    const [photosTaken, setPhotosTaken] = React.useState([]);

    React.useEffect(() => {
        const video = document.createElement('video');
        const canvas = document.getElementById('photoCanvas');
        const context = canvas.getContext('2d');
        
        // Access the device camera and stream to video element
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                video.srcObject = stream;
                video.play();

                // Draw video frame to canvas
                const draw = () => {
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    

                    requestAnimationFrame(draw);
                };
                requestAnimationFrame(draw);
            });
    }, []);

    function GalleryItem({ photo }) {
        return (
            <div className="flex flex-col justify-center items-center border border-black p-4 m-2 bg-white">
                <img src={photo} className="w-60 h-48 object-cover border border-black" />

                <h1 className="text-black font-['Freckle_Face']">Classified as: <span className="text-red">Cat</span></h1>

            </div>
        );
    }

    const takePhoto = () => {
        const canvas = document.getElementById('photoCanvas');
        const dataURL = canvas.toDataURL('image/png');
        setPhotosTaken([...photosTaken, dataURL]);
        console.log("Photo taken");
        if (websocket) {
            websocket.send(JSON.stringify({
                type: 'photo',
                data: dataURL,
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

    return (
        <div className="w-[100vw] h-[100vh] flex flex-col justify-center items-center text-5xl text-black bg-cover bg-center" style={{ backgroundImage: "url('/images/bg.svg')" }}>
            <div className="mb-4 text-center text-2xl p-4 rounded bg-black text-white bg-opacity-50 font-['Freckle_Face']">
                <h1>You have: <span className="text-red">5:00</span></h1>
            </div>
            <div className="flex flex-col justify-center items-center" ref={videoPhotoRef}>
                <h1 className="text-white font-['Freckle_Face']">I need...</h1>
                <div className="flex flex-col justify-center items-center mt-4">
                    <canvas id="photoCanvas" className="border border-black bg-white w-[80vw] h-[60vh]"></canvas>
                    <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 active:bg-blue-700 mt-4 font-['Freckle_Face']" onClick={takePhoto}>Take Photo</button>
                    <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 active:bg-blue-700 mt-4 font-['Freckle_Face']" onClick={swapToGallery}>See Gallery</button>
                </div>
            </div>
            <div className="flex flex-col justify-center items-center w-full" ref={galleryRef} style={{ display: 'none' }}>
                <div className="flex flex-row items-center mt-4 w-[100vw] overflow-x-scroll">
                    {photosTaken.length === 0 && <h1 className="text-white font-['Freckle_Face']">No photos taken yet.</h1>}
                    {photosTaken.map((photo, index) => (
                        <GalleryItem photo={photo} key={index} />
                    ))}
                </div>
                <div className="text-white font-['Freckle_Face'] mt-4">Scroll to see more</div>
                <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 active:bg-blue-700 mt-4 font-['Freckle_Face']" onClick={swapToCamera}>Back to Camera</button>
            </div>
        </div>
    )
}

export default function Game() {
    let testing = true;
    let state = 'play';

    const f = async () => {
        await new Promise(resolve => setTimeout(resolve, 100)); // wait for next tick to ensure search params are available
        if (testing) return;

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
        <>
            {state === 'wait' && <Wait />}
            {state === 'play' && <PhotoGame />}
        </>
    );
}