import { Component, SimpleChange, Input, Output, EventEmitter, OnInit, OnChanges, ChangeDetectionStrategy, ElementRef } from '@angular/core';

import { MapOptions, OfflineOptions } from '../interfaces/Options';
import {PreviousAutoComplete, PreviousMarker, MarkerHandler, PreviousEditPolyLine} from '../interfaces/PreviousMarker';
import { MapStatus } from '../enum/MapStatus';

import { defaultOfflineOpts, defaultOpts } from '../defaults';

import { loader } from '../Loader';
import {
    reCenter, reZoom, redrawMarkers, createInstance, redrawPolyline, createAutoComplete,
    reCheckEditPolygon, reCreatePolygon, createMarkerEdit
} from '../CoreOperations';
import {PreviousPolygon} from "../interfaces/PreviousPolygon";
import {redrawMarkersEdit, redrawPolyLinEdit} from "../RouteEditCoreOperations";

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
export class EditRoute implements OnInit, OnChanges {

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

    constructor(private el: ElementRef) { }

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
}
