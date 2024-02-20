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

export enum OperationEvents {
    AUTHENTICATE = 0,
    AUTH_SUCCESS = 1,
    ERROR = 2,
    GUILD_INTERACTION = 4,
    REQUEST_GUILD_DATA = 5,
    MODIFY_GUILD_DATA = 6,
    HEARTBEAT = 8
}

export interface AuthenticationData {
    /**
   * @param id ID of the client
   * @param secret Secret key of the client
   */
  id: string,
  secret: string,
  connectAs?: 'application' | string,
} 