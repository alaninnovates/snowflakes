/* WARNING : Bad code ahead*/

const Discord = require("discord.js");
const config = require("./config.json");

const JSONdb = require('simple-json-db');
const DB = new JSONdb('./points.json');

const prefix = config.prefix;
var onCooldown = false;

const client = new Discord.Client({ disableMentions: 'everyone', partials: ['REACTION'], presence: { activity: { name: `the snowflakes fall ❄️ | ${prefix}help`, type: 'WATCHING' } } });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
    if (message.author.bot) return;

    // Yes this is the bad code stop looking at it :^)
    switch (message.content) {
        case `${prefix}help`:
            message.channel.send(new Discord.MessageEmbed().setColor('#93e7fb').setTimestamp(Date.now()).setTitle(`Welcome to the Winter Extravaganza!`).setDescription(`**During this event, snowflakes will appear from nowhere into chats for you to catch! Collect the most snowflakes and become the Champion of this year's Winter Extravaganza!**\n\nCommands list:\n\`${prefix}help\` - shows this message\n\`${prefix}count\` - Shows your collected snowflakes count\n\`${prefix}top\` - shows top 10 members, who have the most snowflakes`).setFooter(`Requested by ${message.author.tag}`, message.author.avatarURL({ dynamic: true })));
            break;
        case `${prefix}count`:
            var count = DB.get(message.author.id);
            message.reply(`You have ❄️ ${count || 0} snowflakes.`);
            break;
        case `${prefix}top`:
            var top = [];
            var json = DB.JSON();
            for (var i in json) {
                top.push([json[i], i]);
            }
            text = ``
            top.sort(function (a, b) { return b[0] - a[0] }).slice(0, 10).forEach(t => {
                text += `<@${t[1]}> - **${t[0]}** snowflakes\n`
            });
            message.reply(new Discord.MessageEmbed().setColor('#93e7fb').setTitle(`Top 10 members`).setTimestamp(Date.now()).setDescription(text));
            break;
        case `${prefix}eval`:
            if (!config.developers.includes(message.author.id)) return;

            function cleanString(text) {
                if (typeof(text) == 'string') {
                    return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
                } else {
                    return text;
                }
            }

            try {
                const code = args.join(' ');

                let evaled = eval(code);
                if (typeof evaled != 'string') evaled = require('util').inspect(evaled);

                message.channel.send(cleanString(evaled), {
                    code: 'xl'
                });
            } catch (error) {
                message.channel.send(cleanString(error), {
                    code: 'xl'
                });
            }
            
            break;
        default:
            if (!config.channels.includes(message.channel.id)) return;
            if (DB.get(message.author.id) == undefined) DB.set(message.author.id, 0);
            if (onCooldown) return;
            var number = Math.floor((Math.random() * 100) + 1);
            if (number <= config.rarity) {
                number = Math.floor((Math.random() * 100) + 1);
                onCooldown = true;

                if (number <= 1) {
                    message.channel.send(`🥶 You got caught up in the storm!`).then(message => {
                        message.react(`🥶`).then(msg => {
                            const filter = reaction => reaction.emoji.name == '🥶';
                            message.awaitReactions(filter, { max: 1, time: 10000, errors: ['time'] })
                                .then(collected => {
                                    var person = collected.get('🥶');
                                    person = person.users.cache.filter(id => id != client.user.id).first().id;

                                    setTimeout(function () { onCooldown = false }, config.cooldown * 1000);
                                    setTimeout(function () { message.delete() }, 5000);

                                    var p = DB.get(person);
                                    p += 20;
                                    DB.set(person, p);

                                    message.edit(`🥶 During the storm, <@${person}> caught 20 snowflakes and they now have :snowflake: **${p}** snowflakes.`);

                                    client.channels.fetch(config.logs).then(c => {
                                        c.send(new Discord.MessageEmbed().setDescription(`<@${person}> caught 20 snowflakes. Current count: ${p}`).setColor('#93e7fb').setTimestamp(Date.now()));
                                    })
                                }).catch(err => {
                                    setTimeout(function () { onCooldown = false }, config.cooldown * 1000);
                                    message.delete();
                                })
                        })
                    })
                }
                else if (number <= 5) {
                    message.channel.send(`🐻‍❄️ A wild polar bear appeared! Who wants to fight it for :snowflake: 10 snowflakes?`).then(message => {
                        message.react(`🐻‍❄️`).then(msg => {
                            const filter = reaction => reaction.emoji.name == '🐻‍❄️';
                            message.awaitReactions(filter, { max: 1, time: 10000, errors: ['time'] })
                                .then(collected => {
                                    var person = collected.get('🐻‍❄️');
                                    person = person.users.cache.filter(id => id != client.user.id).first().id;

                                    setTimeout(function () { onCooldown = false }, config.cooldown * 1000);
                                    setTimeout(function () { message.delete() }, 5000);

                                    var p = DB.get(person);

                                    number = Math.floor((Math.random() * 100) + 1);
                                    if (number <= 50) {
                                        if (p <= 10) {
                                            p = 0;
                                            message.edit(`🐻‍❄️ <@${person}> didn't win against the bear and lost all of their snowflakes.`);
                                            client.channels.fetch(config.logs).then(c => {
                                                c.send(new Discord.MessageEmbed().setDescription(`<@${person}> lost ${p} snowflakes. Current count: 0`).setColor('#93e7fb').setTimestamp(Date.now()));
                                            });
                                        } else {
                                            p -= 10;
                                            message.edit(`🐻‍❄️ <@${person}> didn't win against the bear and lost :snowflake: 10 snowflakes. They now have :snowflake: **${p}** snowflakes.`);
                                            client.channels.fetch(config.logs).then(c => {
                                                c.send(new Discord.MessageEmbed().setDescription(`<@${person}> lost 10 snowflakes. Current count: ${p}`).setColor('#93e7fb').setTimestamp(Date.now()));
                                            })
                                        }
                                        DB.set(person, p);
                                    } else {
                                        p += 10;
                                        message.edit(`🐻‍❄️ <@${person}> somehow won against the bear and got 10 snowflakes! They now have :snowflake: **${p}** snowflakes.`);
                                        DB.set(person, p);
                                        client.channels.fetch(config.logs).then(c => {
                                            c.send(new Discord.MessageEmbed().setDescription(`<@${person}> caught 10 snowflakes. Current count: ${p}`).setColor('#93e7fb').setTimestamp(Date.now()));
                                        })
                                    }
                                }).catch(err => {
                                    setTimeout(function () { onCooldown = false }, config.cooldown * 1000);
                                    message.delete();
                                })
                        })
                    })
                }
                else if (number <= 15) {
                    message.channel.send(`🎄 Look! A Christmas tree!`).then(message => {
                        message.react(`🎄`).then(msg => {
                            const filter = reaction => reaction.emoji.name == '🎄';
                            message.awaitReactions(filter, { max: 1, time: 10000, errors: ['time'] })
                                .then(collected => {
                                    var person = collected.get('🎄');
                                    person = person.users.cache.filter(id => id != client.user.id).first().id;

                                    setTimeout(function () { onCooldown = false }, config.cooldown * 1000);
                                    setTimeout(function () { message.delete() }, 5000);

                                    var p = DB.get(person);
                                    p += 5;
                                    DB.set(person, p);

                                    message.edit(`🎄 <@${person}> just found 5 snowflakes under the tree! They now have :snowflake: **${p}** snowflakes.`);

                                    client.channels.fetch(config.logs).then(c => {
                                        c.send(new Discord.MessageEmbed().setDescription(`<@${person}> caught 5 snowflakes. Current count: ${p}`).setColor('#93e7fb').setTimestamp(Date.now()));
                                    })
                                }).catch(err => {
                                    setTimeout(function () { onCooldown = false }, config.cooldown * 1000);
                                    message.delete();
                                })
                        })
                    })
                }
                else {
                    message.channel.send(`❄️ A wild snowflake appeared!`).then(message => {
                        message.react(`❄️`).then(msg => {
                            const filter = reaction => reaction.emoji.name == '❄️';
                            message.awaitReactions(filter, { max: 1, time: 10000, errors: ['time'] })
                                .then(collected => {
                                    var person = collected.get('❄️');
                                    person = person.users.cache.filter(id => id != client.user.id).first().id;

                                    var p = DB.get(person);
                                    if (p == undefined) p = 1;
                                    else p += 1;
                                    DB.set(person, p);

                                    message.edit(`❄️ <@${person}> caught the snowflake! They now have ❄️ **${p}** snowflakes.`);

                                    setTimeout(function () { onCooldown = false }, config.cooldown * 1000);
                                    setTimeout(function () { message.delete() }, 5000);
                                    client.channels.fetch(config.logs).then(c => {
                                        c.send(new Discord.MessageEmbed().setDescription(`<@${person}> caught a snowflake. Current count: ${p}`).setColor('#93e7fb').setTimestamp(Date.now()));
                                    })
                                }).catch(err => {
                                    setTimeout(function () { onCooldown = false }, config.cooldown * 1000);
                                    message.delete();
                                })
                        })
                    })
                }
            }
    }
})

client.on('error', error => {
    console.error(error);
})

client.login(config.token);
