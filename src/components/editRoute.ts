import {
    Component, SimpleChange, Input, Output, EventEmitter, OnInit, OnChanges, ChangeDetectionStrategy, ElementRef,
    OnDestroy, ViewChild, NgZone, ChangeDetectorRef
} from '@angular/core';

import {MapOptions, OfflineOptions, MarkerOptions} from '../interfaces/Options';
// import {
//     PreviousAutoComplete, MarkerState, MarkerHandler, PreviousEditPolyLine,
//     PreviousStateMarker, MarkerSate, PolyLineSate
// } from '../interfaces/MarkerState';
import { MapStatus } from '../enum/MapStatus';

import { defaultOfflineOpts, defaultOpts } from '../defaults';

import { loader } from '../Loader';
import {Store} from '@ngrx/store';
import { Action } from '@ngrx/store';
import {
    reCenter, redrawMarkers, createInstance, redrawPolyline, createAutoComplete,
    reCheckEditPolygon, reCreatePolygon, createMarkerEdit, createMarker
} from '../CoreOperations';
import {PreviousPolygon} from "../interfaces/PreviousPolygon";
import {
    redrawEditPolyline, redrawPolyLinEdit, redrawEditState, redrawDriveRoute,
    redrawStops
} from "../RouteEditCoreOperations";
// import {AppRxState} from "../app/ngrx";
import {Observable, Subscription} from "rxjs";
import {EditRouteActions} from "./editRoute.actions";
import {sampleTime} from "rxjs/operator/sampleTime";
import {BaiduMap} from "./map";
import {MarkerIcon, RouteEditMode} from "../enum/ControlAnchor";
import {StoneState} from "../app/ngrx";
import {
    MarkerHandler, PolyLineSate, PreviousAutoComplete, PreviousEditPolyLine,
    PreviousStateMarker
} from "../interfaces/PreviousMarker";
// import {StoneState} from "../app/ngrx";
// import {StoneState} from "../app/ngrx";

export interface EditRouteRxState {
    startIndex: number;
    endIndex: number;
    markers: MarkerOptions[];
    stops: MarkerOptions[];
    viewports : {
    longitude: number;
    latitude: number;
    }[],
    routes: {
        longitude: number;
        latitude: number;
    }[]
    enableSearch: boolean;
    enableMarkerClick: boolean;
    editMode: number;
}

// changeDetection: ChangeDetectionStrategy.OnPush,
@Component({
    selector: 'edit-route',
    styles: [`
        .offlinePanel {
            width: 100%;
            height: 100%;
            background-color: #E6E6E6;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
        }

        .offlineLabel {
            font-size: 30px;
        }

        #fixHandleBar {
            position: absolute;
            align-items: center;
            display: flex;
            left: 2.5em;
            top: 2.5em;
            padding-left: 2.5em;
            padding-right: 2.5em;
            padding-top: 1.5625em;
            padding-bottom: 1.5625em;
            z-index: 98;
            height: 65px;
            border-radius: 10px;
            background-color: white;
        }

        #container {
            height: 484px;
        }

        .lineInfo {
            width: 144px;
        }

        .startText {
            width: 48px;
            font-size: 18px;
            color: rgb(204, 204, 204);
            text-align: center;
            padding-left: 3px;
            padding-right: 3px;
        }

        .circle.active {
            background-color: green;
        }

        .circle {
            margin-top: 6px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: rgb(204, 204, 204);
        }

        .startText.active {
            color: rgb(37, 40, 39);
        }

        .edit-line-status {
            margin-top: 9px;
            width: 59px;
            border-top-style: solid;
            border-top-width: 3px;
            padding-top: 4px;
            border-top-color: rgb(204, 204, 204);
        }

        .edit-line-status.active {
            border-top-color: rgb(37, 40, 39);

        }
        
        #fixHandleBar button {
            padding-left: 0;
            font-size: 16px;
            padding-right: 0;
            min-width: 35px;
        }
        
        .mapView {
            width: calc(100vw - 880px);
            height: 80vh;
        }

    `],
    template: `

        <div id="fixHandleBar" *ngIf="state">
            <button class="btn btn-primary" (click)="save($event)">
                <clr-icon shape="sync">
                </clr-icon>
            </button>
            
            <!--[ngClass]="{'active': (hasMarkerStart$ | async) }" -->
            <div class="startText lineInfo" [ngClass]="{'active': state.startIndex !== -1}">起点</div>
            <!--[class.active]="hasMarkerStart$ |async"-->

            <div id="leftStartCircle lineInfo" class="circle" [ngClass]="{'active': state.startIndex !== -1}"></div>
            <!--[class.active]="hasLine$ | async" -->
            <div class="edit-line-status"
                 [class.active]=" state.endIndex !== -1 && state.startIndex !== -1"></div>
            
            <div id="rightEndCircle lineInfo" class="circle"
                 [ngClass]="{'active': state.endIndex !== -1}"
            ></div>

            <div class="startText lineInfo" [ngClass]="{'active': state.endIndex !== -1}" >终点</div>
            
            <div class="lineEditArea" [ngClass]="{'ui-hide': state.startIndex === -1 || state.endIndex === -1 || state.editMode !== -1}">
                    <clr-tooltip>
                        <button class="btn btn-primary" (click)="_drawSearch()" clrTooltipTrigger >
                        <clr-icon   shape="baidu-recommend" size="16">
                        </clr-icon>
                        </button>
                        <clr-tooltip-content clrPosition="top-right" clrSize="xs" *clrIfOpen>
                            <span>百度地图推荐</span>
                        </clr-tooltip-content>
                    </clr-tooltip>

                <clr-tooltip>
                    
                <button class="btn btn-primary" (click)="_drawStraight()" clrTooltipTrigger >
                    <clr-icon shape="straight-line"  size="16">
                    </clr-icon>
                </button>
                    <clr-tooltip-content clrPosition="top-right" clrSize="xs" *clrIfOpen>
                        <span>直线连接</span>
                    </clr-tooltip-content>
                </clr-tooltip>

                <clr-tooltip>
                    
                <button class="btn btn-primary" (click)="_draw2Add()" clrTooltipTrigger >
                    <clr-icon shape="addCircle" size="16">
                    </clr-icon>
                    <clr-tooltip-content clrPosition="top-right" clrSize="xs" *clrIfOpen>
                        <span>新增轨迹点</span>
                    </clr-tooltip-content>
                </button>
                </clr-tooltip>
                
            </div>
            
            <div class="applyOrCancel" [class.ui-hide]="state.editMode === -1">
                <clr-tooltip>
                <button class="btn btn-primary" (click)="_applyChange()" clrTooltipTrigger >
                    <clr-icon shape="check-ok">
                    </clr-icon>
                </button>
                    <clr-tooltip-content clrPosition="top-right" clrSize="xs" *clrIfOpen>
                        <span>应用</span>
                    </clr-tooltip-content>
                </clr-tooltip>
                
                <button class="btn btn-primary" (click)="_applyCancel()" uTooltip="取消" tooltipPosition="bottom"  target="body">
                    <clr-icon shape="times">
                    </clr-icon>
                </button>
            </div>
        </div>
        <div id="container" #map class="mapView">

        </div>
        <clr-modal [(clrModalOpen)]="isLoading" clrModalSize='sm'  [clrModalClosable]="false">
            <h3 class="modal-title"></h3>
            <!--I have a nice title-->
            <div class="modal-body model-center">
                <!--<p>But not much to say...</p>-->
                <span class="spinner spinner-inline">
                Loading...
            </span>
                <span>
                加载中
                </span>
            </div>
        </clr-modal>
    `
})
export class EditRoute implements OnInit, OnChanges, OnDestroy {
    @Input() ak: string;
    @Input() protocol: string;
    // @Input() options: MapOptions;
    @Input('offline') offlineOpts: OfflineOptions;

    @Output() onMapLoaded = new EventEmitter();
    @Output() onMarkerClicked = new EventEmitter();
    @Output() onMarkerDragged = new EventEmitter();
    @Output() onSearchCompleted = new EventEmitter();
    @Output() onEditPolygonCompleted = new EventEmitter();
    @Output() onClicked = new EventEmitter();

    @Output() onSave = new EventEmitter();

    @ViewChild("map") mapChild: ElementRef;

    isLoading: boolean = false;
    map: any;
    offlineWords: string;
    // previousMarkers: MarkerState[] = [];
    previousAutoComplete: PreviousAutoComplete;
    previousPolyLine: PreviousEditPolyLine;
    previousPolygon: PreviousPolygon;

    polyline: any;


    // @Input('offline') offlineOpts: OfflineOptions;

    markerHandler: MarkerHandler;

    previousMarkers: PreviousStateMarker;

    public state: EditRouteRxState;
    public map$: Observable<EditRouteRxState>;
    // public hasMarkerStart$ : Observable<boolean>;
    // public hasMarkerEnd$ : Observable<boolean>;
    // public hasLine$ : Observable<boolean>;

    private _subscription : Subscription;

    constructor(private el: ElementRef,
                private _ngZone: NgZone,
                private action:EditRouteActions,
                private cd: ChangeDetectorRef,
                private store: Store<StoneState>) {

        this.map$ = this.store.select(res => {
            return res.routeEdit;
        });

        // this.hasMarkerStart$ = this.store.select(res => res.routeEdit.startIndex !== -1 )
        // this.hasMarkerEnd$ = this.store.select(res => res.routeEdit.endIndex !== -1 )
        // this.hasLine$ = this.store.select(res => (res.routeEdit.endIndex !== -1  && res.routeEdit.startIndex !== -1))

    }


    // @Input('panTo')
    public panTo(event, $event) {
        var BMap: any = (<any>window)['BMap'];
        this.map.panTo(new BMap.Point(event.lng, event.lat))
        console.log(event);
    }

    ngOnInit() {
        let offlineOpts: OfflineOptions = Object.assign({}, defaultOfflineOpts, this.offlineOpts);
        this.offlineWords = offlineOpts.txt;
        loader(this.ak, offlineOpts, this._draw.bind(this), this.protocol, 'edit-route');

        this._subscription = this.map$.subscribe((res) => {
            this.state = res;
            console.log('rrrrrrrrrrrrrrrrrrrr');
            console.log(res);
            this._redrawState(res);
            // this.cd.markForCheck();
        })
    }

    _redrawState(s: EditRouteRxState) {
        if (!this.map) {
            return;
        }

        let needLoading = false;
        if(s.markers.length > 500) {
            needLoading = true;
        }

        if(needLoading) {
            this.isLoading = true;
        }

        redrawEditState.bind(this)(this.map, this.previousMarkers, s);
        redrawEditPolyline.bind(this)(this.map, this.previousMarkers, s);
        redrawDriveRoute.bind(this)(this.map, this.previousMarkers, s);
        redrawStops.bind(this)(this.map, this.previousMarkers, s);
        if (needLoading) {
            setTimeout(() => {
                this.isLoading = false
            }, 20)
        }
    }

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        let baiduMap = (<any>window)['baiduMap'];
        // let opts = changes['options'].currentValue;

        console.log('ngOnChanges');

        if (!baiduMap || baiduMap.status !== MapStatus.LOADED) {
            return;
        }

        // if (changes['options'].isFirstChange() && !this.map) {
        //     return;
        // }

        if (!this.map) {
            return;
        }


        // console.log('reCenter');
        // reCenter(this.map, opts);
        // console.log('getSetMapOption');
        // console.log(opts);

        // let s = {...initialState, ...opts, markers: opts.markers, stops: opts.stops}
        //
        // this.store.dispatch(this.action.getSetMapOption(s))
    }

    _draw() {
        console.log('draw edit_route');
        // let options: MapOptions = Object.assign({}, defaultOpts, {
        //     center: initialState.
        // });

        // map.centerAndZoom(new BMap.Point(opts.center.longitude, opts.center.latitude), opts.zoom);
        let options:MapOptions = {...defaultOpts,
            center: {
                // ,
                longitude: 114.084272,
                // initialState.longitue,
                latitude:22.541915
                     // initialState.latitude,
            }
        }

            // this.options);

        console.log('a');
        this.map = createInstance(options, this.mapChild.nativeElement);
        this.map.addEventListener('click', e => {
            this.onClicked.emit(e);
        });
        this.onMapLoaded.emit(this.map);

        // let s = {...initialState, markers: thisoptions.markers, stops: this.options.stops}
        // console.log('initial state');
        // console.log(this.state);
        // this._redrawState(this.state);
        // this.store.dispatch(this.action.getSetMapOption(options))
    }

    _drawSearch() {
        this.store.dispatch(this.action.setDrive())
    }

    _drawStraight() {
        this.store.dispatch(this.action.setStraight());
    }

    // _drawPolyLine() {
    //     let options: MapOptions = Object.assign({}, defaultOpts, this.options);
    // }

    _applyCancel() {
        this.store.dispatch(this.action.cancelChange());
    }

    _applyChange() {
        this.store.dispatch(this.action.applyChange(this.previousMarkers.currentPoints));
    }

    _setEnd(point: any) {
        let i = this.previousMarkers.markers.findIndex(res => res.marker.getPosition() === point);
        this.store.dispatch(this.action.setEnd(i));
    }

    _setStart(point: any) {
        let i = this.previousMarkers.markers.findIndex(res => res.marker.getPosition() === point);
        this.store.dispatch(this.action.setStart(i));
    }

    _updateMarkers(markers: any) {
        console.log(markers);
        this.previousMarkers = {...this.previousMarkers, markers: markers}
    }

    addMarkerListener(a: any) {
        // this.previousMarkers = {...this.previousMarkers, markers: a}
        this.previousMarkers.mapListener = a;
    }

    _updateDriveRoute(a: any) {
        this.previousMarkers = {...this.previousMarkers, drivingRoute: a}
    }

    _getPolyLine(): PolyLineSate[] {
        // this.previousMarkers = {...this.previousMarkers, polyLine: [{polyLine: a, listeners: []}]}
        return this.previousMarkers.polyLine ? this.previousMarkers.polyLine : [];
    }

    _updatePolyLine(a: any) {
        this.previousMarkers = {...this.previousMarkers, polyLine: [{polyLine: a, listeners: []}]}
    }

    _updateCurrentMarker(opts) {
        var BMap: any = (<any>window)['BMap'];
        this.previousMarkers = {
            ...this.previousMarkers, currentPoints: opts.map(res => {
                return {
                    marker: new BMap.Marker(res),
                    listener: []
                }
            })
        }
    }

    _draw2Add() {
        this.store.dispatch(this.action.setEnableAddMarker());
    }

    addToCurrentPoints(marker) {
        this.previousMarkers.currentPoints.push({
            marker: marker,
            listeners: [],
            contextmenu: undefined
        })
    }
    /**
     * save data
     */
    save(event) {
        this.onSave.emit(this.state.markers);
    }

    getMarkerStates() {
        return this.previousMarkers;
    }

    ngOnDestroy(): void {
        console.log('ngOnDestroy');
        redrawDriveRoute.bind(this)(this.map, this.previousMarkers, this.state);

        // this.store.dispatch(this.action.setClear());
        if (this._subscription) {
            this._subscription.unsubscribe();
            this._subscription.unsubscribe();
        }
    }
}

