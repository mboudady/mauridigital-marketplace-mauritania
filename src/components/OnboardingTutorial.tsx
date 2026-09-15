"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "souq_onboarding_seen";

const TIPS = [
  {
    title: "Swipe up for the next product",
    body: "Scroll through videos and photos just like a feed — one product per screen.",
  },
  {
    title: "Like, save, and follow",
    body: "Use the icons on the right to like a product, save it for later, or follow the seller.",
  },
  {
    title: "Add to cart in one tap",
    body: "The cart icon at the bottom of each post adds it instantly — check out whenever you're ready.",
  },
  {
    title: "Tap + to sell",
    body: "Merchants and affiliates post from the + button. Everyone else can browse, buy, and leave reviews.",
  },
];

export function OnboardingTutorial() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  function next() {
    if (step < TIPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  }

  if (!visible) return null;

  const tip = TIPS[step];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-end bg-black/70 p-6 pb-24">
      <div className="w-full max-w-sm rounded-xl bg-ink-950 p-5 text-ink-50 shadow-xl">
        <div className="flex gap-1.5">
          {TIPS.map((_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i <= step ? "bg-ink-50" : "bg-ink-700"
              }`}
            />
          ))}
        </div>

        <p className="mt-4 font-display text-lg">{tip.title}</p>
        <p className="mt-1 text-sm text-ink-400">{tip.body}</p>

        <div className="mt-5 flex items-center justify-between">
          <button onClick={dismiss} className="text-xs text-ink-400">
            Skip
          </button>
          <button
            onClick={next}
            className="rounded-full bg-ink-50 px-5 py-2 text-sm font-medium text-ink-950"
          >
            {step < TIPS.length - 1 ? "Next" : "Got it"}
          </button>
        </div>
      </div>
    </div>
  );
}
