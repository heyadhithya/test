"use client";
import { getProviders, signIn } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [pending, setPending] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    async function submit(event: React.FormEvent) {
        event.preventDefault();
        setPending(true);
        try {
            const providers = await getProviders();
            if (providers?.email) await signIn('email', { email, redirect: false, callbackUrl: '/app' });
        }
        catch { /* Keep response independent of address eligibility and delivery status. */ }
        finally { setSubmitted(true); setPending(false); }
    }
    return <main className="min-h-screen flex items-center justify-center p-6">
        <section className="w-full max-w-md rounded-2xl border border-slate-300 bg-white p-8 text-slate-900">
            <Link href="/" className="font-semibold">Sairam Certify</Link>
            <h1 className="text-3xl font-semibold mt-8 mb-3">Sign in with email</h1>
            <p className="mb-6">Access is limited to approved institutional issuers.</p>
            <form onSubmit={submit} className="flex flex-col gap-4">
                <label htmlFor="email">Email address</label>
                <input id="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} className="border rounded-lg p-3" />
                <button disabled={pending} className="rounded-lg bg-slate-900 text-white p-3 disabled:opacity-50">{pending ? 'Requesting link…' : 'Request sign-in link'}</button>
            </form>
            {submitted && <p role="status" className="mt-5">If this address is approved and sign-in is available, a link will arrive shortly. Check your inbox and spam folder. If it does not arrive, contact your administrator.</p>}
            <p className="mt-5 text-sm">Links expire after 15 minutes and can be used once. Signing in does not automatically grant permission to issue certificates.</p>
        </section>
    </main>;
}
