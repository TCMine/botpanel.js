"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationCodes = void 0;
var OperationCodes;
(function (OperationCodes) {
    OperationCodes[OperationCodes["AUTHENTICATE"] = 0] = "AUTHENTICATE";
    OperationCodes[OperationCodes["AUTH_SUCCESS"] = 1] = "AUTH_SUCCESS";
    OperationCodes[OperationCodes["ERROR"] = 2] = "ERROR";
    OperationCodes[OperationCodes["GUILD_INTERACTION"] = 4] = "GUILD_INTERACTION";
    OperationCodes[OperationCodes["REQUEST_GUILD_DATA"] = 5] = "REQUEST_GUILD_DATA";
    OperationCodes[OperationCodes["MODIFY_GUILD_DATA"] = 6] = "MODIFY_GUILD_DATA";
    OperationCodes[OperationCodes["ACKNOWLEDGE_INTERACTION"] = 7] = "ACKNOWLEDGE_INTERACTION";
    OperationCodes[OperationCodes["HEARTBEAT"] = 8] = "HEARTBEAT";
})(OperationCodes || (exports.OperationCodes = OperationCodes = {}));
