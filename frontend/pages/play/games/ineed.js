import "@/app/globals.css";
import { Freckle_Face } from "next/font/google";
import React from "react";

const freckleFace = Freckle_Face({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-freckle-face",
});

// Header Component
function GameHeader() {
    const initialTime = Date.now();
    const timerRef = React.useRef(null);

    React.useEffect(() => {
        const updateTimer = () => {
            if (timerRef.current) {
                const elapsed = Date.now() - initialTime;
                const remaining = Math.max(0, 5 * 60 * 1000 - elapsed);
                const minutes = Math.floor(remaining / (60 * 1000));
                const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
                timerRef.current.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }

        updateTimer(); // Initial call to set the timer immediately
        const timer = setInterval(updateTimer, 1000); // Update every second
        
        return () => clearInterval(timer);
    }, [initialTime]);
    
    return (
        <div className="flex justify-between items-start p-4">
            <h1 className="text-6xl md:text-9xl font-normal font-['Freckle_Face'] text-black transform -rotate-3">
                I need...
            </h1>
            <div className="bg-zinc-300 rounded-[50px] px-8 py-4 w-[250px]">
                <div className="text-center text-red-600 text-4xl md:text-8xl font-normal font-['Freckle_Face'] tracking-[5px]" ref={timerRef}>
                    {"5:00"}
                </div>
            </div>
        </div>
    );
}

// Tree Component
function TreeItem() {
    return (
        <div className="flex flex-col items-start space-y-2">
            <h2 className="text-3xl md:text-5xl font-normal font-['Freckle_Face'] text-black transform -rotate-[7deg]">
                A tree
            </h2>
            <img className="w-48 h-48 md:w-60 md:h-60" src="/images/tree.png" alt="Tree" />
        </div>
    );
}

// Grass Patch Component
function GrassPatchItem() {
    return (
        <div className="flex flex-col items-start space-y-2">
            <h2 className="text-3xl md:text-5xl font-normal font-['Freckle_Face'] text-black">
                A grass patch
            </h2>
            <img className="w-48 h-48 md:w-60 md:h-60" src="/images/grass.png" alt="Grass patch" />
        </div>
    );
}

// Clock Tower Component
function ClockTowerItem() {
    return (
        <div className="flex flex-col items-start space-y-2">
            <div className="relative flex flex-col items-center">
                <div className="w-32 h-40 md:w-44 md:h-52 outline outline-4 outline-black bg-transparent" />
            </div>
            <h2 className="text-3xl md:text-5xl font-normal font-['Freckle_Face'] text-black transform rotate-12">
                The Cornell<br/>Clocktower
            </h2>
        </div>
    );
}

// People List Component
function PeopleList() {
    const people = [
        { name: "Smith", rotation: "-rotate-3" },
        { name: "John", rotation: "rotate-2" },
        { name: "Emily", rotation: "-rotate-[7deg]" },
        { name: "Martin", rotation: "rotate-2" }
    ];

    return (
        <div className="bg-zinc-300 rounded-[50px] p-6 space-y-6 min-w-fit">
            {people.map((person, index) => (
                <div key={person.name} className="flex items-center space-x-4">
                    <span className="text-2xl md:text-3xl font-normal font-['Freckle_Face'] text-black">
                        {'3 pts'}
                    </span>
                    <div className="w-10 h-16 md:w-14 md:h-20 outline outline-4 outline-black bg-transparent" />
                    <span className={`text-4xl md:text-6xl font-normal font-['Freckle_Face'] text-black transform ${person.rotation}`}>
                        {person.name}
                    </span>
                </div>
            ))}
        </div>
    );
}

// Rubix Cube Component
function RubixCubeItem() {
    return (
        <div className="flex flex-col items-start space-y-2">
            <div className="relative">
                {/* Complex cube structure - simplified for responsiveness */}
                <div className="grid grid-cols-3 gap-1 w-24 h-24 md:w-32 md:h-32">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="outline outline-2 outline-black bg-transparent" />
                    ))}
                </div>
            </div>
            <h2 className="text-3xl md:text-5xl font-normal font-['Freckle_Face'] text-black transform -rotate-[7deg]">
                Rubix Cube
            </h2>
        </div>
    );
}

// Scissors Component
function ScissorsItem() {
    return (
        <div className="flex flex-col items-start space-y-2">
            <img className="w-40 h-40 md:w-52 md:h-52" src="/images/scissors.webp" alt="Scissors" />
            <h2 className="text-3xl md:text-5xl font-normal font-['Freckle_Face'] text-black transform -rotate-[7deg]">
                Scissors
            </h2>
        </div>
    );
}

// Mystery Item Component
function MysteryItem() {
    return (
        <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-4xl font-normal font-['Freckle_Face'] text-black transform rotate-[8deg]">
                Mysterious Item??
            </h2>
            <p className="text-2xl md:text-4xl font-normal font-['Freckle_Face'] text-black transform rotate-[8deg]">
                3:00 till reveal...
            </p>
        </div>
    );
}

// Main Component
export default function INeed() {
    return (
        <div className={`min-h-screen bg-white p-4 ${freckleFace.variable}`}>
            <div className="max-w-7xl mx-auto">
                <GameHeader />
                
                <div className="flex flex-row gap-8 justify-around flex-wrap">

                <div className="flex flex-col gap-8 rounded-[50px] max-w-3xl">
                    <div className="flex flex-col md:flex-row gap-8 items-center justify-around">
                        <TreeItem />
                        <GrassPatchItem />
                    </div>
                    <div className="flex flex-col md:flex-row gap-8 items-center justify-around">
                        <ClockTowerItem />
                        <RubixCubeItem />
                        <ScissorsItem />
                    </div>
                </div>
                
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    <div className="flex flex-col space-y-8">
                        <PeopleList />
                        <MysteryItem />
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
}