const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js")
const moment = require('moment')
moment.locale("uk")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Інформація про сервер.'),
	async execute(interaction) {
		var server = interaction.guild
        var channelsSum
        var afkChannel = server.afkChannel
        var newsChannel = server.newsChannel
        var rulesChannel = server.rulesChannel
        var systemChannel = server.systemChannel
        var owner

        if(server.afkChannel == null || server.afkChannel == undefined) afkChannel = "відсутній"
        if(server.systemChannel == null || server.systemChannel == undefined) systemChannel = "відсутній"
        if(server.rulesChannel == null || server.rulesChannel == undefined) rulesChannel = "відсутній"
        if(server.newsChannel == null || server.newsChannel == undefined) newsChannel = "відсутній"

        await server.channels.fetch().then(channels => channelsSum = channels.size);

        await server.fetchOwner().then(user => owner = user)

        const serverInfoEmbed = new MessageEmbed()
            .setColor(`#AF33FF`)
            .setTitle(`Інформація про сервер "${server.name}"`)
            .addFields(
                { name: "Загальна інформація", value: `Назва серверу: ${server.name}\nДата створення сервера: ${moment.utc(server.createdTimestamp).format("DD/MM/YYYY")}\nNitro бустів: ${server.premiumSubscriptionCount}` },
                { name: "Учасники", value: `\nК-ість учасників: ${server.memberCount}\nВласник сервера: ${owner}` },
                { name: "Канали", value: `\nК-ість каналів: ${channelsSum}\nAFK канал: ${afkChannel}\nКанал з правилами: ${rulesChannel}\nКанал з новинами: ${newsChannel}\nСистемний канал: ${systemChannel}` }
            )
            .setTimestamp()
            .setFooter({ text: "wedLE" });
        await interaction.reply({ embeds: [serverInfoEmbed] });
	},
};