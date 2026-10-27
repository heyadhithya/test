import CertificatesGrid from "@/components/CertificatesGrid";
import CopyLinkButton from "@/components/CopyLinkButton";
import { authOptions } from "@/lib/auth";
import { ownerDashboard } from "@/lib/dashboard-data";
import { AlertTriangle,ArrowRight,Award,Calendar,ExternalLink,ShieldCheck,TrendingUp } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

// Extend the Session type to include the user.id
interface CustomSession {
    user?: {
        id?: string | null;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export default async function DashboardPage() {
    const session = (await getServerSession(authOptions)) as CustomSession;

    if (!session || !session.user || !session.user.id) {
        redirect("/login");
    }

    let data: Awaited<ReturnType<typeof ownerDashboard>>;
    try {
        data = await ownerDashboard(session.user.id);
    } catch {
        console.error("Dashboard data unavailable");
        // Redirect to an error page or show a user-friendly message
        return (
            <div className="space-y-8 max-w-5xl text-red-700">
                <h1 className="text-2xl font-bold">Error loading dashboard</h1>
                <p>There was an issue fetching your certificates. Please try again later.</p>
            </div>
        );
    }


        const { certificates, total, issued, pending, failed, revoked, thisMonth } = data;

        const STATS = [
            { label: "Saved records", value: total, icon: Award, color: "var(--color-neon-primary)", bg: "rgba(0,229,153,0.08)" },
            { label: "Issued records created this month (UTC)", value: thisMonth, icon: Calendar, color: "#007acc", bg: "rgba(0,122,204,0.08)" },
            { label: "Issued / Active", value: issued, icon: TrendingUp, color: "#10b981", bg: "rgba(16,185,129,0.08)" },
            { label: "Revoked", value: revoked, icon: AlertTriangle, color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
            { label: "Pending", value: pending, icon: Calendar, color: "#506270", bg: "#f4f7f9" },
            { label: "Failed", value: failed, icon: AlertTriangle, color: "#b91c1c", bg: "#fef2f2" },
        ];

        return (
            <div className="space-y-8 max-w-5xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--color-neon-text)]">Certificates</h1>
                        <p className="text-sm text-[var(--color-neon-muted)] mt-1">
                            {total} saved certificate record{total !== 1 ? "s" : ""} on your account
                        </p>
                    </div>
                    <Link href="/app" className="btn-primary py-2.5 px-5 flex items-center gap-2 text-sm w-fit">
                        Generate New <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {STATS.map(s => (
                        <div key={s.label} className="metric-card flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-[var(--color-neon-muted)] uppercase tracking-wider">{s.label}</p>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                                    <s.icon className="w-4 h-4" style={{ color: s.color }} />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-[var(--color-neon-text)]">{s.value}</p>
                        </div>
                    ))}
                </div>

                <p className="text-sm text-[var(--color-neon-muted)]">Verification scan counts are unavailable: visits are not tracked. Counts above come from your saved records only.</p>

                {/* Empty state or grid */}
                {certificates.length === 0 ? (
                    <div className="glass-card flex flex-col items-center justify-center p-16 text-center" style={{ borderStyle: "dashed" }}>
                        <div className="w-16 h-16 rounded-2xl bg-[var(--color-neon-primary)]/08 border border-[var(--color-neon-primary)]/20 flex items-center justify-center mb-5">
                            <Award className="w-8 h-8 text-[var(--color-neon-primary)] opacity-70" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--color-neon-text)] mb-2">No certificates yet</h3>
                        <p className="text-sm text-[var(--color-neon-muted)] max-w-sm mb-6">
                            Head to the generator to create your first batch from a PDF template and Excel sheet.
                        </p>
                        <Link href="/app" className="btn-primary text-sm px-6 flex items-center gap-2">
                            Generate Certificates <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Table header */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-[var(--color-neon-text)]">Recent Certificates</h2>
                            <span className="text-xs text-[var(--color-neon-muted)]">Showing {Math.min(certificates.length, 10)} records</span>
                        </div>

                        {/* Recent certificates table (top 5) */}
                        <div className="rounded-2xl border border-[var(--color-neon-border)] bg-[var(--color-neon-surface)] overflow-hidden">
                            <table className="data-table w-full">
                                <thead>
                                    <tr>
                                        <th>Recipient</th>
                                        <th className="hidden sm:table-cell">Course</th>
                                        <th className="hidden md:table-cell">Date</th>
                                        <th>Cert ID</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {certificates.slice(0, 10).map((cert) => (
                                        <tr key={cert.certificateId}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[var(--color-neon-primary)]/10 border border-[var(--color-neon-primary)]/20 flex items-center justify-center shrink-0">
                                                        <span className="text-[10px] font-bold text-[var(--color-neon-primary)]">
                                                            {cert.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <span className="font-medium text-[var(--color-neon-text)] text-sm">{cert.name}</span>
                                                </div>
                                            </td>
                                            <td className="hidden sm:table-cell text-[var(--color-neon-muted)] text-sm">{cert.course}</td>
                                            <td className="hidden md:table-cell text-[var(--color-neon-muted)] text-sm">{cert.issueDate}</td>
                                            <td>
                                                <span className="font-mono text-xs text-[var(--color-neon-primary)] bg-[var(--color-neon-primary)]/10 px-2 py-1 rounded">
                                                    {cert.certificateId}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* COPY LINK BUTTON - GSSoC 2026 Feature */}
                                                    {cert.status === "issued" && !cert.revoked && cert.pdfUrl && <CopyLinkButton certificateId={cert.certificateId} />}

                                                    {/* View PDF Button */}
                                                    {cert.status === "issued" && !cert.revoked && cert.pdfUrl && <a href={`/api/private-pdf/${encodeURIComponent(cert.certificateId)}`} target="_blank" rel="noreferrer"
                                                        className="p-1.5 text-[var(--color-neon-muted)] hover:text-[var(--color-neon-text)] hover:bg-slate-100 rounded-lg transition-colors"
                                                        title="View PDF">
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </a>}
                                                    
                                                    {/* Verify Button */}
                                                    {cert.status === "issued" && !cert.revoked && cert.pdfUrl ? <Link href={`/verify/${cert.certificateId}`} target="_blank"
                                                        className="p-1.5 text-[var(--color-neon-muted)] hover:text-[var(--color-neon-primary)] hover:bg-[var(--color-neon-primary)]/08 rounded-lg transition-colors"
                                                        title="Verify">
                                                        <ShieldCheck className="w-3.5 h-3.5" />
                                                    </Link> : <span className="text-xs">{cert.revoked ? "Revoked" : cert.status}</span>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Full grid below */}
                        <div className="pt-2">
                            <h2 className="text-sm font-semibold text-[var(--color-neon-text)] mb-4">Latest 30 Saved Records</h2>
                            <CertificatesGrid initialCerts={certificates.map(c => ({
                                certificateId: c.certificateId,
                                name: c.name,
                                course: c.course,
                                issueDate: c.issueDate,
                                pdfUrl: `/api/private-pdf/${encodeURIComponent(c.certificateId)}`,
                                revoked: c.revoked,
                                status: c.status,
                                hasPdf: Boolean(c.pdfUrl)
                            }))} />
                        </div>
                    </>
                )}
            </div>
        );

}
