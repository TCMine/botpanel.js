# <img src="https://github.com/TCMine/botpanel.js/assets/32180878/0a68087d-e9e5-43fd-9a92-d2cee58f5cef" alt="drawing" width="50"/> BotPanel.js
![NPM Version](https://img.shields.io/npm/v/botpanel.js) ![NPM Unpacked Size](https://img.shields.io/npm/unpacked-size/botpanel.js) ![GitHub License](https://img.shields.io/github/license/tcmine/botpanel.js) ![finbar](https://img.shields.io/badge/finbar%20approved-%28probably%29-red)

BotPanel.js is a simple JavaScript/TypeScript library for integrating Discord bots with [Bot Panel](https://botpanel.xyz), the bot dashboard creation platform.

## Example Usage

### Creating and authenticating a client
Import `Client` and construct it using your application's authentication info, then use "`.login()`" to connect to the WebSocket and authenticate.

```ts
import { Client } from 'botpanel.js'; // CommonJS/require also supported

const client = new Client({id: id, secret: secret});
client.login();
```

### Receiving events
You can add an event listener for each of the following events. These event names can be seen through the "`OperationCodes`" enumerator.<br>
`GUILD_INTERACTION` - Guild dashboard is accessed and requesting data<br>
`MODIFY_GUILD_DATA` - Guild data modified from dashboard<br>
`ERROR` - Error from the WebSocket server<br>
*+ `AUTHENTICATE` & `AUTH_SUCCESS`*

```ts
client.on('GUILD_INTERACTION', (interaction: DashboardRequestInteraction) => {
    // ...
});
```

### Interactions
Below are examples for handling two types of interactions.

`Dashboard Request Interaction` (emitted through `GUILD_INTERACTION`):
```ts
client.on('GUILD_INTERACTION', (interaction: DashboardRequestInteraction) => {
  const guildData: object | undefined = allGuildData[interaction.guildId];
  const isBotInGuild: boolean = true;
  interaction.send({
    inGuild: isBotInGuild,
    data: guildData,
  });
});
```
> The ID of the accessed guild can be accessed from the interaction (`guildId`).<br>
> Use `.send()` to return an object of the requested guild information. This must be used for every guild interaction event or no dashboard will be shown.<br>
>> The entries shown are as followed:<br>
>> `inGuild` : Whether the bot is in the guild or not. If this is false, the dashboard will display a message to the user instead of the dashboard's inputs.<br>
>> `data` : Object containing entries with the input names as keys and their input values as values. If present, this will be used to display the currently set data on the dashboard.

`Dashboard Change Interaction` (emitted through `MODIFY_GUILD_DATA`):
```ts
client.on('MODIFY_GUILD_DATA', (interaction: DashboardChangeInteraction) => {
    if (interaction.input.type == ComponentType.Text && interaction.input.value.length < 6) return interaction.acknowledge(false);
    allGuildData[interaction.guildId][interaction.input.name] = interaction.input.value;
    interaction.acknowledge();
    console.log(`User (${interaction.userId}) changed guild data "${interaction.input.name}"!`);
});
```
> These interactions hold the ID of the guild (`guildId`), dashboard user (`userId`) and information of the input, such as the `name`, `type` and `value`, inside an object (`input`).<br>
>  The interaction is acknowledged with the `.acknowledge()` method to display a success message. `false` can be used as a parameter to display an error message to the user instead.

### Disconnecting the client
The client can be disconnected with `.disconnect()`.

```ts
client.disconnect();
```

## Information
Bot Panel is made by @oneandonlyfinbar & @bunnywasnothere. You can join their Discord server here: https://discord.gg/RdPTks5gd9<br>
This module is not affiliated or created by the developers of Bot Panel.
