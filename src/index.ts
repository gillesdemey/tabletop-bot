import { maxBy } from "@std/collections";
import { format, secondsToMilliseconds } from "date-fns";
import { Client, GatewayIntentBits, Message, TextChannel } from "discord.js";
import { EMOTE_TO_DAY_OF_WEEK, EMOTES, emoteToDate } from "./emotes";

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_NAME = process.env.CHANNEL_NAME ?? "tabletop";
const ROLE_ID = process.env.ROLE_ID ?? "";

async function setupClient() {
  console.log("Starting tabletop bot");

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
    ],
  });

  await client.login(DISCORD_TOKEN);

  await new Promise((resolve, reject) => {
    client.once("ready", resolve);
    client.once("error", reject);
  });

  return client;
}

// 1. post question with when we tabletop each wednesday
async function postQuestion(channel: TextChannel) {
  const now = new Date();
  // emotes without "none" so we can dump the dates
  const emotes = Object.values(EMOTES).filter((e) => e !== EMOTES.NONE);

  const dateOverview = emotes
    .map((emote) => {
      const date = emoteToDate(emote);

      return `${emote} – ${formatDate(date)}`;
    })
    .join("\n");

  const message = await channel.send(`
# 🗓️ Tabletop scheduling

<@&ROLE_ID>
It's that time again! React with the correct emoji to schedule tabletop for next week.

${dateOverview}
`);

  // 2. use emoji reactions for day of the week
  for await (const emote of emotes) {
    await message.react(emote);
  }

  return message;
}

const formatDate = (date: Date) => format(date, "MMM do");

// 3. count number of replies when either
//  3.1 12 hours have passed
//  3.2 all participants have reacted
// 4. send a message with final decision
//  4.1 either a date
//  4.2 no date found, skipping
async function runBot() {
  const client = await setupClient();

  const channel = client.channels.cache.find<TextChannel>(
    // @ts-ignore
    (channel) => isTextChannel(channel) && channel.name === CHANNEL_NAME,
  );
  if (!channel) {
    throw new Error(`No channel found with name ${CHANNEL_NAME}`);
  }

  const message = await postQuestion(channel);
  const consensus = await messageConcensus(message);
  console.log("concensus", consensus?.emoji.name);

  if (!consensus) {
    const message = "Tabletop is skipped next week 🥲";

    console.log(message);
    channel.send(message);

    return;
  } else {
    const now = new Date();
    const emote = consensus.emoji.name;
    const dateFn = EMOTE_TO_DAY_OF_WEEK[emote];
    const dateOfTableTop = dateFn(now);

    const formattedDate = formatDate(dateOfTableTop);
    const message = `Tabletop is on **${formattedDate}**`;

    console.log(message);
    channel.send(message);

    return;
  }
}

async function messageConcensus(message: Message<true>) {
  const userReactions = await message.awaitReactions({
    filter: async (emote, user) => {
      const guild = message.guild;
      const member = await guild.members.fetch(user.id);

      const isBot = user.bot;
      const isDayEmote = Object.values(EMOTES).includes(emote.emoji.name);
      const isTableTopUser = member.roles.cache.has(ROLE_ID);

      return isDayEmote && !isBot && isTableTopUser;
    },
    // time: hoursToMilliseconds(24),
    time: secondsToMilliseconds(5),
  });

  const reactionsArray = Array.from(userReactions.values());
  const dayWithMostVotes = maxBy(reactionsArray, (reaction) => reaction.count);

  return dayWithMostVotes;
}

await runBot();
