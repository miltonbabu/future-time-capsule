import type { Language } from "./types";

/**
 * Client-safe pre-defined achievement pools (no server-only code).
 * Short, punchy, one-liner humor — used as fallback when GLM fails.
 */

export const ACHIEVEMENT_POOLS: Record<Language, Record<string, string[]>> = {
  en: {
    tech: [
      "Shipped zero bugs. On a Friday. Survived.",
      "Refactored legacy code into one function.",
      "Fixed prod by reading the error. Groundbreaking.",
    ],
    ai: [
      "Trained AI. It asked for a vacation.",
      "AI wrote better code. Got fired.",
      "Convinced AI it's human. It believed me.",
    ],
    money: [
      "Pitched in 10s. Got a term sheet.",
      "Side project became a unicorn by lunch.",
      "Raised so much cash, banks took a number.",
    ],
    time: [
      "Invented time machine. Lost the remote.",
      "Arrived before the meeting was scheduled.",
      "Set clock forward. Accidentally started tomorrow.",
    ],
    all: [
      "Won the hackathon, internet, and after-party.",
      "Deployed to prod using pure willpower.",
      "Closed all browser tabs. First ever.",
    ],
  },
  zh: {
    tech: [
      "周五发布零bug，居然没崩。",
      "祖传代码重构成一个函数。",
      "看报错修好线上，史上首次。",
    ],
    ai: [
      "训练AI，它主动请假了。",
      "AI写代码比我好，被开除了。",
      "说服AI它是人类，它信了。",
    ],
    money: [
      "10秒路演，拿到投资。",
      "午饭前副业变独角兽。",
      "融资太多，银行排队。",
    ],
    time: [
      "发明时光机，遥控器丢了。",
      "会议开始前就到了。",
      "时钟拨快，意外开启明天。",
    ],
    all: [
      "赢了黑客松和整个互联网。",
      "靠意念部署到生产环境。",
      "关掉了所有浏览器标签页。",
    ],
  },
};
