import * as Common from './common';
import WebSocket from 'ws';
import EventEmitter from 'node:events';

function getEnumKeyByEnumValue(myEnum: any, enumValue: any) {
	let keys = Object.keys(myEnum).filter(x => myEnum[x] == enumValue);
	return keys.length > 0 ? keys[0] : null;
}

/**
* Represents an authenticated client for Bot Panel
* @extends {EventEmitter}
*/

export class Client extends EventEmitter {
	authOptions: Common.AuthenticationData;
	ws: null | WebSocket;
	/**
   * @param options Authentication options
   */
	constructor(options: Common.AuthenticationData) {
		super();
		this.authOptions = options;
		this.ws = null
	}
	/**
	 * Connect to the dashboard and login
	 * @returns Connection successful?
	 */
	async login() {
		try {
			const ws = new WebSocket('wss://botpanel.xyz/api/ws');
			this.ws = ws;
			let connected = false
			ws.on('open', () => {
				this.emit('debug', 'Dashboard initialized.');
			});
			ws.on('close', () => {
				this.emit('debug', 'Dashboard closed.');
				this.emit('close');
				return false
			});
			ws.on('message', async (message: string) => {
				this.emit('debug', `Message received: ${message}`)
				const data = JSON.parse(message);
				if (data.op == Common.OperationCodes.AUTHENTICATE) {
					ws.send(JSON.stringify({
						op: Common.OperationCodes.AUTHENTICATE,
						d: {
							connectAs: this.authOptions.connectAs ?? "application",
							applicationId: this.authOptions.id,
							applicationSecret: this.authOptions.secret
						}
					}));
				} else if (data.op == Common.OperationCodes.AUTH_SUCCESS) {
					connected = true
					this.emit('debug', `Successfully authenticated with application "${data.d.name}" (${this.authOptions.id})`);
					setInterval(() => {
						ws.send(JSON.stringify({
						  op: Common.OperationCodes.HEARTBEAT
						}));
					}, data.d.heartbeatInterval);
					return true;
				} else if (data.op == Common.OperationCodes.ERROR && !connected) {
					this.emit('debug', 'Failed to authenticate');
					return Error(data.d.error)
				} else {
					this.emit(getEnumKeyByEnumValue(Common.OperationCodes, data.op) ?? data.op, data.d)
				}
			});
		} catch (err) {
			this.emit('debug', 'Failed to connect: ' + err);
			return false;
		}
	}

	disconnect() {

	}

}


class DashboardInteraction {
	constructor()
}


export * from Common
