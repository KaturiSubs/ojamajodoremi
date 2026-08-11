// GitHub raw asset URLs (KaturiSubs/ojamajodoremi repo)
const GH = "https://raw.githubusercontent.com/KaturiSubs/ojamajodoremi/main";

function enc(p: string) {
  return p
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

/** Path relative to repo root, e.g. "assets/Sakura-Tree.gif" or "2 months.wav" */
export function gh(path: string) {
  return `${GH}/${enc(path)}`;
}

/** Shortcut for files under /assets/ in the repo */
export function ghAsset(name: string) {
  return gh(`assets/${name}`);
}

export const SFX = {
  ominousWrong: ghAsset("Snd_ominous_music.wav"),
  ominousCorrect: ghAsset("Snd_ominous_cancel_music.wav"),
  ominousForbidden: ghAsset("Snd_ominous_hell_super_music.wav"),
  tense: ghAsset("A Tense Spectacle.mp3"),
  carnival: ghAsset("OJAMAJO CARNIVAL.wav"),
  tenna: ghAsset("tenna.wav"),
  explodeWav: ghAsset("explode.wav"),
  explodeGif: ghAsset("explode.gif"),
  sakuraTree: ghAsset("Sakura-Tree.gif"),
  sakuraGirl0: ghAsset("Sakura Girl 0.wav"),
  tranquility: ghAsset("Tranquility.wav"),
  fafa: ghAsset("fafa.png"),
  trumpet: ghAsset("trumpet.png"),
  hana: ghAsset("The Witchheart's Triumphant Return.wav"),
  doremi: ghAsset("Insanity (Kyoki _ 狂気) - Higurashi no Naku Koro ni Kai _ The Lost Tracks.mp3"),
  hazuki: ghAsset("Re_Zero 2nd Season OST - Disc 2 - 14.『The Sound of Snow』.mp3"),
  onpu: ghAsset("Re_Zero 2nd Season OST - Disc 1 - 03.『Preface to Misfortune』.mp3"),
  roxanne: ghAsset("Gallery of Madness (Kiyouki he no Kairou_狂気への回廊) - Higurashi no Naku Koro ni Kai.mp3"),
  wrongSeries: ghAsset("Depressive Paranoia.mp3"),
  lol: ghAsset("For a moment (Pause Theme) - Friday Night Dustin'.mp3"),
  help: ghAsset("Shinryaku! Ika musume OST - 01 Umi Kara no Shisha.mp3"),
  fafaMusic: ghAsset("Fantasy Lied.wav"),
};
