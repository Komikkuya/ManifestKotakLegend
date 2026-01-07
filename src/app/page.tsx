"use client";

import { useState, useTransition } from "react";
import SearchInput from "@/components/SearchInput";
import GameCard from "@/components/GameCard";
import { ShimmerSkeleton } from "@/components/Skeleton";
import { fetchGameAction } from "./actions";
import { SteamGameDetails } from "@/lib/steam";
import { motion, AnimatePresence } from "framer-motion";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import LightRays from "@/components/LightRays";
import GatingCaptcha from "@/components/GatingCaptcha";

export default function Page() {
  const [appId, setAppId] = useState<string | null>(null);
  const [gameData, setGameData] = useState<SteamGameDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isGated, setIsGated] = useState(false);

  const handleSearch = (id: string) => {
    setAppId(id);
    setError(null);
    setGameData(null);

    startTransition(async () => {
      const result = await fetchGameAction(id);
      if (result.success && result.data) {
        setGameData(result.data);
      } else {
        setError(result.error || "Failed to fetch game details");
      }
    });
  };

  return (
    <div className="flex w-full flex-col items-center">
      <GatingCaptcha onStatusChange={setIsGated} />

      {!isGated && (
        <>
          {/* Hero Section */}
          <section className="container relative flex flex-col items-center px-4 pt-32 pb-16 md:pt-48 md:pb-24 lg:pt-60">
            {/* Background Gradients & Light Rays */}
            <div className="absolute top-0 -z-10 h-[700px] w-full max-w-6xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(147,51,234,0.15),transparent_70%)]" />
              <LightRays
                raysOrigin="top-center"
                raysColor="#c084fc"
                raysSpeed={1.2}
                lightSpread={0.7}
                rayLength={1.5}
                followMouse={true}
                mouseInfluence={0.1}
                noiseAmount={0.1}
                distortion={0.05}
                className="opacity-90"
              />
            </div>

            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-primary"
              >
                Powered by <span className="text-shimmer-purple">ManifestKotakLegend</span> Engine
              </motion.div>

              <h1 className="mb-6 max-w-5xl text-5xl font-black tracking-tight text-white md:text-7xl lg:text-8xl">
                Manifest <span className="relative inline-block">
                  <span className="relative z-10 text-shimmer-purple">KotakLegend</span>
                  <div className="absolute -bottom-2 left-0 h-2 w-full bg-primary/20 blur-xl" />
                </span>
              </h1>

              <p className="mb-12 max-w-2xl text-lg font-medium text-white/40 md:text-xl lg:text-2xl leading-relaxed">
                Reliable Steam manifest downloader. Fetch and download game manifests instantly.
              </p>

              <SearchInput onSearch={handleSearch} isLoading={isPending} />
            </div>
          </section>

          {/* Main Content Area */}
          <section className="container flex w-full flex-col items-center px-4 pb-32">
            <AnimatePresence mode="wait">
              {isPending && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full max-w-4xl"
                >
                  <div className="glass overflow-hidden rounded-[2.5rem] border-white/5 bg-surface/20">
                    <div className="h-72 w-full shimmer" />
                    <div className="p-10 space-y-6">
                      <div className="flex justify-between">
                        <ShimmerSkeleton className="h-12 w-64 rounded-xl" />
                        <ShimmerSkeleton className="h-10 w-32 rounded-xl" />
                      </div>
                      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        <div className="space-y-4">
                          <ShimmerSkeleton className="h-4 w-full" />
                          <ShimmerSkeleton className="h-4 w-[80%]" />
                          <ShimmerSkeleton className="h-4 w-[90%]" />
                        </div>
                        <ShimmerSkeleton className="h-40 w-full rounded-3xl" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {!isPending && gameData && appId && (
                <div key="result" className="w-full max-w-4xl">
                  <GameCard appId={appId} details={gameData} />
                </div>
              )}

              {!isPending && error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-xl rounded-[2rem] border border-red-500/20 bg-red-500/5 p-8 text-center"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 text-red-500">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-white">Detection Failed</h3>
                  <p className="text-sm font-medium text-white/40 leading-relaxed">{error}</p>
                </motion.div>
              )}

            </AnimatePresence>
          </section>

        </>
      )}
    </div>
  );
}
