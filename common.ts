export enum OperationCodes {
    AUTHENTICATE = 0,
    AUTH_SUCCESS = 1,
    ERROR = 2,
    GUILD_INTERACTION = 4,
    REQUEST_GUILD_DATA = 5,
    MODIFY_GUILD_DATA = 6,
    ACKNOWLEDGE_INTERACTION = 7,
    HEARTBEAT = 8
}

export interface GuildData {

}

export interface BaseInteraction {
    interactionId: string | number
}

export interface GuildInteraction extends BaseInteraction {
    guildId: string | number
}

export interface GuildRequestResponse extends GuildInteraction {
    data: GuildData | null,
    inGuild: boolean
}

export interface GuildDataChangedInteraction extends BaseInteraction {
    varname: string,
    data: {},
    userId: string | number,
    inputType: string           // will do later
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