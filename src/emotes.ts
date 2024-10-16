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

export type EMOTE_OF_WEEK_DAY = "🌖" | "🦖" | "🐢" | "🌩️" | "🆓";

export const EMOTE_TO_DAY_OF_WEEK = {
  "🌖": (date: Date) => nextMonday(addWeeks(startOfWeek(date), 1)),
  "🦖": (date: Date) => nextTuesday(addWeeks(startOfWeek(date), 1)),
  "🐢": (date: Date) => nextWednesday(addWeeks(startOfWeek(date), 1)),
  "🌩️": (date: Date) => nextThursday(addWeeks(startOfWeek(date), 1)),
  "🆓": (date: Date) => nextFriday(addWeeks(startOfWeek(date), 1)),
};

export function emoteToDate(emote: EMOTE_OF_WEEK_DAY) {
  const now = new Date();
  const dateFn = EMOTE_TO_DAY_OF_WEEK[emote];
  return dateFn(now);
}
