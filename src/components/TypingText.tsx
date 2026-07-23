"use client";

import { useEffect, useState } from "react";

type Props = {
  words: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseAfterType?: number;
  pauseAfterDelete?: number;
  className?: string;
};

export default function TypingText({
  words,
  typeSpeed = 110,
  deleteSpeed = 60,
  pauseAfterType = 1400,
  pauseAfterDelete = 300,
  className = "",
}: Props) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!words || words.length === 0) return;

    const current = words[wordIndex % words.length];

    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && text === current) {
      timeout = setTimeout(() => setDeleting(true), pauseAfterType);
    } else if (deleting && text === "") {
      timeout = setTimeout(() => {
        setDeleting(false);
        setWordIndex((i) => (i + 1) % words.length);
      }, pauseAfterDelete);
    } else {
      timeout = setTimeout(() => {
        setText((prev) =>
          deleting ? current.slice(0, prev.length - 1) : current.slice(0, prev.length + 1)
        );
      }, deleting ? deleteSpeed : typeSpeed);
    }

    return () => clearTimeout(timeout);
  }, [text, deleting, wordIndex, words, typeSpeed, deleteSpeed, pauseAfterType, pauseAfterDelete]);

  return (
    <span className={className}>
      {text}
      <span className="inline-block w-[3px] h-[0.85em] align-middle ml-1 bg-current animate-pulse" />
    </span>
  );
}
