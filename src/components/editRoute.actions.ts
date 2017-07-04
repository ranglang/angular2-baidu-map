import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import {MarkerSate} from "../interfaces/PreviousMarker";
import {MapOptions} from "../interfaces/Options";

@Injectable()

export class EditRouteActions {
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

    static SET_ENABLE_ADD_MARKER = '[ROUTE EDIT ] SET Add Marker';
    public setEnableAddMarker(): Action {
        return {
            type: EditRouteActions.SET_ENABLE_ADD_MARKER,
        };
    }

    static SET_CLEAR = '[ROUTE EDIT ] SET Clear';
    public setClear(): Action {
        return {
            type: EditRouteActions.SET_CLEAR,
        };
    }
}

