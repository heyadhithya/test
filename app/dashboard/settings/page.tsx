import Link from "next/link";
import { Settings, Bell, Globe, Shield } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-8 max-w-xl">
            <div>
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-sm text-[var(--color-neon-muted)] mt-1">Manage your Sairam Certify account preferences.</p>
            </div>

            {/* Settings groups */}
            {[
                {
                    icon: <Globe className="w-4 h-4" />,
                    title: "API & Integrations",
                    desc: "Manage your API key and external integrations.",
                    action: { label: "Go to API Key →", href: "/dashboard/api-key" },
                },
                {
                    icon: <Shield className="w-4 h-4" />,
                    title: "Security",
                    desc: "Your account uses " + "secure authentication. Password resets are handled via email.",
                    action: null,
                },
                {
                    icon: <Bell className="w-4 h-4" />,
                    title: "Notifications",
                    desc: "Email notification preferences — coming soon.",
                    action: null,
                },
                {
                    icon: <Settings className="w-4 h-4" />,
                    title: "Account",
                    desc: "Delete account or export your data — coming soon.",
                    action: null,
                },
            ].map(item => (
                <div key={item.title} className="glass-card p-5 flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-[var(--color-neon-surface)] border border-[var(--color-neon-border)] flex items-center justify-center text-[var(--color-neon-primary)] shrink-0">
                        {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white mb-0.5">{item.title}</p>
                        <p className="text-sm text-[var(--color-neon-muted)] leading-relaxed">{item.desc}</p>
                        {item.action && (
                            <Link href={item.action.href} className="text-xs text-[var(--color-neon-primary)] hover:underline mt-2 inline-block">
                                {item.action.label}
                            </Link>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
