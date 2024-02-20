"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationEvents = exports.OperationCodes = void 0;
var OperationCodes;
(function (OperationCodes) {
    OperationCodes[OperationCodes["AUTHENTICATE"] = 0] = "AUTHENTICATE";
    OperationCodes[OperationCodes["AUTH_SUCCESS"] = 1] = "AUTH_SUCCESS";
    OperationCodes[OperationCodes["ERROR"] = 2] = "ERROR";
    OperationCodes[OperationCodes["GUILD_INTERACTION"] = 4] = "GUILD_INTERACTION";
    OperationCodes[OperationCodes["REQUEST_GUILD_DATA"] = 5] = "REQUEST_GUILD_DATA";
    OperationCodes[OperationCodes["MODIFY_GUILD_DATA"] = 6] = "MODIFY_GUILD_DATA";
    OperationCodes[OperationCodes["HEARTBEAT"] = 8] = "HEARTBEAT";
})(OperationCodes || (exports.OperationCodes = OperationCodes = {}));
var OperationEvents;
(function (OperationEvents) {
    OperationEvents[OperationEvents["AUTHENTICATE"] = 0] = "AUTHENTICATE";
    OperationEvents[OperationEvents["AUTH_SUCCESS"] = 1] = "AUTH_SUCCESS";
    OperationEvents[OperationEvents["ERROR"] = 2] = "ERROR";
    OperationEvents[OperationEvents["GUILD_INTERACTION"] = 4] = "GUILD_INTERACTION";
    OperationEvents[OperationEvents["REQUEST_GUILD_DATA"] = 5] = "REQUEST_GUILD_DATA";
    OperationEvents[OperationEvents["MODIFY_GUILD_DATA"] = 6] = "MODIFY_GUILD_DATA";
    OperationEvents[OperationEvents["HEARTBEAT"] = 8] = "HEARTBEAT";
})(OperationEvents || (exports.OperationEvents = OperationEvents = {}));
