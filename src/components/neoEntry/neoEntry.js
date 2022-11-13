"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
function NEOEntry(props) {
    return react_1.default.createElement("div", { id: props.object.id, className: "NEO-entry", onClick: e => props.requestEncounter(props.object.self) });
}
exports.default = NEOEntry;
