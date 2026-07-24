import { createFileRoute, useParams, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import guitarAsset from "@/assets/guitar.png.asset.json";
import loveAndPeace from "@/assets/love_and_peace.wav.asset.json";
import lovelyGuitar from "@/assets/lovely_guitar.wav.asset.json";
import burnGif from "@/assets/burn.gif.asset.json";
import burnMp3 from "@/assets/burn.mp3.asset.json";
import burnDiary from "@/assets/burn_the_diary.wav.asset.json";
import bombFalling from "@/assets/bomb_falling.mp3.asset.json";
import battlefield from "@/assets/battlefield.mp3.asset.json";
import isThatAll from "@/assets/is_that_all_we_re_worth.mp3.asset.json";

export const Route = createFileRoute("/reveal/$slug")({
  ssr: false,
  head: () => ({ meta: [{ title: "…" }, { name: "robots", content: "noindex" }] }),
  component: RevealPage,
});

const TEXTS: Record<string, string> = {
  "onpu-segawa": "what is wrong with her.",
  "hazuki-fujiwara": "she's not innocent.",
  hana: "she saved them.",
  "wrong-series": "You're thinking of the wrong series.",
  lol: "what's that going to do lol?",
};

function BlackText({ text }: { text: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6 text-center font-sans text-2xl font-medium text-white sm:text-4xl">
      {text}
    </div>
  );
}

function useHome() {
  const navigate = useNavigate();
  return () => navigate({ to: "/" });
}

function Aiko() {
  const goHome = useHome();
  const [playing, setPlaying] = useState(false);
  function onClick() {
    if (playing) return;
    setPlaying(true);
    const a = new Audio(isThatAll.url);
    a.onended = goHome;
    a.play().catch(goHome);
  }
  return (
    <div
      onClick={onClick}
      className="flex min-h-screen cursor-pointer items-center justify-center bg-black px-6 text-center font-sans text-xl italic text-white sm:text-3xl"
    >
      "If that really happens, we won't be able to use the Recipe Diary anymore!"
    </div>
  );
}

function Momo() {
  const goHome = useHome();
  const [scale, setScale] = useState(1);
  const [gray, setGray] = useState(false);
  function onClick() {
    const rare = Math.random() < 0.25;
    const url = rare ? lovelyGuitar.url : loveAndPeace.url;
    if (rare) setGray(true);
    setScale((s) => s * 1.01);
    const a = new Audio(url);
    if (rare) a.onended = goHome;
    a.play().catch(() => {});
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <img
        src={guitarAsset.url}
        alt=""
        onClick={onClick}
        style={{
          transform: `scale(${scale})`,
          filter: gray ? "grayscale(1)" : "none",
          transition: "transform 120ms, filter 400ms",
          imageRendering: "pixelated",
          maxWidth: "40vw",
          cursor: "pointer",
        }}
      />
    </div>
  );
}

function Recipe() {
  const goHome = useHome();
  const bgAudio = useRef<HTMLAudioElement | null>(null);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    const a = new Audio(burnMp3.url);
    a.loop = true;
    a.volume = 0.7;
    bgAudio.current = a;
    a.play().catch(() => {});
    return () => {
      a.pause();
      a.src = "";
    };
  }, []);

  function onClick() {
    if (ending) return;
    setEnding(true);
    bgAudio.current?.pause();
    const a = new Audio(burnDiary.url);
    a.onended = goHome;
    a.play().catch(goHome);
  }

  return (
    <div
      onClick={onClick}
      className="min-h-screen cursor-pointer bg-black bg-cover bg-center"
      style={{ backgroundImage: `url("${burnGif.url}")` }}
    />
  );
}

function War() {
  const goHome = useHome();
  useEffect(() => {
    const a = new Audio(bombFalling.url);
    a.onended = goHome;
    a.play().catch(goHome);
    return () => {
      a.pause();
      a.src = "";
    };
  }, [goHome]);
  return <div className="min-h-screen bg-black" />;
}

function Witches() {
  useEffect(() => {
    const a = new Audio(battlefield.url);
    a.loop = true;
    a.play().catch(() => {});
    return () => {
      a.pause();
      a.src = "";
    };
  }, []);
  return <div className="min-h-screen bg-black" />;
}

function RevealPage() {
  const { slug } = useParams({ from: "/reveal/$slug" });

  if (slug in TEXTS) return <BlackText text={TEXTS[slug]} />;
  if (slug === "aiko") return <Aiko />;
  if (slug === "momo") return <Momo />;
  if (slug === "recipe") return <Recipe />;
  if (slug === "war") return <War />;
  if (slug === "witches") return <Witches />;

  return <BlackText text="…" />;
}
