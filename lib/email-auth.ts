import type { EmailConfig } from 'next-auth/providers/email';

export function normalizeEmail(value: string): string {
    const email = value.trim().toLowerCase();
    if (email.length > 254 || !/^[a-z0-9.!#$%&'*+\-/=?^_`{|}~]+@[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/.test(email)) throw new Error('Invalid email');
    return email;
}
export function allowedEmail(value: string | null | undefined): boolean {
    try {
        const allowed = (process.env.AUTH_EMAIL_ALLOWLIST || '').split(',').filter(Boolean);
        return allowed.length > 0 && allowed.length <= 100 && allowed.map(normalizeEmail).includes(normalizeEmail(value || ''));
    } catch { return false; }
}
export function authReady(): boolean {
    try {
        const origin = new URL(process.env.NEXTAUTH_URL || '');
        return process.env.AUTH_ENABLED === 'true' && origin.protocol === 'https:' && origin.pathname === '/' && !origin.username && !origin.password && !origin.search && !origin.hash &&
            !!process.env.DATABASE_URL && (process.env.NEXTAUTH_SECRET?.length || 0) >= 32 && !!process.env.AUTH_RESEND_API_KEY && !!process.env.AUTH_EMAIL_FROM &&
            (process.env.AUTH_EMAIL_ALLOWLIST || '').split(',').some(value => allowedEmail(value));
    } catch { return false; }
}
// Bounded per-process defense; production also requires distributed provider/platform limits.
export function createSendLimiter() {
    const attempts = new Map<string, number[]>();
    return (email: string, now = Date.now()): boolean => {
        for (const [key, values] of attempts) {
            const live = values.filter(time => now - time < 3600000);
            if (live.length) attempts.set(key, live); else attempts.delete(key);
        }
        const times = attempts.get(email) || [];
        if (attempts.size >= 100 && !attempts.has(email)) return false;
        if (times.length >= 3 || (times.length > 0 && now - times[times.length - 1] < 60000)) return false;
        attempts.set(email, [...times, now]);
        return true;
    };
}
const canSend = createSendLimiter();
export async function sendSignInLink(identifier: string, url: string, send = fetch): Promise<void> {
    const email = normalizeEmail(identifier);
    // Same public request response for unlisted or throttled addresses; never grant a session here.
    if (!allowedEmail(email)) return;
    if (!authReady()) throw new Error('Sign-in unavailable');
    const link = new URL(url);
    if (link.origin !== new URL(process.env.NEXTAUTH_URL!).origin || link.pathname !== '/api/auth/callback/email' || link.username || link.password) throw new Error('Sign-in unavailable');
    if (!canSend(email)) return;
    try {
        const response = await send('https://api.resend.com/emails', {
            method: 'POST', headers: { Authorization: `Bearer ${process.env.AUTH_RESEND_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: process.env.AUTH_EMAIL_FROM, to: [email], subject: 'Sign in to Sairam Certify', text: `Use this single-use link to sign in. It expires in 15 minutes.\n\n${link.href}\n\nIf you did not request this, ignore this email.` }),
            signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) throw new Error('Delivery failed');
        const result = await response.json();
        if (!result || typeof result.id !== 'string' || !result.id) throw new Error('Delivery failed');
    } catch { throw new Error('Sign-in unavailable'); }
}
// Custom HTTP transport avoids importing the upstream SMTP/Nodemailer runtime.
export const emailProvider: EmailConfig = {
    id: 'email', type: 'email', name: 'Email', server: {}, from: process.env.AUTH_EMAIL_FROM || '', maxAge: 15 * 60, options: {},
    normalizeIdentifier: normalizeEmail,
    sendVerificationRequest: ({ identifier, url }) => sendSignInLink(identifier, url),
};
