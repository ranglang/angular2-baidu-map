import {
    Component, SimpleChange, Input, Output, EventEmitter, OnInit, OnChanges, ChangeDetectionStrategy, ElementRef,
    ContentChild, ViewChild, OnDestroy
} from '@angular/core';
import {
redrawStops
} from "../RouteEditCoreOperations";
import { MapOptions, OfflineOptions } from '../interfaces/Options';
// import {PreviousAutoComplete, MarkerState} from '../interfaces/MarkerState';
import { MapStatus } from '../enum/MapStatus';

import { defaultOfflineOpts, defaultOpts } from '../defaults';

import { loader } from '../Loader';
import {
    reCenter, redrawMarkers, createInstance, redrawPolyline, createAutoComplete,
    reCheckEditPolygon, reCreatePolygon
} from '../CoreOperations';
import {PreviousPolygon} from "../interfaces/PreviousPolygon";
import * as format from 'date-fns/format';
import {MarkerSate, PreviousAutoComplete} from "../interfaces/PreviousMarker";



//changeDetection: ChangeDetectionStrategy.OnPush,
@Component({
    selector: 'baidu-map',
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
        
        .model-center {
            display: flex;
            justify-content: center;
        }
        
        .mapView {
            width: 100%;
            height: 100%;
        }

        .stopSelectStyle {
            width: calc(100vw - 1180px);
            height: 484px;
        }

        
    `],
    template: `
        <!--<div class="offlinePanel">-->
            <!--<label class="offlineLabel">{{ offlineWords }}</label>-->
        <!--</div>-->
        <!---->
        <!--<h1>-->
            <!--{{isLoading}}-->
        <!--</h1>-->
        
        <!--{{isLoading}}-->
        <div class="mapView" #mapView>
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
export class BaiduMap implements OnInit, OnChanges, OnDestroy {

    @Input() ak: string;
    @Input() protocol: string;
    @Input() options: MapOptions;
    @Input('offline') offlineOpts: OfflineOptions;

    @Input('styleClass') styleClass = 'mapView';


    @Output() onMapLoaded = new EventEmitter();
    @Output() onMarkerClicked = new EventEmitter();
    @Output() onMarkerDragged = new EventEmitter();
    @Output() onSearchCompleted = new EventEmitter();
    @Output() onEditPolygonCompleted = new EventEmitter();
    @Output() onClicked = new EventEmitter();


    public isLoading: boolean;
    // @ContentChild()
    //     View
    @ViewChild('mapView') mapView: ElementRef;

    map: any;
    offlineWords: string;
    previousMarkers: MarkerSate[] = [];
    previousAutoComplete : PreviousAutoComplete;
    previousPolygon : PreviousPolygon;
    polyline: any;

    constructor(private el: ElementRef) { }

    ngOnInit() {
        let offlineOpts: OfflineOptions = Object.assign({}, defaultOfflineOpts, this.offlineOpts);
        this.offlineWords = '离线';
            // offlineOpts.txt;
        loader(this.ak, offlineOpts, this._draw.bind(this), this.protocol, 'baidu-map');
    }

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        let baiduMap = (<any>window)['baiduMap'];
        if (!baiduMap || baiduMap.status !== MapStatus.LOADED) {
            return;
        }
        if (changes['options'].isFirstChange() && !this.map) {
            return;
        }
        let opts = changes['options'].currentValue as MapOptions;

        let needLoading = false;
        if(opts.markers.length > 500) {
            needLoading = true;
        }

        if(needLoading) {
            this.isLoading = true;
        }

        console.log('opts');
        console.log(opts);
        reCenter(this.map, opts);
        redrawMarkers.bind(this)(this.map, this.previousMarkers, opts);

        redrawPolyline.bind(this)(this.map, this.polyline, opts)

        createAutoComplete.bind(this)(this.map, this.previousAutoComplete, opts)
        reCheckEditPolygon.bind(this)(this.map, this.previousPolygon, opts)
        reCreatePolygon.bind(this)(this.map, this.previousPolygon, opts)

        reCreatePolygon.bind(this)(this.map, this.previousPolygon, opts)


        if(needLoading) {
        setTimeout(() => {
                this.isLoading = false;
        }, 10);
        }
    }

    a() {
        this._draw();
    }
    updatePolygonInfo(any) {
        this.previousPolygon = any;
    }

    // isOpenWindow ?: boolean = false
    public panTo(event, {isOpenWindow, title } , $event,) {
        var BMap: any = (<any>window)['BMap'];
        let point = new BMap.Point(event.lng, event.lat);
        console.log('panTo: ');
        console.log(point);
        //this.map.set(point)
        this.map.centerAndZoom(point, 16);

        //marker2.openInfoWindow(infoWindow2);
        if(isOpenWindow) {
            let msg = `<p>${ title || ''}</p><p>${parseFloat(event.lng.toString()).toFixed(7) +  ', ' + parseFloat(event.lat.toString()).toFixed(7) }</p>`;
            let infoWindow2 = new BMap.InfoWindow(msg, {
            });
            let a = this.previousMarkers.filter((res) => res.marker.getPosition().equals(point))[0]
            if(a) {
                console.log('open Info: ' + title);
                a.marker.openInfoWindow(infoWindow2);
            }
        }
    }

    _draw() {
        let options: MapOptions = Object.assign({}, defaultOpts, this.options);
        this.map = createInstance(options, this.mapView.nativeElement);
        this.map.addEventListener('click', e => {
            this.onClicked.emit(e);
        });
        console.log('reCenter');
        console.log(options);
        this.onMapLoaded.emit(this.map);
        reCenter(this.map, options);
        redrawMarkers.bind(this)(this.map, this.previousMarkers, options);
        redrawPolyline.bind(this)(this.map, this.polyline, options)
        createAutoComplete.bind(this)(this.map, this.previousAutoComplete, options)
        reCheckEditPolygon.bind(this)(this.map, this.previousPolygon, options)
        reCreatePolygon.bind(this)(this.map, this.previousPolygon, options)
        reCenter(this.map, options);
    }

    ngOnDestroy(): void {


        //redrawDriveRoute.bind(this)(this.map, this.previousMarkers, this.state);
/*        if (this._subscription) {
            this._subscription.unsubscribe();
            this._subscription.unsubscribe();
        }*/
    }
}

