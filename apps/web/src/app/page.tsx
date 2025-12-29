import SignUpButton from "./sign-up-button";

export default function HomePage() {
  return (
    <div className={"w-screen h-screen p-8 flex items-center justify-center"}>
      <h1 className={"text-4xl font-bold"}>Moveto V3</h1>
      <SignUpButton />
    </div>
  );
}
