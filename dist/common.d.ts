export declare enum OperationCodes {
    /** Request to authenticate */
    AUTHENTICATE = 0,
    /** Authentication successful */
    AUTH_SUCCESS = 1,
    /** Error received from the WebSocket */
    ERROR = 2,
    APPLICATION_STATUS = 3,// reserved for browser clients
    /** Guild is being accessed from the dashboard */
    GUILD_INTERACTION = 4,
    /** Response to GUILD_INTERACTION with guild data and info */
    REQUEST_GUILD_DATA = 5,// this is the response
    /** Guild data modified by user */
    MODIFY_GUILD_DATA = 6,
    /** Acknowledges MODIFY_GUILD_DATA */
    ACKNOWLEDGE_INTERACTION = 7,
    HEARTBEAT = 8
}
export declare enum ComponentType {
    Text = "Text",
    Number = "Number",
    Checkbox = "Checkbox",
    Select = "Select"
}
export type GuildData = number | string | Array<string>;
export interface ServerMessage {
    op: number;
    d: object;
}
export interface ServerResponseError {
    error: string;
}
export interface ServerResponseAuthSuccess {
    name: string;
    heartbeatInterval: number;
}
export interface InteractionInfo {
    interactionId: string;
    guildId: string;
}
export interface GuildRequestResponse {
    interactionId?: string;
    /** Object of guild data for the dashboard. */
    data?: {
        [key: string]: GuildData;
    };
    /** Bot is in the guild? */
    inGuild: boolean;
    /** Formatted list of the guild's text channels */
    textChannels?: Array<GuildChannelOrRole>;
    /** Formatted list of the guild's voice channels */
    voiceChannels?: Array<GuildChannelOrRole>;
    /** Formatted list of the guild's category channels */
    categories?: Array<GuildChannelOrRole>;
    /** Formatted list of the guild's roles */
    roles?: Array<GuildChannelOrRole>;
}
export interface InteractionResponse {
    interactionId: string;
    success: boolean;
    key: GuildDataChangeInfo['varname'];
    value: GuildDataChangeInfo['data'];
}
export interface GuildDataChangeInfo extends InteractionInfo {
    varname: string;
    data: GuildData;
    userId: string;
    inputType: ComponentType.Text | ComponentType.Number | ComponentType.Checkbox | ComponentType.Select;
}
export interface GuildChannelOrRole {
    id: string;
    name: string;
    position: number | 0;
}
export interface AuthenticationData {
    /** ID of the client */
    id: string;
    /** Secret key of the client (do not share this) */
    secret: string;
    connectAs?: 'application';
}
export interface ClientDebugOptions {
    logHeartbeat?: boolean;
}