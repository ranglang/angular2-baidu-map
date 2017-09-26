
import {RouteOptions} from "./Options";
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
    contextmenu: any;
}

// export interface MarkerState {
//     marker: any;
//     cxm ?: any;
//     listeners: Function[];
// }

export interface PolyLineSate {
    polyLine: any;
    listeners: Function[];
}

export interface PreviousStateMarker {
    stops: MarkerSate[];
    markers: MarkerSate[];
    polyLine ?: PolyLineSate[];
    drivingRoute: any;
    currentPoints ?: MarkerSate[];
    mapListener: Function;
}

// export interface PreviousStateMarker {
//     markers: MarkerSate[]
// }


export interface PreviousAutoComplete {
    autoComplete: any;
    listeners: Function[];
}
