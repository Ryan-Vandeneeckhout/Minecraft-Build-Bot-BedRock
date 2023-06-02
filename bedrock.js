const bedrock = require("bedrock-protocol");
const fs = require("graceful-fs");

const bedRockFunctionClient = (
  realmCode,
  usernameBot,
  handleBotsStatus,
  discordCommandState,
  discordMessage,
  arraycoords,
  failedToConnect
) => {
  // Global Variables
  let timerInterval = null;
  let BotIdleTimer;
  let CommandsUsedCounter = 0;
  let commandsTimeout;
  let bedrockClient;

  // Create 1 Minecraft client/bot
  bedrockClient = bedrock.createClient({
    username: usernameBot,
    uuid: "",
    offline: false,
    realms: {
      realmInvite: realmCode,
    },
  });

  // Minecraft Command Object
  const SendMinecraftCommand = (commandItem) => {
    bedrockClient.write("command_request", {
      command: `/ ${commandItem}`,
      origin: {
        type: 0,
        uuid: "",
        request_id: "",
      },
      internal: false,
      version: 52,
    });
  };

  // Minecraft Text Object
  const SendMinecraftTextChat = (messageText) => {
    bedrockClient.queue("text", {
      type: "chat",
      needs_translation: false,
      source_name: bedrockClient.username,
      xuid: "",
      platform_chat_id: "",
      message: messageText,
    });
  };

  //Bedrock console log Function

  const clog = (middleText) => {
    console.log(
      `============================================\nFrom Realm Code: ${realmCode} ${middleText} \n============================================`
    );
  };

  //BedRock Error Function (Internal Errors from Node);

  const elog = (middleText) => {
    console.error(
      `=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\nFrom Realm Code: ${realmCode} ${middleText} \n-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=`
    );
  };

  // Bot Spawning / Catch Errors
  const botInit = () => {
    botSpawnWriteToConsole();
    addBotMessageEventListeners();
    startBotIdleTimer();
  };

  //If Bot Errors while connecting to Realm Function

  function Error() {
    handleBotsStatus(usernameBot, false);
    clearInterval(BotIdleTimer);
    bedrockClient.disconnect();
    clog("Connection Closed!!");
    elog(`Bot Failed to Connect to ${realmCode}!!`);
    failedToConnect();
  }
  //Bot was Successful in Connecting to Realm
  function Success() {
    clog(`${usernameBot} Connected!!`);
    handleBotsStatus(usernameBot, true);

    if (discordCommandState === true) {
      SendMinecraftCommand(
        `tp ${arraycoords[0]} ${arraycoords[1]} ${arraycoords[2]}`
      );
      botBuildFunction(discordMessage, "build");
    } else {
      return;
    }
    //Continue to check for bot messages on a 5s loop from computer app//
    readBotMessage();
  }

  //Write Current Bot State to Node Console
  const botSpawnWriteToConsole = () => {
    bedrockClient.on("join", () => {
      clog(`${usernameBot} Joining.... ${realmCode}!!`);
    });
    bedrockClient.on("kicked", (err) => {
      clog(err.message);
      Error();
    });
    bedrockClient.on("disconnect", (err) => {
      if (err.message === "disconnectionScreen.serverFull") {
        clog(`Server is full, ${usernameBot} cannot join ${realmCode}`);
      } else if (err.message === "disconnectionScreen.serverIdConflict") {
        clog("Bot is already in the server!!");
      } else {
        clog(err.message);
      }
      Error();
    });
    bedrockClient.on("spawn", Success);
    bedrockClient.on("error", (err) => {
      if (err.code === undefined) {
        clog("Undefinded Error");
      } else if (err.code.includes("disconnect")) {
        clog("Disconnect Error Server!!");
      } else {
        clog(err);
      }
      Error();
    });
  };

  const loopCommandArray = (commandArray) => {
    for (const commandItem of commandArray) {
      SendMinecraftCommand(commandItem.toString());
    }
  };

  const MineCraftCommandAndTextFunctionReuseable = (command, message) => {
    SendMinecraftCommand(command);
    SendMinecraftTextChat(message);
  };

  //Accepted Bot Command Conditions
  const botCommandConditions = [
    ".follow",
    ".stop",
    ".help",
    ".build",
    ".flat",
    ".clear",
    ".drain",
    ".deforest",
    ".off",
  ];

  //Test for whether in-game message contains command items.

  // Minecraft Chat Commands event listener
  const addBotMessageEventListeners = () => {
    bedrockClient.on("text", (packet) => {
      const message = packet.message.toLowerCase();
      const testIfCommandsArePresent = botCommandConditions.some((el) =>
        message.includes(el)
      );

      if (
        packet.source_name !== bedrockClient.username &&
        testIfCommandsArePresent
      ) {
        handleBotCommand(packet);
        resetBotIdleTimer();
        usedTimer();
      } else {
        logMinecraftMessage(packet);
      }
    });
  };

  //Handle Bot checking in-game minecraft commmands logic

  const handleBotCommand = (packet) => {
    const message = packet.message.toLowerCase();

    if (message.includes(".follow")) {
      followPlayerFunction(packet);
    } else if (message.includes(".stop")) {
      stopCommand(packet);
    } else if (message.includes(".build")) {
      botBuildFunction(packet.message, "builds");
    } else if (message.includes(".flat")) {
      botBuildFunction(packet.message, "flat");
    } else if (message.includes(".drain")) {
      drainFunction(packet.source_name);
    } else if (message.includes(".clear")) {
      clearareaFunction(packet.source_name);
    } else if (message.includes(".deforest")) {
      deforestFunction(packet.source_name);
    } else if (message.includes(".help")) {
      HelpMenu();
    } else if (message.includes(".off")) {
      botShutDown();
    }
  };

  //log Minecraft message

  const logMinecraftMessage = (packet) => {
    const currentTime = new Date().toLocaleTimeString();

    if (!packet.source_name) return; // Return early if the sender is undefined
    clog(`[${packet.source_name}]:\n${packet.message}\n[${currentTime}]`);
  };

  // Too Many Commands Timer
  const usedTimer = () => {
    CommandsUsedCounter++;
    if (CommandsUsedCounter === 100) {
      botShutDown();
      SendMinecraftTextChat(
        `§l§cToo Many Commands Used Running Disconnect!!!!`
      );
      clearTimeout(commandsTimeout);
    }
  };

  // Idle Timer
  const startBotIdleTimer = () => {
    let timer = 0;
    const timerFunction = () => {
      timer++;

      switch (timer) {
        case 15:
          readBotMessage();
          break;
        case 60:
          SendMinecraftTextChat(
            `§l§cIf My Commands Are Not Running I Need OP, \n§6Also Chat Addons Can Mess With Me :(`
          );
          break;
        case 120:
          SendMinecraftTextChat(
            `§l§6Please Run A §c.Command In MineCrafts Chat!! \n§6Or Ill Have To Leave`
          );
          break;
        case 280:
          SendMinecraftTextChat(
            `§l§2Need Help? In Minecraft §6Chat §2Do: §6.he§6lp §2To See MY Commands!!`
          );
          break;
        case 590:
          SendMinecraftTextChat(
            `§l§4No Commands Were Used, Leaving In 10 Sec...`
          );
          break;
        case 600:
          clearTimeout(BotIdleTimer);
          console.log("Running Disconnect..");
          botShutDown();
          break;

        default:
          break;
      }
      if (BotIdleTimer) clearInterval(BotIdleTimer);
      BotIdleTimer = setInterval(timerFunction, 1000);
    };
  };

  // Function to reset the bot shutdown timer
  const resetBotIdleTimer = () => {
    clearInterval(BotIdleTimer);
    startBotIdleTimer();
  };

  //.Help Function - bot's .help Command

  const HelpMenu = () => {
    // Bots .help Command Built In
    SendMinecraftTextChat(
      "§l§6Warning: Chat Addons Can Mess With Me!! :(§r\n§c§lHelp Message: §r(1/2) \n==========Bots Commands===============\n§c.§cdrain§r - The Bot Will Drain The Water Around You\n§c.§cclear§r - The Bot Will Clear A Small Area Around You \n§c.§cdeforest§r - The Bot Will Remove Any Trees Around You \n§c.§cfollow§r - The Bot Will TP To Follow You Around \n§c.§cstop§r  - Stop's The Bot Looping\n§c.§coff§r    - Remove's The Bot From The Realm \n§c.§chelp§r   - Display's The Help Message\n"
    );
    setTimeout(() => {
      MineCraftCommandAndTextFunctionReuseable(
        `playanimation @s animation.react_bottom_3 a 4`,
        "§c§lHelp Message: §r(2/2) \n==========Build Commands==============\n§c.§cbuild§r  - Select A Build To Spawn \n§c.§cbuild 001§r - Example\n==========Flat Commands===============\n§c.§cflat§r  - Flatten A Area\n§c.§cflat S§r  - Example§r\n§c.§cflat SG§r - Grass Example§c\n.§cflat M§r  - Example§c \n.§cflat MG§r - Grass Example§c \n.§cflat L§r  - Example§c\n.§cflat LG§r - Grass Example§c"
      );
    }, 250);
  };

  //.Follow Function - Bots .follow Command

  const followPlayerFunction = (packet) => {
    MineCraftCommandAndTextFunctionReuseable(
      `playanimation @s animation.react_bottom_2 a 4`,
      `§2§lFollowing ${packet.source_name}.\n§cUse .§cstop To Stop Me`
    );
    let commandArray = [
      "Say §l§cDo .stop To Stop Me",
      "playanimation @s animation.react_bottom_1 a 4",
      `tp @s ${packet.source_name}`,
    ];

    //Go to the reusable function that requires the bot to follow the requesting player

    drainFollowClearAreaFunctionResuable(
      false,
      packet.source_name,
      "Say §l§cDo .stop To Stop Me",
      commandArray,
      6000
    );
  };

  const drainFollowClearAreaFunctionResuable = (
    stop,
    source_name,
    message,
    commandArray,
    timer
  ) => {
    const executeCommands = () => {
      drainFollowClearAreaFunctionResuable(
        stop,
        source_name,
        message,
        commandArray,
        timer
      );
      loopCommandArray(commandArray);
    };

    if (stop === false) {
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(executeCommands, timer);
    } else {
      // Bots .stop Command clears .drain .follow .deforest as of 1.08
      clearInterval(timerInterval);
    }
  };

  //Stop Function .stop - Bot Stop all Drain - Follow - Deforest Commands

  const stopCommand = (packet) => {
    let commandArray = [
      "tag @a remove drain",
      "tag @a remove cleararea",
      `tag @a remove deforest`,
    ];

    drainFollowClearAreaFunctionResuable(
      true,
      packet.source_name,
      `§c§lStopping Loop.. ${packet.source_name}.`,
      commandArray,
      1000
    );
    SendMinecraftCommand(`playanimation @s animation.react_confirm_2 a 4`);
  };

  //Bot Drain Function
  const drainFunction = (source_name) => {
    SendMinecraftTextChat(`§l§aDraining The Area Around! ${source_name}`);

    let commandArray = [`tag "${source_name}" add drain`];
    let waterArray = ["water", "flowing_water"];

    for (const arrayitem of waterArray) {
      commandArray.push(
        `execute at @a[tag=cleararea] run fill ~-15 ~0 ~-15 ~15 ~15 ~15 ${arrayitem}`
      );
    }

    drainFollowClearAreaFunctionResuable(
      false,
      source_name,
      `§l§cDo .§cstop To Stop Me`,
      commandArray,
      1000
    );
  };

  // Bots .clear Command
  const clearareaFunction = (source_name) => {
    SendMinecraftTextChat(`§l§aClearing The Area Around! ${source_name}`);

    let commandArray = [
      `tag "${source_name}" add cleararea`,
      "execute at @a[tag=cleararea] run fill ~-15 ~0 ~-15 ~15 ~15 ~15 air",
    ];

    drainFollowClearAreaFunctionResuable(
      false,
      source_name,
      `§l§2Clearing Area §l§cDo .§cstop To Stop Me`,
      commandArray,
      1000
    );
  };

  // Bots .deforest Command
  const deforestFunction = (source_name) => {
    SendMinecraftTextChat(`§l§aClearing The Area Around! ${source_name}`);

    let commandArray = [`tag "${source_name}" add cleararea`];
    let forestArray = [
      "acacia_log",
      "azalea_leaves_flowered",
      "azalea_leaves",
      "birch_log",
      "dark_oak_log",
      "jungle_log",
      "leaves",
      "leaves2",
      "mangrove_leaves",
      "mangrove_log",
      "oak_log",
      "spruce_log",
      "stripped_acacia_log",
      "stripped_birch_log",
      "stripped_dark_oak_log",
      "stripped_jungle_log",
      "stripped_mangrove_log",
      "stripped_oak_log",
      "stripped_spruce_log",
    ];

    for (const arrayitem of forestArray) {
      commandArray.push(
        `execute at @a[tag=cleararea] run fill ~-15 ~0 ~-15 ~15 ~15 ~15 ${arrayitem}`
      );
    }

    drainFollowClearAreaFunctionResuable(
      false,
      source_name,
      `§l§2Deforesting... §l§cDo .§cstop To Stop Me`,
      commandArray,
      1000
    );
  };

  // Bots .off Command
  const botShutDown = () => {
    SendMinecraftTextChat("Got To Go, Bye Guys!");

    const closeConnection = () => {
      SendMinecraftTextChat("§l§cClosing Connection...");
      setTimeout(() => {
        clog("Connection Closed!!");
        handleBotsStatus(usernameBot, false);
        clearInterval(BotIdleTimer);
        bedrockClient.disconnect();
      }, 2000);
    };

    setTimeout(closeConnection, 1000);
  };
  // Bots .build Command
  const tickingarea = [
    "tickingarea add circle ~0 ~40 ~64 4 temp1",
    "tickingarea add circle ~64 ~40 ~64 4 temp2",
    "tickingarea add circle ~64 ~40 ~0 4 temp3",
    "tickingarea add circle ~0 ~40 ~128 4 temp4",
    "tickingarea add circle ~128 ~40 ~0 4 temp5",
    "tickingarea add circle ~128 ~40 ~64 4 temp6",
    "tickingarea add circle ~64 ~40 ~128 4 temp7",
    "tickingarea add circle ~128 ~40 ~128 4 temp8",
    "tickingarea add circle ~128 ~40 ~192 4 temp9",
    "tickingarea add circle ~192 ~40 ~128 4 temp10",
  ];
  //create the tickingarea remove array from the length of in use tickingareas

  const tickingarearemove = Array.from(
    { length: tickingarea.length },
    (_, index) => `tickingarea remove temp${index + 1}`
  );

  //Allowed Flat commands and their namesake variations

  const ALLOWED_FLAT_VARIATIONS = [
    "S",
    "M",
    "L",
    "SG",
    "MG",
    "LG",
    "s",
    "m",
    "l",
    "sg",
    "mg",
    "lg",
  ]; // Add the allowed variations for flat commands
  const MAX_BUILD_NUMBER = 1000;

  //Bot build function test in-game user input to ensure message contains appropriate build variables

  const botBuildFunction = (message, state) => {
    let input = message;
    let res;

    //If .flat command
    if (state === "flat") {
      res = input.replaceAll(".flat", "").replaceAll(" ", "");
      clog(`Flat ` + res);
    }
    //if .build command
    else {
      res = input.replace(/\D/g, "");
    }

    clearInterval(timerInterval); // Stop bot following while building

    //Further checking of the user input data after the .build or .flat command

    if (/^\d+$/.test(res) === true || state === "flat") {
      let buildNumber;
      if (state === "flat") {
        buildNumber = res.toUpperCase(); // Convert the flat command to uppercase
        //If user inputted flat without proper .flat variables as found in the flat folder
        if (!ALLOWED_FLAT_VARIATIONS.includes(buildNumber)) {
          MineCraftCommandAndTextFunctionReuseable(
            `playanimation @s animation.react_confirm_1 a 4`,
            `§l§cInvalid Flat Command! Please Use A Vaild .flat Command.`
          );
          return;
        }
        //Success got the the build function
        else {
          minecraftNBTTextBuildFunction(state, res);
        }
      } else {
        buildNumber = parseInt(res, 10);
        if (buildNumber > MAX_BUILD_NUMBER) {
          MineCraftCommandAndTextFunctionReuseable(
            `playanimation @s animation.react_confirm_1 a 4`,
            `§l§cI Cant Find That Build Is That The Right Number?`
          );
          return;
        } else {
          minecraftNBTTextBuildFunction(state, res);
        }
      }
    }
  };

  //Actual Reading of Folders for Build and Flat Function put here for Reading Requires Build or Flat for State along with a flat variable or a build number variable

  const minecraftNBTTextBuildFunction = (state, res) => {
    fs.readFile(`./${state}/${res}.txt`, "utf8", (err, data) => {
      if (err) {
        clog("Build Error" + err);
        return;
      }

      //Remove all TickingAreas
      loopCommandArray(tickingarearemove);
      const buildResponse = data.trim();
      const commands = buildResponse.split("\n");

      //Run Ticking Commands as found in the ticking Area Array
      loopCommandArray(tickingarea);

      // Run commands from build file
      commands.forEach((commanditem, index) => {
        SendMinecraftCommand(commanditem);

        if (index === commands.length - 1) {
          //Remove all tickingareas created by the bot
          loopCommandArray(tickingarearemove);
          let commandArray = [
            "say §2§lBuild Done!!! §cMake Sure To Check The Far Side Of The Build That It Fully Spawned!!",
            "playsound note.pling @a",
            "playanimation @s animation.react_confirm_1 a 4",
          ];
          loopCommandArray(commandArray);
          clog(`${usernameBot} finished building!!`);
        }
      });

      SendMinecraftCommand(`playanimation @s animation.react_confirm_1 a 4`);
    });
  };
  //Check if master control application sent an in-game message to the bot

  const readBotMessage = () => {
    clearInterval(timerInterval);
    fs.readFile(`BotMessage.txt`, "utf8", (err, data) => {
      if (err) {
        return;
      } else {
        const buildResponse = data.trim();
        const commands = buildResponse.split("\n");
        const messageToString = commands.toString();

        if (messageToString.includes(usernameBot)) {
          SendMinecraftTextChat(messageToString);
          fs.unlink(`BotMessage.txt`, (err) => {
            if (err) {
              return;
            }
          });
        }
      }
    });
    timerInterval = setInterval(() => {
      readBotMessage();
    }, 5000);
  };

  botInit();
};

module.exports = { bedRockFunctionClient };
