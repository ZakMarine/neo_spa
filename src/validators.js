"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInputKeyPress = exports.inputOnchange = void 0;
const inputOnchange = (e) => {
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
exports.inputOnchange = inputOnchange;
const validateInputKeyPress = (e) => {
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
};
exports.validateInputKeyPress = validateInputKeyPress;
