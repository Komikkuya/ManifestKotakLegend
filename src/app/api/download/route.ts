import { NextRequest, NextResponse } from "next/server";

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const AUTH_CODE = process.env.AUTH_CODE;

async function verifyTurnstile(token: string) {
    const response = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `secret=${TURNSTILE_SECRET_KEY}&response=${token}`,
        }
    );

    const data = await response.json();
    return data.success;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const appId = searchParams.get("appid");
    const token = searchParams.get("token");
    const type = searchParams.get("type") || "zip"; // Default to zip

    if (!appId || !token) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Verify Turnstile Token
    const isHuman = await verifyTurnstile(token);
    if (!isHuman) {
        return NextResponse.json({ error: "Invalid anti-bot verification" }, { status: 403 });
    }

    // Dynamic Upstream URL selection
    const upstreamUrl = type === "lua"
        ? `https://generator.ryuu.lol/resellerlua/${appId}?auth_code=${AUTH_CODE}`
        : `https://generator.ryuu.lol/secure_download?appid=${appId}&auth_code=${AUTH_CODE}`;

    try {
        const upstreamResponse = await fetch(upstreamUrl);

        if (!upstreamResponse.ok) {
            return NextResponse.json({ error: "Failed to fetch from upstream" }, { status: 502 });
        }

        // Stream the response back to client
        const headers = new Headers();
        const contentType = upstreamResponse.headers.get("content-type") || (type === "lua" ? "text/x-lua" : "application/zip");
        const defaultFilename = type === "lua" ? `manifest_${appId}.lua` : `manifest_${appId}.zip`;
        const contentDisposition = upstreamResponse.headers.get("content-disposition") || `attachment; filename="${defaultFilename}"`;
        const contentLength = upstreamResponse.headers.get("content-length");

        headers.set("Content-Type", contentType);
        headers.set("Content-Disposition", contentDisposition);
        if (contentLength) {
            headers.set("Content-Length", contentLength);
        }

        return new NextResponse(upstreamResponse.body, {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error("Download proxy error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
