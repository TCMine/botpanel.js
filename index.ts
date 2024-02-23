import * as Common from './common';
import WebSocket from 'ws';
import EventEmitter from 'node:events';

export interface ClientDebugOptions {
	logHeartbeat?: boolean
}

function getEnumKeyByEnumValue(myEnum: Enumerator<string> | any, enumValue: string | number): string | null {
	const keys = Object.keys(myEnum).filter(x => myEnum[x] == enumValue);
	return keys.length > 0 ? keys[0] : null;
}

const messageHandlers: {[key: number]: (client: Client, data?: any, debugOptions?: ClientDebugOptions) => void} = {
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
	[Common.OperationCodes.AUTH_SUCCESS]: (client: Client, data: any, debugOptions?: ClientDebugOptions) => {
		client.connected = true;
		client.emit('debug', `Successfully authenticated with application "${data.d.name}" (${client.authOptions.id})`);
		if (debugOptions?.logHeartbeat) client.emit('debug', 'Heartbeat interval set to ' + data.d.heartbeatInterval);
		setInterval(() => {
			client.ws?.send(JSON.stringify({
				op: Common.OperationCodes.HEARTBEAT
			}));
			if (debugOptions?.logHeartbeat) client.emit('debug', 'Heartbeat sent');
		}, data.d.heartbeatInterval);
		return true;
	},
	[Common.OperationCodes.ERROR]: (client: Client, data: any) => {
		if (client.connected) throw Error(data.d.error)
		client.emit('debug', 'Failed to authenticate');
		return Error(data.d.error);
	}



}

/**
 * Represents an authenticated client for Bot Panel
 * @extends {EventEmitter}
 * @constructor
*/

export class Client extends EventEmitter {
	authOptions: Common.AuthenticationData;
	ws: undefined | WebSocket;
	connected: boolean = false;
	debugOptions: undefined | ClientDebugOptions
	/**
	 * @param options Authentication options
	*/
	constructor(options: Common.AuthenticationData, debugOptions?: ClientDebugOptions) {
		super();
		this.authOptions = options;
		this.debugOptions = debugOptions
	}
	/**
	 * Connect to the dashboard and login
	 * @returns Connection successful?
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
				if (data.d?.interactionId)
				this.emit(getEnumKeyByEnumValue(Common.OperationCodes, data.op) ?? data.op.toString(), data.d);
				let v = messageHandlers[data.op]
				if (!v) return
				try {
					v(this, data, this.debugOptions)
				} catch (err) {
					this.emit('debug', `[${Common.OperationCodes[data.op]}] Failed to send message: ${err}`);
				}
			});
		} catch (err) {
			this.emit('debug', 'Failed to connect: ' + err);
			return false;
		}
	}

	disconnect() {
		if (this.connected) this.ws?.close(); else throw Error("what")
	}

}

class DashboardInteraction {
	client: Client;
	id: string;
	constructor(options: any) {
		this.client = options.client;
		this.id = options.interactionId
	}
}



export * from './common';