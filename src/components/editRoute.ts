import {
    Component, SimpleChange, Input, Output, EventEmitter, OnInit, OnChanges, ChangeDetectionStrategy, ElementRef,
    OnDestroy, ViewChild, NgZone, ChangeDetectorRef
} from '@angular/core';

import {MapOptions, OfflineOptions, MarkerOptions} from '../interfaces/Options';
import {MapStatus} from '../enum/MapStatus';
import {defaultOfflineOpts, defaultOpts} from '../defaults';
import {loader} from '../Loader';
import {Store} from '@ngrx/store';
import {Action} from '@ngrx/store';
import {
    reCenter, redrawMarkers, createInstance, redrawPolyline, createAutoComplete,
    reCheckEditPolygon, reCreatePolygon, createMarkerEdit, createMarker, createInstanceMarkerClusterer
} from '../CoreOperations';
import {PreviousPolygon} from "../interfaces/PreviousPolygon";
import {
    redrawEditPolyline, redrawPolyLinEdit, redrawEditState, redrawDriveRoute,
    redrawStops
} from "../RouteEditCoreOperations";
// import {AppRxState} from "../app/ngrx";
import {Observable, Subscription} from "rxjs";
import {EditRouteActions} from "./editRoute.actions";
import {StoneState} from "../app/ngrx";
import {
    MarkerHandler, PolyLineSate, PreviousAutoComplete, PreviousEditPolyLine,
    PreviousStateMarker
} from "../interfaces/PreviousMarker";

export interface EditRouteRxState {
    startIndex: number;
    endIndex: number;
    markers: MarkerOptions[];
    stops: MarkerOptions[];
    viewports: {
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

        .applyOrCancel {
            margin-left: 30px;
        }

        #fixHandleBar {
            position: absolute;
            align-items: center;
            display: flex;
            left: 4em;
            top: 20px;
            padding-left: 20px;
            padding-right: 20px;
            padding-top: 1.5625em;
            padding-bottom: 1.5625em;
            z-index: 98;
            height: 50px;
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
            width: 40px;
            font-size: 14px;
            color: rgb(204, 204, 204);
            text-align: center;
            padding-left: 3px;
            padding-right: 3px;
        }

        .circle.active {
            background-color: green;
        }

        .circle {
            /*margin-top: 6px;*/
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
            padding-top: 8px;
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
            height: 484px;
        }

        .svg-save {
            color: rgb(0, 203, 129);
            font-size: 54px;
        }

        .svg-cancel {
            color: rgb(252, 143, 71);
            font-size: 54px;
        }

        #fixHandleBar button#saveBtn {
            font-size: 14px;
            background-color: rgb(0, 203, 129);
            width: 54px;
            border-style: none;
            line-height: 30px;
            border-radius: 15px;
            font-weight: 600;
        }
    `],
    template: `

        <div id="fixHandleBar" *ngIf="state">
            <clr-tooltip>
                <button id="saveBtn" class=" btn btn-primary" (click)="save($event)" clrTooltipTrigger
                        [disabled]="state.editMode !== -1">
                    保存
                </button>

                <clr-tooltip-content clrPosition="top-right" clrSize="xs" *clrIfOpen>
                    <span>提交并保存</span>
                </clr-tooltip-content>
            </clr-tooltip>

            <div class="startText " [ngClass]="{'active': state.startIndex !== -1}" (click)="panToStart($event)">起点
            </div>
            <div id="leftStartCircle lineInfo" class="circle" [ngClass]="{'active': state.startIndex !== -1}"></div>
            <div class="edit-line-status"
                 [class.active]=" state.endIndex !== -1 && state.startIndex !== -1"></div>

            <div id="rightEndCircle lineInfo" class="circle"
                 [ngClass]="{'active': state.endIndex !== -1}"
            ></div>

            <div class="startText" [ngClass]="{'active': state.endIndex !== -1}" (click)="panToEnd($event)">终点</div>
            <div class="lineEditArea"
                 [ngClass]="{'ui-hide': state.editMode !== -1 || !(state.endIndex === -1 && state.startIndex ===  -1 && state.markers.length ===0 )}">
                <clr-tooltip>
                    <clr-icon shape="addCircle" size="18" clrTooltipTrigger (click)="_draw2AddInitial()">
                    </clr-icon>
                    <clr-tooltip-content clrPosition="top-right" clrSize="xs" *clrIfOpen>
                        <span>首次添加轨迹点</span>
                    </clr-tooltip-content>
                </clr-tooltip>
            </div>

            <div class="lineEditArea"
                 [ngClass]="{'ui-hide': state.editMode !== -1 || !(state.startIndex !== -1 && state.startIndex === 0 && state.endIndex == -1 )}">
                <clr-tooltip>
                    <clr-icon shape="addCircle" size="18" clrTooltipTrigger (click)="_draw2BeforeStart()">
                    </clr-icon>
                    <clr-tooltip-content clrPosition="top-right" clrSize="xs" *clrIfOpen>
                        <span>在起始点前方添加轨迹点</span>
                    </clr-tooltip-content>
                </clr-tooltip>
            </div>

            <div class="lineEditArea"
                 [ngClass]="{'ui-hide': state.editMode !== -1 || !(state.endIndex !== -1 && state.endIndex === (state.markers.length -1) && state.startIndex ===  -1)}">
                <clr-tooltip>
                    <clr-icon shape="addCircle" size="18" clrTooltipTrigger (click)="_draw2AddAfterDes()">
                    </clr-icon>
                    <clr-tooltip-content clrPosition="top-right" clrSize="xs" *clrIfOpen>
                        <span>追加轨迹点</span>
                    </clr-tooltip-content>
                </clr-tooltip>
            </div>

            <div class="lineEditArea"
                 [ngClass]="{'ui-hide': state.startIndex === -1 || state.endIndex === -1 || state.editMode !== -1}">
                <clr-tooltip>
                    <!--<button class="btn btn-primary" >-->
                    <clr-icon shape="baidu-recommend" size="18" (click)="_drawSearch()" clrTooltipTrigger>
                    </clr-icon>
                    <!--</button>-->
                    <clr-tooltip-content clrPosition="top-right" clrSize="xs" *clrIfOpen>
                        <span>百度地图推荐</span>
                    </clr-tooltip-content>
                </clr-tooltip>
                <clr-tooltip>

                    <clr-icon shape="straight-line" size="18" (click)="_drawStraight()" clrTooltipTrigger>
                    </clr-icon>
                    <clr-tooltip-content clrPosition="top-right" clrSize="xs" *clrIfOpen>
                        <span>直线连接</span>
                    </clr-tooltip-content>
                </clr-tooltip>

                <clr-tooltip *ngIf="state.startIndex === state.endIndex - 1;else showEditRoutePointMode">
                    <clr-icon shape="addCircle" size="18" (click)="_draw2Add()" clrTooltipTrigger>
                    </clr-icon>
                    <clr-tooltip-content clrPosition="top-right" clrSize="xs" *clrIfOpen>
                        <span>新增轨迹点</span>
                    </clr-tooltip-content>
                </clr-tooltip>

                <ng-template #showEditRoutePointMode>
                    <clr-tooltip>
                        <clr-icon shape="addCircle" size="18" (click)="_draw2Add()" clrTooltipTrigger>
                        </clr-icon>
                        <clr-tooltip-content clrPosition="top-right" clrSize="xs" *clrIfOpen>
                            <span>修改轨迹点</span>
                        </clr-tooltip-content>
                    </clr-tooltip>
                </ng-template>
            </div>

            <clr-tooltip>
                <clr-icon shape="help-baidu" size="18" (click)="openHelp($event)" clrTooltipTrigger>
                </clr-icon>
                <clr-tooltip-content clrPosition="top-right" clrSize="xs" *clrIfOpen>
                    <span>打开帮助</span>
                </clr-tooltip-content>
            </clr-tooltip>

            <div class="applyOrCancel" [class.ui-hide]="state.editMode === -1">
                <clr-tooltip>
                    <clr-icon shape="svg-save" class="svg-save" size="54" (click)="_applyChange()" clrTooltipTrigger>
                    </clr-icon>
                    <clr-tooltip-content clrPosition="top-right" clrSize="xs" *clrIfOpen>
                        <span>应用</span>
                    </clr-tooltip-content>
                </clr-tooltip>

                <clr-tooltip>
                    <clr-icon shape="svg-cancle" class="svg-cancel" size="54" (click)="_applyCancel()"
                              clrTooltipTrigger>
                    </clr-icon>

                    <clr-tooltip-content clrPosition="top-right" clrSize="xs" *clrIfOpen>
                        <span>取消</span>
                    </clr-tooltip-content>

                </clr-tooltip>
            </div>
        </div>
        <div id="container" #map class="mapView">

        </div>
        <clr-modal [(clrModalOpen)]="isLoading" clrModalSize='sm' [clrModalClosable]="false">
            <h3 class="modal-title"></h3>
            <div class="modal-body model-center">
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
    @Output() onHelpClicked = new EventEmitter();

    @Output() onSave = new EventEmitter();

    @ViewChild("map") mapChild: ElementRef;


    isLoading: boolean = false;
    map: any;


    markerClusterer: any;

    offlineWords: string;
    previousAutoComplete: PreviousAutoComplete;
    previousPolyLine: PreviousEditPolyLine;
    previousPolygon: PreviousPolygon;

    polyline: any;

    panToEnd(event) {
        var BMap: any = (<any>window)['BMap'];

        let index = this.state.markers.length - 1;

        if (this.state.endIndex !== -1) {
            index = this.state.endIndex;
        }

        let a = this.state.markers[index]

        this.map.setZoom(18);
        this.map.panTo(new BMap.Point(a.longitude, a.latitude));

        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    panToStart(event) {
        var BMap: any = (<any>window)['BMap'];
        let a = 0;
        if (this.state.startIndex !== -1) {
            a = this.state.startIndex;
        }
        let marker = this.state.markers[a]
        this.map.setZoom(18);
        this.map.panTo(new BMap.Point(marker.longitude, marker.latitude));

        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
    }


    // @Input('offline') offlineOpts: OfflineOptions;

    markerHandler: MarkerHandler;

    previousMarkers: PreviousStateMarker;

    public state: EditRouteRxState;
    public map$: Observable<EditRouteRxState>;

    private _subscription: Subscription;

    constructor(private el: ElementRef,
                private _ngZone: NgZone,
                private action: EditRouteActions,
                private cd: ChangeDetectorRef,
                private store: Store<StoneState>) {

        this.map$ = this.store.select(res => {
            return res.routeEdit;
        });
    }

    public panTo(event, {isOpenWindow, title }, $event) {
        var BMap: any = (<any>window)['BMap'];
        //this.map.panTo()
        let point = new BMap.Point(event.lng, event.lat);
        this.map.centerAndZoom(point, 17)

        if(isOpenWindow) {
            let msg = `<p>${ title || ''}</p><p>${ ''}</p>`;
            let infoWindow2 = new BMap.InfoWindow(msg, {
            });
            let a = this.previousMarkers.stops.filter((res) => res.marker.getPosition().equals(point))[0]
            if(a) {
                console.log('open Info: ' + title);
                a.marker.openInfoWindow(infoWindow2);
            }
        }
    }

    ngOnInit() {
        let offlineOpts: OfflineOptions = Object.assign({}, defaultOfflineOpts, this.offlineOpts);
        this.offlineWords = offlineOpts.txt;
        loader(this.ak, offlineOpts, this._draw.bind(this), this.protocol, 'edit-route');

        this._subscription = this.map$.subscribe((res) => {
            this.state = res;
            this._redrawState(res);
            // this.cd.markForCheck();
        })
    }

    _redrawState(s: EditRouteRxState) {
        if (!this.map) {
            return;
        }

        let needLoading = false;
        if (s.markers.length > 500) {
            needLoading = true;
        }

        if (needLoading) {
            this.isLoading = true;
        }

        redrawEditState.bind(this)(this.map, this.markerClusterer, this.previousMarkers, s);
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


        if (!baiduMap || baiduMap.status !== MapStatus.LOADED) {
            return;
        }

        // if (changes['options'].isFirstChange() && !this.map) {
        //     return;
        // }

        if (!this.map) {
            return;
        }


        // reCenter(this.map, opts);
        // console.log(opts);

        // let s = {...initialState, ...opts, markers: opts.markers, stops: opts.stops}
        //
        // this.store.dispatch(this.action.getSetMapOption(s))
    }


    _draw() {
        // let options: MapOptions = Object.assign({}, defaultOpts, {
        //     center: initialState.
        // });
        // map.centerAndZoom(new BMap.Point(opts.center.longitude, opts.center.latitude), opts.zoom);
        let options: MapOptions = {
            ...defaultOpts,
            center: {
                // ,
                longitude: 114.084272,
                // initialState.longitue,
                latitude: 22.541915
                // initialState.latitude,
            }
        }

        // this.options);

        this.map = createInstance(options, this.mapChild.nativeElement);
        this.markerClusterer = createInstanceMarkerClusterer(this.map)
        this.map.addEventListener('click', e => {
            this.onClicked.emit(e);
        });
        this.onMapLoaded.emit(this.map);
    }

    _drawSearch() {
        this.store.dispatch(this.action.setDrive())
    }

    getMarkers() {
        return this.state.markers;
    }

    _drawStraight() {
        // var markerLab : any = (<any>window)['BMapLib']
        // var markerClusterer;
        this.previousMarkers.currentPoints = [];
        for (let i = 0; i < this.previousMarkers.markers.length; i++) {
            if (this.state.startIndex < i && i < this.state.endIndex) {
                let marker = this.previousMarkers.markers[i].marker;
                // console.log(marker);

                // if(markerLab && markerLab.MarkerClusterer) {
                //     markerClusterer
                this.map.removeOverlay(marker);
                this.markerClusterer.removeMarker(marker)
                // }else {
                // }
            }
        }

        // let i = this.previousMarkers.markers.find(res => res.marker.getPosition() === point);
        // this.store.dispatch(
        //     this.action.removeMarker()
        // )

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

    _removeEnd1(point: any) {
        this.previousMarkers.currentPoints = [];
        let i = this.previousMarkers.markers.find(res => res.marker.getPosition() === point);
        this.addToCurrentPoints(i.marker);
        this.store.dispatch(
            this.action.removeMarkerInLine()
        )
    }

    _removeEnd(point: any) {
        this.previousMarkers.currentPoints = [];
        let i = this.previousMarkers.markers.find(res => res.marker.getPosition() === point);
        this.addToCurrentPoints(i.marker);
        this.store.dispatch(
            this.action.removeMarker()
        )
    }

    _setUnStart() {
        this.store.dispatch(this.action.update_UPDATE_SET_UN_START(-1));
    }

    _setUnEnd() {
        this.store.dispatch(this.action.update_UPDATE_SET_UN_END(-1));
    }

    _setStart(point: any) {
        let i = this.previousMarkers.markers.findIndex(res => res.marker.getPosition() === point);
        this.store.dispatch(this.action.setStart(i));
    }

    _updateMarkers(markers: any) {
        this.previousMarkers = {...this.previousMarkers, markers: markers}
    }

    // setEnableAddMarkerAfterDestination

    addMarkerListener(a: any) {
        // this.previousMarkers = {...this.previousMarkers, markers: a}
        this.previousMarkers.mapListener = a;
    }

    _updateDriveRoute(a: any) {
        this.previousMarkers = {...this.previousMarkers, drivingRoute: a}
    }

    _getPolyLine(): PolyLineSate[] {
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

    _draw2AddInitial() {
        this.store.dispatch(this.action.setInitailAddMarker());
    }

    _draw2AddAfterDes() {
        this.store.dispatch(this.action.setEnableAddMarkerAfterDestination());
    }

    _draw2BeforeStart() {
        this.previousMarkers.currentPoints = [];
        this.previousMarkers.currentPoints.length = 0;
        this.store.dispatch(this.action.setEnableAddMarkerBeforeStart());
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

    openHelp() {
        this.onHelpClicked.emit('');
    }

    ngOnDestroy(): void {
        redrawDriveRoute.bind(this)(this.map, this.previousMarkers, this.state);
        if (this._subscription) {
            this._subscription.unsubscribe();
            this._subscription.unsubscribe();
        }
    }
}

