import * as Common from './common';
import WebSocket from 'ws';
import EventEmitter from 'node:events';

/*eslint-disable */
function getEnumKeyByEnumValue(myEnum: any, enumValue: number): string | null { // {[key: string]: Common.OperationCodes}
	const keys = Object.keys(myEnum).filter(x => myEnum[x] == enumValue);
	return keys.length > 0 ? keys[0] : null;
}

const messageHandlers: { [key: number]: (client: Client, data?: any, debugOptions?: Common.ClientDebugOptions) => void } = {
	/*eslint-enable */
	[Common.OperationCodes.AUTHENTICATE]: (client: Client) => {
		client.ws?.send(JSON.stringify({
			op: Common.OperationCodes.AUTHENTICATE,
			d: {
				connectAs: client.authOptions.connectAs ?? 'application',
				applicationId: client.authOptions.id,
				applicationSecret: client.authOptions.secret
			}
		}));
	},
	[Common.OperationCodes.AUTH_SUCCESS]: (client: Client, data: Common.ServerResponseAuthSuccess, debugOptions?: Common.ClientDebugOptions) => {
		client.connected = true;
		client.emit('debug', `Successfully authenticated with application "${data.name}" (${client.authOptions.id})`);
		if (debugOptions?.logHeartbeat) client.emit('debug', 'Heartbeat interval set to ' + data.heartbeatInterval);
		setInterval(() => {
			client.ws?.send(JSON.stringify({
				op: Common.OperationCodes.HEARTBEAT
			}));
			if (debugOptions?.logHeartbeat) client.emit('debug', 'Heartbeat sent');
		}, data.heartbeatInterval);
		return data;
	},
	[Common.OperationCodes.ERROR]: (client: Client, data: Common.ServerResponseError) => {
		if (!client.connected) throw Error(data.error), client.emit('debug', 'Failed to authenticate');
		return data;
	},

	[Common.OperationCodes.GUILD_INTERACTION]: (client: Client, data: Common.InteractionInfo) => {
		return new DashboardRequestInteraction(client, { interactionId: data.interactionId, guildId: data.guildId });
	},

	[Common.OperationCodes.MODIFY_GUILD_DATA]: (client: Client, data: Common.GuildDataChangeInfo) => {
		return new DashboardInteraction(client, data);
	}

};

/**
 * Represents an authenticated client for Bot Panel
 * @constructor
*/
export class Client extends EventEmitter {
	/**
	 * Authentication information for the WebSocket
	 */
	authOptions: Common.AuthenticationData;
	/**
	 * Client WebSocket
	 */
	ws: undefined | WebSocket;
	/**
	 * Whether the Client is currently connected to the WebSocket
	 */
	connected: boolean = false;
	/**
	 * Options for debugging BotPanel.js
	 */
	debugOptions: undefined | Common.ClientDebugOptions;
	/**
	 * @param options Authentication options
	*/
	constructor(options: Common.AuthenticationData, debugOptions?: Common.ClientDebugOptions) {
		super();
		this.authOptions = options;
		this.debugOptions = debugOptions;
	}
	/**
	 * Connect to the BotPanel WebSocket and login
	 */
	async login() {
		try {
			const ws = new WebSocket('wss://botpanel.xyz/api/ws');
			this.ws = ws;
			this.connected = false;

			ws.on('open', () => {
				this.emit('debug', 'Dashboard initialized.');
			});
			ws.on('close', () => {
				this.connected = false;
				this.emit('debug', 'Dashboard closed.');
				this.emit('close');
				return false;
			});

			ws.on('message', (message: string) => {
				const data: Common.ServerMessage = JSON.parse(message);

				this.emit('debug', `Message received: ${message}`);

				let dataToSend;
				const v = messageHandlers[data.op];
				if (!v) return;

				try {
					dataToSend = v(this, data.d, this.debugOptions);
				} catch (err) {
					this.emit('debug', `Error: [${Common.OperationCodes[data.op]}]: ${err}`);
				}

				this.emit(getEnumKeyByEnumValue(Common.OperationCodes, data.op) ?? data.op.toString(), dataToSend);
			});
			
		} catch (err) {
			this.emit('debug', 'Failed to connect: ' + err);
			throw err;
		}
	}

	/**
	 * Closes the WebSocket connection
	 */
	disconnect() {
		if (this.connected) this.ws?.close();
	}

}

export class BaseInteraction {
	client: Client;
	/**
	 * Assigned ID for the interaction
	 */
	id: Common.GuildDataChangeInfo['interactionId'] | null;
	/**
	 * ID of the guild involved with the interaction
	 */
	guildId: Common.GuildDataChangeInfo['guildId'];
	constructor(client: Client, options: Common.InteractionInfo) {
		this.client = client;
		this.id = options.interactionId;
		this.guildId = options.guildId;
	}
}

/**
 * Guild information request interaction
*/
export class DashboardRequestInteraction extends BaseInteraction {
	constructor(client: Client, options: Common.InteractionInfo) {
		super(client, options);
	}
	/**
	 * Send an interaction response containing guild information
	 * @param data Guild info
	 */
	async send(info: Common.GuildRequestResponse) {
		info.data = info.data ?? {};
		for (const [key, value] of Object.entries(info.data)) {
			info.data[key] = value.toString();
		}
		await new Promise((resolve) => {
			this.client.ws?.send(JSON.stringify({
				op: Common.OperationCodes.REQUEST_GUILD_DATA,
				d: {
					interactionId: this.id,
					data: info.data,
					inGuild: info.inGuild,
					textChannels: info.textChannels ?? [],
					voiceChannels: info.voiceChannels ?? [],
					categories: info.categories ?? [],
					roles: info.roles ?? [],
				}
			}), resolve);
		});
	}
}

/**
 * Dashboard changed interaction
*/
export class DashboardInteraction extends BaseInteraction {
	/**
 	* ID of the user that initiated the interaction
	*/
	userId: string;
	/**
 	* Dashboard input that was changed
	*/
	input: {
		type: Common.GuildDataChangeInfo['inputType'],
		name: Common.GuildDataChangeInfo['varname'],
		value: Common.GuildDataChangeInfo['data']
	};
	rawData: Common.GuildDataChangeInfo;
	constructor(client: Client, options: Common.GuildDataChangeInfo) {
		super(client, options);
		let newValue: Common.GuildData = options.data;
		if (typeof options.data == 'string') newValue = options.inputType == Common.ComponentType.Checkbox || options.inputType == Common.ComponentType.Select ? options.data.split(',') : options.data;
		this.userId = options.userId;
		this.input = {
			type: options.inputType,
			name: options.varname,
			value: newValue
		};
		this.rawData = options;
	}
	/**
 	* Sends an interaction response indicating if the change was successful
	* @param success Was the change successful? (this will be shown to the user)
	*/
	async acknowledge(success: boolean = true) {
		if (!this.id) throw Error('Interaction already acknowledged');
		await new Promise((resolve) => {
			this.client.ws?.send(JSON.stringify({
				op: Common.OperationCodes.ACKNOWLEDGE_INTERACTION,
				d: {
					interactionId: this.id,
					success,
					key: this.rawData.varname,
					value: this.rawData.data
				}
			}), resolve);
		});
		this.id = null;
	}
}

export * from './common';