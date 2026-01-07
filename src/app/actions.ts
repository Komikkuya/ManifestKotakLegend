"use server";

import { getSteamGameDetails, SteamGameDetails } from "@/lib/steam";

export async function fetchGameAction(appId: string): Promise<{ success: boolean; data?: SteamGameDetails; error?: string }> {
    if (!appId || !/^\d+$/.test(appId)) {
        return { success: false, error: "Invalid App ID" };
    }

    try {
        const details = await getSteamGameDetails(appId);
        if (!details) {
            return { success: false, error: "Game not found" };
        }
        return { success: true, data: details };
    } catch (error) {
        console.error("Server Action fetch error:", error);
        return { success: false, error: "Internal server error" };
    }
}
