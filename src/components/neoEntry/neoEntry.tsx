import React, { useState } from 'react'
import { neoObject } from "../../@types"

declare type props = {
    object: neoObject
    requestEncounter: (self: string) => void
}

export default function NEOEntry(props: props){
    return <div id={props.object.id} className="NEO-entry" onClick={e => props.requestEncounter(props.object.self)}>
        {/* <h2>Name</h2>
        <p>{props.object.name}</p>
        <h3>Diameter</h3>

        <h3>Hazard</h3>
        <p>{props.object.hazard.toString()}</p>
        
        <h3>Sentry Object</h3>
        <p>{props.object.sentry.toString()}</p> */}
    </div>
}