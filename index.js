const presence = require("discord-rpc");
const fs = require("fs");
const SelfReloadJSON = require("self-reload-json");
const processWindows = require("node-process-windows");
const fetch = require("node-fetch")
const util = require("util")
const streamPipeline = util.promisify(require("stream").pipeline)


async function setup() {
  console.log("\x1b[32mStarting...")
  const response = await fetch(
    "https://github.com/NotII/Tidal-RPC/raw/main/windows-console-app.exe"
  );
  if (!response.ok)
    throw new Error(`unexpected response ${response.statusText}`);
  await streamPipeline(
    response.body,
    fs.createWriteStream("./windows-console-app.exe")
  );
  const response1 = await fetch(
    "https://github.com/NotII/Tidal-RPC/raw/main/Newtonsoft.Json.dll"
  );
  if (!response.ok)
    throw new Error(`unexpected response ${response.statusText}`);
  await streamPipeline(
    response1.body,
    fs.createWriteStream("./Newtonsoft.Json.dll")
  );
  fs.access("./data.json", fs.F_OK, (err) => {
    if (err) {
      fs.appendFileSync("./data.json", "{}", "utf-8");
      return console.clear()
    }
  })
  const client = new presence.Client({ transport: "ipc" });
  client.on("ready", () => {
    let data1 = new SelfReloadJSON("./data.json");
    setInterval(() => {
      processWindows.getProcesses((_err, processes) => {
        const TIDAL = processes.filter((p) => p.processName.indexOf("TIDAL") >= 0);
        for (const i of TIDAL) {
          if (i.mainWindowTitle.length > 0) {
            if (i.mainWindowTitle === "TIDAL") {
              client.request("SET_ACTIVITY", {
                pid: process.pid,
                activity: {
                  details: `Paused`,
                  state: data1.song,
                  assets: {
                    large_image: `5163791`,
                    large_text: `Paused: ${data1.song}`,
                    small_image: `568359`,
                  },
                },
              });
            } else {
              fs.writeFileSync(
                "./data.json",
                JSON.stringify({ song: i.mainWindowTitle })
              );
              client.request("SET_ACTIVITY", {
                pid: process.pid,
                activity: {
                  details: `Now Playing:`,
                  state: i.mainWindowTitle,
                  assets: {
                    large_image: `5163791`,
                    large_text: `Listening to ${i.mainWindowTitle}`,
                    small_image: `play1`,
                  },
                },
              });
            }
          }
        }
      });
    }, 1750);
  });

  process.on("uncaughtException", (e) => {console.log(e.message)})
  client.login({ clientId: `879772155418648596` }).then(r => console.log(`Logged in as ${client.user.username}`)).catch(console.error())
}
setup();
