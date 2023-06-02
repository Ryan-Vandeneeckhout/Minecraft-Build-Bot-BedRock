const { BOT_VERSION } = require("../keys/keys.js");

let arrayOfBotsInUse = 1;

let minecraftguyspin =
  "https://media.discordapp.net/attachments/1042376318555275297/1103247677703065610/FakeLeadingBilby-max-1mb.gif?width=275&height=275";
let serverbee =
  "https://media.discordapp.net/attachments/1042376318555275297/1062387787258663012/Server_Bee_Honey.gif";

let DISCORD_MESSAGES_ARRAY = [
  {
    name: "realmcode",
    description:
      "Send a Build Bot To Your Realm🤖 Control It In Game With .Comands!",
    options: [
      {
        name: "code",
        type: 3,
        description: "Enter Your Realm Code:",
        required: true,
      },
    ],
  },
  {
    name: "build",
    description:
      "Send a Build Bot To Your Realm With A Build Already In Mind⛏️ (For Advanced Users)",
    options: [
      {
        name: "realmcode",
        type: 3,
        description: "Enter Your Realm Code:",
        required: true,
      },
      {
        name: "buildoption",
        type: 3,
        description: "Specify The Build Number",
        required: true,
      },
      {
        name: "xinput",
        type: 3,
        description: "Enter Your X Cord:",
        required: true,
      },
      {
        name: "yinput",
        type: 3,
        description: "Enter Your Y Cord:",
        required: true,
      },
      {
        name: "zinput",
        type: 3,
        description: "Enter Your Z Cord:",
        required: true,
      },
    ],
  },
  {
    name: "help",
    description: "Build Bot Help Commands💎",
  },
];

const helpEmbed = {
  title: "𝙆𝙞𝙩𝙩𝙮 𝙎𝙝𝙞𝙯𝙯 𝙉𝘽𝙏𝙨",
  url: "https://www.dsc.gg/kittysnbt",
  fields: [
    {
      name: "/realmcode",
      value:
        "In Discord Chat Do /Realmcode An Put Your Realm Code In, Once The Bot Joins You Can Run Custom Commands In Minecraft And Spawn Builds! (Bot Needs OP For Builds)",
    },
    {
      name: "/build",
      value:
        "In Discord Chat Do /Build An Put Your Realm Code In, Build You Want, An Where You Want It, The Bot Will Join And Spawn The Build In Your Realm! (note please make sure the bot has joined before as it needs op to run its commands",
    },
    {
      name: "All Bot Builds:",
      value:
        "You Can Find All The Bot Builds Here. They Can Be Spawned In Minecraft By Doing .build In Minecraft",
    },
    { name: "<#1086412256633422004>", value: " " },
    { name: "<#1086795470787055736>", value: " " },
    {
      name: "Bot In Game .Commands:",
      value:
        ".drain - The Bot Will Drain The Water Around You \n.clear - The Bot Will Clear A Small Area Around You \n.deforest - The Bot Will Remove Any Trees Around You \n.follow - The Bot Will TP To Follow To You\n.stop - Stops The Bot TP Loop\n.off - Removes The Bot From The Realm\n.help - Displays The Help Message In Game",
    },
    {
      name: "Bot In Game .Build Commands:",
      value: ".build - Select A Build To Spawn\n.build 001 - Example",
    },
    {
      name: "Bot In Game .Flat Commands:",
      value:
        ".flat - Flatten An Area\n.flat S - Small Example\n.flat SG - Small Grass Example\n.flat M - Medium Example\n.flat MG - Medium Grass Example\n.flat L - Large Example\n.flat LG - Large Grass Example",
    },
    {
      name: "About Build Bot:",
      value:
        "This Bot Was Made To Join Any Realm An Spawn Preset Builds From The Discord Sections. This Bot Is Just Ment To Save Time In The Creation Of Realms An To Only Assist Owners An Admins In Builds",
    },
    {
      name: "More Questions?",
      value:
        "If You Get A Build Bot In Your Minecraft Game And Do .help In Minecraft's Chat The Bot Will Go Into Detail On Its Commands Or Ask In Discord About The Bot!!",
    },
  ],
  thumbnail: {
    url: serverbee,
  },
  footer: {
    text: `𝙆𝙞𝙩𝙩𝙮'𝙨 𝙉𝘽𝙏'𝙨 ⛏ ${BOT_VERSION}`,
    iconURL: serverbee,
  },
};
const BotJoinedMessage = {
  title: "𝙆𝙞𝙩𝙩𝙮 𝙎𝙝𝙞𝙯𝙯 𝙉𝘽𝙏𝙨",
  url: "https://www.dsc.gg/kittysnbt",
  color: 0xbd10e0,
  fields: [
    {
      name: `Type "/realmcode <code>" to get a build bot to join!`,
      value: `Bots In Use: - ${arrayOfBotsInUse.length} / 5`,
    },
  ],
  thumbnail: {
    url: minecraftguyspin,
  },
  footer: {
    text: `𝙆𝙞𝙩𝙩𝙮'𝙨 𝙉𝘽𝙏'𝙨 ⛏ ${BOT_VERSION}`,
    iconURL: serverbee,
  },
};

const ALL_BOTS_IN_USE_MESSAGE = {
  title: "𝙆𝙞𝙩𝙩𝙮 𝙎𝙝𝙞𝙯𝙯 𝙉𝘽𝙏𝙨",
  url: "https://www.dsc.gg/kittysnbt",
  color: "#C40000",
  fields: [
    {
      name: `Type "/realmcode <code>" to get a build bot to join!`,
      value: `Bots In Use: - ${arrayOfBotsInUse.length} / 5`,
    },
  ],
  thumbnail: {
    url: serverbee,
  },
  footer: {
    text: `𝙆𝙞𝙩𝙩𝙮'𝙨 𝙉𝘽𝙏'𝙨 ⛏ ${BOT_VERSION}`,
    iconURL: serverbee,
  },
};

module.exports = {
  DISCORD_MESSAGES_ARRAY,
  helpEmbed,
  BotJoinedMessage,
  ALL_BOTS_IN_USE_MESSAGE,
};
