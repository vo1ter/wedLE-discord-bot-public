const fs = require('node:fs');
const path = require('node:path');
const { Client, Intents, Collection, MessageEmbed, Permissions, MessageActionRow, MessageButton } = require('discord.js');
const { token, ticketChannelId, welcomeChannelId, ticketResultChannelId, playerRoleId, ticketLogChannelId, approvalRoleId, voiceRoomCreatorId, serverIp, serverPort } = require('./config.json');
const moment = require('moment');
const gamedig = require("gamedig")
const { Rcon } = require("rcon-client");

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
	console.log('Бот успішно залогінився!');
	setInterval(async function() {
		const getServer = gamedig.query({
            type: "minecraft",
            host: serverIp,
            port: serverPort,
			maxAttempts: 10
        })
        .then((server) => {
            return server
        })
        // .catch((error) => {
        //     console.log(error)
        // });
		// disabled this cuz i got 1mb error log after 1 day of work
		
		const server = async () => {
			const x = await getServer
			client.user.setActivity(`Гравців на сервері: ${x.players.length}/${x.maxplayers}\nIP: play.irishcoffee.online`)
		}

		server();
	}, 10000)
});

client.on('guildMemberAdd', (member) => {
	const helloEmbed = new MessageEmbed()
		.setColor(`#AF33FF`)
		.addFields(
			{ name: "Новий учасник", value: `Ласкаво просимо на сервер, ${member.user}` },
			{ name: "Як приєднатися до ігрового серверу?", value: `Для цього потрібно створити заявку в каналі <#${ticketChannelId}>. Подальші інструкції ви отримаєте при створені заявки.` }
		)
		.setThumbnail(member.displayAvatarURL())
		.setTimestamp()
		.setFooter({ text: "wedLE" })
	member.guild.channels.cache.get(welcomeChannelId).send({ embeds: [helloEmbed] })
	.catch((err) => console.log(err))
});

// client.on('guildMemberRemove', (member) => {
// 	member.guild.channels.cache.get("983174909251448842").send(`${member.user} покинув нас :с`)
// 	.catch((err) => console.log(err))
// });

client.on('messageCreate', async message => {
	if(message.author.bot) return;

	if(message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) == true && message.channelId == ticketChannelId) {
		if(message.content == "!createTicketEmbed") {
			const buttonsRow = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('create-ticket')
						.setLabel('Створити заявку')
						.setStyle('SUCCESS')
				)
	
			const embed = new MessageEmbed()
				.setColor(`#AF33FF`)
				.addFields(
					{ name: `Заявки`, value: "Щоб створити заявку, натисніть на кнопку нижче." }
				)
				.setFooter({ text: "wedLE" });
			await message.channel.send({ embeds: [embed], ephemeral: false, components: [buttonsRow] });
		}
	}

	var channel = await client.channels.fetch(message.channelId)

	if(!channel.name.includes("ticket-")) return;

	var ticketMember = await message.guild.members.fetch(message.channel.topic)

	if(message.member.roles.cache.find(r => r.id === "965990882014793778") || message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) == true) {
		if(message.content.startsWith("!accept")) {
			const args = message.content.trim().split(/ +/g);

			if(!args[1]) {
				message.reply("Ви неправильно вказали аргументи!");
				return;
			}
			var role = await message.guild.roles.fetch(playerRoleId)
			await ticketMember.roles.add(role)

			var role = await message.guild.roles.fetch(approvalRoleId)
			await ticketMember.roles.remove(role)

			// const rcon = await Rcon.connect({ host: "45.42.247.129", port: 25575, password: "n3s3vjAeMLVCT5Xr" })
			
			// await rcon.send("easywl add " + args[1]) 
			// rcon.end

			const ticketEmbed = new MessageEmbed()
				.setColor(`#32A832`)
				.setTitle("Ticket system")
				.addFields(
					{name: "Заявку прийнято.", value: `Заявку від ${ticketMember.user} прийнято! Приємної гри!`}
				)
				.setAuthor({ name: `${ticketMember.user.username}#${ticketMember.user.discriminator}`, iconURL: ticketMember.user.displayAvatarURL()})
				.setFooter({ text: "wedLE" });

			await client.channels.cache.get(ticketResultChannelId).send({ embeds: [ticketEmbed] })

			message.channel.delete()
		}
		else if(message.content == "!deny") {
			const serverInfoEmbed = new MessageEmbed()
				.setColor(`#EB4034`)
				.setTitle("Ticket system")
				.addFields(
					{name: "Заявку відхилено.", value: `Заявку від ${ticketMember.user} відхилено.`}
				)
				.setAuthor({ name: `${ticketMember.user.username}#${ticketMember.user.discriminator}`, iconURL: ticketMember.user.displayAvatarURL()})
				.setFooter({ text: "wedLE" });

			await client.channels.cache.get(ticketResultChannelId).send({ embeds: [serverInfoEmbed] })

			var role = await message.guild.roles.fetch(approvalRoleId)
			await ticketMember.roles.remove(role)

			message.channel.delete()
		}
		return
	}

	var messageRows = message.content.split("\n")
	
	if(messageRows.length != 6) {
		if(messageRows.length < 6) message.reply("У вас недостатня к-сть речень.");
		if(messageRows.length > 6) message.reply("У вас завелика к-сть речень.");
	}
	else {
		const userInfo = new MessageEmbed()
			.setColor(`#AF33FF`)
			.setTitle(`Заявка від ${ticketMember.user.username}#${ticketMember.user.discriminator}`)
			.addFields(
				{ name: `Нікнейм`, value: `${messageRows[0]}` },
				{ name: `Вік`, value: `${messageRows[1]}` },
				{ name: `Звідки дізналились про цей сервер`, value: `${messageRows[2]}` },
				{ name: `Досвід гри на подібних серверах`, value: `${messageRows[3]}` },
				{ name: `Чим збирається займатись на сервері`, value: `${messageRows[4]}` },
				{ name: `Навички будівництва`, value: `${messageRows[5]}` }
			)
			.setFooter({ text: "wedLE" })
			.setTimestamp();
		await client.channels.cache.get(ticketLogChannelId).send({ embeds: [userInfo] })
		message.channel.permissionOverwrites.edit(message.member.id, { VIEW_CHANNEL: false })
	}
});

client.on('interactionCreate', async interaction => {
	if(interaction.isButton()) {
		if(interaction.channelId != ticketChannelId) return;

		var approvalRole = await interaction.guild.roles.fetch(approvalRoleId)

		if(interaction.member.roles.cache.find(r => r.id === playerRoleId)) {
			interaction.reply({ content: "У вас вже є доступ до серверу!", ephemeral: true })
			return
		}
		else if(interaction.member.roles.cache.find(r => r.id === approvalRoleId)) {
			interaction.reply({ content: "Ви вже створили тікет!", ephemeral: true })
			return
		}

		interaction.member.roles.add(approvalRole)

		let everyoneRole = interaction.guild.roles.cache.find(r => r.name = "@everyone");

		var channel = await interaction.guild.channels.create(`ticket-${moment().unix()}`, {
			type: 'GUILD_TEXT',
			topic: interaction.member.id,
			parent: "966392752424222821",
			permissionOverwrites: [{
				id: everyoneRole.id,
				deny: ['VIEW_CHANNEL']
			},
			{
				id: interaction.member.id,
				allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
			}
			]
		});

		const ticketEmbed = new MessageEmbed()
            .setColor(`#ff1414`)
            .setTitle(`Заявка на приєднання.`)
			.setTimestamp()
            .addFields(
				{ name: `Важлива інформація!`, value: "Ваша заявка має складатися мінімум із 6 речень, не більше не менше.\nЗаявка має бути написана строго по шаблону.\nВсе що знаходиться в заявці має бути замінено на вашу інформацію." },
                { name: `Заявка`, value: "1. Ваш ігровий нікнейм\n2. Ваш вік\n3. Звідки ви дізналились про цей сервер\n4. Чи маєте ви досвід гри на подібних серверах?\n5. Чим ви збираєтесь займатись на сервері\n6. Оцініть свої навички будівництва (0/10), по можливості додайте скріншоти" }
            );

		await channel.send({ embeds: [ticketEmbed] })
		interaction.deferUpdate();
	}

	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

    if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'При обробці команди сталася помилка!', ephemeral: true });
	}
});

client.on("voiceStateUpdate", async (oldMember, newMember) => {
	if (newMember.channelId == voiceRoomCreatorId) {
		var channel = await newMember.guild.channels.create(`${newMember.member.user.username}`, {
			type: 'GUILD_VOICE',
			parent: "967108158248075324",
			permissionOverwrites: [{
				id: newMember.member.user.id,
				allow: ["MANAGE_CHANNELS"]
			}
		]
		});
		await newMember.member.voice.setChannel(channel)
	}
	if (oldMember.channel != null && oldMember.channel.members.size < 1 && oldMember.channelId != voiceRoomCreatorId) {
		if(newMember.channelId == voiceRoomCreatorId) return;
		await oldMember.channel.delete();
	}
})

client.login(token);