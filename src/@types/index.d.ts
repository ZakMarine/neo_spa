export * from './APIResp'

export type neoObject = {
    name: string,
    estimatedDiameter: number,
    hazard: boolean,
    sentry: boolean,
    id: string,
    self: string
}

export type Distance = {min: number, max: number}

export type estimateDiameter = {
    kilometers: Distance,
    meters: Distance, 
    miles: Distance,
    feet: Distance
}


export type NEOEncounter = {
    date: string,
    speed: string,
    distance: string
}