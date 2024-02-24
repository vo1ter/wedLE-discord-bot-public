## Setting up the bot (linux + pm2)

1. First at all, install reqs:
    * Node.js v16.9.0+
    * npm that matches your node version
    * pm2
2. Copy this repo on your machine:
    * I'm recommending doing all this stuff in your /home dir
    ```bash
    git clone https://github.com/vo1ter/wedLE-discord-bot
    ```
3. Install node.js packages
    ```bash
    cd wedLE-discord-bot
    npm i
    ```
4. Create config file:
    ```json
    {
        "token": "* your bot token from https://discord.com/developers *",
        "devGuildId": "* your testing guild id *",
        "clientId": "* your application id from Discord Developer Portal *",
        "ticketChannelId": "* your ticket creation channel id *",
        "welcomeChannelId": "* your welcome channel id *",
        "ticketResultChannelId": "* your ticket accept/decline result channel id *",
        "ticketLogChannelId": "* your ticket log (user's info) channel id *",
        "playerRoleId": "* your accepted player role id *"
    }
    ```
5. Deploy commands:
    ```bash
    node deploy-commands.js
    ```
6. Launch your bot with pm2:
    ```bash
    pm2 start bot.js
    ```
6. Done!

## ToDo
- [ ] Moderation commands
- [ ] Server status in bio/news channel desc
- [x] Whitelist applications
- [ ] Actions on guildMemberRemove