/// <reference types="node" />
import * as Common from './common';
import WebSocket from 'ws';
import EventEmitter from 'node:events';
/**
 * Represents a client for Bot Panel
 * @constructor
*/
export declare class Client extends EventEmitter {
    /** Authentication information for the client */
    authOptions: Common.AuthenticationData;
    /** Client WebSocket  */
    ws: undefined | WebSocket;
    /** Whether the client is currently connected to the WebSocket */
    connected: boolean;
    /** Options for debugging BotPanel.js */
    debugOptions: undefined | Common.ClientDebugOptions;
    /**
     * @param options Authentication options
    */
    constructor(options: Common.AuthenticationData, debugOptions?: Common.ClientDebugOptions);
    /** Connects to the Bot Panel WebSocket and login */
    login(): Promise<WebSocket | null>;
    /** Closes the WebSocket connection */
    disconnect(): void;
    /** Sends a message to the WebSocket server (as JSON) */
    send(message: object): void;
}
export declare class DashboardInteraction {
    client: Client;
    /**
     * Assigned ID for the interaction
     */
    id: Common.GuildDataChangeInfo['interactionId'] | null;
    /**
     * ID of the guild involved with the interaction
     */
    guildId: Common.GuildDataChangeInfo['guildId'];
    constructor(client: Client, options: Common.InteractionInfo);
}
/**
 * Guild information request interaction
*/
export declare class DashboardRequestInteraction extends DashboardInteraction {
    requestedElements: Common.GuildRequestInfo['include'];
    constructor(client: Client, options: Common.GuildRequestInfo);
    /**
     * Sends an interaction response containing guild information
     * @param data Guild info
     */
    send(info: Common.GuildRequestResponse): Promise<void>;
}
/**
 * Dashboard changed interaction
*/
export declare class DashboardChangeInteraction extends DashboardInteraction {
    /**
    * ID of the user that initiated the interaction
    */
    userId: string;
    /**
    * Dashboard input that was changed
    */
    input: {
        type: Common.GuildDataChangeInfo['inputType'];
        name: Common.GuildDataChangeInfo['varname'];
        value: Common.GuildDataChangeInfo['data'];
    };
    rawData: Common.GuildDataChangeInfo;
    constructor(client: Client, options: Common.GuildDataChangeInfo);
    /**
    * Sends an interaction response indicating if the change was successful
    * @param success Was the change successful? (this will be shown to the user)
    */
    acknowledge(success?: boolean, newValue?: string | number | Array<string>): Promise<void>;
}
export * from './common';
