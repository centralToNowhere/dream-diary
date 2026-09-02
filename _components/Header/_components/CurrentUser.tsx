import getCurrentUser from "@/features/auth/getUserProfile";
import HeaderProfile from "./HeaderProfile";

export default async function CurrentUser() {
  const profile = await getCurrentUser();

  if (!profile) {
    return null;
  }

  return (
    <HeaderProfile
      userName={profile.name}
      email={profile.email}
      avatarUrl={profile.avatarUrl ?? null}
    />
  );
}
