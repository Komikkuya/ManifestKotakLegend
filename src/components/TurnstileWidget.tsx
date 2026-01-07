import { Turnstile } from "@marsidev/react-turnstile";
import { motion } from "framer-motion";
import Script from "next/script";

interface TurnstileWidgetProps {
    onSuccess: (token: string) => void;
    onError?: () => void;
    onExpire?: () => void;
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

export default function TurnstileWidget({ onSuccess, onError, onExpire }: TurnstileWidgetProps) {
    return (
        <>
            <Script
                src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                strategy="beforeInteractive"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-2"
            >
                <div className="flex items-center gap-3">
                    <div className="h-px w-6 bg-primary/30" />
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Security Verification</p>
                    <div className="h-px w-6 bg-primary/30" />
                </div>
                <div className="rounded-xl overflow-hidden ring-1 ring-white/10 shadow-2xl min-h-[65px] flex items-center justify-center bg-white/[0.02]">
                    <Turnstile
                        siteKey={SITE_KEY}
                        onSuccess={onSuccess}
                        onError={onError}
                        onExpire={onExpire}
                        options={{
                            theme: "dark",
                            appearance: "always",
                        }}
                    />
                </div>
            </motion.div>
        </>
    );
}
