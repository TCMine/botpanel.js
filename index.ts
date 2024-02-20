import * as Types from './common'
import WebSocket from 'ws'
import EventEmitter from 'node:events'

/**
* Represents an authenticated client for Bot Panel
* @extends {EventEmitter}
*/
export class Client extends EventEmitter {
    authOptions: Types.AuthenticationData
    /**
   * @param options Authentication options
   */
    constructor(options: Types.AuthenticationData, debug?: boolean) {
        super()
        this.authOptions = options
    }
    async login() {
        
    }
}