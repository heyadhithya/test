"use client"

import { useState, useEffect } from "react"
import { Key, Copy, Check, RefreshCw, Eye, EyeOff, Sparkles } from "lucide-react"

export default function ApiKeyPanel() {
    const [apiKey, setApiKey] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [rotating, setRotating] = useState(false)
    const [revealed, setRevealed] = useState(false)
    const [copied, setCopied] = useState(false)
    const [confirmRotate, setConfirmRotate] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function safeFetch(url: string, options?: RequestInit) {
        const res = await fetch(url, options)
        const text = await res.text()
        if (!text) throw new Error("Empty response from server")
        try {
            return { ok: res.ok, status: res.status, data: JSON.parse(text) }
        } catch {
            throw new Error(`Server error (${res.status}): ${text.slice(0, 120)}`)
        }
    }

    useEffect(() => {
        safeFetch("/api/user/api-key")
            .then(r => {
                if (!r.ok) throw new Error(r.data?.error ?? "Failed to load key")
                setApiKey(r.data.apiKey) // may be null — no key yet
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false))
    }, [])

    async function generateKey() {
        setGenerating(true)
        setError(null)
        safeFetch("/api/user/api-key", { method: "POST" })
            .then(r => { setApiKey(r.data.apiKey); setRevealed(true) })
            .catch(e => setError(e.message))
            .finally(() => setGenerating(false))
    }

    async function rotateKey() {
        if (!confirmRotate) { setConfirmRotate(true); return }
        setRotating(true)
        setConfirmRotate(false)
        setError(null)
        safeFetch("/api/user/api-key", { method: "POST" })
            .then(r => { setApiKey(r.data.apiKey); setRevealed(true) })
            .catch(e => setError(e.message))
            .finally(() => setRotating(false))
    }

    function copyKey() {
        if (!apiKey) return
        navigator.clipboard.writeText(apiKey)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const masked = apiKey ? apiKey.slice(0, 8) + "•".repeat(Math.max(0, apiKey.length - 12)) + apiKey.slice(-4) : ""

    // ── No key yet ──────────────────────────────────────
    if (!loading && !apiKey) {
        return (
            <div className="glass-card p-8 flex flex-col items-center text-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-neon-primary)]/10 border border-[var(--color-neon-primary)]/20 flex items-center justify-center">
                    <Key className="w-8 h-8 text-[var(--color-neon-primary)]" />
                </div>
                <div>
                    <h3 className="font-bold text-white text-lg mb-1">No API Key Yet</h3>
                    <p className="text-sm text-[var(--color-neon-muted)] max-w-sm">
                        Generate a secret key to start creating certificates via the Sairam Certify API from any external system.
                    </p>
                </div>

                {error && (
                    <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2 w-full">
                        ⚠️ {error}
                    </p>
                )}

                <button
                    onClick={generateKey}
                    disabled={generating}
                    className="flex items-center gap-2 btn-primary px-8 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {generating ? (
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                    ) : (
                        <Sparkles className="w-4 h-4" />
                    )}
                    {generating ? "Generating…" : "Generate API Key"}
                </button>

                <p className="text-xs text-[var(--color-neon-muted)] opacity-60">
                    You can rotate or revoke this key at any time.
                </p>
            </div>
        )
    }

    // ── Key exists ──────────────────────────────────────
    return (
        <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-neon-primary)]/10 border border-[var(--color-neon-primary)]/30 flex items-center justify-center">
                    <Key className="w-5 h-5 text-[var(--color-neon-primary)]" />
                </div>
                <div>
                    <h2 className="font-bold text-white">API Key</h2>
                    <p className="text-xs text-[var(--color-neon-muted)]">Use this key to create certificates via the Sairam Certify API</p>
                </div>
            </div>

            {error && (
                <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                    ⚠️ {error}
                </div>
            )}

            <div className="flex items-center gap-2 bg-black/40 border border-[var(--color-neon-border)] rounded-xl px-4 py-3">
                <code className="flex-1 font-mono text-sm text-[var(--color-neon-primary)] truncate min-w-0">
                    {loading ? "Loading…" : error ? "—" : (revealed ? apiKey : masked)}
                </code>
                <button onClick={() => setRevealed(v => !v)} title={revealed ? "Hide" : "Reveal"}
                    className="text-[var(--color-neon-muted)] hover:text-white transition-colors p-1 rounded">
                    {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={copyKey} title="Copy"
                    className="text-[var(--color-neon-muted)] hover:text-white transition-colors p-1 rounded">
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
            </div>

            <div className="flex items-center justify-between gap-4">
                <a href="/docs" target="_blank"
                    className="text-xs text-[var(--color-neon-primary)] hover:underline underline-offset-4">
                    View API documentation →
                </a>
                <button
                    onClick={rotateKey}
                    disabled={rotating}
                    className={`flex items-center gap-2 text-xs px-4 py-2 rounded-lg border transition-all ${confirmRotate
                            ? "border-red-400/50 text-red-400 hover:bg-red-400/10"
                            : "border-[var(--color-neon-border)] text-[var(--color-neon-muted)] hover:border-white/30 hover:text-white"
                        } disabled:opacity-50`}
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${rotating ? "animate-spin" : ""}`} />
                    {confirmRotate ? "Click again to confirm" : "Rotate Key"}
                </button>
            </div>

            <p className="text-xs text-[var(--color-neon-muted)] opacity-70">
                ⚠️ Keep this key secret. Anyone with it can generate certificates on your account.
            </p>
        </div>
    )
}
