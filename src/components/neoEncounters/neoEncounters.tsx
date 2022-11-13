import React from 'react'
import { NEOEncounter } from "../../@types"

declare type props = {
    prevEnvounters: NEOEncounter[],
    nextEncounters: NEOEncounter[]
}

export default function Encounter(props: props){
    return <>
    <div>
        {props.prevEnvounters.map(el => <div key={el.date}>
            <h2>Date</h2>
            <p>{el.date}</p>

            <h2>Speed</h2>
            <p>{el.speed}</p>

            <h2>Distance</h2>
            <p>{el.distance}</p>
        </div>
        )}
    </div>
    <div>
        {props.nextEncounters.map(el => <div key={el.date}>
            <h2>Date</h2>
            <p>{el.date}</p>

            <h2>Speed</h2>
            <p>{el.speed}</p>

            <h2>Distance</h2>
            <p>{el.distance}</p>
        </div>
        )}
    </div>
    </>
}