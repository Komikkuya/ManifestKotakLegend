"use client";

import { useEffect, useState, useRef } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Loader2, Sparkles } from "lucide-react";

interface GatingCaptchaProps {
    onStatusChange?: (isGated: boolean) => void;
}

export default function GatingCaptcha({ onStatusChange }: GatingCaptchaProps) {
    const [shouldShow, setShouldShow] = useState(false);
    const [isSolved, setIsSolved] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const hcaptchaRef = useRef<HCaptcha>(null);

    const SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "";

    useEffect(() => {
        // 1. Check if we are currently "under challenge" from a previous load
        const activeChallenge = sessionStorage.getItem("hcaptcha_active_challenge") === "true";

        if (activeChallenge) {
            setShouldShow(true);
            onStatusChange?.(true);
            return;
        }

        // 2. Random chance logic (10% chance to show)
        const random = Math.random();
        if (random < 0.1) {
            setShouldShow(true);
            sessionStorage.setItem("hcaptcha_active_challenge", "true");
            onStatusChange?.(true);
        } else {
            onStatusChange?.(false);
        }
    }, [onStatusChange]);

    const onVerify = (token: string) => {
        setIsVerifying(true);
        // Simulate verification delay
        setTimeout(() => {
            sessionStorage.removeItem("hcaptcha_active_challenge");
            setIsSolved(true);
            setIsVerifying(false);
            onStatusChange?.(false);
        }, 1500);
    };

    if (!shouldShow || isSolved) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-2xl">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass-morphism relative w-full max-w-md overflow-hidden rounded-[2.5rem] p-10 text-center border-white/10 shadow-[0_0_100px_rgba(147,51,234,0.2)]"
            >
                {/* Background Sparkles */}
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 opacity-20 blur-2xl">
                    <div className="h-64 w-64 rounded-full bg-primary/30" />
                </div>

                <div className="relative z-10 space-y-8">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 shadow-lg shadow-primary/10">
                        <ShieldAlert className="h-10 w-10 text-primary" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-black tracking-tighter text-white">
                            Security <span className="text-shimmer-purple">Protocol</span>
                        </h2>
                        <p className="text-sm font-medium text-white/40 leading-relaxed px-4">
                            To ensure high-performance manifest streaming, please complete this quick human verification.
                        </p>
                    </div>

                    <div className="flex justify-center min-h-[78px]">
                        <AnimatePresence mode="wait">
                            {isVerifying ? (
                                <motion.div
                                    key="verifying"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center gap-3"
                                >
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary animate-pulse">
                                        Validating Identity...
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="captcha"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <HCaptcha
                                        sitekey={SITE_KEY}
                                        onVerify={onVerify}
                                        ref={hcaptchaRef}
                                        theme="dark"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-4 opacity-30">
                        <Sparkles className="h-3 w-3 text-accent" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                            KotakLegend Security System
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
