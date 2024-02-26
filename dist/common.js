"use strict";
//import { Client } from './';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentType = exports.OperationCodes = void 0;
var OperationCodes;
(function (OperationCodes) {
    /** Request to authenticate */
    OperationCodes[OperationCodes["AUTHENTICATE"] = 0] = "AUTHENTICATE";
    /** Authentication successful */
    OperationCodes[OperationCodes["AUTH_SUCCESS"] = 1] = "AUTH_SUCCESS";
    /** Error received from the WebSocket */
    OperationCodes[OperationCodes["ERROR"] = 2] = "ERROR";
    OperationCodes[OperationCodes["APPLICATION_STATUS"] = 3] = "APPLICATION_STATUS";
    /** Guild is being accessed from the dashboard */
    OperationCodes[OperationCodes["GUILD_INTERACTION"] = 4] = "GUILD_INTERACTION";
    /** Response to GUILD_INTERACTION with guild data and info */
    OperationCodes[OperationCodes["REQUEST_GUILD_DATA"] = 5] = "REQUEST_GUILD_DATA";
    /** Guild data modified by user */
    OperationCodes[OperationCodes["MODIFY_GUILD_DATA"] = 6] = "MODIFY_GUILD_DATA";
    /** Acknowledges MODIFY_GUILD_DATA */
    OperationCodes[OperationCodes["ACKNOWLEDGE_INTERACTION"] = 7] = "ACKNOWLEDGE_INTERACTION";
    OperationCodes[OperationCodes["HEARTBEAT"] = 8] = "HEARTBEAT";
})(OperationCodes || (exports.OperationCodes = OperationCodes = {}));
var ComponentType;
(function (ComponentType) {
    ComponentType["Text"] = "Text";
    ComponentType["Number"] = "Number";
    ComponentType["Checkbox"] = "Checkbox";
    ComponentType["Select"] = "Select";
})(ComponentType || (exports.ComponentType = ComponentType = {}));
