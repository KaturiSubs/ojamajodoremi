import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import guitarAsset from "@/assets/guitar.png.asset.json";
import loveAndPeace from "@/assets/love_and_peace.wav.asset.json";
import lovelyGuitar from "@/assets/lovely_guitar.wav.asset.json";
import burnGif from "@/assets/burn.gif.asset.json";
import burnMp3 from "@/assets/burn.mp3.asset.json";
import burnDiary from "@/assets/burn_the_diary.wav.asset.json";
import bombFalling from "@/assets/bomb_falling.mp3.asset.json";
import battlefield from "@/assets/battlefield.mp3.asset.json";
import isThatAll from "@/assets/is_that_all_we_re_worth.mp3.asset.json";
import fairyVideo from "@/assets/i_ll_be_giving_back_all_my_anger_ive_built_up.mp4.asset.json";
import { SFX, ghAsset, gh } from "@/lib/asset-urls";
import { playSecret, stopAllSecrets, stopSecret } from "@/lib/audio-manager";
import { Gif } from "@/components/countdown/Gif";

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
  roxanne: "...how does she have one?",
  help: "If it doesn't work the first time, try again later.",
};

const TEXT_MUSIC: Record<string, string> = {
  "onpu-segawa": SFX.onpu,
  "hazuki-fujiwara": SFX.hazuki,
  hana: SFX.hana,
  "wrong-series": SFX.wrongSeries,
  lol: SFX.lol,
  roxanne: SFX.roxanne,
  help: SFX.help,
};

function BlackText({ text, music }: { text: string; music?: string }) {
  useEffect(() => {
    const a = music ? playSecret(music, { loop: true, volume: 0.8 }) : null;
    return () => {
      stopSecret(a);
      stopAllSecrets();
    };
  }, [music]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6 text-center font-sans text-2xl font-medium text-white sm:text-4xl">
      {text}
    </div>
  );
}

function useGoHome() {
  const navigate = useNavigate();
  return useCallback(() => {
    stopAllSecrets();
    navigate({ to: "/" });
  }, [navigate]);
}

// ─── Aiko ────────────────────────────────────────────────
function Aiko() {
  const goHome = useGoHome();
  const [playing, setPlaying] = useState(false);
  useEffect(() => () => stopAllSecrets(), []);
  function onClick() {
    if (playing) return;
    setPlaying(true);
    playSecret(isThatAll.url, { onEnded: goHome });
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

// ─── Momo (guitar) ───────────────────────────────────────
function Momo() {
  const goHome = useGoHome();
  const [scale, setScale] = useState(1);
  const [gray, setGray] = useState(false);
  const [locked, setLocked] = useState(false);
  const clicksRef = useRef(0);
  const currentRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => () => stopAllSecrets(), []);

  function onClick() {
    if (locked) return;
    // Stop any previously playing sample so audios don't overlap
    stopSecret(currentRef.current);
    currentRef.current = null;

    clicksRef.current += 1;

    const rare = Math.random() < 0.25;
    if (rare) {
      setGray(true);
      setLocked(true);
      setScale((s) => s * 1.01);
      currentRef.current = playSecret(lovelyGuitar.url, { onEnded: goHome });
      return;
    }
    setScale((s) => s * 1.01);
    currentRef.current = playSecret(loveAndPeace.url);

    if (clicksRef.current >= 20) {
      setLocked(true);
      stopSecret(currentRef.current);
      navigate({ to: "/reveal/$slug", params: { slug: "tense" } });
    }
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
          cursor: locked ? "default" : "pointer",
          pointerEvents: locked ? "none" : "auto",
        }}
      />
    </div>
  );
}

// ─── Tense (secret behind Momo) ──────────────────────────
function Tense() {
  useEffect(() => {
    const a = playSecret(SFX.tense, { loop: true, volume: 0.8 });
    return () => {
      stopSecret(a);
      stopAllSecrets();
    };
  }, []);
  return <div className="min-h-screen bg-black" />;
}

// ─── Recipe ──────────────────────────────────────────────
function Recipe() {
  const goHome = useGoHome();
  const [ending, setEnding] = useState(false);
  const bgRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    bgRef.current = playSecret(burnMp3.url, { loop: true, volume: 0.7 });
    return () => {
      stopAllSecrets();
    };
  }, []);

  function onClick() {
    if (ending) return;
    setEnding(true);
    // burn.mp3 keeps playing; overlap with burn_the_diary.wav
    playSecret(burnDiary.url, { onEnded: goHome });
  }

  return (
    <div
      onClick={onClick}
      className="min-h-screen cursor-pointer bg-black bg-cover bg-center"
      style={{ backgroundImage: `url("${burnGif.url}")` }}
    />
  );
}

// ─── War (ojamajo) ───────────────────────────────────────
function War() {
  const goHome = useGoHome();
  const [phase, setPhase] = useState<"bomb" | "explode">("bomb");
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const a = playSecret(bombFalling.url, {
      onEnded: () => {
        setPhase("explode");
        setScale(2);
        playSecret(SFX.explodeWav, { onEnded: goHome });
      },
    });
    return () => {
      stopSecret(a);
      stopAllSecrets();
    };
  }, [goHome]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      {phase === "explode" && (
        <img
          src={SFX.explodeGif}
          alt=""
          style={{ transform: `scale(${scale})`, transition: "transform 200ms" }}
        />
      )}
    </div>
  );
}

// ─── Witches ─────────────────────────────────────────────
function Witches() {
  useEffect(() => {
    const a = playSecret(battlefield.url, { loop: true });
    return () => {
      stopSecret(a);
      stopAllSecrets();
    };
  }, []);
  return <div className="min-h-screen bg-black" />;
}

// ─── Fairy (video) ───────────────────────────────────────
function Fairy() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.play().catch(() => {
      // Autoplay blocked; retry muted so it always shows something
      v.muted = true;
      v.play().catch(() => {});
    });
  }, []);
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <video
        ref={videoRef}
        src={fairyVideo.url}
        autoPlay
        loop
        playsInline
        controls
        className="max-h-screen max-w-full"
      />
    </div>
  );
}

// ─── Carnival (trumpet) ──────────────────────────────────
function Carnival() {
  const goHome = useGoHome();
  const [scale, setScale] = useState(1);
  const [locked, setLocked] = useState(false);
  const currentRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => stopAllSecrets(), []);

  function onClick() {
    if (locked) return;
    stopSecret(currentRef.current);
    currentRef.current = null;
    setScale((s) => s * 1.01);

    if (Math.random() < 0.1) {
      setLocked(true);
      currentRef.current = playSecret(SFX.tenna, { onEnded: goHome });
    } else {
      currentRef.current = playSecret(SFX.carnival);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <img
        src={SFX.trumpet}
        alt=""
        onClick={onClick}
        style={{
          transform: `scale(${scale})`,
          transition: "transform 120ms",
          imageRendering: "pixelated",
          maxWidth: "40vw",
          cursor: locked ? "default" : "pointer",
          pointerEvents: locked ? "none" : "auto",
        }}
      />
    </div>
  );
}

// ─── Fafa (pop) ──────────────────────────────────────────
function Fafa() {
  const [n, setN] = useState(0);
  useEffect(() => () => stopAllSecrets(), []);
  const filter = `brightness(${Math.max(0, 1 - n * 0.08)}) saturate(${1 + n * 0.3}) contrast(${1 + n * 0.2}) grayscale(${Math.min(0.7, n * 0.1)})`;
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <img
        src={SFX.fafa}
        alt=""
        onClick={() => setN((x) => x + 1)}
        style={{
          filter,
          transition: "filter 250ms",
          imageRendering: "pixelated",
          maxWidth: "40vw",
          cursor: "pointer",
        }}
      />
    </div>
  );
}

// ─── Sakura (dialogue sequence) ──────────────────────────
type Dialogue = { gif: string; wav: string };

const SEQUENCE: Dialogue[] = [
  { gif: "there is a girl behind this sakura tree.gif", wav: "assets/there is a girl behind this sakura tree.wav" },
  { gif: "she looks familiar.gif", wav: "assets/she looks familiar.wav" },
  { gif: "why does she look at you with familiar eyes.gif", wav: "assets/why does she look at you with familiar eyes.wav" },
  { gif: "how much longer will it be.gif", wav: "assets/How much longer will it be.wav" },
  { gif: "1 month.gif", wav: "assets/1 month.wav" },
  { gif: "2 months.gif", wav: "2 months.wav" }, // wav lives at repo root
  { gif: "6 months.gif", wav: "assets/6 months.wav" },
  { gif: "1 year.gif", wav: "assets/1 year.wav" },
  { gif: "2 years.gif", wav: "assets/2 years.wav" },
  { gif: "11 years.gif", wav: "assets/11 years.wav" },
  { gif: "how much longer.gif", wav: "assets/how much longer.wav" },
  { gif: "if only.gif", wav: "assets/if only.wav" },
  { gif: "just a little while longer.gif", wav: "assets/just a little while longer.wav" },
  { gif: "until then.gif", wav: "assets/until then.wav" },
  { gif: "please be patient ok.gif", wav: "assets/please be patient ok.wav" },
];

const FINAL: Dialogue = {
  gif: "the peaches are blossoming quite nicely arent they.gif",
  wav: "assets/the peaches are blossoming quite nicely arent they.wav",
};

const SAKURA_KEY = "sakura_completed_v1";

function Sakura() {
  const [completed, setCompleted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SAKURA_KEY) === "1";
  });
  const [bgTrack] = useState<string>(() =>
    completed ? SFX.tranquility : SFX.sakuraGirl0,
  );
  const [step, setStep] = useState<number | null>(null);
  const [gifNonce, setGifNonce] = useState(0); // bump to force gif restart
  const bgRef = useRef<HTMLAudioElement | null>(null);
  const lineRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const bg = playSecret(bgTrack, { loop: true, volume: 0.6 });
    bgRef.current = bg;
    return () => {
      stopSecret(bg);
      stopSecret(lineRef.current);
      stopAllSecrets();
    };
  }, [bgTrack]);

  // Preload WAVs so audio transitions are instant. (GIFs are cached by the
  // Gif component's decoder cache after first play.)
  useEffect(() => {
    for (const d of [...SEQUENCE, FINAL]) {
      const a = new Audio();
      a.preload = "auto";
      a.src = gh(d.wav);
    }
  }, []);

  const advance = useCallback(() => {
    setStep((s) => {
      if (s === null) return s;
      if (s === -1) return null;
      const next = s + 1;
      if (next >= SEQUENCE.length) {
        window.localStorage.setItem(SAKURA_KEY, "1");
        setCompleted(true);
        return null;
      }
      return next;
    });
  }, []);

  // Play audio for current dialogue
  useEffect(() => {
    stopSecret(lineRef.current);
    lineRef.current = null;
    if (step === null) return;
    const dlg = step === -1 ? FINAL : SEQUENCE[step];
    lineRef.current = playSecret(gh(dlg.wav), {
      volume: 0.9,
      onEnded: advance,
    });
  }, [step, advance]);

  // Keyboard: Z restarts current dialogue's gif + audio from the start.
  // C / Enter / Ctrl / Space skip to the next line.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (step === null) return;
      if (e.key === "z" || e.key === "Z") {
        e.preventDefault();
        stopSecret(lineRef.current);
        lineRef.current = null;
        const dlg = step === -1 ? FINAL : SEQUENCE[step];
        setGifNonce((n) => n + 1);
        lineRef.current = playSecret(gh(dlg.wav), {
          volume: 0.9,
          onEnded: advance,
        });
        return;
      }
      if (
        e.key === "Enter" ||
        e.key === "c" ||
        e.key === "C" ||
        e.key === "Control" ||
        e.key === " "
      ) {
        e.preventDefault();
        stopSecret(lineRef.current);
        lineRef.current = null;
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, advance]);

  function onTreeClick() {
    if (step !== null) return;
    if (completed) setStep(-1);
    else setStep(0);
  }

  const currentDialogue = step === null ? null : step === -1 ? FINAL : SEQUENCE[step];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      <div className="flex min-h-screen items-center justify-center">
        <img
          src={SFX.sakuraTree}
          alt=""
          onClick={onTreeClick}
          style={{
            cursor: step === null ? "pointer" : "default",
            pointerEvents: step === null ? "auto" : "none",
            imageRendering: "pixelated",
            maxWidth: "min(60vw, 500px)",
          }}
        />
      </div>
      {currentDialogue && (
        <div
          className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2"
          style={{ width: "min(90vw, 900px)" }}
        >
          <Gif
            src={ghAsset(currentDialogue.gif)}
            resetKey={`${step}-${gifNonce}`}
            className="mx-auto block h-auto w-full"
          />
        </div>
      )}
    </div>
  );
}


// ─── Water (looping video background) ────────────────────
function Water() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.play().catch(() => {
      v.muted = true;
      v.play().catch(() => {});
    });
    return () => stopAllSecrets();
  }, []);
  return (
    <div className="fixed inset-0 bg-black">
      <video
        ref={videoRef}
        src="https://ia600804.us.archive.org/29/items/drink-water-2/drink%20water%202.mp4"
        autoPlay
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}

// ─── Chapter openings (video, fairy-style) ───────────────
function ChapterOpening({ n }: { n: number }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.play().catch(() => {
      v.muted = true;
      v.play().catch(() => {});
    });
  }, []);
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <video
        ref={videoRef}
        src={ghAsset(`CHAPTER ${n} OPENING.mp4`)}
        autoPlay
        loop
        playsInline
        controls
        className="max-h-screen max-w-full"
      />
    </div>
  );
}

// ─── Route dispatcher ────────────────────────────────────
function RevealPage() {
  const { slug } = useParams({ from: "/reveal/$slug" });

  if (slug in TEXTS) return <BlackText text={TEXTS[slug]} />;
  if (slug === "aiko") return <Aiko />;
  if (slug === "momo") return <Momo />;
  if (slug === "tense") return <Tense />;
  if (slug === "recipe") return <Recipe />;
  if (slug === "war") return <War />;
  if (slug === "witches") return <Witches />;
  if (slug === "fairy") return <Fairy />;
  if (slug === "carnival") return <Carnival />;
  if (slug === "fafa") return <Fafa />;
  if (slug === "sakura") return <Sakura />;
  if (slug === "water") return <Water />;
  const m = /^chapter-([1-4])$/.exec(slug);
  if (m) return <ChapterOpening n={Number(m[1])} />;

  return <BlackText text="…" />;
}
