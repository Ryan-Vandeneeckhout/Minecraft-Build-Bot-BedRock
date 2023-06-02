const { bedRockFunctionClient } = require("./bedrock.js");
const { Client, GatewayIntentBits } = require("discord.js");
const {
  DISCORD_KEY,
  DISCORD_BOT_ID,
  GUILD_ID,
  ROLE_ID,
  BOT_CHANNEL,
} = require("./keys/keys.js");

//Create One discord Client

const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const {
  DISCORD_MESSAGES_ARRAY,
  helpEmbed,
  BotJoinedMessage,
  ALL_BOTS_IN_USE_MESSAGE,
} = require("./discord_messages/discord_messages.js");

//Login to discord based on key found in key/key.js

discordClient.login(`${DISCORD_KEY}`);
let guild;

//Global variables

let currentTime = new Date().toLocaleTimeString();

// Bot Array
let arrayOfBotsInUse = []; // Bots in currently in use
let arrayOfAvailableBots = ["bot1", "bot2", "bot3", "bot4", "bot5"]; //Default five bots available

function init() {
  discordBot();
}

//Standardized Console Log Function for Discord

const clog = (middleText) => {
  console.log(
    `--------------------------------------------\nDiscord Message: ${middleText} \n--------------------------------------------`
  );
};

//Function to move minecraft bot into either in use or available state

const handleBotsStatus = (botUsername, stateStatus) => {
  //If bot successfully connected to realm and sent back a callback message to update its status as in use
  if (stateStatus === true) {
    arrayOfBotsInUse.push(botUsername);
    arrayOfAvailableBots = arrayOfAvailableBots.filter(
      (val) => val !== botUsername
    );
    Botjoined();
  } else {
    //bot is no longer in use or failed to connect to the inputted realm - updated to in available status
    arrayOfBotsInUse = arrayOfBotsInUse.filter((item) => item !== botUsername);
    arrayOfAvailableBots.push(botUsername);
    arrayOfAvailableBots = [...new Set(arrayOfAvailableBots)];
  }
  clog(
    `Available Bots: ` + arrayOfAvailableBots.toString().replaceAll(",", ", ")
  );
  if (arrayOfBotsInUse.length === 0) {
    clog("No Bots Are Currently In Use");
  } else {
    clog(`Bots Currently in use: ` + arrayOfBotsInUse);
  }
};

//Create a BedRock Bot Function

const BedRockbotCreate = (
  realmCode,
  discordCommandState,
  buildOption,
  coordinates
) => {
  const lowercaseRealmCode = realmCode.toLowerCase(); // Convert to lowercase if realmCode exists
  let usernameBot = arrayOfAvailableBots[0];
  bedRockFunctionClient(
    lowercaseRealmCode,
    usernameBot,
    handleBotsStatus,
    discordCommandState,
    buildOption,
    coordinates
  );
};
async function test_realmcode(realmCode, interaction) {
  if (realmCode.length < 8 || realmCode.length > 12) {
    try {
      await interaction.reply({
        content: "The Realm Code Must Be Between 8 And 12 Characters Long.",
        ephemeral: true,
      });
    } catch (error) {
      await interaction.reply({
        content: "Error: Could not vaildate the realm code length at this time",
        ephemeral: true,
      });
    }
    return false;
  } else {
    try {
      await interaction.reply({
        content: `I'll Try That Realm Code, ${interaction.user.username}, An Send A Bot Right Away!`,
        ephemeral: true,
      });
    } catch (error) {
      clog(
        "Failed to interact with requesting discord user: Further infomation can be found within the Realm Length checking error if else function!!"
      );
    }

    return true;
  }
}

// Register / Commands
function discordBot() {
  discordClient.on("ready", async () => {
    guild = discordClient.guilds.cache.get(GUILD_ID);
    await guild.commands.set(DISCORD_MESSAGES_ARRAY);

    clog(
      `Logged in as ${discordClient.user.tag} On Discord \nSlash Commands Registered!!📗 \nAwating Use.. \n[${currentTime}]⏲`
    );
    changeRoleColor();
    setInterval(changeRoleColor, 120000);
  });

  // Bot Commands
  // Realmcode Bot Command
  discordClient.on("interactionCreate", async (interaction) => {
    const currentTime = new Date().toLocaleTimeString();
    const { user, options } = interaction;
    const realmCode = options.getString("code");

    if (!interaction.isCommand()) return;
    else if (
      interaction.commandName === "realmcode" &&
      arrayOfBotsInUse.length < 5
    ) {
      clog(
        `Discord User: ${user.tag} \nRealm Code: ${realmCode}\n[${currentTime}]⏲`
      );

      let realmCodePassed = await test_realmcode(realmCode, interaction);

      if (realmCodePassed === true) {
        BedRockbotCreate(realmCode, false, "none", "none");
      }

      // Build Bot Command
    } else if (
      interaction.commandName === "build" &&
      arrayOfBotsInUse.length < 5
    ) {
      const realmCode = options.getString("realmcode");
      const buildOption = options.getString("buildoption");
      const xinput = options.getString("xinput");
      const yinput = options.getString("yinput");
      const zinput = options.getString("zinput");
      clog(
        `Discord User: ${user.tag} \nRealm Code: ${realmCode} \nBuild: ${buildOption} \nXinput: ${xinput}\nYinput: ${yinput}\nYinput: ${zinput}\n[${currentTime}]⏲`
      );

      let realmCodePassed = await test_realmcode(realmCode, interaction);

      if (realmCodePassed === true) {
        if ((buildOption || xinput || yinput || zinput) === NaN) {
          try {
            await interaction.reply({
              content:
                "The Build Option, X, Y, And Z Coordinates Must Be Valid Numbers. To Get A Build Number Check Out \n<#1086412256633422004> \n<#1086795470787055736>",
              ephemeral: true,
            });
          } catch (error) {
            clog(
              "Could not reply to discord user regarding the input coordinates check the build command discord for more infomation"
            );
          }
        } else {
          bedRockFunctionClient(
            realmCode.toLowerCase(),
            arrayOfAvailableBots[1],
            handleBotsStatus,
            true,
            buildOption,
            [xinput, yinput, zinput]
          );
          let dcordmessage = `I'll Build The Following: ${buildOption} In Your Realm, At: X${xinput} Y${yinput} Z${zinput}, ${interaction.user.username}!`;
          try {
            await interaction.reply({
              content: dcordmessage,
              ephemeral: true,
            });
          } catch (error) {
            clog(
              "Could not reply to discord user regarding the input coordinates check the build command discord for more infomation from line 212"
            );
          }
          clog(dcordmessage);
        }
      }
    } else if (interaction.commandName === "help") {
      try {
        await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
        clog(`/Help Command Used By: ${user.tag}\n[${currentTime}]⏲`);
      } catch (error) {
        clog("Failed to provide discord user interaction /Help");
      }

      // Send Bot Full Embed
    } else if (arrayOfBotsInUse.length === 5) {
      const channel = discordClient.channels.cache.get(BOT_CHANNEL);
      try {
        await channel.send({ embeds: [ALL_BOTS_IN_USE_MESSAGE] });
      } catch (error) {}
    }
  });
}

// Send Bot Joined Embed
const Botjoined = () => {
  const channel = discordClient.channels.cache.get(BOT_CHANNEL);

  let message = BotJoinedMessage;
  message.fields[0].value = `Bots In Use: - ${arrayOfBotsInUse.length} / 5`;
  channel.send({ embeds: [BotJoinedMessage] });
};

// Record Discord Messages
discordClient.on("messageCreate", (message) => {
  const currentTime = new Date().toLocaleTimeString();
  if (
    message.author.bot ||
    message.author.tag === DISCORD_BOT_ID ||
    message.author.tag === "Carl-bot Logging#0000"
  ) {
    return;
  } else {
    clog(
      `Discord Message: [${message.author.tag}] \n${message.content} \n[${currentTime}]⏲`
    );
  }
});

// Chage Role Color
function changeRoleColor() {
  const role = guild.roles.cache.get(ROLE_ID);
  if (!role) {
    clog("Role Not Found!!");
    return;
  } else {
    const randomColor = Math.floor(Math.random() * 16777215);
    role
      .edit({ color: randomColor })
      .then(() => {})
      .catch((error) => {
        console.error(error + ` Failed to change role color:`);
      });
  }
}

init();
