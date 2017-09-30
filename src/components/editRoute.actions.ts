import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import {MarkerSate} from "../interfaces/PreviousMarker";
import {MapOptions} from "../interfaces/Options";

@Injectable()

export class EditRouteActions {
    static UPDATE_SET_UN_START = '[ROUTE EDIT ]  UPDATE_SET_UN_START ';
    public update_UPDATE_SET_UN_START (i: number): Action {
        return {
            type: EditRouteActions.UPDATE_SET_UN_START,
            payload: i,
        };
    }


    static UPDATE_SET_UN_END = '[ROUTE EDIT ]  UPDATE_SET_UN_END ';
    public update_UPDATE_SET_UN_END (i: number): Action {
        return {
            type: EditRouteActions.UPDATE_SET_UN_END,
            payload: i,
        };
    }


    static SET_START = '[ROUTE EDIT ] Set Start';
    public setStart(i: number): Action {
        return {
            type: EditRouteActions.SET_START,
            payload: i,
        };
    }

    static SET_END = '[ROUTE EDIT ] Set End';
    public setEnd(i: number): Action {
        return {
            type: EditRouteActions.SET_END,
            payload: i,
        };
    }

    static SET_DRIVE = '[ROUTE EDIT ] Set Drive';
    public setDrive(): Action {
        return {
            type: EditRouteActions.SET_DRIVE,
        };
    }

    static APPLY_CHANGE = '[ROUTE EDIT ] Apply Change';
    public applyChange(a: MarkerSate[] ): Action {
        return {
            type: EditRouteActions.APPLY_CHANGE,
            payload: a
        };
    }

    static CANCEL_CHANGE = '[ROUTE EDIT ] Cancel Change';
    public cancelChange(): Action {
        return {
            type: EditRouteActions.CANCEL_CHANGE,
        };
    }

    static SET_OPTIONS = '[ROUTE EDIT ] INITIAL Change';
    public getSetMapOption(mapOpt: MapOptions): Action {
            return {
                type: EditRouteActions.SET_OPTIONS,
                payload: mapOpt
            };
    }

    static SET_STRAIGHT = '[ROUTE EDIT ] SET Straight';
    public setStraight(): Action {
        return {
            type: EditRouteActions.SET_STRAIGHT,
        };
    }

    static SET_ENABLE_ADD_MARKER_AFTER_DESTINATION = '[ROUTE EDIT ] SET ENABLE_ADD_MARKER_AFTER_DESTINATION ';
    public setEnableAddMarkerAfterDestination(): Action {
        return {
            type: EditRouteActions.SET_ENABLE_ADD_MARKER_AFTER_DESTINATION,
        };
    }
    static SET_ENABLE_ADD_MARKER = '[ROUTE EDIT ] SET Add Marker';
    public setEnableAddMarker(): Action {
        return {
            type: EditRouteActions.SET_ENABLE_ADD_MARKER,
        };
    }

    static SET_UPDATE_REMOVE_MARKER_IN_LINE = '[ROUTE NEED ADD INITIAL ] REMOVE POINT IN LINE';
    public removeMarkerInLine(): Action {
        return {
            type: EditRouteActions.SET_UPDATE_REMOVE_MARKER_IN_LINE,
        };
    }

    static SET_UPDATE_REMOVE_MARKER = '[ROUTE NEED ADD INITIAL ] REMOVE POINT ';
    public removeMarker(): Action {
        return {
            type: EditRouteActions.SET_UPDATE_REMOVE_MARKER,
        };
    }

    static SET_ENABLE_ADD_INITIAL = '[ROUTE NEED ADD INITIAL ] SET_ENABLE_ADD_INITIAL ';
    public setInitailAddMarker(): Action {
        return {
            type: EditRouteActions.SET_ENABLE_ADD_INITIAL ,
        };
    }

    static SET_CLEAR = '[ROUTE EDIT ] SET Clear';
    public setClear(): Action {
        return {
            type: EditRouteActions.SET_CLEAR,
        };
    }

    static UPDATE_ROUTE_POINT = '[ROUTE POINT ] UPDATE Route point';
    public updateRoutePoint(data: any): Action {
        return {
            type: EditRouteActions.UPDATE_ROUTE_POINT,
            payload: data
        };
    }

    static UPDATE_SHOW_STOP_INFO = '[ROUTE POINT ] update show stop info';
    public updateShowStopInfo(stop: any): Action {
        return {
            type: EditRouteActions.UPDATE_SHOW_STOP_INFO,
            payload: stop
        };
    }
}

