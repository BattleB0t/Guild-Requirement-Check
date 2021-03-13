const Discord = require('discord.js');
const chalk = require('chalk')
const fetch = require('node-fetch');
const config = require('./config.json');

const client = new Discord.Client();

const acceptedEmbed = new Discord.MessageEmbed()
    .setTitle(`Accepted!`)
    .setColor(`32CD32`)
    .setDescription([
        `You meet the requirements to join the guild!`,
        `Before we invite you please make sure you:`,
        `- Aren't currently in a guild`,
        `- Have guild invites privacy settings on low`,
        `- Are able to accept the invite`
    ].join('\n'))
    .setFooter(`Made by neyoa ❤`);

const deniedEmbed = new Discord.MessageEmbed()
    .setTitle(`Denied.`)
    .setColor(`DC143C`)
    .addFields(
        {
            name: "Current Requirements",
            value: [
                `Slayer: ${config.requirements.slayer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
                `Skills: ${config.requirements.skills}`,
                `Catacombs: ${config.requirements.catacombs}`
            ].join('\n'),
            inline: true
        },
        {
            name: "Bypasses",
            value: [
                `Slayer: ${config.requirements.bypasses.slayer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
                `Skills: ${config.requirements.bypasses.skills}`,
                `Catacombs: ${config.requirements.bypasses.catacombs}`
            ].join('\n'),
            inline: true
        }
    )
.setFooter(`If you think this is wrong we'll check manually for you`)
.setTimestamp();

const helpEmbed = new Discord.MessageEmbed()
.setTitle('Help')
.addFields(
    {
        name: "Check Player",
        value: [
            `\`${config.prefix}check <ign>\``,
            `\`${config.prefix}c <ign>\``,
            `Checks if the specified player meets the current guild requirements`
        ].join('\n'),
        inline: true
    },
    {
        name: "Check Weight",
        value: [
            `\`${config.prefix}weight <ign>\``,
            `\`${config.prefix}we <ign>\``,
            `Gets the specified player's weight`
        ].join('\n'),
        inline: true
    },
    {
        name: "",
        value: ""
    },
    {
        name: "Current requirements",
        value: [
            `Slayer: ${config.requirements.slayer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
            `Skills: ${config.requirements.skills}`,
            `Catacombs: ${config.requirements.catacombs}`
        ].join('\n'),
        inline: true
    },
    {
        name: "Bypasses",
        value: [
            `Slayer: ${config.requirements.bypasses.slayer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
            `Skills: ${config.requirements.bypasses.skills}`,
            `Catacombs: ${config.requirements.bypasses.catacombs}`
        ].join('\n'),
        inline: true
    }
)
.setFooter('Made by neyoa ❤');

const errorEmbed = new Discord.MessageEmbed()
.setTitle('Error!')
.setDescription([`Something went wrong - this usually means you don't meet requirements and have a null value in the API.`,
`We'll check if you meet requirements manually for you now.`].join('\n'))
.setColor('FF0000')
.setFooter('Made by neyoa ❤');

const apiOffEmbed = new Discord.MessageEmbed()
.setTitle(`API Error`)
.setColor('FFA500')
.setFooter('Made by neyoa ❤');

client.once('ready', () => {
  console.log(chalk.greenBright(`Logged in as ${client.user.username}!`));
  client.user.setActivity('new guild members.', { type: 'WATCHING' });
});

client.on('message', async message => {
  if (message.author.bot || !message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();

  if (cmd === 'c' || cmd === 'check') {
    if (!args[0]) return message.channel.send('Please provide a user to check.');
    message.react('819138970771652609');
    try{
        var result = await rankTest(args[0]);
    } catch{
        var result = errorEmbed.setTimestamp();
    }
    message.reactions.cache.get('819138970771652609').remove().catch(error => console.error('Failed to remove loading reaction: ', error));
    return message.channel.send(result);
  } 
  else if (cmd === 'we' || cmd === 'weight'){
    if(!args[0]) return message.channel.send('Please provide a user to check.')
	message.react('819138970771652609');
    var result = await getWeight(args[0]);
	message.reactions.cache.get('819138970771652609').remove().catch(error => console.error('Failed to remove loading reaction: ', error))
	return message.channel.send(result);
  }
  else if (cmd === 'h' || cmd === 'help'){
    message.reply(helpEmbed.setColor(message.guild.me.displayHexColor))
  }
});

client.login(config.token);

async function rankTest(ign){
    const apiData = await getApiData(ign);

    if(apiData.data.skills.apiEnabled === false){
        return apiOffEmbed.setAuthor(ign, `https://cravatar.eu/helmavatar/${ign}/600.png`, `http://sky.shiiyu.moe/stats/${ign}`)
        .setDescription(`\`${ign}\` doesn't have skills api enabled. Please enable it then try again`)
        .setTimestamp();
    }

    var reqsMet = 0;
    if(apiData.data.slayers.total_experience >= config.requirements.slayer) reqsMet++;
    if(apiData.data.skills.average_skills >= config.requirements.skills) reqsMet++;
    if(apiData.data.dungeons.types.catacombs.level >= config.requirements.catacombs) reqsMet++;
    if(apiData.data.slayers.total_experience >= config.requirements.bypasses.slayer) reqsMet++;
    if(apiData.data.skills.average_skills >= config.requirements.bypasses.skills) reqsMet++;
    if(apiData.data.dungeons.types.catacombs.level >= config.requirements.bypasses.catacombs) reqsMet++;

    if(reqsMet >= 3){
        return acceptedEmbed.setAuthor(ign, `https://cravatar.eu/helmavatar/${ign}/600.png`, `http://sky.shiiyu.moe/stats/${ign}`)
        .setTimestamp();
    } else{
        let denial = deniedEmbed;
        denial.setAuthor(ign, `https://cravatar.eu/helmavatar/${ign}/600.png`, `http://sky.shiiyu.moe/stats/${ign}`)
        .setDescription([`Sorry but you meet ${reqsMet}/3 requirements or bypasses.`,
        ``,
        `**Your stats:**`,
        `Slayer: ${apiData.data.slayers.total_experience.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
        `Skills: ${apiData.data.skills.average_skills.toString().substr(0, 4)}`,
        `Catacombs: ${apiData.data.dungeons.types.catacombs.level.toString().substr(0, 4)}`
        ].join('\n'))
        .setTimestamp();
        return denial;
    }
}

async function getApiData(ign) {
  const uuidWithDash = await getUUID(ign);
  const url = `https://hypixel-api.senither.com/v1/profiles/${uuidWithDash}/save?key=${config.apiKey}`;
  const response = await fetch(url);
  const result = await response.json();
  return result;
}

async function getUUID(ign){
    const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${ign}`);
    const result = await response.json();
    const uuid = result.id;
    return uuid.substr(0,8)+"-"+uuid.substr(8,4)+"-"+uuid.substr(12,4)+"-"+uuid.substr(16,4)+"-"+uuid.substr(20);
}

async function getWeight(ign){
    const apiData = await getApiData(ign);
	if (apiData.status != 200) return new Discord.MessageEmbed().setColor('DC143C').setDescription(`API Error: \`${apiData.status}\``); 

	return new Discord.MessageEmbed()
	.setAuthor(ign, `https://cravatar.eu/helmavatar/${ign}/600.png`, `https://sky.shiiyu.moe/stats/${ign}`)
	.setColor('69e0a5')
	.setDescription(`${ign}'s weights for their **${apiData.data.name}** profile are **${roundNumber(apiData.data.weight)} + ${roundNumber(apiData.data.weight_overflow)} Overflow (${roundNumber(apiData.data.weight) + roundNumber(apiData.data.weight_overflow)} Total)**`)
    .addFields(
        {
            name: `Skills Weight: ${roundNumber(apiData.data.skills.weight)} + ${roundNumber(apiData.data.skills.weight_overflow)} Overflow (${roundNumber(apiData.data.skills.weight) + roundNumber(apiData.data.skills.weight_overflow)} Total)`,
            value: '```ruby\n' + [
                `Mining     > Lvl: ${roundNumber(apiData.data.skills.mining.level)}     Weight: ${roundNumber(apiData.data.skills.mining.weight)}`,
                `Enchanting > Lvl: ${roundNumber(apiData.data.skills.enchanting.level)} Weight: ${roundNumber(apiData.data.skills.enchanting.weight)}`,
                `Farming    > Lvl: ${roundNumber(apiData.data.skills.farming.level)}    Weight: ${roundNumber(apiData.data.skills.farming.weight)}`,
                `Combat     > Lvl: ${roundNumber(apiData.data.skills.combat.level)}     Weight: ${roundNumber(apiData.data.skills.combat.weight)}`,
                `Fishing    > Lvl: ${roundNumber(apiData.data.skills.fishing.level)}    Weight: ${roundNumber(apiData.data.skills.fishing.weight)}`,
                `Alchemy    > Lvl: ${roundNumber(apiData.data.skills.alchemy.level)}    Weight: ${roundNumber(apiData.data.skills.alchemy.weight)}`,
                `Taming     > Lvl: ${roundNumber(apiData.data.skills.taming.level)}     Weight: ${roundNumber(apiData.data.skills.taming.weight)}`
            ].join('\n') + '\n```'
        },
        {
            name: `Slayer Weight: ${roundNumber(apiData.data.slayers.weight)} + ${roundNumber(apiData.data.slayers.weight_overflow)} Overflow (${roundNumber(apiData.data.slayers.weight) + roundNumber(apiData.data.slayers.weight_overflow)} Total)`,
            value: '```ruby\n' + [
                `Revenant   > Exp: ${roundNumber(apiData.data.slayers.bosses.revenant.experience)}      Weight: ${roundNumber(apiData.data.slayers.bosses.revenant.weight)}`,
                `Tarantula  > Exp: ${roundNumber(apiData.data.slayers.bosses.tarantula.experience)}     Weight: ${roundNumber(apiData.data.slayers.bosses.tarantula.weight)}`,
                `Sven       > Exp: ${roundNumber(apiData.data.slayers.bosses.sven.experience)}          Weight: ${roundNumber(apiData.data.slayers.bosses.sven.weight)}`
            ].join('\n') + '\n```'
        },
        {
            name: `Dungeon Weight: ${roundNumber(apiData.data.dungeons.weight)} + ${roundNumber(apiData.data.dungeons.weight_overflow)} Overflow (${roundNumber(apiData.data.dungeons.weight) + roundNumber(apiData.data.dungeons.weight_overflow)} Total)`,
            value: '```ruby\n' + [
                `Catabombs  > Lvl: ${roundNumber(apiData.data.dungeons.types.catacombs.level)}          Weight: ${roundNumber(apiData.data.dungeons.types.catacombs.weight)}`,
                `Healer     > Lvl: ${roundNumber(apiData.data.dungeons.classes.healer.level)}           Weight: ${roundNumber(apiData.data.dungeons.classes.healer.weight)}`,
                `Mage       > Lvl: ${roundNumber(apiData.data.dungeons.classes.mage.level)}             Weight: ${roundNumber(apiData.data.dungeons.classes.mage.weight)}`,
                `Berserker  > Lvl: ${roundNumber(apiData.data.dungeons.classes.berserker.level)}        Weight: ${roundNumber(apiData.data.dungeons.classes.berserker.weight)}`,
                `Tank       > Lvl: ${roundNumber(apiData.data.dungeons.classes.tank.level)}             Weight: ${roundNumber(apiData.data.dungeons.classes.tank.weight)}`
            ].join('\n') + '\n```'
        }
    )
}

function roundNumber(number){
    return Math.round((number + Number.EPSILON) * 100) / 100
}