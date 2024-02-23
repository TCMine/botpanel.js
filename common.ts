import {Client} from './';
export enum OperationCodes {
    AUTHENTICATE = 0,
    AUTH_SUCCESS = 1,
    ERROR = 2,
    GUILD_INTERACTION = 4,  // this is the request
    REQUEST_GUILD_DATA = 5, // this is the response
    MODIFY_GUILD_DATA = 6,
    ACKNOWLEDGE_INTERACTION = 7,
    HEARTBEAT = 8
}

export interface GuildData {

}

export interface ServerMessage {
    op: number;
    d?: BaseInteraction;
}

export interface BaseInteraction {
    interactionId: string
}
interface ServerResponseError {
    error: string
}
interface ServerResponseAuth {
    name: string,
    heartbeatInterval: number
}


export interface GuildInteraction extends BaseInteraction {
    guildId: string | number
}


export interface GuildRequestResponse extends GuildInteraction {
    data: GuildData | null,
    inGuild: boolean
}

export interface GuildDataChangedInteraction extends GuildInteraction {
    varname: string,
    data: GuildData,
    userId: string | number,
    inputType: string           // will do later
}


export interface Interaction extends BaseInteraction {
    client: Client,
    
}

export interface AuthenticationData {
    /**
   * @param id ID of the client
   * @param secret Secret key of the client
   */
  id: string,
  secret: string,
  connectAs?: 'application',
}

export interface GuildChannelOrRole {
    id: string,
    name: string,
    position: number | 0
}