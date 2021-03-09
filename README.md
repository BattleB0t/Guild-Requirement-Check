# Guild Requirement Checker

A discord bot to check if someone meets skyblock requirements for a hypixel guild.

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
- If yes invite user to guild via the [hypixel-discord-chat-bridge](https://github.com/Senither/hypixel-discord-chat-bridge)
    - Prevents staff needing to manually invite
- Add commands to change the requirements
    - Something like `-setreq catacombs 30` and `-setbypass catacombs 40`