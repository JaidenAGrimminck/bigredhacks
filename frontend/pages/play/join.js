import "@/app/globals.css";
import { Freckle_Face } from "next/font/google";
import React from "react";

const freckleFace = Freckle_Face({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-freckle-face",
});

function UserIcon({ title, indx }) {
        const rots = [0, 135, 45, 180];

        function getSepEles() {
            return [
                (<h1 className={`text-black text-4xl lg:text-7xl font-normal font-['Freckle_Face'] ${
                        indx === 0 ? 'rotate-[5.38deg]' : 
                        indx === 1 ? 'rotate-[10.11deg]' :
                        indx === 2 ? 'rotate-[-9.75deg]' : 'rotate-[-10.08deg]'
                }`}>
                    {title}
                </h1>),
                (<img 
                    className={`w-60 h-48 lg:w-80 lg:h-72 rotate-[${rots[indx]}deg]`} 
                    src="/images/splat.png" 
                    alt="Player splat"
                />)
            ]
        }

        return (
            <div className={`flex flex-col items-center`}>
                        
                {indx % 2 === 0 ? getSepEles() : getSepEles().reverse()}
            </div>
        );
}

export default function Join() {
        return (
                <div className={`min-h-screen w-full h-[100vh] bg-white overflow-hidden relative ${freckleFace.variable} overflow-y-hidden flex flex-col`}>
                        {/* Background */}
                        <img 
                                className="absolute inset-0 w-full h-full object-cover" 
                                src="/images/beach.jpg" 
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
                                        <div className="flex gap-2 lg:gap-4">
                                                {[...Array(4)].map((_, i) => (
                                                        <div 
                                                                key={i}
                                                                className="w-16 h-20 lg:w-20 lg:h-24 outline outline-2 outline-offset-[-1px] outline-black bg-white"
                                                        />
                                                ))}
                                        </div>
                                </div>
                        </div>

                        <div className="relative flex-1 mx-4 lg:mx-16 my-8 lg:my-16">
                                <div className="flex flex-row justify-around w-full">
                                        <UserIcon title="Name 1" indx={0} />
                                        <UserIcon title="Name 2" indx={1} />
                                        <UserIcon title="Name 3" indx={2} />
                                        <UserIcon title="Name 4" indx={3} />
                                </div>
                        </div>

                        {/* GO Button */}
                        <div className="relative z-10 flex justify-center pb-8 lg:pb-16">
                                <button className="bg-green-500 rounded-[50px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] px-8 py-4 lg:px-12 lg:py-6 flex items-center gap-4 hover:bg-green-600 transition-colors duration-300 cursor-pointer">
                                        <span className="text-white text-4xl lg:text-7xl font-normal font-['Freckle_Face']">
                                                GO!
                                        </span>
                                        <div className="w-8 h-0 lg:w-11 border-[4px] lg:border-[6px] border-white" />
                                </button>
                        </div>
                </div>
        );
}