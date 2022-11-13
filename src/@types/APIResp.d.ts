export type APIDefaultResp = {
    links: {
        next: string,
        prev: string,
        self: string,
    },
    element_count: number,
    near_earth_objects: {
        [key: string]: APINEOResp[]
    }

}

type APIDistance = {estimated_diameter_min: number, estimated_diameter_max: number}

export type APINEOResp = {
    links: {self: string},
    id: string,
    name: string,
    neo_reference_id: string,
    nasa_jpl_url: string,
    absoulte_magnitude_h: number,
    estimated_diameter: {
        kilometers: APIDistance,
        meters: APIDistance, 
        miles: APIDistance,
        feet: APIDistance
    },
    is_potentially_hazardous_asteroid: boolean,
    close_approach_data: APICloseApprData[],
    is_sentry_object: boolean
}


type APICloseApprData = {
    close_approach_date: string,
    close_approach_date_full: string,
    epoch_date_close_approach: string,
    relative_velocity: {
        kilometers_per_second: string,
        kilometers_per_hour: string,
        miles_per_hour: string
    },
    miss_distance: {
        astronomical: string,
        lunar: string,
        kilometers: string,
        miles: string
    },
    orbiting_body: string,
    is_sentry_object: boolean
}