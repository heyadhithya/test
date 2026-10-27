import { provisionOwner } from '@/lib/owner-auth';
export async function POST(request: Request) {
    const denied = () => Response.json({error: 'Setup unavailable or request invalid.'}, {status: 400, headers: {'Cache-Control': 'no-store'}});
    let origin: string;
    try { const url = new URL(process.env.NEXTAUTH_URL || ''); if (url.protocol !== 'https:') return denied(); origin = url.origin; } catch { return denied(); }
    if (request.headers.get('origin') !== origin || request.headers.get('content-type')?.split(';')[0] !== 'application/json') return denied();
    if (Number(request.headers.get('content-length') || 0) > 2048) return denied();
    const reader = request.body?.getReader();
    if (!reader) return denied();
    const chunks: Uint8Array[] = []; let length = 0;
    try {
        while (true) {
            const {done, value} = await reader.read(); if (done) break;
            length += value.byteLength; if (length > 2048) { await reader.cancel(); return denied(); }
            chunks.push(value);
        }
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (!await provisionOwner(body.code, body.password)) return denied();
        return Response.json({success: true}, {headers: {'Cache-Control': 'no-store'}});
    } catch { return denied(); }
}
