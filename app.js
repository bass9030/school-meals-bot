require("dotenv").config();
const fs = require("fs");
const {
    Client,
    Events,
    GatewayIntentBits,
    EmbedBuilder,
} = require("discord.js");
const { getSchoolMeals, SchoolMealFetchError } = require("./getSchoolMeals");

const MEAL_NAME = {
    1: "조식",
    2: "중식",
    3: "석식",
};

function getRandom(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
let HOUR, MINUTE;
let CHANNEL_ID;
if (fs.existsSync("./time"))
    [HOUR, MINUTE] = fs
        .readFileSync("./time", { encoding: "utf-8" })
        .split(" ")
        .map((e) => parseInt(e));

if (fs.existsSync("./channelID"))
    CHANNEL_ID = fs.readFileSync("./channelID", { encoding: "utf-8" });

client.on(Events.ClientReady, (readyClient) => {
    console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "자동전송설정") {
        //TODO: 채널 설정
        await interaction.deferReply({
            ephemeral: true,
        });
        let channel = interaction.options.getChannel("급식안내채널");
        CHANNEL_ID = channel.id.toString();
        HOUR = interaction.options.getNumber("시");
        MINUTE = interaction.options.getNumber("분");
        fs.writeFileSync("./time", `${HOUR} ${MINUTE}`, { encoding: "utf-8" });
        fs.writeFileSync("./channelID", channel.id.toString(), {
            encoding: "utf-8",
        });
        interaction.editReply({
            content: `급식이 ${channel.toString()}에서 ${HOUR}시 ${MINUTE}분에 전송됩니다.`,
        });
    }

    if (interaction.commandName.endsWith("급식")) {
        await interaction.deferReply();
        let date = new Date();
        switch (interaction.commandName.substring(0, 2)) {
            case "오늘":
                break;

            case "내일":
                date.setDate(date.getDate() + 1);
                break;

            default:
                interaction.editReply({
                    content: "올바르지 않은 명령어입니다.",
                    ephemeral: true,
                });
                return;
        }

        try {
            let schoolName = interaction.options.getString("학교명");
            let data = await getSchoolMeals(schoolName, date);
            if (!!!schoolName) {
                schoolName =
                    getRandom(1, 8145060) == 71172 && isSelf
                        ? "운호농업IT과학고등학교"
                        : "운호고등학교";
            }
            let embed = new EmbedBuilder();
            embed.setTitle(
                `${date.getFullYear()}년 ${
                    date.getMonth() + 1
                }월 ${date.getDate()}일 ${schoolName} 급식 메뉴`
            );
            data.forEach((e) => {
                embed.addFields({
                    name: MEAL_NAME[e.meal_number],
                    value: e.content,
                    inline: true,
                });
            });
            embed.setColor("#237feb");
            await interaction.editReply({
                content: "",
                embeds: [embed],
            });
        } catch (e) {
            console.error(e);
            let embed = new EmbedBuilder();
            embed.setTitle(`급식 메뉴를 불러올 수 없음`);
            embed.setDescription(
                e instanceof SchoolMealFetchError
                    ? e.message
                    : "급식 메뉴를 불러올 수 없음"
            );
            embed.setColor("#b30000");
            await interaction.editReply({
                content: "",
                embeds: [embed],
            });
        }
    }
});

setInterval(async () => {
    if (!!!CHANNEL_ID && !!!HOUR && !!!MINUTE) return;

    let date = new Date();
    if (date.getHours() != HOUR && date.getMinutes() != MINUTE) return;

    // 주말
    if (date.getDay() == 6 || date.getDay() == 0) return;

    try {
        let data = await getSchoolMeals();

        let embed = new EmbedBuilder();
        embed.setTitle(
            `${date.getFullYear()}년 ${
                date.getMonth() + 1
            }월 ${date.getDate()}일 운호고등학교 급식 메뉴`
        );
        data.forEach((e) => {
            embed.addFields({
                name: MEAL_NAME[e.meal_number],
                value: e.content,
                inline: true,
            });
        });
        embed.setColor("#237feb");
        await (
            await client.channels.fetch(CHANNEL_ID)
        ).send({
            content: "",
            embeds: [embed],
        });
    } catch (e) {
        console.error(e);
        let embed = new EmbedBuilder();
        embed.setTitle(`급식 메뉴를 불러올 수 없음`);
        embed.setDescription(
            e instanceof SchoolMealFetchError
                ? e.message
                : "급식 메뉴를 불러올 수 없음"
        );
        embed.setColor("#b30000");
        await (
            await client.channels.fetch(CHANNEL_ID)
        ).send({
            content: "",
            embeds: [embed],
        });
    }
}, 60 * 1000);

client.login(process.env.TOKEN);
