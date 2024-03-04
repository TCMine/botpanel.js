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
exports.DashboardChangeInteraction = exports.DashboardRequestInteraction = exports.DashboardInteraction = exports.Client = void 0;
const Common = __importStar(require("./common"));
const ws_1 = __importDefault(require("ws"));
const node_events_1 = __importDefault(require("node:events"));
/*eslint-disable */
// ts wont shut up if I put any type other than "any" for this or the messageHandlers. maybe theres a way to fix this, but I don't know it.
function getEnumKeyByEnumValue(myEnum, enumValue) {
    const keys = Object.keys(myEnum).filter(x => myEnum[x] == enumValue);
    return keys.length > 0 ? keys[0] : null;
}
const messageHandlers = {
    /*eslint-enable */
    [Common.OperationCodes.AUTHENTICATE]: (client) => {
        var _a, _b;
        (_a = client.ws) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify({
            op: Common.OperationCodes.AUTHENTICATE,
            d: {
                connectAs: (_b = client.authOptions.connectAs) !== null && _b !== void 0 ? _b : 'application',
                applicationId: client.authOptions.id,
                applicationSecret: client.authOptions.secret,
                version: Common.BP_VERSION
            }
        }));
    },
    [Common.OperationCodes.AUTH_SUCCESS]: (client, data, debugOptions) => {
        client.connected = true;
        client.emit('debug', `Successfully authenticated with application "${data.name}" (${client.authOptions.id})`);
        if (debugOptions === null || debugOptions === void 0 ? void 0 : debugOptions.logHeartbeat)
            client.emit('debug', 'Heartbeat interval set to ' + data.heartbeatInterval);
        setInterval(() => {
            var _a;
            (_a = client.ws) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify({
                op: Common.OperationCodes.HEARTBEAT
            }));
            if (debugOptions === null || debugOptions === void 0 ? void 0 : debugOptions.logHeartbeat)
                client.emit('debug', 'Heartbeat sent');
        }, data.heartbeatInterval);
        return data;
    },
    [Common.OperationCodes.ERROR]: (client, data) => {
        if (!client.connected)
            throw Error(data.error), client.emit('debug', 'Failed to authenticate');
        return data;
    },
    [Common.OperationCodes.GUILD_INTERACTION]: (client, data) => {
        return new DashboardRequestInteraction(client, { interactionId: data.interactionId, guildId: data.guildId, include: data.include });
    },
    [Common.OperationCodes.MODIFY_GUILD_DATA]: (client, data) => {
        return new DashboardChangeInteraction(client, data);
    }
};
/**
 * Represents a client for Bot Panel
 * @constructor
*/
class Client extends node_events_1.default {
    /**
     * @param options Authentication options
    */
    constructor(options, debugOptions) {
        super();
        /** Whether the client is currently connected to the WebSocket */
        this.connected = false;
        this.authOptions = options;
        this.debugOptions = debugOptions;
    }
    /** Connects to the Bot Panel WebSocket and login */
    login() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    const ws = new ws_1.default('wss://botpanel.xyz/api/ws');
                    if (this.ws)
                        this.ws.close;
                    this.ws = ws;
                    this.connected = false;
                    ws.onopen = () => {
                        this.emit('debug', 'Dashboard initialized.');
                        resolve(ws);
                    };
                    ws.onclose = () => {
                        this.connected = false;
                        this.emit('debug', 'Dashboard closed.');
                        this.emit('close');
                        reject();
                    };
                    ws.onmessage = (event) => {
                        var _a;
                        const message = event.data.toString();
                        const data = JSON.parse(message);
                        this.emit('debug', `Message received: ${message}`);
                        let dataToSend;
                        const v = messageHandlers[data.op];
                        if (!v)
                            return;
                        try {
                            dataToSend = v(this, data.d, this.debugOptions);
                        }
                        catch (err) {
                            this.emit('debug', `Error: [${Common.OperationCodes[data.op]}]: ${err}`);
                        }
                        this.emit((_a = getEnumKeyByEnumValue(Common.OperationCodes, data.op)) !== null && _a !== void 0 ? _a : data.op.toString(), dataToSend);
                    };
                }
                catch (err) {
                    this.emit('debug', 'Failed to connect: ' + err);
                    throw err;
                }
            });
        });
    }
    /** Closes the WebSocket connection */
    disconnect() {
        var _a;
        if (this.connected)
            (_a = this.ws) === null || _a === void 0 ? void 0 : _a.close();
    }
    /** Sends a message to the WebSocket server (as JSON) */
    send(message) { var _a; (_a = this.ws) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(message)); }
}
exports.Client = Client;
class DashboardInteraction {
    constructor(client, options) {
        this.client = client;
        this.id = options.interactionId;
        this.guildId = options.guildId;
    }
}
exports.DashboardInteraction = DashboardInteraction;
/**
 * Guild information request interaction
*/
class DashboardRequestInteraction extends DashboardInteraction {
    constructor(client, options) {
        super(client, options);
        this.requestedElements = options.include;
    }
    /**
     * Sends an interaction response containing guild information
     * @param data Guild info
     */
    send(info) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            info.data = (_a = info.data) !== null && _a !== void 0 ? _a : {};
            // convert array values into strings
            for (const [key, value] of Object.entries(info.data)) {
                if (Array.isArray(value))
                    info.data[key] = value.toString();
            }
            // check for missing elements
            const missing = [];
            for (let i = 0; i < this.requestedElements.length; i++) {
                const element = this.requestedElements[i];
                if (!info[element]) {
                    missing.push(element);
                }
            }
            if (missing.length > 0)
                this.client.emit('debug', 'Warning: Guild interaction response missing the following elements: ' + missing.join(', '));
            // default position values
            for (const element of this.requestedElements) {
                if (!info[element]) {
                    continue;
                }
                const elements = info[element];
                if (!elements)
                    continue;
                for (let i = 0; i < elements.length; i++) {
                    const item = elements[i];
                    item.position = (_b = item.position) !== null && _b !== void 0 ? _b : 0;
                    if (element == Common.ElementType.Role)
                        item.managed = (_c = item.managed) !== null && _c !== void 0 ? _c : false;
                }
            }
            yield new Promise((resolve) => {
                var _a, _b, _c, _d, _e;
                (_a = this.client.ws) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify({
                    op: Common.OperationCodes.REQUEST_GUILD_DATA,
                    d: {
                        interactionId: this.id,
                        data: info.data,
                        inGuild: info.inGuild,
                        textChannels: (_b = info.textChannels) !== null && _b !== void 0 ? _b : [],
                        voiceChannels: (_c = info.voiceChannels) !== null && _c !== void 0 ? _c : [],
                        categories: (_d = info.categories) !== null && _d !== void 0 ? _d : [],
                        roles: (_e = info.roles) !== null && _e !== void 0 ? _e : [],
                    }
                }), resolve);
            });
        });
    }
}
exports.DashboardRequestInteraction = DashboardRequestInteraction;
/**
 * Dashboard changed interaction
*/
class DashboardChangeInteraction extends DashboardInteraction {
    constructor(client, options) {
        super(client, options);
        let newValue = options.data;
        // convert string to array for Select and Checkbox types
        if (typeof options.data == 'string')
            newValue = options.inputType == Common.ComponentType.Checkbox || options.inputType == Common.ComponentType.Select ? options.data.split(',') : options.data;
        this.userId = options.userId;
        this.input = {
            type: options.inputType,
            name: options.varname,
            value: newValue
        };
        this.rawData = options;
    }
    /**
    * Sends an interaction response indicating if the change was successful
    * @param success Was the change successful? (this will be shown to the user)
    * @param newValue Optional new value to display on the dashboard input
    */
    acknowledge(success = true, newValue = this.rawData.data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.id)
                throw Error('Interaction already acknowledged');
            yield new Promise((resolve) => {
                var _a;
                (_a = this.client.ws) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify({
                    op: Common.OperationCodes.ACKNOWLEDGE_INTERACTION,
                    d: {
                        interactionId: this.id,
                        success,
                        key: this.rawData.varname,
                        value: typeof newValue == 'object' ? newValue.join(',') : newValue
                    }
                }), resolve);
            });
            this.id = null;
        });
    }
}
exports.DashboardChangeInteraction = DashboardChangeInteraction;
__exportStar(require("./common"), exports);
