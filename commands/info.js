const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js")
const { serverIp, serverPort } = require("../config.json")
const gamedig = require("gamedig")
const moment = require('moment')
moment.locale("uk")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Інформація про *ІГРОВИЙ* сервер.'),
	async execute(interaction) {
		const getServer = gamedig.query({
            type: "minecraft",
            host: serverIp,
            port: serverPort
        })
        .then((server) => {
            return server
        })
        .catch((error) => {
            console.log(error)
            interaction.reply("При запиті виникла помилка!")
        });

        const server = async () => {
            const x = await getServer

            const serverInfoEmbed = new MessageEmbed()
                .setColor(`#AF33FF`)
                .setTitle(`Інформація про сервер ${x.name}`)
                .addFields(
                    { name: "Загальна інформація", value: `Онлайн: ${x.players.length}/${x.maxplayers}\nIP: ${x.connect}` }
                )
                .setTimestamp()
                .setFooter({ text: "wedLE" })
            await interaction.reply({ embeds: [serverInfoEmbed] }); 
        }
        
        server()
        
    	},
};