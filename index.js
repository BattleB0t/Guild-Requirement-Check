const Discord = require('discord.js');
const chalk = require('chalk')
const fetch = require('node-fetch');
const config = require('./config.json');

const client = new Discord.Client();

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
            `Slayer: ${config.requirements.slayer}`,
            `Skills: ${config.requirements.skills}`,
            `Catacombs: ${config.requirements.catacombs}`
        ].join('\n'),
        inline: true
    },
    {
        name: "Bypasses",
        value: [
            `Slayer: ${config.requirements.bypasses.slayer}`,
            `Skills: ${config.requirements.bypasses.skills}`,
            `Catacombs: ${config.requirements.bypasses.catacombs}`
        ].join('\n'),
        inline: true
    }
)
.setFooter('Made by neyoa ❤')
.setTimestamp();

const errorEmbed = new Discord.MessageEmbed()
.setTitle('Error!')
.setDescription([`Something went wrong - this usually means you don't meet requirements and have a null value in the API.`,
`We'll check if you meet requirements manually for you now.`].join('\n'))
.setColor('FF0000')
.setFooter('Made by neyoa ❤')
.setTimestamp();

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
    message.react('✔️');
    try{
        var result = await rankTest(args[0]);
    } catch{
        var result = errorEmbed;
    }
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
        return {
            embed: {
              title: `API Error`,
              description: `\`${ign}\` doesn't have skills api enabled. Please enable it then try again`,
              color: 'ffa500',
              timestamp: new Date(),
              footer: {
                text: 'Made by neyoa ❤',
              },
            },
          }
    }

    var meetsSlayer = (apidata.data.slayers.total_experience >= config.requirements.slayer)
    var meetsSkill = (apidata.data.skills.average_skills >= config.requirements.skills)
    var meetsCata = (apidata.data.dungeons.types.catacombs.level >= config.requirements.catacombs)
    var meetsSlayerBypass = (apidata.data.slayers.total_experience >= config.requirements.bypasses.slayer)
    var meetsSkillBypass = (apidata.data.skills.average_skills >= config.requirements.bypasses.skills)
    var meetsCataBypass = (apidata.data.dungeons.types.catacombs.level >= config.requirements.bypasses.catacombs)

    var reqsMet = 0;
    if(meetsSlayer) reqsMet++;
    if(meetsSkill) reqsMet++;
    if(meetsCata) reqsMet++;
    if(meetsSlayerBypass) reqsMet++;
    if(meetsSkillBypass) reqsMet++;
    if(meetsCataBypass) reqsMet++;

    var embed = new Discord.MessageEmbed()
    .setTitle(`User: ${ign}`)
    .addFields(
        {
            name: `Normal Requirements`,
            value: [
                `Slayer: ${meetsSlayer}`,
                `Skills: ${meetsSkill}`,
                `Catacombs: ${meetsCata}`
            ].join('\n'),
            inline: true,
        },
        {
            name: `Bypasses`,
            value: [
                `Slayer: ${meetsSlayerBypass}`,
                `Skills: ${meetsSkillBypass}`,
                `Catacombs: ${meetsCataBypass}`
            ].join('\n'),
            inline: true,
        }
    )
    .setFooter(`${config.prefix}check <ign>`)
    .setTimestamp();

    if(reqsMet >= 3){
        embed.setDescription([
            `You meet the requirements to join the guild!`,
            `Please make sure you aren't currently in a guild and set guild invites privacy settings to low`,
            `Welcome!`
        ].join('\n'))
        embed.setColor('32CD32')
    } else{
        embed.setDescription([
            `Sorry, you only meet ${reqsMet} out of 3 needed requirements`,
            `You can view the current requirements and bypasses by running \`${config.prefix}help\``
        ].join('\n'))
        embed.setColor('DC143C')
    }
    return embed;
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
