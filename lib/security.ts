export function trustedRedirect(url: string, baseUrl: string): string {
    try {
        const base = new URL(baseUrl);
        const target = new URL(url, base);
        return target.origin === base.origin && ['https:', 'http:'].includes(target.protocol) ? target.href : baseUrl;
    } catch { return baseUrl; }
}
export function isApprovedIssuer(userId: string | undefined, configuredIds: string | undefined): boolean {
    return !!userId && !!configuredIds?.split(',').map(id => id.trim()).filter(Boolean).includes(userId);
}
