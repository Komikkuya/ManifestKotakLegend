import { NextRequest, NextResponse } from 'next/server';

const AUTH_CODE = process.env.AUTH_CODE;
const KEYS = process.env.KEY?.split(',') || [];

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ key: string; type: string }> }
) {
    const { key, type } = await params;
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appid');

    // 1. Validate Private Key
    if (!KEYS.map(k => k.trim()).includes(key)) {
        return NextResponse.json({ error: "Unauthorized: Invalid Private Key" }, { status: 401 });
    }

    // 2. Validate App ID
    if (!appId) {
        return NextResponse.json({ error: "Mission App ID: ?appid=... required" }, { status: 400 });
    }

    // 3. Determine Upstream Target
    // Normalizing type to lua or manifest (mapped to zip)
    const isLua = type.toLowerCase() === 'lua';
    const upstreamUrl = isLua
        ? `https://generator.ryuu.lol/resellerlua/${appId}?auth_code=${AUTH_CODE}`
        : `https://generator.ryuu.lol/secure_download?appid=${appId}&auth_code=${AUTH_CODE}`;

    try {
        const response = await fetch(upstreamUrl);

        if (!response.ok) {
            return NextResponse.json(
                { error: `Upstream error (${response.status}): ${response.statusText}` },
                { status: response.status }
            );
        }

        // 4. Stream response to client
        const headers = new Headers();
        const contentType = response.headers.get("content-type");
        const contentDisposition = response.headers.get("content-disposition");

        if (contentType) headers.set("Content-Type", contentType);
        if (contentDisposition) {
            headers.set("Content-Disposition", contentDisposition);
        } else {
            // Fallback filename if upstream doesn't provide one
            const ext = isLua ? 'lua' : 'zip';
            headers.set("Content-Disposition", `attachment; filename="manifest_${appId}.${ext}"`);
        }

        return new Response(response.body, {
            status: 200,
            headers: headers
        });

    } catch (error) {
        console.error("V2 Proxy Error:", error);
        return NextResponse.json({ error: "Internal Server Error in V2 Proxy" }, { status: 500 });
    }
}
