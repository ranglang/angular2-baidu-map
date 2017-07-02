import {
    Component, SimpleChange, Input, Output, EventEmitter, OnInit, OnChanges, ChangeDetectionStrategy, ElementRef,
    OnDestroy
} from '@angular/core';

import { MapOptions, OfflineOptions } from '../interfaces/Options';
import {PreviousAutoComplete, PreviousMarker, MarkerHandler, PreviousEditPolyLine} from '../interfaces/PreviousMarker';
import { MapStatus } from '../enum/MapStatus';

import { defaultOfflineOpts, defaultOpts } from '../defaults';

import { loader } from '../Loader';
import {Store} from '@ngrx/store';
import { Action } from '@ngrx/store';
import {
    reCenter, reZoom, redrawMarkers, createInstance, redrawPolyline, createAutoComplete,
    reCheckEditPolygon, reCreatePolygon, createMarkerEdit
} from '../CoreOperations';
import {PreviousPolygon} from "../interfaces/PreviousPolygon";
import {redrawMarkersEdit, redrawPolyLinEdit} from "../RouteEditCoreOperations";
import {AppRxState} from "../app/ngrx";
import {Observable, Subscription} from "rxjs";
import {EditRouteActions} from "./editRoute.actions";


export interface EditRouteRxState {
    startIndex: number;
    endIndex: number;
}

export const initialState: EditRouteRxState  = {
    startIndex: -1,
    endIndex: -1,
}


export function editRouteReducer(state = initialState, action: any): EditRouteRxState  {
    switch (action.type) {
        case EditRouteActions.SHOW_MARKER: {
            return state;
        }

        case EditRouteActions.SET_START: {
            return {...state, startIndex: action.payload};
        }
        default: {
            return state;
        }
    }
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'edit-route',
    styles: [`
        .offlinePanel{
            width: 100%;
            height: 100%;
            background-color: #E6E6E6;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
        }
    `, `
        .offlineLabel{
            font-size: 30px;
        }
    `],
    template: `
        <div class="offlinePanel">
            <label class="offlineLabel">{{ offlineWords }}</label>
        </div>
    `
})
export class EditRoute implements OnInit, OnChanges, OnDestroy {
    @Input() ak: string;
    @Input() protocol: string;
    @Input() options: MapOptions;
    @Input('offline') offlineOpts: OfflineOptions;
    @Output() onMapLoaded = new EventEmitter();
    @Output() onMarkerClicked = new EventEmitter();
    @Output() onMarkerDragged = new EventEmitter();
    @Output() onSearchCompleted = new EventEmitter();
    @Output() onEditPolygonCompleted = new EventEmitter();
    @Output() onClicked = new EventEmitter();

    map: any;
    offlineWords: string;
    previousMarkers: PreviousMarker[] = [];
    previousAutoComplete : PreviousAutoComplete;

    previousPolyLine : PreviousEditPolyLine;

    previousPolygon : PreviousPolygon;
    polyline: any;

    markerHandler: MarkerHandler;


    private map$ : Observable<EditRouteRxState>;

    private  _subRes: Subscription;
    constructor(private el: ElementRef,
                private  action: EditRouteActions,
                private store: Store<AppRxState>,
    ) {
        this.map$= this.store.select(res => {
            console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
            console.log(res);
            return res.routeEdit;
        });

        this._subRes = this.map$.subscribe((res) => {
            console.log('///////////////////////////////////////////');
            console.log(res);
        })
    }

    ngOnInit() {
        let offlineOpts: OfflineOptions = Object.assign({}, defaultOfflineOpts, this.offlineOpts);
        this.offlineWords = offlineOpts.txt;
        loader(this.ak, offlineOpts, this._draw.bind(this), this.protocol, 'edit-route');
    }

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        let baiduMap = (<any>window)['baiduMap'];
        if (!baiduMap || baiduMap.status !== MapStatus.LOADED) {
            return;
        }
        if (changes['options'].isFirstChange() && !this.map) {
            return;
        }
        let opts = changes['options'].currentValue;
        reCenter(this.map, opts);
        reZoom(this.map, opts);
        console.log('ngChanges: opts')
        console.log(opts.markers)

        redrawMarkersEdit.bind(this)(this.map, this.previousMarkers, this.markerHandler, opts);
        // redrawPolyline.bind(this)(this.map, this.polyline, opts)
        // createAutoComplete.bind(this)(this.map, this.previousAutoComplete, opts)
        // reCheckEditPolygon.bind(this)(this.map, this.previousPolygon, opts)
        // reCreatePolygon.bind(this)(this.map, this.previousPolygon, opts)
    }

    _draw() {
        let options: MapOptions = Object.assign({}, defaultOpts, this.options);
        this.map = createInstance(options, this.el.nativeElement);
        this.map.addEventListener('click', e => {
            this.onClicked.emit(e);
        });
        this.onMapLoaded.emit(this.map);
        redrawMarkersEdit.bind(this)(this.map, this.previousMarkers, this.markerHandler, options);
        // redrawPolyline.bind(this)(this.map, this.polyline, options)
        // createAutoComplete.bind(this)(this.map, this.previousAutoComplete, options)
        // reCheckEditPolygon.bind(this)(this.map, this.previousPolygon, options)
        // reCreatePolygon.bind(this)(this.map, this.previousPolygon, options)
    }



    _drawPolyLine() {
        console.log('_drawPolyLine');
        let options: MapOptions = Object.assign({}, defaultOpts, this.options);
        console.log('this.markerHandler');
        console.log(this.markerHandler);
        redrawPolyLinEdit.bind(this)(this.map, this.previousPolyLine, this.markerHandler, options )
    }

    _setStart(i: number) {
        console.log('dispatch set start: ' + i);
        this.store.dispatch(this.action.setStart(i));
    }


    ngOnDestroy(): void {
        if(this._subRes ) {
            this._subRes.unsubscribe();
        }
    }

}

