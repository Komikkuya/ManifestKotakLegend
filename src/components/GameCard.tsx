"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Download, ExternalLink, Users, Terminal, Loader2, ShieldCheck, Gamepad } from "lucide-react";
import { useState } from "react";
import type { SteamGameDetails } from "@/lib/steam";
import TurnstileWidget from "./TurnstileWidget";
import { ShimmerSkeleton } from "./Skeleton";
import { cn } from "@/lib/utils";

export default function GameCard({ appId, details }: { appId: string, details: SteamGameDetails }) {
    const { name, header_image, short_description, developers, publishers, price_overview } = details.data;

    const [token, setToken] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [speed, setSpeed] = useState(0);
    const [downloadedMB, setDownloadedMB] = useState(0);
    const [totalMB, setTotalMB] = useState(0);
    const [downloadType, setDownloadType] = useState<"lua" | "zip" | null>(null);

    const handleDownload = async (type: "lua" | "zip") => {
        if (!token) return;
        setIsDownloading(true);
        setDownloadType(type);
        setDownloadError(null);
        setProgress(0);
        setSpeed(0);
        setDownloadedMB(0);

        try {
            const response = await fetch(`/api/download?appid=${appId}&token=${token}&type=${type}`);

            if (response.status === 403 || response.status === 400) {
                throw new Error("Verification expired or invalid. Please re-verify and try again.");
            }

            if (!response.ok) {
                throw new Error("Content not available or server error. Try refreshing the page.");
            }

            const contentLength = response.headers.get("content-length");
            const total = contentLength ? parseInt(contentLength, 10) : 0;
            setTotalMB(total / (1024 * 1024));

            const reader = response.body?.getReader();
            if (!reader) throw new Error("Could not initialize stream");

            let receivedLength = 0;
            const chunks = [];
            const startTime = Date.now();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                chunks.push(value);
                receivedLength += value.length;

                const now = Date.now();
                const duration = (now - startTime) / 1000;
                const currentSpeed = (receivedLength * 8) / (duration * 1024 * 1024); // Mbps

                setSpeed(currentSpeed);
                setDownloadedMB(receivedLength / (1024 * 1024));
                if (total > 0) {
                    setProgress(Math.round((receivedLength / total) * 100));
                }
            }

            // Combine chunks and trigger download
            const blob = new Blob(chunks);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const contentDisposition = response.headers.get("content-disposition");
            const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
            const defaultFilename = type === "lua" ? `manifest_${appId}.lua` : `manifest_${appId}.zip`;
            a.download = filenameMatch ? filenameMatch[1] : defaultFilename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Download error:", error);
            setDownloadError(error instanceof Error ? error.message : "An unexpected error occurred");
            setToken(null);
        } finally {
            setTimeout(() => {
                setIsDownloading(false);
                setDownloadType(null);
                setProgress(0);
            }, 2000);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative w-full max-w-4xl"
        >
            {/* Decorative Outer Glow */}
            <div className="absolute -inset-0.5 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100" />

            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#0a0512]/60 backdrop-blur-3xl shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
                {/* Banner Section */}
                <div className="relative h-72 w-full overflow-hidden">
                    <motion.img
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 1.5 }}
                        src={header_image}
                        alt={name}
                        className="h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0512] via-[#0a0512]/40 to-transparent" />

                    <div className="absolute bottom-8 left-10 right-10 flex items-end justify-between">
                        <div className="space-y-3">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center gap-3"
                            >
                                <div className="rounded-full bg-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/20">
                                    Steam Application
                                </div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                                    ID: {appId}
                                </div>
                            </motion.div>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-4xl font-extrabold text-white md:text-5xl lg:text-6xl tracking-tight"
                            >
                                {name}
                            </motion.h2>
                        </div>
                    </div>

                    <div className="shimmer absolute inset-0 opacity-10" />
                </div>

                {/* Content Section */}
                <div className="p-10 pt-4">
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                        {/* Left Box: Description */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="glass rounded-3xl p-6 relative overflow-hidden group/box">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover/box:h-full transition-all duration-500" />
                                <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                                    <Terminal className="h-3 w-3 text-primary" />
                                    Technical Description
                                </h3>
                                <p className="text-sm font-medium leading-relaxed text-white/70">
                                    {short_description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="glass rounded-2xl p-4 flex items-center gap-4">
                                    <div className="rounded-xl bg-accent/10 p-2.5 text-accent">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-tighter text-white/30">Developers</p>
                                        <p className="text-xs font-bold text-white/80 line-clamp-1">{developers.join(", ")}</p>
                                    </div>
                                </div>
                                <div className="glass rounded-2xl p-4 flex items-center gap-4">
                                    <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                                        <ExternalLink className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-tighter text-white/30">Publishers</p>
                                        <p className="text-xs font-bold text-white/80 line-clamp-1">{publishers.join(", ")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Box: Actions */}
                        <div className="lg:col-span-5">
                            <div className="glass-morphism h-full rounded-3xl p-8 flex flex-col justify-between gap-8 border-white/10">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Availability</p>
                                            <p className="text-xl font-black text-white">{price_overview?.final_formatted || "Free to Play"}</p>
                                        </div>
                                        <div className="rounded-2xl bg-white/5 p-3">
                                            <ShieldCheck className="h-6 w-6 text-primary" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <AnimatePresence mode="wait">
                                            {downloadError ? (
                                                <motion.div
                                                    key="error"
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="w-full flex flex-col items-center gap-3 text-center"
                                                >
                                                    <div className="rounded-full bg-red-500/10 p-3 border border-red-500/20">
                                                        <Gamepad className="h-6 w-6 text-red-500" />
                                                    </div>
                                                    <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Download Failed</p>
                                                    <p className="text-[10px] font-medium text-white/40 leading-relaxed px-4">
                                                        {downloadError}
                                                    </p>
                                                    <button
                                                        onClick={() => setDownloadError(null)}
                                                        className="mt-2 text-[10px] font-black text-primary hover:text-accent transition-colors underline underline-offset-4"
                                                    >
                                                        GOT IT, TRY AGAIN
                                                    </button>
                                                </motion.div>
                                            ) : !token ? (
                                                <motion.div
                                                    key="captcha"
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                >
                                                    <TurnstileWidget onSuccess={setToken} onExpire={() => setToken(null)} />
                                                </motion.div>
                                            ) : isDownloading ? (
                                                <motion.div
                                                    key="progress"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="flex flex-col items-center gap-4 w-full"
                                                >
                                                    <div className="relative flex items-center justify-center h-24 w-24">
                                                        <svg className="h-full w-full transform -rotate-90">
                                                            <circle
                                                                cx="48"
                                                                cy="48"
                                                                r="44"
                                                                stroke="currentColor"
                                                                strokeWidth="8"
                                                                fill="transparent"
                                                                className="text-white/5"
                                                            />
                                                            <motion.circle
                                                                cx="48"
                                                                cy="48"
                                                                r="44"
                                                                stroke="currentColor"
                                                                strokeWidth="8"
                                                                fill="transparent"
                                                                strokeDasharray="276"
                                                                strokeDashoffset={276 - (276 * progress) / 100}
                                                                className="text-primary"
                                                                transition={{ duration: 0.5 }}
                                                            />
                                                        </svg>
                                                        <span className="absolute text-xl font-black text-white">{progress}%</span>
                                                    </div>

                                                    <div className="flex flex-col items-center gap-1">
                                                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] animate-pulse">
                                                            Streaming {downloadType === "lua" ? "Lua Script" : "Manifest Zip"}
                                                        </p>
                                                        <p className="text-xs font-medium text-white/40">
                                                            {downloadedMB.toFixed(2)} MB {totalMB > 0 && `/ ${totalMB.toFixed(2)} MB`}
                                                        </p>
                                                        <p className="text-[10px] font-mono text-white/20">Speed: {speed.toFixed(2)} Mbps</p>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="verified"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex flex-col items-center gap-4 py-8"
                                                >
                                                    <div className="rounded-full bg-green-500/10 p-4 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
                                                        <ShieldCheck className="h-8 w-8 text-green-500" />
                                                    </div>
                                                    <p className="text-[10px] font-black text-green-500 uppercase tracking-[0.3em]">Identity Verified</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleDownload("lua")}
                                            disabled={!token || isDownloading}
                                            className={cn(
                                                "group/btn relative h-14 overflow-hidden rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest text-white border border-white/10 transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-20",
                                                isDownloading && downloadType === "lua" && "bg-primary border-primary shadow-[0_10px_30px_-5px_rgba(147,51,234,0.4)]"
                                            )}
                                        >
                                            <div className="relative z-10 flex items-center justify-center gap-2">
                                                {isDownloading && downloadType === "lua" ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Terminal className="h-4 w-4 text-primary" />
                                                )}
                                                {isDownloading && downloadType === "lua" ? "Syncing..." : "Lua only"}
                                            </div>
                                            <div className="shimmer absolute inset-0 opacity-10" />
                                        </button>

                                        <button
                                            onClick={() => handleDownload("zip")}
                                            disabled={!token || isDownloading}
                                            className={cn(
                                                "group/btn relative h-14 overflow-hidden rounded-xl bg-primary text-[10px] font-black uppercase tracking-widest text-white shadow-[0_10px_30px_-5px_rgba(147,51,234,0.3)] transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-20",
                                                isDownloading && downloadType === "zip" && "shadow-[0_15px_40px_-10px_rgba(147,51,234,0.6)]"
                                            )}
                                        >
                                            <div className="relative z-10 flex items-center justify-center gap-2">
                                                {isDownloading && downloadType === "zip" ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Download className="h-4 w-4" />
                                                )}
                                                {isDownloading && downloadType === "zip" ? "Streaming..." : "Manifest"}
                                            </div>
                                            <div className="shimmer absolute inset-0 opacity-20" />
                                        </button>
                                    </div>
                                    <p className="text-center text-[10px] font-medium text-white/30">
                                        {isDownloading ? "Capturing decentralized stream nodes" : "Select your preferred delivery protocol"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
