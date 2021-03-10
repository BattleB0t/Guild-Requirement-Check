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
            name: "Requirements",
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
        ].join('\n')
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
  else if (cmd === 'h' || cmd === 'help'){
    message.reply(helpEmbed.setColor(message.guild.me.displayHexColor))
  }
});

client.login(config.token);

async function rankTest(ign){
    const apidata = await getApiData(ign);

    if(apidata.data.skills.apiEnabled === false){
        return apiOffEmbed.setAuthor(ign, `https://cravatar.eu/helmavatar/${ign}/600.png`, `http://sky.shiiyu.moe/stats/${ign}`)
        .setDescription(`\`${ign}\` doesn't have skills api enabled. Please enable it then try again`)
        .setTimestamp();
    }

    var reqsMet = 0;
    if(apidata.data.slayers.total_experience >= config.requirements.slayer) reqsMet++;
    if(apidata.data.skills.average_skills >= config.requirements.skills) reqsMet++;
    if(apidata.data.dungeons.types.catacombs.level >= config.requirements.catacombs) reqsMet++;
    if(apidata.data.slayers.total_experience >= config.requirements.bypasses.slayer) reqsMet++;
    if(apidata.data.skills.average_skills >= config.requirements.bypasses.skills) reqsMet++;
    if(apidata.data.dungeons.types.catacombs.level >= config.requirements.bypasses.catacombs) reqsMet++;

    if(reqsMet >= 3){
        return acceptedEmbed.setAuthor(ign, `https://cravatar.eu/helmavatar/${ign}/600.png`, `http://sky.shiiyu.moe/stats/${ign}`)
        .setTimestamp();
    } else{
        return deniedEmbed.setAuthor(ign, `https://cravatar.eu/helmavatar/${ign}/600.png`, `http://sky.shiiyu.moe/stats/${ign}`)
        .setDescription(`Sorry but you meet ${reqsMet}/3 requirements or bypasses.\nCurrent requirements:`)
        .setTimestamp();
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
