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
            `${config.prefix}check <ign>`,
            `${config.prefix}c <ign>`,
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
    /*{
        name: "Bypasses",
        value: [
            `Slayer: ${config.requirements.bypasses.slayer}`,
            `Skills: ${config.requirements.bypasses.skills}`
            `Catacombs: ${config.requirements.bypasses.catacombs}`
        ].join('\n'),
        inline: true
    }*/
)

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
    } catch(e) {
        var result = `Error caught: \`${e}\``
    }
    return message.channel.send(result);
  }
  else if (cmd === 'h' || cmd === 'help'){

  }
});

client.login(config.token);

async function rankTest(ign){
    const apidata = await getApiData(ign);

    if(apidata.data.skills.apiEnabled === false){
        return `User \`${ign}\` doesn't have skills api enabled.`
    }

    try{
        var meetsSlayer = (apidata.data.slayers.total_experience >= config.requirements.slayer)
    } catch{
        var meetsSlayer = false;
    }
    try{
        var meetsSkill = (apidata.data.skills.average_skills >= config.requirements.skills)
    } catch{
        var meetsSkill = false;
    }
    try{
        var meetsCata = (apidata.data.dungeons.types.catacombs.level >= config.requirements.catacombs)
    } catch{
        var meetsCata = false;
    }
    console.log(chalk.yellow(`User ${ign}:\nSlayer: ${meetsSlayer}\nSkills: ${meetsSkill}\nCatacombs: ${meetsCata}`)) //normal req stuff

    try{
        var meetsSlayerBypass = (apidata.data.slayers.total_experience >= config.requirements.bypasses.slayer)
    } catch{
        var meetsSlayerBypass = false;
    }
    try{
        var meetsSkillBypass = (apidata.data.skills.average_skills >= config.requirements.bypasses.skills)
    } catch{
        var meetsSkillBypass = false;
    }
    try{
        var meetsCataBypass = (apidata.data.dungeons.types.catacombs.level >= config.requirements.bypasses.catacombs)
    } catch{
        var meetsCataBypass = false;
    }
    console.log(chalk.blueBright(`Slayer Bypass: ${meetsSlayerBypass}\nSkills Bypass: ${meetsSkillBypass}\nCatacombs Bypass: ${meetsCataBypass}`)) //bypass stuff

    var embed = new Discord.MessageEmbed()
    .setTitle(`User: ${ign}`)
    .setColor('F42069')
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
