import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    let session = null;
    try {
        session = await getServerSession(authOptions);
    } catch {
        /* ignore decryption errors */
    }

    if (!session?.user) redirect("/login");

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-neon-bg)]">
            <DashboardSidebar user={{
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
            }} />
            <main className="flex-1 min-w-0 overflow-y-auto p-6 pt-20 md:p-10">
                {children}
            </main>
        </div>
    );
}
