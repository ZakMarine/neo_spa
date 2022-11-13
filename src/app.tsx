import React, {ChangeEvent, Component} from 'react'
import {TabulatorFull as Tabulator} from 'tabulator-tables';
import { neoObject, APIDefaultResp, APINEOResp, Distance, estimateDiameter, NEOEncounter } from './@types'
import Encounter from './components/neoEncounters/neoEncounters'
import NEOEntry from './components/neoEntry/neoEntry'
import { APIKEY } from './constants'
import './app.scss'
import './tabular.scss'

declare type props = {
    test: string
}

declare type state = {
    neoObjects: neoObject[],
    prevEncounters: NEOEncounter[]
    nextEncounters: NEOEncounter[],
    loggedIn: boolean,
    incorrectPassword: boolean,
    objectID: string | undefined,
    startDate: string | undefined,
    endDate: string | undefined
}

export default class App extends Component<props, state>{

    neoTable: Tabulator
    prevTable: Tabulator
    nextTable: Tabulator

    constructor(props: props){
        super(props)

        this.state = {
            neoObjects: [],
            prevEncounters: [],
            nextEncounters: [],
            loggedIn: false,
            incorrectPassword: false,
            objectID: undefined,
            startDate: undefined,
            endDate: undefined
        }
        
    }

    componentDidUpdate(prevProps: Readonly<props>, prevState: Readonly<state>, snapshot?: any): void {
        // if we have an update to the NEO objects
        if (this.state.neoObjects !== prevState.neoObjects){
            // if this is the first request we have to generate the table
            if (!this.neoTable){
                this.neoTable = new Tabulator("#NEO-table", {
                    // height: "80%", // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
                    data:this.state.neoObjects, //assign data to table
                    layout:"fitColumns", //fit columns to width of table (optional).
                    pagination:true,
                    paginationSize:9,
                    //@ts-ignore
                    rowHeight:40, //set rows to 40px height
                    // paginationSize:5,
                    columns:[ //Define Table Columns
                        {title:"Name", field:"name"},
                        {title:"Diameter (km)", field:"estimatedDiameter"},
                        {title:"Hazard", field:"hazard"},
                        {title:"Sentry Object", field:"sentry"},
                    ],
               });
               
               //on a click of a row request the encounter data
               this.neoTable.on("rowClick", (e, row) => { 
                    this.requestEcounter(row.getData().self)
                    this.setState({objectID: row.getData().id})
               });
            }
            else{
                //otherwise update the data in the already exsiting table
                this.neoTable.replaceData(this.state.neoObjects)
            }
        }

        // if we have an update to the Encounters state
        if (this.state.prevEncounters !== prevState.prevEncounters){
            // if this is the first request we have to generate the table
            if (!this.prevTable){
                this.prevTable = new Tabulator("#prev-table", {
                    // height: "80%", // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
                    data:this.state.prevEncounters, //assign data to table
                    layout:"fitColumns", //fit columns to width of table (optional).
                    pagination:true,
                    //@ts-ignore
                    rowHeight:40, //set rows to 40px height
                    // paginationSize:5,
                    columns:[ //Define Table Columns
                        {title:"Date", field:"date"},
                        {title:"Speed (kmph)", field:"speed"},
                        {title:"Distance (km)", field:"distance"},
                    ],
               });
                this.nextTable = new Tabulator("#next-table", {
                    // height: "80%", // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
                    data:this.state.nextEncounters, //assign data to table
                    layout:"fitColumns", //fit columns to width of table (optional).
                    pagination:true,
                    //@ts-ignore
                    rowHeight:40, //set rows to 40px height
                    // paginationSize:5,
                    columns:[ //Define Table Columns
                        {title:"Date", field:"date"},
                        {title:"Speed (kmph)", field:"speed"},
                        {title:"Distance (km)", field:"distance"},
                    ],
               });
            }
            else{
                //otherwise update the data in the already exsiting table
                this.prevTable.replaceData(this.state.prevEncounters)
                this.nextTable.replaceData(this.state.nextEncounters)
            }
        }

    }

    apiToNeoObject = (neo: APINEOResp): neoObject => {

        let diameter: estimateDiameter = {} as estimateDiameter

        // get all diameter values out of the API response
        Object.keys(neo.estimated_diameter).forEach((el: "kilometers" | "meters" | "miles" | "feet") => diameter[el] = {
            min: neo.estimated_diameter[el].estimated_diameter_max, 
            max: neo.estimated_diameter[el].estimated_diameter_min
        })

        //return the data from the API that we require for rendering and functionality, 
        //this means that we can work with smaller objects then if we were to store the exact output of the API request

        return {
            id: neo.id,
            name: neo.name,
            hazard: neo.is_potentially_hazardous_asteroid,
            sentry: neo.is_sentry_object,
            estimatedDiameter: (neo.estimated_diameter["kilometers"].estimated_diameter_max + neo.estimated_diameter["kilometers"].estimated_diameter_min) / 2,
            self: neo.links.self
        }
    }

    inputOnchange = (e: React.ChangeEvent<HTMLInputElement>): void => {
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

    validateInputKeyPress (e: React.KeyboardEvent<HTMLInputElement>): void{
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

    requestNewData = (e: React.MouseEvent<HTMLButtonElement>): void => {
        // get start and end date
        let startDate = (document.getElementById("start-input") as HTMLInputElement).value
        let endDate = (document.getElementById("end-input") as HTMLInputElement).value


        //validate they are in YYYY-MM-DD format
        if (Number.isNaN(Date.parse(startDate)) || Number.isNaN(Date.parse(endDate))) return

        // fetch data from API
        fetch("https://api.nasa.gov/neo/rest/v1/feed?start_date=" + startDate + "&end_date=" + endDate + "&api_key=" + APIKEY)
        .then((resp) => resp.json())
        .then((data: APIDefaultResp) => {
            //convert all NEOs from the API into simpler objects containing the information we want to render
            let neo = data.near_earth_objects[startDate].map(el => this.apiToNeoObject(el))

            this.setState({neoObjects: neo, startDate: startDate, endDate: endDate})
        })
    }

    login = () => {
        let loginBtn = document.getElementById("login-button")
        // if button is currently disabled, running login request return
        if (loginBtn.classList.contains("disabled-btn")) return

        // add in disabled class
        loginBtn.classList.add("disabled-btn")
        //get username and password inputs
        let username = document.getElementById("username-input") as HTMLInputElement
        let password = document.getElementById("password-input") as HTMLInputElement
        let remember = document.getElementById("remember-check") as HTMLInputElement

        // create formData for body of POST requets
        let body = new FormData()

        body.append("username", username.value)
        body.append("password", password.value)
        body.append("remember", remember.checked.toString())

        //send request to server handling authentication
        fetch ("http://localhost:8000", {
            method: "POST",
            body: body
        }).then(resp => resp.json())
        .then(data => {
            //dummy check of a username or password
            if (username.value === "marinezak@gmail.com" && password.value === "testpassword1"){
                // if succesful login set loggedIn state to true to remove login overlay
                this.setState({loggedIn: true})
            }
            else{
                // on an incorrect username password render 
                this.setState({
                    incorrectPassword: true
                })
            }
        })
        //.catch as if no server the request will error
        .catch(() => {
            //dummy check of a username or password
            if (username.value === "marinezak@gmail.com" && password.value === "testpassword1"){
                // if succesful login set loggedIn state to true to remove login overlay
                this.setState({loggedIn: true})
            }
            else{

                // on an incorrect username password render 
                this.setState({
                    incorrectPassword: true
                }, () => {
                    // run this in a callback so that the error message and animate happen together
                    //assign the animate class
                    password.classList.add("animate")
                    //create timeout to remove class once animation is done
                    //this is so that if the user enters another incorrect password it will animate again
                    setTimeout(() => {
                        password.classList.remove("animate")
                    }, 820)

                    //clear the current entry in the password field and renable login button
                    password.value = "";
                    document.getElementById("login-button").classList.remove("disabled-btn")
                })
            }

        })
    }

    requestEcounter = (self: string) => {
        //replacing http with https due to local hosting and the self link generating a http request
        let url = self.replace("http://", "https://")
        fetch(url)
        .then((resp) => resp.json())
        .then((data: APINEOResp) => {
            //filter only encounters with earth
            let earthEnounters = data.close_approach_data.filter(el => el.orbiting_body === "Earth")

            // check date string for encounters filtering them into before the current date and after the current date
            let earthEncountersBefore = earthEnounters.filter(el => el.close_approach_date < new Date().toISOString().split("T")[0])
            let earthEnvoutnerAfter = earthEnounters.filter(el => el.close_approach_date > new Date().toISOString().split("T")[0])

            // cut the length of the array to 5 therefore deleting any elements after the 5th
            if (earthEncountersBefore.length > 5) earthEncountersBefore.length = 5
            if (earthEnvoutnerAfter.length > 5) earthEnvoutnerAfter.length = 5

            //convert into objects to be rendered into the table
            let prevEncounters = earthEncountersBefore.map(el => {return {
                date: el.close_approach_date,
                speed: (Math.floor(parseFloat(el.relative_velocity.kilometers_per_hour) * 100) / 100).toString(),
                distance: (Math.floor(parseFloat(el.miss_distance.kilometers) * 100) / 100).toString()
            }})
            let nextEncounters = earthEnvoutnerAfter.map(el => {return {
                date: el.close_approach_date,
                speed: (Math.floor(parseFloat(el.relative_velocity.kilometers_per_hour) * 100) / 100).toString(),
                distance: (Math.floor(parseFloat(el.miss_distance.kilometers) * 100) / 100).toString()
            }})

            this.setState({
                prevEncounters,
                nextEncounters
            })
        })
    }

    render() {
        return <>
            <div id="top-container" className='column-container'>
                {/* <div id="info-container" className='left-box outline'>
                    <p>NEO Viewer</p>
                    <p>Set a start date and end date to search for near by Near Earth Objects</p>
                    <p>Date Format: YYYY-MM-DD</p>
                    <p>Note: Start and End dates must be within 7 days of each other</p>
                </div> */}
                <div id="field-container" className="left-box outline">

                    <p>NEO Viewer</p>
                    <p>Set a start date and end date to search for near by Near Earth Objects</p>
                    <p>Date Format: YYYY-MM-DD</p>
                    <p>Note: Start and End dates must be within 7 days of each other</p>

                    <label htmlFor="start-input">Start Date</label>
                    <input id="start-input" className="date-input" type="text" defaultValue="2015-09-07" name="Start Date" onChange={this.inputOnchange} onKeyDown={this.validateInputKeyPress}></input>
                    <label htmlFor="end-input">End Date</label>
                    <input id="end-input" className="date-input" type="text" defaultValue="2015-09-07" name="End Date" onChange={this.inputOnchange} onKeyDown={this.validateInputKeyPress}></input>
                    <button onClick={this.requestNewData}>Request NEOs</button>
                </div>
                <div id="spacer"/>
            </div>
            <div id="bottom-container" className='column-container'>
                <div id="NEO-container" className="left-box outline">
                    <p>{"NEO objects between: ".concat(this.state.startDate ? this.state.startDate + " to " + this.state.endDate : "")}</p>
                    {/* <p>Near Earth Objects</p> */}
                    <div id="NEO-table" />
                    {/* {this.state.neoObjects.map(el => <NEOEntry key={el.id} object={el} requestEncounter={this.requestEcounter}/>)} */}
                </div>
                <div id="encounter-container" className="left-box outline">
                    <p>{"Encounters for NEO ID: ".concat(this.state.objectID ? this.state.objectID : "")}</p>
                    {/* <Encounter prevEnvounters={this.state.prevEncounters} nextEncounters={this.state.nextEncounters}/> */}
                        <p>Previous Encounters</p>
                        <div id="prev-table" className='table'/>
                        <p>Next Encounters</p>
                        <div id="next-table" className='table'/>
                </div>
            </div>
            {!this.state.loggedIn &&
                <div id="login-container">
                    <div id="login-inner" className='outline'>
                        <p>Near Earth Object(NEO) Viewer</p>
                        <p id="incorrect">{this.state.incorrectPassword && "Inccorrect Username or Password. Please try again"}</p>
                        <label htmlFor='username-input'>Username: </label>
                        <input id="username-input" type="text"></input>
                        <label htmlFor='password-input'>Password: </label>
                        <input id="password-input" type="password"></input>
                        <div id="remember">
                            <input id="remember-check"type="checkbox"/>
                            <label htmlFor='remember-check'>Remember Me </label>
                        </div>
                        <button id="login-button" onClick={this.login}>Login</button>
                    </div>
                </div>
            }
        </>
    }
}

