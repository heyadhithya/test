"use client"

import { CheckCircle, ExternalLink } from "lucide-react"

interface Props {
    cert: {
        certificateId: string
        name: string
        course: string
        issueDate: string
        pdfUrl: string
        revoked: boolean
        status?: string
        hasPdf?: boolean
    }
}

export default function CertificateCard({ cert }: Props) {
    const available = cert.status === "issued" && !cert.revoked && cert.hasPdf === true

    return (
        <div className="glass-card flex flex-col p-5 hover:border-[var(--color-neon-primary)]/40 transition-colors group relative">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 pr-2">
                    <h3 className="font-semibold text-[var(--color-neon-text)] truncate">{cert.name}</h3>
                    <p className="text-xs text-[var(--color-neon-muted)] truncate mt-0.5">{cert.course}</p>
                </div>
                {cert.revoked ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-400/10 text-red-700 border border-red-400/20 shrink-0">Revoked</span>
                ) : available ? (
                    <CheckCircle className="w-4 h-4 text-[var(--color-neon-primary)] shrink-0 mt-0.5" />
                ) : <span className="text-xs text-slate-700">{cert.status || "Unavailable"}</span>}
            </div>

            {/* ID */}
            <div className="bg-slate-50 px-3 py-2 rounded-lg mb-2 font-mono text-xs text-[var(--color-neon-primary)] truncate">
                {cert.certificateId}
            </div>
            <p className="text-xs text-[var(--color-neon-muted)] mb-4">Certificate date: {cert.issueDate}</p>

            {/* Actions */}
            <div className="flex gap-2 mt-auto">
                {available && <><a href={`/api/private-pdf/${encodeURIComponent(cert.certificateId)}`} target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 flex-1 text-xs py-2 rounded-lg border border-[var(--color-neon-border)] hover:border-[var(--color-neon-primary)] text-[var(--color-neon-muted)] hover:text-[var(--color-neon-text)] transition-colors">
                    <ExternalLink className="w-3 h-3" /> PDF
                </a>
                <a href={`/verify/${encodeURIComponent(cert.certificateId)}`} target="_blank" rel="noreferrer"
                    className="flex-1 text-center text-xs py-2 rounded-lg bg-[var(--color-neon-primary)] text-white font-semibold hover:brightness-110 transition-all">
                    Verify
                </a></>}

            </div>
        </div>
    )
}
