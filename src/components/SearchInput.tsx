"use client";

import { Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SearchInputProps {
    onSearch: (appId: string) => void;
    isLoading?: boolean;
}

export default function SearchInput({ onSearch, isLoading }: SearchInputProps) {
    const [appId, setAppId] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (appId.trim() && !isLoading) {
            onSearch(appId.trim());
        }
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto px-4">
            <motion.form
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                onSubmit={handleSubmit}
                className="group relative"
            >
                {/* Animated Background Glow */}
                <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-primary via-accent to-secondary opacity-30 blur-lg transition duration-1000 group-hover:opacity-60 group-hover:duration-200" />

                <div className="relative flex items-center rounded-2xl border border-white/10 bg-surface/80 backdrop-blur-xl p-1.5 shadow-2xl transition-all duration-300 group-focus-within:border-primary/50 group-focus-within:ring-4 group-focus-within:ring-primary/10">
                    <div className="flex pl-4 pr-3 text-white/30 transition-colors group-focus-within:text-primary">
                        <Search className="h-5 w-5" />
                    </div>
                    <input
                        type="text"
                        value={appId}
                        onChange={(e) => setAppId(e.target.value)}
                        placeholder="Search Steam App ID (e.g., 1237320)..."
                        className="h-12 w-full bg-transparent pr-4 text-base text-white placeholder:text-white/20 focus:outline-none"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !appId.trim()}
                        className={cn(
                            "group/btn relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-8 py-3 text-sm font-black uppercase tracking-widest text-white shadow-[0_10px_30px_-10px_rgba(147,51,234,0.5)] transition-all hover:scale-[1.02] hover:shadow-[0_15px_40px_-10px_rgba(147,51,234,0.6)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
                            isLoading && "cursor-not-allowed"
                        )}
                    >
                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="flex items-center gap-2"
                                >
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Fetching...</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="text"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="flex items-center gap-2"
                                >
                                    <span>Fetch details</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Shimmer Effect */}
                        <div className="shimmer absolute inset-0 opacity-40" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                    </button>
                </div>
            </motion.form>

            {/* Quick Tips */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                className="mt-4 flex justify-center gap-4 text-[10px] font-medium uppercase tracking-[0.2em] text-white"
            >
                <span>Secure</span>
                <span className="h-1 w-1 rounded-full bg-white/20 my-auto" />
                <span>Authenticated</span>
                <span className="h-1 w-1 rounded-full bg-white/20 my-auto" />
                <span>Fast</span>
            </motion.div>
        </div>
    );
}
