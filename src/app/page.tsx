import App from "@/components/App";
import Scene from "@/components/Scene";
import BgVideo from "@/components/BgVideo";

// Fully static shell: live numbers come from /api/stats on the client.
export default function Home() {
  return (
    <>
      <Scene />
      <BgVideo />
      <App />
    </>
  );
}
