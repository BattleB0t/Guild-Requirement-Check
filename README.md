# Guild Requirement Checker

> A discord bot to check if someone meets skyblock requirements for a hypixel guild.

### Table of Content

- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Roadmap](#roadmap)

### Prerequisites
- Git
- NodeJS >= 14
- Yarn >= 1.2

### Installation & Setup

Firstly clone the repository using:
```
https://github.com/itsneyoa/Guild-Requirement-Check.git
```
Then go into the `Guild-Requirement-Check` folder:
```
cd Guild-Requirement-Check
```
Install all the dependencies using Yarn:
```
yarn
```
While the dependencies are being installed you can copy the configuration file.
```
cp config.example.json config.json
```
Configure the config file with all the details:
```
nano config.json
```
Finally you can run the program:
```
node index.js
```

### Configuration
- `Prefix` is the prefix the bot will use
- `Token` is the token for the discord bot.
    - If you don't already have a Discord App, you can [create a new app](https://discord.com/developers), then convert the app to a Discord bot, and then get your Discord bot token on the "Bot" page.
- `apiKey` is your hypixel api key, run `/api new` ingame if you don't already have one
- `Requirements`
    - `Slayer` - Minimum total slayer exp needed to be accepted
    - `Skills` - Minimum average skill level needed to be accepted
    - `Catacombs` - Minimum catacombs level needed to be accepted
    - `Bypasses`
        - `Slayer` - Minimum total slayer exp needed to bypass another requirement
        - `Skills` - Minimum average skill level needed to bypass another requirement
        - `Catacombs` - Minimum catacombs level needed to bypass another requirement

### Roadmap
- Add staff player heads as reaction emojis, players can click these to ping the staff
    - Thanks `EnderxGaming#9887` :)
- If yes invite user to guild via the [hypixel-discord-chat-bridge](https://github.com/Senither/hypixel-discord-chat-bridge)
    - Prevents staff needing to manually invite
- Add commands to change the requirements
    - Something like `-setreq catacombs 30` and `-setbypass catacombs 40`
- Add loading embed while api data is being fetched
    - No idea how but I'll figure it out ¯\_(ツ)_/¯
- Rewrite to include a command handler
    - Am I ever gonna do this? Probably not.