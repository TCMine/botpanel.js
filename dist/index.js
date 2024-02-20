"use strict";
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
const common_1 = require("./common");
const ws_1 = __importDefault(require("ws"));
const node_events_1 = __importDefault(require("node:events"));
/**
* Represents an authenticated client for Bot Panel
* @extends {EventEmitter}
*/
function getEnumKeyByEnumValue(myEnum, enumValue) {
    let keys = Object.keys(myEnum).filter(x => myEnum[x] == enumValue);
    return keys.length > 0 ? keys[0] : null;
}
class Client extends node_events_1.default {
    /**
   * @param options Authentication options
   */
    constructor(options) {
        super();
        this.authOptions = options;
        this.ws = null;
    }
    login() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ws = new ws_1.default('wss://botpanel.xyz/api/ws');
                this.ws = ws;
                let connected = false;
                ws.on('open', () => {
                    this.emit('debug', 'Dashboard initialized.');
                });
                ws.on('close', () => {
                    this.emit('debug', 'Dashboard closed.');
                    this.emit('close');
                    return false;
                });
                ws.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b;
                    this.emit('debug', `Message received: ${message}`);
                    const data = JSON.parse(message);
                    if (data.op == common_1.OperationCodes.AUTHENTICATE) {
                        ws.send(JSON.stringify({
                            op: common_1.OperationCodes.AUTHENTICATE,
                            d: {
                                connectAs: (_a = this.authOptions.connectAs) !== null && _a !== void 0 ? _a : "application",
                                applicationId: this.authOptions.id,
                                applicationSecret: this.authOptions.secret
                            }
                        }));
                    }
                    else if (data.op == common_1.OperationCodes.AUTH_SUCCESS) {
                        connected = true;
                        this.emit('debug', `Successfully authenticated with application "${data.d.name}" (${this.authOptions.id})`);
                        setInterval(() => {
                            ws.send(JSON.stringify({
                                op: common_1.OperationCodes.HEARTBEAT
                            }));
                        }, data.d.heartbeatInterval);
                        return true;
                    }
                    else if (data.op == common_1.OperationCodes.ERROR && !connected) {
                        this.emit('debug', 'Failed to authenticate');
                        return Error(data.d.error);
                    }
                    else {
                        this.emit((_b = getEnumKeyByEnumValue(common_1.OperationCodes, data.op)) !== null && _b !== void 0 ? _b : data.op, data.d);
                    }
                }));
            }
            catch (err) {
                this.emit('debug', 'Failed to connect');
                return false;
            }
        });
    }
}
exports.Client = Client;
