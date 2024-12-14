require("dotenv").config();
const { REST, Routes } = require("discord.js");
const CLIENT_ID = "1317119032993779762";
const commands = require("./commands");

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

async function main() {
    try {
        console.log("Started refreshing application (/) commands.");

        await rest.put(Routes.applicationCommands(CLIENT_ID), {
            body: commands,
        });

        console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error(error);
    }
}

main();
