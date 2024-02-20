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
const ws_1 = __importDefault(require("ws"));
const node_events_1 = __importDefault(require("node:events"));
/**
* Represents an authenticated client for Bot Panel
* @extends {EventEmitter}
*/
class Client extends node_events_1.default {
    /**
   * @param options Authentication options
   */
    constructor(options) {
        var _a;
        super();
        options.connectAs = (_a = options.connectAs) !== null && _a !== void 0 ? _a : 'application';
        this.authOptions = options;
        this.ws = null;
    }
    login() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ws = new ws_1.default('wss://botpanel.xyz/api/ws');
                this.ws = ws;
                ws.on('open', () => {
                    this.emit('debug', 'Dashboard initialized.');
                });
                ws.on('close', () => {
                    this.emit('debug', 'Dashboard closed.');
                    this.emit('close');
                });
                ws.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
                    const data = JSON.parse(message);
                    if (data.op == 0) {
                        ws.send(JSON.stringify({
                            op: 0,
                            d: Object.assign({}, this.authOptions)
                        }));
                    }
                    else if (data.op == 1) {
                        this.emit('debug', `Successfully authenticated with application "${data.d.name}" (${this.authOptions.id})`);
                        return true;
                    }
                }));
            }
            catch (err) {
                this.emit('debug', 'Failed to login client');
                return false;
            }
        });
    }
}
exports.Client = Client;
