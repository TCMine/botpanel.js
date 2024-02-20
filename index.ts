import { AuthenticationData, OperationCodes } from './common';
import WebSocket from 'ws';
import EventEmitter from 'node:events';

/**
* Represents an authenticated client for Bot Panel
* @extends {EventEmitter}
*/

function getEnumKeyByEnumValue(myEnum: any, enumValue: any) {
    let keys = Object.keys(myEnum).filter(x => myEnum[x] == enumValue);
    return keys.length > 0 ? keys[0] : null;
}
export class Client extends EventEmitter {
	authOptions: AuthenticationData;
	ws: null | WebSocket;
	/**
   * @param options Authentication options
   */
	constructor(options: AuthenticationData) {
		super();
		this.authOptions = options;
		this.ws = null
	}
	async login() {
		try {
			const ws = new WebSocket('wss://botpanel.xyz/api/ws');
			this.ws = ws;

			ws.on('open', () => {
				this.emit('debug', 'Dashboard initialized.');
			});
			ws.on('close', () => {
				this.emit('debug', 'Dashboard closed.');
				this.emit('close');
			});
			ws.on('message', async (message: string) => {
				this.emit('debug', `Message received: ${message}`)
				const data = JSON.parse(message);
				if (data.op == OperationCodes.AUTHENTICATE) {
					ws.send(JSON.stringify({
						op: OperationCodes.AUTHENTICATE,
						d: {
							connectAs: this.authOptions.connectAs ?? "application",
							applicationId: this.authOptions.id,
							applicationSecret: this.authOptions.secret
						}
					}));
				} else if (data.op == OperationCodes.AUTH_SUCCESS) {
					this.emit('debug', `Successfully authenticated with application "${data.d.name}" (${this.authOptions.id})`);
					setInterval(() => {
						ws.send(JSON.stringify({
						  op: OperationCodes.HEARTBEAT
						}));
					}, data.d.heartbeatInterval);
					return true;
				} else {
					this.emit(getEnumKeyByEnumValue(OperationCodes, data.op) ?? data.op)
				}
			});
			
		} catch (err) {
			this.emit('debug', 'Failed to login client');
			return false;
		}
	}
}
