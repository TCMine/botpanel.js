"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const Common = __importStar(require("./common"));
const ws_1 = __importDefault(require("ws"));
const node_events_1 = __importDefault(require("node:events"));
function getEnumKeyByEnumValue(myEnum, enumValue) {
    const keys = Object.keys(myEnum).filter(x => myEnum[x] == enumValue);
    return keys.length > 0 ? keys[0] : null;
}
const messageHandlers = {
    [Common.OperationCodes.AUTHENTICATE]: (client) => {
        var _a, _b;
        (_a = client.ws) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify({
            op: Common.OperationCodes.AUTHENTICATE,
            d: {
                connectAs: (_b = client.authOptions.connectAs) !== null && _b !== void 0 ? _b : 'application',
                applicationId: client.authOptions.id,
                applicationSecret: client.authOptions.secret
            }
        }));
    },
    [Common.OperationCodes.AUTH_SUCCESS]: (client, data, debugOptions) => {
        client.connected = true;
        client.emit('debug', `Successfully authenticated with application "${data.d.name}" (${client.authOptions.id})`);
        if (debugOptions === null || debugOptions === void 0 ? void 0 : debugOptions.logHeartbeat)
            client.emit('debug', 'Heartbeat interval set to ' + data.d.heartbeatInterval);
        setInterval(() => {
            var _a;
            (_a = client.ws) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify({
                op: Common.OperationCodes.HEARTBEAT
            }));
            if (debugOptions === null || debugOptions === void 0 ? void 0 : debugOptions.logHeartbeat)
                client.emit('debug', 'Heartbeat sent');
        }, data.d.heartbeatInterval);
        return true;
    },
    [Common.OperationCodes.ERROR]: (client, data) => {
        if (client.connected)
            throw Error(data.d.error);
        client.emit('debug', 'Failed to authenticate');
        return Error(data.d.error);
    }
};
/**
 * Represents an authenticated client for Bot Panel
 * @extends {EventEmitter}
 * @constructor
*/
class Client extends node_events_1.default {
    /**
     * @param options Authentication options
    */
    constructor(options) {
        super();
        this.ws = null;
        this.connected = false;
        this.authOptions = options;
    }
    /**
     * Connect to the dashboard and login
     * @returns Connection successful?
     */
    login(debugOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ws = new ws_1.default('wss://botpanel.xyz/api/ws');
                this.ws = ws;
                this.connected = false;
                ws.on('open', () => {
                    this.emit('debug', 'Dashboard initialized.');
                });
                ws.on('close', () => {
                    this.connected = false;
                    this.emit('debug', 'Dashboard closed.');
                    this.emit('close');
                    return false;
                });
                ws.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    const data = JSON.parse(message);
                    this.emit('debug', `Message received: ${message}`);
                    this.emit((_a = getEnumKeyByEnumValue(Common.OperationCodes, data.op)) !== null && _a !== void 0 ? _a : data.op, data.d);
                    let v = messageHandlers[data.op];
                    if (!v)
                        return;
                    try {
                        v(this, data, debugOptions);
                    }
                    catch (err) {
                        this.emit('debug', `[${Common.OperationCodes[data.op]}] Failed to send message: ${err}`);
                    }
                }));
            }
            catch (err) {
                this.emit('debug', 'Failed to connect: ' + err);
                return false;
            }
        });
    }
    disconnect() {
        var _a;
        if (this.connected)
            (_a = this.ws) === null || _a === void 0 ? void 0 : _a.close();
        else
            throw Error("what");
    }
}
exports.Client = Client;
class DashboardInteraction {
    constructor(options) {
        this.client = options.client;
    }
}
__exportStar(require("./common"), exports);
