import "@/app/globals.css";
import { Freckle_Face } from "next/font/google";

const freckleFace = Freckle_Face({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-freckle-face",
});



export default function SignUp() {
    return (
        <div className={`w-[100vw] h-[100vh] relative bg-white overflow-hidden flex flex-col justify-center text-left text-5xl text-black font-['Freckle_Face'] ${freckleFace.variable}`}>
            <div className="flex flex-col items-center justify-center gap-5">
                <div>Sign Up</div>
                <div className="flex flex-col items-center justify-center gap-16 bg-zinc-100 p-10 rounded-[50px]">
                    <div className="flex flex-row items-center justify-start gap-[19px]">
                        <div className="justify-start text-black text-4xl font-normal font-['Freckle_Face']">Email</div>
                        <input className="w-80 h-11 bg-zinc-300 rounded-[5px] text-3xl pl-[10px]" />
                    </div>                
                    <div className="flex flex-row items-center justify-center gap-2.5 bg-zinc-300 rounded-[20px] text-center text-white cursor-pointer hover:bg-zinc-400 transition-colors duration-300">
                        <div className="text-black text-4xl font-normal font-['Freckle_Face'] pl-[40px] pr-[40px] pt-[10px] pb-[10px]">Submit</div>
                    </div>
                    <div className="left-[442px] top-[535px] justify-start">
                        <span className="text-black text-3xl font-normal font-['Freckle_Face']">Already have an account?</span>
                        <a className="text-blue-500 text-3xl font-normal font-['Freckle_Face'] underline pl-[5px]" href="/signin">Sign in</a>
                    </div>
                </div>
            </div>
        </div>
    );
}