import "@/app/globals.css";
import { Freckle_Face } from "next/font/google";
import React from "react";

const freckleFace = Freckle_Face({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-freckle-face",
});

// Header Component
function GameHeader({ initialTime, onFinish }) {
    const timerRef = React.useRef(null);
    const maxTime = 5 * 60 * 1000; // 5 minutes in milliseconds alt: 8 * 1000;//

    React.useEffect(() => {
        const updateTimer = () => {
            if (timerRef.current) {
                const elapsed = Date.now() - initialTime;
                const remaining = Math.max(0, maxTime - elapsed);
                const minutes = Math.floor(remaining / (60 * 1000));
                const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
                timerRef.current.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

                if (remaining <= 0) {
                    // Time's up, trigger onFinish
                    if (typeof onFinish === 'function') {
                        onFinish();
                    }
                }
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
function TreeItem({ text }) {
    return (
        <div className="flex flex-col items-start space-y-2">
            <h2 className="text-3xl md:text-5xl font-normal font-['Freckle_Face'] text-black transform -rotate-[7deg]">
                {text}
            </h2>
            {/* <img className="w-48 h-48 md:w-60 md:h-60" src="/images/tree.png" alt="Tree" /> */}
        </div>
    );
}

// Grass Patch Component
function GrassPatchItem({ text }) {
    return (
        <div className="flex flex-col items-start space-y-2">
            <h2 className="text-3xl md:text-5xl font-normal font-['Freckle_Face'] text-black">
                {text}
            </h2>
            {/* <img className="w-48 h-48 md:w-60 md:h-60" src="/images/grass.png" alt="Grass patch" /> */}
        </div>
    );
}

// Clock Tower Component
function ClockTowerItem({ text }) {
    return (
        <div className="flex flex-col items-start space-y-2">
            <div className="relative flex flex-col items-center">
                {/* <div className="w-32 h-40 md:w-44 md:h-52 outline outline-4 outline-black bg-transparent" /> */}
            </div>
            <h2 className="text-3xl md:text-5xl font-normal font-['Freckle_Face'] text-black transform rotate-12">
                {text}
            </h2>
        </div>
    );
}

// People List Component
function PeopleList({ people, points }) {
    const refs = [
        React.useRef(null),
        React.useRef(null),
        React.useRef(null),
        React.useRef(null),
    ]

    const rotations = ["-rotate-3", "rotate-2", "-rotate-[7deg]", "rotate-2"];
    // Example people data if none provided
    if (!people) people = ["Smith", "John", "Emily", "Martin"];
    if (!points) points = [3, 5, 2, 4];

    const names = ["one", "two", "three", "four"];

    React.useEffect(() => {
        const tm = setInterval(() => {
            refs.forEach((ref) => {
                if (ref.current) {
                    const src = ref.current.src;
                    if (src.includes("letters/")) {
                        const newsrc = src.replace("letters/", "letters2/");
                        ref.current.src = newsrc;
                    } else if (src.includes("letters2/")) {
                        const newsrc = src.replace("letters2/", "letters/");
                        ref.current.src = newsrc;
                    }
                }
            });
        })

        return () => clearInterval(tm);
    }, []);

    return (
        <div className="bg-zinc-300 rounded-[50px] p-6 space-y-6 min-w-fit">
            {people.map((person, index) => (
                <div key={person.name} className="flex items-center space-x-4">
                    <span className="text-2xl md:text-3xl font-normal font-['Freckle_Face'] text-black">
                        {points[index] || 0} pt{points[index] === 1 ? '' : 's'}
                    </span>
                    <img src={`/images/letters/${names[index]}.svg`} className="w-16 h-16 md:w-20 md:h-20" ref={refs[index]}/>
                    <span className={`text-4xl md:text-6xl font-normal font-['Freckle_Face'] text-black transform ${rotations[index % rotations.length]}`}>
                        {person}
                    </span>
                </div>
            ))}
        </div>
    );
}

// Rubix Cube Component
function RubixCubeItem({ text }) {
    return (
        <div className="flex flex-col items-start space-y-2">
            <h2 className="text-3xl md:text-5xl font-normal font-['Freckle_Face'] text-black transform -rotate-[7deg]">
                {text}
            </h2>
        </div>
    );
}

// Scissors Component
function ScissorsItem({ text }) {
    return (
        <div className="flex flex-col items-start space-y-2">
            {/* <img className="w-40 h-40 md:w-52 md:h-52" src="/images/scissors.webp" alt="Scissors" /> */}
            <h2 className="text-3xl md:text-5xl font-normal font-['Freckle_Face'] text-black transform -rotate-[7deg]">
                {text}
            </h2>
        </div>
    );
}

// Mystery Item Component
function MysteryItem() {
    return (
        <div className="text-center space-y-2">
            {/* <h2 className="text-2xl md:text-4xl font-normal font-['Freckle_Face'] text-black transform rotate-[8deg]">
                Mysterious Item??
            </h2>
            <p className="text-2xl md:text-4xl font-normal font-['Freckle_Face'] text-black transform rotate-[8deg]">
                3:00 till reveal...
            </p> */}
        </div>
    );
}

// Main Component
export default function INeed({ leaderboard, gameStart, onFinish, items=["Tree", "Grass", "Clock Tower", "Rubix", "Scissors"] }) {
    const [people, setPeople] = React.useState(["Smith", "John", "Emily", "Martin"]);
    const [points, setPoints] = React.useState([3, 5, 2, 4]);

    React.useEffect(() => {
        console.log(leaderboard)
        setPeople(leaderboard.map(entry => entry.name));
        setPoints(leaderboard.map(entry => entry.points));
    }, [leaderboard]);

    return (
        <div className={`min-h-screen p-4 ${freckleFace.variable}`}>
            <div className="max-w-7xl mx-auto">
                <GameHeader initialTime={gameStart} onFinish={onFinish} />
                
                <div className="flex flex-row gap-8 justify-around flex-wrap">

                    <div className="flex flex-col gap-8 rounded-[50px] max-w-3xl">
                        <div className="flex flex-col md:flex-row gap-8 items-center justify-around">
                            <TreeItem text={items[0]} />
                            <GrassPatchItem text={items[1]} />
                        </div>
                        <div className="flex flex-col md:flex-row gap-8 items-center justify-around">
                            <ClockTowerItem text={items[2]} />
                            <RubixCubeItem text={items[3]} />
                            <ScissorsItem text={items[4]} />
                        </div>
                    </div>
                    
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        
                        <div className="flex flex-col space-y-8">
                            <PeopleList people={people} points={points} />
                            <MysteryItem />
                        </div>
                    </div>
                </div>

                <img className="w-[100vw] absolute top-0 left-0 -z-10" src="/images/bg.svg" />
            </div>
        </div>
    );
}