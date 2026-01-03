import DefaultLayout from "../components/default-layout";
import ProfileBadge from "../components/profile-badge";
import FileUploader from "../components/file-uploader";

export const experimental_ppr = true;

export default async function HomePage() {
  return (
    <DefaultLayout className={"items-center justify-center"}>
      <ProfileBadge />
      <FileUploader />
    </DefaultLayout>
  );
}
