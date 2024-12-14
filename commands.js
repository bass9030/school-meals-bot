const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = [
    new SlashCommandBuilder()
        .setName("자동전송설정")
        .setDescription("급식 자동 싸개 설정")
        .addChannelOption((option) =>
            option
                .setName("급식안내채널")
                .setDescription("급식 정보 싸지를 채널")
                .setRequired(true)
        )
        .addNumberOption((option) =>
            option
                .setName("시")
                .setDescription("급식 싸지를 시간 (24시간제로 입력)")
                .setMinValue(0)
                .setMaxValue(24)
                .setRequired(true)
        )
        .addNumberOption((option) =>
            option
                .setName("분")
                .setDescription("급식 싸지를 분")
                .setMinValue(0)
                .setMaxValue(59)
                .setRequired(true)
        )
        .toJSON(),
    new SlashCommandBuilder()
        .setName("오늘급식")
        .setDescription("오늘 급식")
        .addStringOption((option) =>
            option
                .setName("학교명")
                .setDescription("학교명(기본값: 운호고)")
                .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName("내일급식")
        .setDescription("내일 급식")
        .addStringOption((option) =>
            option
                .setName("학교명")
                .setDescription("학교명(기본값: 운호고)")
                .setRequired(false)
        ),
];
