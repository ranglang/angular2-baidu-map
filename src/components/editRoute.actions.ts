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
}