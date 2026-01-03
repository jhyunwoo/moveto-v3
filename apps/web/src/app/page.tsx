import DefaultLayout from "../components/default-layout";
import ProfileBadge from "../components/profile-badge";

export const experimental_ppr = true;

export default async function HomePage() {
  return (
    <DefaultLayout>
      <ProfileBadge />
      <div>Home</div>
    </DefaultLayout>
  );
}
