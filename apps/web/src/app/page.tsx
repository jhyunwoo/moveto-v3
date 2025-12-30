import { getStaticApiClient } from "../lib/getStaticApiClient";

export default async function HomePage() {
  const client = await getStaticApiClient();

  const res = await client.health.$get();

  if (!res.ok) {
    return <div>Error loading data</div>;
  }

  const data = await res.json();
  console.log(data);

  return (
    <div
      className={
        "w-screen h-screen p-8 flex items-center justify-center flex-col gap-2"
      }
    >
      <h1 className={"text-4xl font-bold"}>Moveto V3</h1>
      <div>{data.status}</div>
      <div>{data.timestamp}</div>
    </div>
  );
}
