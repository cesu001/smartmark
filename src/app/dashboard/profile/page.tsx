import { requireUser } from "@/lib/auth-utils";
import { getUserProfile, getUserStats } from "@/lib/db/users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import DeleteAccountButton from "@/components/profile/DeleteAccountButton";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import EditableName from "@/components/profile/EditableName";
import { CalendarDays, FileText, FolderOpen, Heart, Tag } from "lucide-react";

function getInitials(name?: string | null, email?: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return (email?.[0] ?? "U").toUpperCase();
}

export default async function ProfilePage() {
  const sessionUser = await requireUser();
  const [profile, stats] = await Promise.all([
    getUserProfile(sessionUser.id),
    getUserStats(sessionUser.id),
  ]);

  if (!profile) return null;

  const isEmailUser = Boolean(profile.password);
  const initials = getInitials(profile.name, profile.email);
  const memberSince = profile.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const statItems = [
    { label: "Notes", value: stats.notes, icon: FileText },
    { label: "Collections", value: stats.collections, icon: FolderOpen },
    { label: "Tags", value: stats.tags, icon: Tag },
    { label: "Favorites", value: stats.favorites, icon: Heart },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto py-4 px-px">
      {/* Profile info */}
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center gap-8">
            <Avatar className="h-20 w-20 text-2xl">
              <AvatarImage src={profile.image ?? undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1 min-w-0">
              <EditableName name={profile.name} />
              <p className="text-muted-foreground truncate">{profile.email}</p>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <CalendarDays className="h-4 w-4 shrink-0" />
                <span>Member since {memberSince}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader className="px-8 pt-6 pb-0">
          <CardTitle className="text-xl font-bold">Usage Stats</CardTitle>
        </CardHeader>
        <CardContent className="px-8 pb-6 pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {statItems.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/50"
              >
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{value}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader className="px-8 pt-6 pb-0">
          <CardTitle className="text-xl font-bold">Account</CardTitle>
        </CardHeader>
        <CardContent className="px-8 pb-6 pt-4 flex flex-col gap-6">
          {isEmailUser && (
            <div className="flex flex-col gap-3">
              <h3 className="font-medium">Security</h3>
              <p className="text-sm text-muted-foreground">
                Update your password to keep your account secure.
              </p>
              <ChangePasswordForm />
            </div>
          )}
          {isEmailUser && <Separator />}
          <div className="flex flex-col gap-3">
            <h3 className="font-medium text-destructive">Danger Zone</h3>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
            <DeleteAccountButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
