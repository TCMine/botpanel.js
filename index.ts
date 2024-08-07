import * as Common from './common';
import WebSocket from 'ws';
import EventEmitter from 'node:events';

/*eslint-disable */
// ts wont shut up if I put any type other than "any" for this or the messageHandlers. maybe theres a way to fix this, but I don't know it.
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
				applicationSecret: client.authOptions.secret,
				version: client.authOptions.wssVersionOverride ?? Common.BP_VERSION
			}
		}));
	},
	[Common.OperationCodes.AUTH_SUCCESS]: (client: Client, data: Common.ServerResponseAuthSuccess, debugOptions?: Common.ClientDebugOptions) => {
		client.connected = true;
		client.emit('debug', `Successfully authenticated with application "${data.name}" (${client.authOptions.id})`);
		if (debugOptions?.logHeartbeat) client.emit('debug', 'Heartbeat interval set to ' + data.heartbeatInterval);
		client.heartbeatInterval = setInterval(() => {
			client.ws?.send(JSON.stringify({
				op: Common.OperationCodes.HEARTBEAT
			}));
			if (debugOptions?.logHeartbeat) client.emit('debug', 'Heartbeat sent');
		}, data.heartbeatInterval);
		return data;
	},
	[Common.OperationCodes.ERROR]: (client: Client, data: Common.ServerResponseError) => {
		if (!client.connected) client.emit('debug', 'Failed to authenticate');
		let error = data.error;
		if (error.toLowerCase().includes('invalid websocket version')) error = 'Outdated WebSocket server version. Please update BotPanel.js.';
		throw Error(error);
	},
	[Common.OperationCodes.GUILD_INTERACTION]: (client: Client, data: Common.GuildRequestInfo) => {
		return new DashboardRequestInteraction(client, { interactionId: data.interactionId, guildId: data.guildId, include: data.include });
	},
	[Common.OperationCodes.MODIFY_GUILD_DATA]: (client: Client, data: Common.GuildDataChangeInfo) => {
		return new DashboardChangeInteraction(client, data);
	}

};

/**
 * Represents a client for Bot Panel
 * @constructor
*/
export class Client extends EventEmitter {
	/** Authentication information for the client */
	authOptions: Common.AuthenticationData;
	/** Client WebSocket  */
	ws: undefined | WebSocket;
	/** Whether the client is currently connected to the WebSocket */
	connected: boolean = false;
	/** Options for debugging BotPanel.js */
	debugOptions: undefined | Common.ClientDebugOptions;
	heartbeatInterval: undefined | NodeJS.Timeout;

	/**
	 * @param options Authentication options
	*/
	constructor(options: Common.AuthenticationData, debugOptions?: Common.ClientDebugOptions) {
		super();
		this.authOptions = options;
		this.debugOptions = debugOptions;
	}

	/** Connects to the Bot Panel WebSocket and login */
	async login() {
		return new Promise<WebSocket | null>((resolve) => {
			try {
				const ws = new WebSocket(this.authOptions.wss ?? 'wss://wss.botpanel.xyz');
				if (this.ws) this.ws.close; 
				this.ws = ws;
				this.connected = false;
				
				ws.onopen = () => {
					this.emit('debug', 'Connection initialized.');
					resolve(ws);
				};
				ws.onclose = (event) => {
					clearInterval(this.heartbeatInterval);
					this.connected = false;
					this.emit('debug', 'Connection closed.');
					this.emit('close');
					if (event.code != 1005 && !this.debugOptions?.disableAutoReconnect) {
						this.emit('debug', 'Reconnecting to WebSocket in 5 seconds.');
						setTimeout(()=>{this.login();},5000);
					}		
				};

				ws.on('error', (err) => {
					console.error('WebSocket', err);
					ws.close();
				});

				ws.onmessage = (event) => {
					const message: string = event.data.toString();
					const data: Common.ServerMessage = JSON.parse(message);
					
					this.emit('message', message);

					let dataToSend;
					const eventHandler = messageHandlers[data.op];
					if (!eventHandler) return;
					
					try {
						dataToSend = eventHandler(this, data.d, this.debugOptions);
					} catch (err) {
						this.emit('debug', `[${Common.OperationCodes[data.op]}]: ${err}`);
						throw err;
					}
					
					this.emit(getEnumKeyByEnumValue(Common.OperationCodes, data.op) ?? data.op.toString(), dataToSend);
				};
			} catch (err) {
				this.emit('debug', 'Failed to connect: ' + err);
				throw err;
			}
		});
	}
	
	/** Closes the WebSocket connection */
	disconnect() {
		if (this.connected) this.ws?.close();
	}
	
	/** Sends a message to the WebSocket server (as JSON) */
	send(message: object) {this.ws?.send(JSON.stringify(message));}
}

export class DashboardInteraction {
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
export class DashboardRequestInteraction extends DashboardInteraction {
	requestedElements: Common.GuildRequestInfo['include'];
	constructor(client: Client, options: Common.GuildRequestInfo) {
		super(client, options);
		this.requestedElements = options.include;
	}
	/**
	 * Sends an interaction response containing guild information
	 * @param data Guild info
	 */
	async send(info: Common.GuildRequestResponse) {
		info.data ??= {};

		// convert array values into strings
		for (const [key, value] of Object.entries(info.data)) {
			if (Array.isArray(value)) info.data[key] = value.toString();
		}

		// check for missing elements
		const missing: Array<string> = [];
		for (let i = 0; i < this.requestedElements.length; i++) {
			const element = this.requestedElements[i];
			if (!info[element]) {
				missing.push(element);
			}
		}

		if (missing.length > 0) this.client.emit('debug', 'Warning: Guild interaction response is missing the following elements: ' + missing.join(', '));
		
		// default position values
		for (const element of this.requestedElements) {
			const elements = info[element];
			if (!elements) continue;
			for (let i = 0; i < elements.length; i++) {
				const item = elements[i];
				item.position = item.position ?? 0;
				if (element == Common.ElementType.Role) item.managed = item.managed ?? false;
			}
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
export class DashboardChangeInteraction extends DashboardInteraction {
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
		// convert string to array for Select and Checkbox types
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
	* @param newValue Optional new value to display on the dashboard input (if 'success' is not false).
	*/
	async acknowledge(data?: Common.AcknowledgementData) {
		if (!this.id) throw Error('Interaction already acknowledged');
		await new Promise((resolve) => {
			this.client.ws?.send(JSON.stringify({
				op: Common.OperationCodes.ACKNOWLEDGE_INTERACTION,
				d: {
					interactionId: this.id,
					success: data?.success ?? true,
					message: data?.message,
					key: this.rawData.varname,
					value: data?.newValue ? (typeof data?.newValue == 'object' ? data?.newValue.join(',') : data?.newValue) : this.rawData.data
				}
			}), resolve);
		});
		this.id = null;
	}
}

export * from './common';
