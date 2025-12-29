// Lightweight sentiment analysis without external APIs
// Returns { emotion, sentiment } where sentiment is 0..1

function clamp01(x) {
  return Math.max(0, Math.min(1, Number(x)));
}

function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z\s']/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

const LEXICON = {
  positive: {
    happy: 0.3, joy: 0.3, joyful: 0.3, delighted: 0.3, content: 0.25,
    calm: 0.2, relaxed: 0.2, peaceful: 0.2, relieved: 0.2,
    great: 0.25, good: 0.2, better: 0.2, optimistic: 0.25, hopeful: 0.25,
    excited: 0.25, proud: 0.25, grateful: 0.25
  },
  negative: {
    sad: -0.3, unhappy: -0.3, depressed: -0.35, down: -0.2,
    anxious: -0.3, nervous: -0.25, worried: -0.25, panic: -0.35,
    stressed: -0.3, overwhelmed: -0.3, frustrated: -0.25,
    angry: -0.3, furious: -0.35, annoyed: -0.2,
    tired: -0.2, exhausted: -0.25, lonely: -0.25
  },
  intensifiers: { very: 1.3, extremely: 1.5, super: 1.2, really: 1.2, quite: 1.1 },
  diminishers: { slightly: 0.8, somewhat: 0.85, a_little: 0.85 }
};

const EMOTION_MAP = [
  { label: "Happy", keys: ["happy","joy","joyful","content","delighted"] },
  { label: "Calm", keys: ["calm","relaxed","peaceful","relieved"] },
  { label: "Hopeful", keys: ["hopeful","optimistic"] },
  { label: "Excited", keys: ["excited","proud"] },
  { label: "Sad", keys: ["sad","unhappy","depressed","down","lonely"] },
  { label: "Anxious", keys: ["anxious","nervous","worried","panic"] },
  { label: "Stressed", keys: ["stressed","overwhelmed","frustrated"] },
  { label: "Angry", keys: ["angry","furious","annoyed"] },
  { label: "Tired", keys: ["tired","exhausted"] }
];

export function analyzeSentiment(text) {
  const words = tokenize(text);
  if (words.length === 0) return { emotion: "Calm", sentiment: 0.5 };

  let score = 0; // center at 0, convert to 0..1 later
  let dominant = null;
  const counts = {};

  // simple window for intensifiers and negations
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const prev = words[i - 1] || "";
    const prev2 = words[i - 2] || "";

    const isNeg = (prev === "not" || prev === "never" || prev === "no") ||
                  (prev2 === "not" || prev2 === "never" || prev2 === "no");

    let intensity = 1.0;
    if (LEXICON.intensifiers[prev]) intensity *= LEXICON.intensifiers[prev];
    if (LEXICON.intensifiers[prev2]) intensity *= LEXICON.intensifiers[prev2];
    if (LEXICON.diminishers[prev]) intensity *= LEXICON.diminishers[prev];

    if (w in LEXICON.positive) {
      const delta = (LEXICON.positive[w] * intensity) * (isNeg ? -1 : 1);
      score += delta;
      counts[w] = (counts[w] || 0) + 1;
    } else if (w in LEXICON.negative) {
      const delta = (LEXICON.negative[w] * intensity) * (isNeg ? -1 : 1);
      score += delta;
      counts[w] = (counts[w] || 0) + 1;
    }
  }

  // Convert score to 0..1 around 0
  const sentiment = clamp01(0.5 + score);

  // Determine emotion by matching the most frequent mapped key
  let bestLabel = "Calm";
  let bestCount = -1;
  for (const group of EMOTION_MAP) {
    const c = group.keys.reduce((sum, k) => sum + (counts[k] || 0), 0);
    if (c > bestCount) { bestCount = c; bestLabel = group.label; }
  }

  // If sentiment is strongly positive/negative, prefer complementary emotion when no strong keyword
  if (bestCount <= 0) {
    if (sentiment > 0.65) bestLabel = "Happy";
    else if (sentiment < 0.35) bestLabel = "Sad";
    else bestLabel = "Calm";
  }

  return { emotion: bestLabel, sentiment: Number(sentiment.toFixed(2)) };
}

export default analyzeSentiment;
