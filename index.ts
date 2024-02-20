import * as Types from './common';
import WebSocket from 'ws';
import EventEmitter from 'node:events';

/**
* Represents an authenticated client for Bot Panel
* @extends {EventEmitter}
*/

function getEnumKeyByEnumValue(myEnum: Enumerator<number>, enumValue: string) {
    let keys = Object.keys(myEnum).filter(x => myEnum[x] == enumValue);
    return keys.length > 0 ? keys[0] : null;
}
export class Client extends EventEmitter {
	authOptions: Types.AuthenticationData;
	ws: null | WebSocket;
	/**
   * @param options Authentication options
   */
	constructor(options: Types.AuthenticationData) {
		super();
		options.connectAs = options.connectAs ?? 'application';
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
				const data = JSON.parse(message);
				if (data.op == 0) {
					ws.send(JSON.stringify({
						op: 0,
						d: {
							...this.authOptions
						}
					}));
				} else if (data.op == 1) {
					this.emit('debug', `Successfully authenticated with application "${data.d.name}" (${this.authOptions.id})`);
					return true;
				} else {
					this.emit(Types.OperationCodes.)
				}
			});
		} catch (err) {
			this.emit('debug', 'Failed to login client');
			return false;
		}
	}
}
