
export interface MarkerHandler {
    startMarker ?: any;
    endMarker ?: any;
}

export interface PreviousEditPolyLine {
    polyLine: any;
    cxm ?: any;
    listeners: Function[];
}


export interface MarkerSate {
    marker: any;
    listeners: Function[];
}

export interface PolyLineSate {
    polyLine: any;
    listeners: Function[];
}

export interface PreviousStateMarker {
    markers: MarkerSate[],
    polyLine ?: PolyLineSate[]
    drivingRoute: any;
}

// export interface PreviousStateMarker {
//     markers: MarkerSate[]
// }

export interface PreviousMarker {
    marker: any;
    cxm ?: any;
    listeners: Function[];
}

export interface PreviousAutoComplete {
    autoComplete: any;
    listeners: Function[];
}
