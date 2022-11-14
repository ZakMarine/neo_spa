export const inputOnchange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    //validate that the dates are within 7 days of each other due to restriction of the API
    if (e.currentTarget.value.length === 10){
        // retrieve input elements
        let startInput = document.getElementById("start-input") as HTMLInputElement
        let endInput = document.getElementById("end-input") as HTMLInputElement

        // convert dates to JavaScript date objects
        let startDate = new Date(startInput.value)
        let endDate = new Date(endInput.value)

        // calculate the number of days between the start and end
        // the initial minus of dates returns the output in milliseconds and as such we have to convert to days
        let dayDiff = Math.ceil((endDate.getTime() - startDate.getTime())  / (1000 * 60 * 60 * 24))
    
        // if the start date is after the end date set the end date to the start date
        //note this also catches if the user enters a end date before the start date
        if (startDate > endDate)
            endInput.value = startDate.toISOString().split("T")[0]
        // if the difference is greater than 7 set the dates to exactly 7 days so as to always have valid dates for the api request
        else if ((dayDiff < -7 || dayDiff > 7)){
            if (e.currentTarget.id === "start-input"){
                endDate.setDate(startDate.getDate() + 7)
                endInput.value = endDate.toISOString().split("T")[0]
            }
            else if (e.currentTarget.id === "end-input"){
                startDate.setDate(startDate.getDate() - 7)
                startInput.value = endDate.toISOString().split("T")[0]
            }
        }
    }
}

export const validateInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    //check if key is a number
    if (!parseInt(e.key)){
        // if the backspace allow default event to happen
        if (e.key === "Backspace") {
            //check if we hit a - to remove that as well so the user can get past them
            let value = e.currentTarget.value
            if (value.substring(value.length - 1) === "-"){
                value = value.slice(value.length - 1)
            }
            return
        }
        // if key or 0 or arrow keys and dash return to allow default event to happen
        if (e.key === "0" || e.key.includes("Arrow") || e.key === "-") return
        //If any other key prevent default so that the user cannot enter non numeric characters
        e.preventDefault();
    }
    
    // if we are at 10 characters, length of YYYY-MM-DD format, prevent default so the user cannot add information 
    // and therefore increasing the length of the input past length of YYYY-MM-DD
    if (e.currentTarget.value.length >= 10) e.preventDefault()
}