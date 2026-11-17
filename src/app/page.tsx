import App from "@/components/App";
import Scene from "@/components/Scene";

// Fully static shell: live numbers come from /api/stats on the client.
export default function Home() {
  return (
    <>
      <Scene />
      <App />
    </>
  );
}
