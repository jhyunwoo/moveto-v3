import ProfileBadge from "../../components/profile-badge";
import { ReactNode } from "react";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ProfileBadge />
      {children}
    </>
  );
}
