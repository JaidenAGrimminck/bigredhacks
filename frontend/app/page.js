'use client';

import Image from "next/image";
import Link from "next/link";

export default function Home() {
    return (
        <div>
            <Link href="/signin">Sign In</Link>
            <br />
            <Link href="/signup">Sign Up</Link>
        </div>
    );
}
