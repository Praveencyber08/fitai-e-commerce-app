import { SiteShell } from "@/components/layout/site-shell"
import { ProfileClient } from "@/components/profile/profile-client"

export const metadata = { title: "My Profile — FitAI" }

export default function ProfilePage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <ProfileClient />
      </div>
    </SiteShell>
  )
}
