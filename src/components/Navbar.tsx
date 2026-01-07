"use client";

import { motion } from "framer-motion";
import { Gamepad2, Github, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
    return (
        <div className="fixed top-6 z-50 flex w-full justify-center px-4">
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass-morphism flex h-14 w-full max-w-5xl items-center justify-between rounded-full px-6"
            >
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-transform group-hover:scale-110">
                        <Gamepad2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white transition-all group-hover:scale-105">
                        Manifest<span className="text-shimmer-purple">KotakLegend</span>
                    </span>
                </Link>

                <div className="flex items-center gap-6">
                    <div className="hidden items-center gap-6 text-sm font-medium text-white/60 md:flex">
                        <Link href="/" className="transition-colors hover:text-white">Home</Link>
                        <a href="#" className="transition-colors hover:text-white">API</a>
                    </div>

                    <div className="h-4 w-px bg-white/10 hidden md:block" />

                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com/Komikkuya-KotakLegends/"
                            target="_blank"
                            rel="noreferrer"
                            className="text-white/60 transition-colors hover:text-white"
                        >
                            <Github className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </motion.nav>
        </div>
    );
}
