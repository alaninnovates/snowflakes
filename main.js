/* WARNING : Bad code ahead*/

const Discord = require('discord.js');
const config = require('./config.json');

const JSONdb = require('simple-json-db');
const db = new JSONdb('./points.json');

const prefix = config.prefix;
let onCooldown = false;

const client = new Discord.Client({
	disableMentions: 'everyone',
	partials: ['REACTION'],
	presence: {
		activity: {
			name: `the snowflakes fall ❄️ | ${prefix}help`,
			type: 'WATCHING',
		},
	},
});

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async (message) => {
	if (message.author.bot) return;

	if (db.get(message.author.id) == undefined) db.set(message.author.id, 0);

	switch (message.content) {
		case `${prefix}help`:
			message.channel.send(
				new Discord.MessageEmbed()
					.setColor('#93e7fb')
					.setTimestamp(Date.now())
					.setTitle(`Welcome to the Winter Extravaganza!`)
					.setDescription(
						`**During this event, snowflakes will appear from nowhere into chats for you to catch! Collect the most snowflakes and become the Champion of this year's Winter Extravaganza!**\n\nCommands list:\n\`${prefix}help\` - shows this message\n\`${prefix}count\` - Shows your collected snowflakes count\n\`${prefix}top\` - shows top 10 members, who have the most snowflakes`,
					)
					.setFooter(
						`Requested by ${message.author.tag}`,
						message.author.avatarURL({ dynamic: true }),
					),
			);
			break;
		case `${prefix}count`:
			message.reply(
				`You have ❄️ ${db.get(message.author.id) || 0} snowflakes.`,
			);
			break;
		case `${prefix}top`:
			let top = [];
			const json = db.JSON();
			for (const i in json) {
				top.push([json[i], i]);
			}
			const sorted = top
				.sort(function (a, b) {
					return b[0] - a[0];
				})
				.slice(0, 10);
			const d = sorted.map((t) => {
				`<@${t[1]}> - **${t[0]}** snowflakes`;
			});
			message.reply(
				new Discord.MessageEmbed()
					.setColor('#93e7fb')
					.setTitle(`Top 10 members`)
					.setTimestamp(Date.now())
					.setDescription(d.join('\n')),
			);
			break;
		case `${prefix}eval`:
			if (!config.developers.includes(message.author.id)) return;

			const cleanString = (text) => {
				if (typeof text == 'string') {
					return text
						.replace(/`/g, '`' + String.fromCharCode(8203))
						.replace(/@/g, '@' + String.fromCharCode(8203));
				} else {
					return text;
				}
			};

			try {
				const code = args.join(' ');

				let evaled = eval(code);
				if (typeof evaled != 'string')
					evaled = require('util').inspect(evaled);

				message.channel.send(cleanString(evaled), {
					code: 'xl',
				});
			} catch (error) {
				message.channel.send(cleanString(error), {
					code: 'xl',
				});
			}

			break;
		default:
			if (!config.channels.includes(message.channel.id)) return;
			if (onCooldown) return;
			let number = Math.floor(Math.random() * 100 + 1);
			if (number <= config.rarity) {
				number = Math.floor(Math.random() * 100 + 1);
				onCooldown = true;

				if (number <= 1) {
					const m = await message.channel.send(
						`🥶 You got caught up in the storm!`,
					);
					await m.react('🥶');
					const filter = (reaction) => reaction.emoji.name == '🥶';
					try {
						const collected = await m.awaitReactions(filter, {
							max: 1,
							time: 10000,
							errors: ['time'],
						});

						let person = collected.get('🥶');
						person = person.users.cache
							.filter((id) => id != client.user.id)
							.first().id;

						setTimeout(() => {
							onCooldown = false;
						}, config.cooldown * 1000);

						setTimeout(() => {
							m.delete();
						}, 5000);

						let p = db.get(person);
						p += 20;
						db.set(person, p);

						m.edit(
							`🥶 During the storm, <@${person}> caught 20 snowflakes and they now have :snowflake: **${p}** snowflakes.`,
						);

						const c = await client.channels.fetch(config.logs);
						c.send(
							new Discord.MessageEmbed()
								.setDescription(
									`<@${person}> caught 20 snowflakes. Current count: ${p}`,
								)
								.setColor('#93e7fb')
								.setTimestamp(Date.now()),
						);
					} catch (e) {
						setTimeout(() => {
							onCooldown = false;
						}, config.cooldown * 1000);
						message.delete();
					}
				} else if (number <= 5) {
					const m = await message.channel.send(
						`🐻‍❄️ A wild polar bear appeared! Who wants to fight it for :snowflake: 10 snowflakes?`,
					);
					m.react(`🐻‍❄️`);
					const filter = (reaction) => reaction.emoji.name == '🐻‍❄️';
					try {
						const collected = await m.awaitReactions(filter, {
							max: 1,
							time: 10000,
							errors: ['time'],
						});
						let person = collected.get('🐻‍❄️');
						person = person.users.cache
							.filter((id) => id != client.user.id)
							.first().id;

						setTimeout(() => {
							onCooldown = false;
						}, config.cooldown * 1000);
						setTimeout(() => {
							m.delete();
						}, 5000);

						let p = db.get(person);

						number = Math.floor(Math.random() * 100 + 1);
						const c = await client.channels.fetch(config.logs);
						if (number <= 50) {
							if (p <= 10) {
								p = 0;
								m.edit(
									`🐻‍❄️ <@${person}> didn't win against the bear and lost all of their snowflakes.`,
								);
								c.send(
									new Discord.MessageEmbed()
										.setDescription(
											`<@${person}> lost ${p} snowflakes. Current count: 0`,
										)
										.setColor('#93e7fb')
										.setTimestamp(Date.now()),
								);
							} else {
								p -= 10;
								m.edit(
									`🐻‍❄️ <@${person}> didn't win against the bear and lost :snowflake: 10 snowflakes. They now have :snowflake: **${p}** snowflakes.`,
								);
								c.send(
									new Discord.MessageEmbed()
										.setDescription(
											`<@${person}> lost 10 snowflakes. Current count: ${p}`,
										)
										.setColor('#93e7fb')
										.setTimestamp(Date.now()),
								);
							}
							db.set(person, p);
						} else {
							p += 10;
							m.edit(
								`🐻‍❄️ <@${person}> somehow won against the bear and got 10 snowflakes! They now have :snowflake: **${p}** snowflakes.`,
							);
							db.set(person, p);
							c.send(
								new Discord.MessageEmbed()
									.setDescription(
										`<@${person}> caught 10 snowflakes. Current count: ${p}`,
									)
									.setColor('#93e7fb')
									.setTimestamp(Date.now()),
							);
						}
					} catch (e) {
						setTimeout(() => {
							onCooldown = false;
						}, config.cooldown * 1000);
						m.delete();
					}
				} else if (number <= 15) {
					const m = await message.channel.send(
						`🎄 Look! A Christmas tree!`,
					);
					m.react(`🎄`);
					const filter = (reaction) => reaction.emoji.name == '🎄';
					try {
						const collected = await m.awaitReactions(filter, {
							max: 1,
							time: 10000,
							errors: ['time'],
						});
						let person = collected.get('🎄');
						person = person.users.cache
							.filter((id) => id != client.user.id)
							.first().id;

						setTimeout(() => {
							onCooldown = false;
						}, config.cooldown * 1000);
						setTimeout(() => {
							m.delete();
						}, 5000);

						let p = db.get(person);
						p += 5;
						db.set(person, p);

						m.edit(
							`🎄 <@${person}> just found 5 snowflakes under the tree! They now have :snowflake: **${p}** snowflakes.`,
						);

						const c = await client.channels.fetch(config.logs);
						c.send(
							new Discord.MessageEmbed()
								.setDescription(
									`<@${person}> caught 5 snowflakes. Current count: ${p}`,
								)
								.setColor('#93e7fb')
								.setTimestamp(Date.now()),
						);
					} catch (e) {
						setTimeout(() => {
							onCooldown = false;
						}, config.cooldown * 1000);
						m.delete();
					}
				} else {
					const m = await message.channel.send(
						`❄️ A wild snowflake appeared!`,
					);
					m.react(`❄️`);
					const filter = (reaction) => reaction.emoji.name == '❄️';
					try {
						const collected = await m.awaitReactions(filter, {
							max: 1,
							time: 10000,
							errors: ['time'],
						});
						let person = collected.get('❄️');
						person = person.users.cache
							.filter((id) => id != client.user.id)
							.first().id;

						let p = db.get(person);
						if (p == undefined) p = 1;
						else p += 1;
						db.set(person, p);

						m.edit(
							`❄️ <@${person}> caught the snowflake! They now have ❄️ **${p}** snowflakes.`,
						);

						setTimeout(() => {
							onCooldown = false;
						}, config.cooldown * 1000);
						setTimeout(() => {
							m.delete();
						}, 5000);
						const c = await client.channels.fetch(config.logs);
						c.send(
							new Discord.MessageEmbed()
								.setDescription(
									`<@${person}> caught a snowflake. Current count: ${p}`,
								)
								.setColor('#93e7fb')
								.setTimestamp(Date.now()),
						);
					} catch (e) {
						setTimeout(() => {
							onCooldown = false;
						}, config.cooldown * 1000);
						m.delete();
					}
				}
			}
	}
});

client.on('error', (error) => {
	console.error(error);
});

client.login(config.token);
