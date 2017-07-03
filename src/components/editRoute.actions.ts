import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

@Injectable()

export class EditRouteActions {

    static SHOW_MARKER = '[Stop] show Marker';
    public showMarker(): Action {
        return {
            type: EditRouteActions.SHOW_MARKER,
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
    public applyChange(): Action {
        return {
            type: EditRouteActions.APPLY_CHANGE,
        };
    }

    static CANCEL_CHANGE = '[ROUTE EDIT ] Cancel Change';
    public cancelChange(): Action {
        return {
            type: EditRouteActions.CANCEL_CHANGE,
        };
    }
}
