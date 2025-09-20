'use client';

import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Home() {

    // redir to /test/join
    React.useEffect(() => {
        // check if iphone
        if (navigator.userAgent.match(/iPhone/i)) {
            window.location.href = "/test/join";
        } else {
            window.location.href = "/dashboard";
        }
    }, []);

    return (
        <div>
            <Link href="/signin">Sign In</Link>
            <br />
            <Link href="/signup">Sign Up</Link>
        </div>
    );
}
