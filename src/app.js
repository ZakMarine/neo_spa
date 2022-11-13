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
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const tabulator_tables_1 = require("tabulator-tables");
const constants_1 = require("./constants");
require("./app.scss");
require("./tabular.scss");
class App extends react_1.Component {
    constructor(props) {
        super(props);
        this.apiToNeoObject = (neo) => {
            let diameter = {};
            Object.keys(neo.estimated_diameter).forEach((el) => diameter[el] = {
                min: neo.estimated_diameter[el].estimated_diameter_max,
                max: neo.estimated_diameter[el].estimated_diameter_min
            });
            return {
                id: neo.id,
                name: neo.name,
                hazard: neo.is_potentially_hazardous_asteroid,
                sentry: neo.is_sentry_object,
                estimatedDiameter: (neo.estimated_diameter["kilometers"].estimated_diameter_max + neo.estimated_diameter["kilometers"].estimated_diameter_min) / 2,
                self: neo.links.self
            };
        };
        this.inputOnchange = (e) => {
            if (e.currentTarget.value.length === 10) {
                let startInput = document.getElementById("start-input");
                let endInput = document.getElementById("end-input");
                let startDate = new Date(startInput.value);
                let endDate = new Date(endInput.value);
                let dayDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                if (startDate > endDate)
                    endInput.value = startDate.toISOString().split("T")[0];
                else if ((dayDiff < -7 || dayDiff > 7)) {
                    if (e.currentTarget.id === "start-input") {
                        endDate.setDate(startDate.getDate() + 7);
                        endInput.value = endDate.toISOString().split("T")[0];
                    }
                    else if (e.currentTarget.id === "end-input") {
                        startDate.setDate(startDate.getDate() - 7);
                        startInput.value = endDate.toISOString().split("T")[0];
                    }
                }
            }
        };
        this.requestNewData = (e) => {
            let startDate = document.getElementById("start-input").value;
            let endDate = document.getElementById("end-input").value;
            if (Number.isNaN(Date.parse(startDate)) || Number.isNaN(Date.parse(endDate)))
                return;
            fetch("https://api.nasa.gov/neo/rest/v1/feed?start_date=" + startDate + "&end_date=" + endDate + "&api_key=" + constants_1.APIKEY)
                .then((resp) => resp.json())
                .then((data) => {
                let neo = data.near_earth_objects[startDate].map(el => this.apiToNeoObject(el));
                this.setState({ neoObjects: neo, startDate: startDate, endDate: endDate });
            });
        };
        this.login = () => {
            let loginBtn = document.getElementById("login-button");
            if (loginBtn.classList.contains("disabled-btn"))
                return;
            loginBtn.classList.add("disabled-btn");
            let username = document.getElementById("username-input");
            let password = document.getElementById("password-input");
            let remember = document.getElementById("remember-check");
            let body = new FormData();
            body.append("username", username.value);
            body.append("password", password.value);
            body.append("remember", remember.checked.toString());
            fetch("http://localhost:8000", {
                method: "POST",
                body: body
            }).then(resp => resp.json())
                .then(data => {
                if (username.value === "marinezak@gmail.com" && password.value === "testpassword1") {
                    this.setState({ loggedIn: true });
                }
                else {
                    this.setState({
                        incorrectPassword: true
                    });
                }
            })
                .catch(() => {
                if (username.value === "marinezak@gmail.com" && password.value === "testpassword1") {
                    this.setState({ loggedIn: true });
                }
                else {
                    this.setState({
                        incorrectPassword: true
                    }, () => {
                        password.classList.add("animate");
                        setTimeout(() => {
                            password.classList.remove("animate");
                        }, 820);
                        password.value = "";
                        document.getElementById("login-button").classList.remove("disabled-btn");
                    });
                }
            });
        };
        this.requestEcounter = (self) => {
            let url = self.replace("http://", "https://");
            fetch(url)
                .then((resp) => resp.json())
                .then((data) => {
                let earthEnounters = data.close_approach_data.filter(el => el.orbiting_body === "Earth");
                let earthEncountersBefore = earthEnounters.filter(el => el.close_approach_date < new Date().toISOString().split("T")[0]);
                let earthEnvoutnerAfter = earthEnounters.filter(el => el.close_approach_date > new Date().toISOString().split("T")[0]);
                if (earthEncountersBefore.length > 5)
                    earthEncountersBefore.length = 5;
                if (earthEnvoutnerAfter.length > 5)
                    earthEnvoutnerAfter.length = 5;
                let prevEncounters = earthEncountersBefore.map(el => {
                    return {
                        date: el.close_approach_date,
                        speed: (Math.floor(parseFloat(el.relative_velocity.kilometers_per_hour) * 100) / 100).toString(),
                        distance: (Math.floor(parseFloat(el.miss_distance.kilometers) * 100) / 100).toString()
                    };
                });
                let nextEncounters = earthEnvoutnerAfter.map(el => {
                    return {
                        date: el.close_approach_date,
                        speed: (Math.floor(parseFloat(el.relative_velocity.kilometers_per_hour) * 100) / 100).toString(),
                        distance: (Math.floor(parseFloat(el.miss_distance.kilometers) * 100) / 100).toString()
                    };
                });
                this.setState({
                    prevEncounters,
                    nextEncounters
                });
            });
        };
        this.state = {
            neoObjects: [],
            prevEncounters: [],
            nextEncounters: [],
            loggedIn: false,
            incorrectPassword: false,
            objectID: undefined,
            startDate: undefined,
            endDate: undefined
        };
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.neoObjects !== prevState.neoObjects) {
            if (!this.neoTable) {
                this.neoTable = new tabulator_tables_1.TabulatorFull("#NEO-table", {
                    data: this.state.neoObjects,
                    layout: "fitColumns",
                    pagination: true,
                    paginationSize: 9,
                    rowHeight: 40,
                    columns: [
                        { title: "Name", field: "name" },
                        { title: "Diameter (km)", field: "estimatedDiameter" },
                        { title: "Hazard", field: "hazard" },
                        { title: "Sentry Object", field: "sentry" },
                    ],
                });
                this.neoTable.on("rowClick", (e, row) => {
                    this.requestEcounter(row.getData().self);
                    this.setState({ objectID: row.getData().id });
                });
            }
            else {
                this.neoTable.replaceData(this.state.neoObjects);
            }
        }
        if (this.state.prevEncounters !== prevState.prevEncounters) {
            if (!this.prevTable) {
                this.prevTable = new tabulator_tables_1.TabulatorFull("#prev-table", {
                    data: this.state.prevEncounters,
                    layout: "fitColumns",
                    pagination: true,
                    rowHeight: 40,
                    columns: [
                        { title: "Date", field: "date" },
                        { title: "Speed (kmph)", field: "speed" },
                        { title: "Distance (km)", field: "distance" },
                    ],
                });
                this.nextTable = new tabulator_tables_1.TabulatorFull("#next-table", {
                    data: this.state.nextEncounters,
                    layout: "fitColumns",
                    pagination: true,
                    rowHeight: 40,
                    columns: [
                        { title: "Date", field: "date" },
                        { title: "Speed (kmph)", field: "speed" },
                        { title: "Distance (km)", field: "distance" },
                    ],
                });
            }
            else {
                this.prevTable.replaceData(this.state.prevEncounters);
                this.nextTable.replaceData(this.state.nextEncounters);
            }
        }
    }
    validateInputKeyPress(e) {
        if (!parseInt(e.key)) {
            if (e.key === "Backspace") {
                let value = e.currentTarget.value;
                if (value.substring(value.length - 1) === "-") {
                    value = value.slice(value.length - 1);
                }
                return;
            }
            if (e.key === "0" || e.key.includes("Arrow") || e.key === "-")
                return;
            e.preventDefault();
        }
        if (e.currentTarget.value.length >= 10)
            e.preventDefault();
    }
    render() {
        return react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", { id: "top-container", className: 'column-container' },
                react_1.default.createElement("div", { id: "field-container", className: "left-box outline" },
                    react_1.default.createElement("p", null, "NEO Viewer"),
                    react_1.default.createElement("p", null, "Set a start date and end date to search for near by Near Earth Objects"),
                    react_1.default.createElement("p", null, "Date Format: YYYY-MM-DD"),
                    react_1.default.createElement("p", null, "Note: Start and End dates must be within 7 days of each other"),
                    react_1.default.createElement("label", { htmlFor: "start-input" }, "Start Date"),
                    react_1.default.createElement("input", { id: "start-input", className: "date-input", type: "text", defaultValue: "2015-09-07", name: "Start Date", onChange: this.inputOnchange, onKeyDown: this.validateInputKeyPress }),
                    react_1.default.createElement("label", { htmlFor: "end-input" }, "End Date"),
                    react_1.default.createElement("input", { id: "end-input", className: "date-input", type: "text", defaultValue: "2015-09-07", name: "End Date", onChange: this.inputOnchange, onKeyDown: this.validateInputKeyPress }),
                    react_1.default.createElement("button", { onClick: this.requestNewData }, "Request NEOs")),
                react_1.default.createElement("div", { id: "spacer" })),
            react_1.default.createElement("div", { id: "bottom-container", className: 'column-container' },
                react_1.default.createElement("div", { id: "NEO-container", className: "left-box outline" },
                    react_1.default.createElement("p", null, "NEO objects between: ".concat(this.state.startDate ? this.state.startDate + " to " + this.state.endDate : "")),
                    react_1.default.createElement("div", { id: "NEO-table" })),
                react_1.default.createElement("div", { id: "encounter-container", className: "left-box outline" },
                    react_1.default.createElement("p", null, "Encounters for NEO ID: ".concat(this.state.objectID ? this.state.objectID : "")),
                    react_1.default.createElement("p", null, "Previous Encounters"),
                    react_1.default.createElement("div", { id: "prev-table", className: 'table' }),
                    react_1.default.createElement("p", null, "Next Encounters"),
                    react_1.default.createElement("div", { id: "next-table", className: 'table' }))),
            !this.state.loggedIn &&
                react_1.default.createElement("div", { id: "login-container" },
                    react_1.default.createElement("div", { id: "login-inner", className: 'outline' },
                        react_1.default.createElement("p", null, "Near Earth Object(NEO) Viewer"),
                        react_1.default.createElement("p", { id: "incorrect" }, this.state.incorrectPassword && "Inccorrect Username or Password. Please try again"),
                        react_1.default.createElement("label", { htmlFor: 'username-input' }, "Username: "),
                        react_1.default.createElement("input", { id: "username-input", type: "text" }),
                        react_1.default.createElement("label", { htmlFor: 'password-input' }, "Password: "),
                        react_1.default.createElement("input", { id: "password-input", type: "password" }),
                        react_1.default.createElement("div", { id: "remember" },
                            react_1.default.createElement("input", { id: "remember-check", type: "checkbox" }),
                            react_1.default.createElement("label", { htmlFor: 'remember-check' }, "Remember Me ")),
                        react_1.default.createElement("button", { id: "login-button", onClick: this.login }, "Login"))));
    }
}
exports.default = App;
