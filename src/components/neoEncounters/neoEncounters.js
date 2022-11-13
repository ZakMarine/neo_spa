"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
function Encounter(props) {
    return react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("div", null, props.prevEnvounters.map(el => react_1.default.createElement("div", { key: el.date },
            react_1.default.createElement("h2", null, "Date"),
            react_1.default.createElement("p", null, el.date),
            react_1.default.createElement("h2", null, "Speed"),
            react_1.default.createElement("p", null, el.speed),
            react_1.default.createElement("h2", null, "Distance"),
            react_1.default.createElement("p", null, el.distance)))),
        react_1.default.createElement("div", null, props.nextEncounters.map(el => react_1.default.createElement("div", { key: el.date },
            react_1.default.createElement("h2", null, "Date"),
            react_1.default.createElement("p", null, el.date),
            react_1.default.createElement("h2", null, "Speed"),
            react_1.default.createElement("p", null, el.speed),
            react_1.default.createElement("h2", null, "Distance"),
            react_1.default.createElement("p", null, el.distance)))));
}
exports.default = Encounter;
