import {
    Component, SimpleChange, Input, Output, EventEmitter, OnInit, OnChanges, ChangeDetectionStrategy, ElementRef,
    ContentChild, ViewChild
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



@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
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
        .mapView {
            width: calc(100vw - 880px);
            height: 80vh;
        }
        
        .model-center {
            display: flex;
            justify-content: center;
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
export class BaiduMap implements OnInit, OnChanges {

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

        console.log(opts);

        console.log('opts.markers:' + opts.markers.length);

        if(opts.markers.length > 500) {
            needLoading = true;
        }

        if(needLoading) {
            this.isLoading = true;
        }
        console.log('ngOnChanges: ' + this.isLoading);
        reCenter(this.map, opts);
        console.log('after reCenter: ' + format(new Date(), 'HH:mm:ss'));
        redrawMarkers.bind(this)(this.map, this.previousMarkers, opts);

        console.log('after redrawMarkers: ' + format(new Date(), 'HH:mm:ss'));
        redrawPolyline.bind(this)(this.map, this.polyline, opts)

        console.log('after redrawPolyline: ' + format(new Date(), 'HH:mm:ss'));
        createAutoComplete.bind(this)(this.map, this.previousAutoComplete, opts)
        console.log('after createAutoComplete: ' + format(new Date(), 'HH:mm:ss'));
        reCheckEditPolygon.bind(this)(this.map, this.previousPolygon, opts)
        console.log('after reCheckEditPolygon: ' + format(new Date(), 'HH:mm:ss'));
        reCreatePolygon.bind(this)(this.map, this.previousPolygon, opts)

        reCreatePolygon.bind(this)(this.map, this.previousPolygon, opts)
        console.log('after reCreatePolygon: ' + format(new Date(), 'HH:mm:ss'));

        // redrawStops.bind(this)(this.map, this.previousPolygon, opts)

        if(needLoading) {
        setTimeout(() => {
                this.isLoading = false;
        }, 10);
        }
    }

    updatePolygonInfo(any) {
        this.previousPolygon = any;
    }

    public panTo(event, $event) {
        var BMap: any = (<any>window)['BMap'];
        this.map.panTo(new BMap.Point(event.lng, event.lat))
        console.log(event);
    }

    _draw() {
        console.log('draw');
        let options: MapOptions = Object.assign({}, defaultOpts, this.options);
        this.map = createInstance(options, this.mapView.nativeElement);
        this.map.addEventListener('click', e => {
            this.onClicked.emit(e);
        });
        this.onMapLoaded.emit(this.map);

        // reZoom(this.map, options);
        redrawMarkers.bind(this)(this.map, this.previousMarkers, options);
        redrawPolyline.bind(this)(this.map, this.polyline, options)
        createAutoComplete.bind(this)(this.map, this.previousAutoComplete, options)
        reCheckEditPolygon.bind(this)(this.map, this.previousPolygon, options)
        reCreatePolygon.bind(this)(this.map, this.previousPolygon, options)
        reCenter(this.map, options);
    }
}

