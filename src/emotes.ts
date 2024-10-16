import {
  addWeeks,
  nextFriday,
  nextMonday,
  nextThursday,
  nextTuesday,
  nextWednesday,
  startOfWeek,
} from "date-fns";

export const EMOTES = {
  MONDAY: "🌖",
  TUESDAY: "🦖",
  WEDNESDAY: "🐢",
  THURSDAY: "🌩️",
  FRIDAY: "🆓",
  NONE: "❌",
} as const;

export type DAY_OF_WEEK =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY";

export const EMOTE_TO_DAY_OF_WEEK = {
  MONDAY: (date: Date) => nextMonday(addWeeks(startOfWeek(date), 1)),
  TUESDAY: (date: Date) => nextTuesday(addWeeks(startOfWeek(date), 1)),
  WEDNESDAY: (date: Date) => nextWednesday(addWeeks(startOfWeek(date), 1)),
  THURSDAY: (date: Date) => nextThursday(addWeeks(startOfWeek(date), 1)),
  FRIDAY: (date: Date) => nextFriday(addWeeks(startOfWeek(date), 1)),
};

export function emoteToDate(emote: DAY_OF_WEEK) {
  const now = new Date();
  const dateFn = EMOTE_TO_DAY_OF_WEEK[emote];
  return dateFn(now);
}
