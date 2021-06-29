const presence = require("discord-rpc");
const fs = require("fs");
const SelfReloadJSON = require("self-reload-json");
const processWindows = require("node-process-windows");
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
                  large_image: `tidal`,
                  large_text: `Pasued: ${data1.song}`,
                  small_image: `paused`,
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
                  large_image: `tidal`,
                  large_text: `Listening to ${i.mainWindowTitle}`,
                  small_image: `playing`,
                },
              },
            });
          }
        }
      }
    });
  }, 1750);
});
client.login({ clientId: `825408902773342208` }).then(r => console.log(`Logged in as ${client.user.username}`)).catch(console.error())