import {
    Component, SimpleChange, Input, Output, EventEmitter, OnInit, OnChanges, ChangeDetectionStrategy, ElementRef,
    OnDestroy, ViewChild
} from '@angular/core';

import {MapOptions, OfflineOptions, MarkerOptions} from '../interfaces/Options';
import {
    PreviousAutoComplete, PreviousMarker, MarkerHandler, PreviousEditPolyLine,
    PreviousStateMarker
} from '../interfaces/PreviousMarker';
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
import {redrawEditPolyline, redrawPolyLinEdit, redrawEditState} from "../RouteEditCoreOperations";
import {AppRxState} from "../app/ngrx";
import {Observable, Subscription} from "rxjs";
import {EditRouteActions} from "./editRoute.actions";
import {sampleTime} from "rxjs/operator/sampleTime";
import {BaiduMap} from "./map";


export interface EditRouteRxState {
    startIndex: number;
    endIndex: number;
    markers: MarkerOptions[];
}

export const initialState: EditRouteRxState  = {
    startIndex: -1,
    endIndex: -1,
    markers: [],
}


export function editRouteReducer(state = initialState, action: any): EditRouteRxState  {
    switch (action.type) {
        case EditRouteActions.SHOW_MARKER: {
            return state;
        }

        case EditRouteActions.SET_START: {
            return {...state, startIndex: action.payload};
        }

        case EditRouteActions.SET_END: {
            return {...state, endIndex: action.payload};
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
        .offlineLabel{
            font-size: 30px;
        }
        
        #fixHandleBar {
        position: absolute;
        display: flex;
        left: 2.5em;
        top: 2.5em;
        padding-left: 2.5em;
        padding-right: 2.5em;
        padding-top: 1.5625em;
        padding-bottom: 1.5625em;
        z-index: 98;
        height: 20px;
        border-radius: 10px;
        background-color: white;
        }
        
        #container {
            height: 100vh;   
        }
        
.lineInfo {
  width: 144px;
}

.startText {
  width: 36px;
  font-size: 18px;
  color: rgb(204,204,204);
  text-align: center;
  padding-left: 3px;
  padding-right: 3px;
}


.circle.active {
  background-color: green;
}

.circle {
  margin-top : 6px;
  width:10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgb(204, 204, 204);
}
.startText.active {
  color: rgb(37,40,39);
}


.edit-line-status {
  margin-top : 9px;
  width: 59px;
  border-top-style: solid;
  border-top-width: 3px;
  padding-top: 4pxj;
  border-top-color: rgb(204, 204, 204);
}

.edit-line-status.active {
  border-top-color: rgb(37,40,39);


}
    `],
    template: `

    <div id="fixHandleBar" >
        <div class="startText lineInfo" [ngClass]="{'active': (hasMarkerStart$ | async) }" >起点</div>
        <div id="leftStartCircle lineInfo"  [class.active]="hasMarkerStart$ |async" class="circle" ></div>
        <div class="edit-line-status"  [class.active]="hasLine$ | async" ></div>
        <div id="rightEndCircle lineInfo"  class="circle"  [class.active]="hasLine$ |async" ></div>
        <div class="startText lineInfo"   [class.active]="hasMarkerEnd$ | async">终点</div>
    </div>
    <div id="container" #map>
    
    </div>
        <div class="offlinePanel">
            <label class="offlineLabel">{{ offlineWords }}</label>
        </div>
        
        <!--[ngClass]="{'active': DATA.start_marker }"-->
        <!--<div id="leftStartCircle lineInfo"  [ngClass]="{'active': DATA.start_marker }" class="circle" ></div>-->
        <!--<div id="edit-line-status" [ngClass]="{'active': DATA.editing_line }"  ></div>-->
        <!--<div id="rightEndCircle lineInfo"  class="circle" [ngClass]="{'active': DATA.end_marker }" ></div>-->
        <!--<div class="startText lineInfo"   [ngClass]="{'active': DATA.end_marker }">终点</div>-->
        <!--<div class="lineEditArea" [ngClass]="{'ui-hide': (!(DATA.start_marker && DATA.end_marker)) || DATA.edit_mode }">-->
            <!--<button id="addstraigLine" uButton type="button"   class="ui-button-secondary" icon="fa-italic" title="改为直线连接" uTooltip="改为直线连接" tooltipPosition="bottom"></button>-->
            <!--<button uButton type="button" id="generateRoute"  class="ui-button-secondary" icon="fa-magic" title="自动推荐轨迹点" uTooltip="自动推荐轨迹点" tooltipPosition="bottom"></button>-->
            <!--<button uButton type="button"  id="addNewPoint" [ngClass]="{'ui-hide': (DATA.locationArray[1] - DATA.locationArray[0]) !== 1 }"  class="ui-button-secondary" icon="fa-plus-circle"-->
                    <!--uTooltip = "添加途径线路点"  tooltipPosition="bottom"-->
                    <!--title="添加途径线路点"></button>-->
            <!--<button uButton type="button"-->
                    <!--uTooltip = "编辑该线段"  tooltipPosition="bottom"-->
                    <!--id="editThePoint"  class="ui-button-secondary" icon="fa-pencil-square" title="编辑该线段" ></button>-->
        <!--</div>-->
        <!--<div class="applyOrCancel" *ngIf="loadinig">-->
            <!--<button uButton type="button"   class="ui-button-info applyIcon" icon="fa-circle-o-notch fa-spin" title="loading"  disabled></button>-->
        <!--</div>-->
        <!--<div class="applyOrCancel"  [ngClass]="{'ui-hide': (!DATA.edit_mode || loadinig) }" >-->
            <!--<button id="applyChange" uButton type="button"   class="ui-button-info applyIcon" icon="fa-check" title="应用该变更"  ></button>-->
            <!--<button  id="applyCancel" uButton type="button"   class="ui-button-warning applyIcon" icon="fa-reply" title="取消本次修改"></button>-->
        <!--</div>-->
    
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

    @ViewChild("map") mapChild: ElementRef;

    map: any;
    offlineWords: string;
    // previousMarkers: PreviousMarker[] = [];
    previousAutoComplete : PreviousAutoComplete;

    previousPolyLine : PreviousEditPolyLine;

    previousPolygon : PreviousPolygon;
    polyline: any;

    markerHandler: MarkerHandler;

    previousMarkers: PreviousStateMarker;


    private map$ : Observable<EditRouteRxState>;
    private hasMarkerStart$ : Observable<boolean>;
    private hasMarkerEnd$ : Observable<boolean>;

    private hasLine$ : Observable<boolean>;

    private  _subRes: Subscription;
    constructor(private el: ElementRef,
                private  action: EditRouteActions,
                private store: Store<AppRxState>,
    ) {

        this.map$= this.store.select(res => {
            return res.routeEdit;
        });

        this.hasMarkerStart$ = this.store.select(res => res.routeEdit.startIndex !== -1 )
        this.hasMarkerEnd$ = this.store.select(res => res.routeEdit.endIndex !== -1 )
        this.hasLine$ = this.store.select(res => (res.routeEdit.endIndex !== -1  && res.routeEdit.startIndex !== -1))

        this._subRes = this.map$.subscribe((res) => {
            this._redrawState(res);
        })
    }


    ngOnInit() {
        let offlineOpts: OfflineOptions = Object.assign({}, defaultOfflineOpts, this.offlineOpts);
        this.offlineWords = offlineOpts.txt;
        loader(this.ak, offlineOpts, this._draw.bind(this), this.protocol, 'edit-route');
    }


    _redrawState(state: EditRouteRxState ) {
        let s = {...state, markers: this.options ? this.options.markers: []}
        redrawEditState.bind(this)(this.map, this.previousMarkers, s);
        redrawEditPolyline.bind(this)(this.map, this.previousMarkers, s)
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
        let s = {...initialState, markers: opts.markers}
        redrawEditState.bind(this)(this.map, this.previousMarkers, s)
        redrawEditPolyline.bind(this)(this.map, this.previousMarkers, s)

        // redrawMarkersEdit.bind(this)(this.map, this.previousMarkers, this.markerHandler, opts);
        // redrawPolyline.bind(this)(this.map, this.polyline, opts)
        // createAutoComplete.bind(this)(this.map, this.previousAutoComplete, opts)
        // reCheckEditPolygon.bind(this)(this.map, this.previousPolygon, opts)
        // reCreatePolygon.bind(this)(this.map, this.previousPolygon, opts)
    }

    _draw() {
        let options: MapOptions = Object.assign({}, defaultOpts, this.options);
        this.map = createInstance(options, this.mapChild.nativeElement);
        // nativeElement
        this.map.addEventListener('click', e => {
            this.onClicked.emit(e);
        });
        this.onMapLoaded.emit(this.map);

        let s = {...initialState, markers: this.options.markers}
        redrawEditState.bind(this)(this.map, this.previousMarkers, s)
        redrawEditPolyline.bind(this)(this.map, this.previousMarkers, s)


        // redrawEditPolyline.bind(this)(this.map, this.previousMarkers, s);

        // redrawMarkersEdit.bind(this)(this.map, this.previousMarkers, this.markerHandler, options);
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
        // redrawPolyLinEdit.bind(this)(this.map, this.previousPolyLine, this.markerHandler, options )
    }

    _setEnd(point: any) {
        let i = this.options.markers.findIndex(res => res.longitude === point.lng && res.latitude === point.lat);
        this.store.dispatch(this.action.setEnd(i));
    }

    _setStart(point: any) {
        let i = this.options.markers.findIndex(res => res.longitude === point.lng && res.latitude === point.lat);
        this.store.dispatch(this.action.setStart(i));
    }


    ngOnDestroy(): void {
        if(this._subRes ) {
            this._subRes.unsubscribe();
        }
    }

}

