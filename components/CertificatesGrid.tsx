"use client"

import CertificateCard from "@/components/CertificateCard"

interface Cert {
    certificateId: string
    name: string
    course: string
    issueDate: string
    pdfUrl: string
    revoked: boolean
    status?: string
    hasPdf?: boolean
}

export default function CertificatesGrid({ initialCerts }: { initialCerts: Cert[] }) {
    const certs = initialCerts

    if (certs.length === 0) {
        return (
            <p className="text-sm text-[var(--color-neon-muted)] text-center py-10">
                All certificates have been deleted.
            </p>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {certs.map(cert => (
                <CertificateCard key={cert.certificateId} cert={cert} />
            ))}
        </div>
    )
}
