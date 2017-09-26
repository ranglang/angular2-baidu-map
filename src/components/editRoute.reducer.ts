
import {EditRouteRxState} from "./editRoute";
import {MarkerIcon, RouteEditMode} from "../enum/ControlAnchor";
import {EditRouteActions} from "./editRoute.actions";
import {MapOptions} from "../interfaces/Options";
import {MarkerSate} from "../interfaces/PreviousMarker";

export const initialState: EditRouteRxState  = {
    startIndex: -1,
    endIndex: -1,
    enableMarkerClick: false,
    markers: [],
    viewports : [],
    stops: [],
    routes: [],
    enableSearch: false,
    editMode: RouteEditMode.SELECT_MODE,
}


function filterAnable(state: EditRouteRxState): EditRouteRxState {

    return {...state,
        stops: state.stops.map(res => ({...res,
            autoDisplayInfoWindow: false
        }))
    }

    // return state;
}
export function editRouteReducer(state = initialState, action: any): EditRouteRxState {





    // console.log('editRouteReducer');
    // console.log(action);
    // console.log(state);
    switch (action.type) {
        case EditRouteActions.SET_CLEAR: {
            return {...state, markers: [], startIndex: -1, endIndex: -1, polyLine: [], enableSearch: false}
        }

        case EditRouteActions.SET_OPTIONS: {
            let mapOpts = action.payload as MapOptions;
            console.log('reducer');
            console.log(mapOpts);
            let a =  {...state,
                markers: mapOpts.markers,
                startIndex: -1,
                endIndex: -1,
                stops: mapOpts.stops,
                viewports: mapOpts.markers}
                return filterAnable(a);
        }

        case  EditRouteActions.UPDATE_ROUTE_POINT: {
            let routePointList = action.payload;


            console.log(routePointList);
            // routePointList.map(res => ({
            //           longitude: res.lng,
            //           latitude: res.lat,
            //           category: MarkerIcon.ROUTE
            //         })),
            let a = {...state,
                markers: routePointList.map(res => ({
                          longitude: res.lng,
                          latitude: res.lat,
                          category: MarkerIcon.ROUTE
                        })),
                startIndex: -1,
                endIndex: -1,
                // stops: mapOpts.stops,
                // viewports: mapOpts.markers
            }
            return filterAnable(a)
        }

        case EditRouteActions.SET_STRAIGHT: {
            return {...state, editMode: RouteEditMode.SET_STRAIGHT};
        }
        case EditRouteActions.UPDATE_SHOW_STOP_INFO : {
            let stop = action.payload;
           return {...state,
               stops: state.stops.map(item => ({...item,
                   autoDisplayInfoWindow: item.longitude === stop.lng && item.latitude === stop.lat,
               }))
           }
        }

        case EditRouteActions.SET_START: {
            if(state.endIndex !== -1 ) {
                let s = action.payload < state.endIndex ? action.payload  : state.endIndex;
                let e = action.payload > state.endIndex ? action.payload : state.endIndex;
                return filterAnable({...state,
                    viewports: [],
                    startIndex: s, endIndex: e});
            } else {
                return filterAnable({...state,
                    viewports: [],
                    startIndex: action.payload});
            }

        }

        case EditRouteActions.SET_END: {

            if(state.startIndex !== - 1) {
                let s = state.startIndex < action.payload ? state.startIndex : action.payload;
                let e = state.startIndex > action.payload ? state.startIndex : action.payload;
                return filterAnable({...state,
                    viewports: [],
                    startIndex: s, endIndex: e});
            } else {
                return filterAnable({...state,
                    viewports: [],
                    endIndex: action.payload});
            }
        }

        case EditRouteActions.SET_DRIVE: {
            return {...state, enableSearch: true, editMode: RouteEditMode.DRIVIVE_ROUTE};
        }

        case EditRouteActions.SET_ENABLE_ADD_MARKER : {
            return {...state, enableMarkerClick: true, editMode: RouteEditMode.SET_AND_MARKER};
        }
        case EditRouteActions.APPLY_CHANGE: {
            switch (state.editMode) {
                case RouteEditMode.SET_AND_MARKER: {
                    let a = state.markers.slice(0, state.startIndex + 1);
                    let b = state.markers.slice(state.endIndex);

                    let s = action.payload as MarkerSate[]
                    let c = s.map(item => {
                        return {
                            longitude: item.marker.getPosition().lng,
                            latitude: item.marker.getPosition().lat,
                            category: MarkerIcon.ROUTE
                        }
                    });
                    let r = (a.concat(c)).concat(b);

                    return {...state,
                        enableMarkerClick: false,
                        editMode: RouteEditMode.SELECT_MODE, markers: r , endIndex: state.endIndex + c.length - (state.startIndex - state.endIndex + 1)
                    }
                }
                case RouteEditMode.SET_STRAIGHT: {
                    let a = state.markers.slice(0, state.startIndex + 1);
                    let b = state.markers.slice(state.endIndex);
                    return {
                        ...state, enableSearch: false,
                        editMode: RouteEditMode.SELECT_MODE, markers: a.concat(b), endIndex: state.startIndex + 1
                    };
                }
                case RouteEditMode.DRIVIVE_ROUTE: {
                    let a = state.markers.slice(0, state.startIndex);
                    let b = state.markers.slice(state.endIndex + 1)
                    let s = action.payload as MarkerSate[]

                    let c = s.map(item => {
                        return {
                            longitude: item.marker.getPosition().lng,
                            latitude: item.marker.getPosition().lat,
                            category: MarkerIcon.ROUTE
                        }
                    });
                    let r = (a.concat(c)).concat(b);
                    return {...state, enableSearch: false, editMode: RouteEditMode.SELECT_MODE, markers: r};
                }
                default: {
                    return state;
                }
            }
        }

        case EditRouteActions.CANCEL_CHANGE: {
            switch (state.editMode) {
                case RouteEditMode.SET_AND_MARKER: {
                    return {...state, enableSearch: false, editMode: RouteEditMode.SELECT_MODE, enableMarkerClick: false};
                }
                case RouteEditMode.DRIVIVE_ROUTE: {
                    return {...state, enableSearch: false, editMode: RouteEditMode.SELECT_MODE};
                }
                case RouteEditMode.SET_STRAIGHT: {
                    return {...state, enableSearch: false, editMode: RouteEditMode.SELECT_MODE};
                }
                default: {
                    return state;
                }
            }
        }
        default: {
            return state;
        }
    }
}
