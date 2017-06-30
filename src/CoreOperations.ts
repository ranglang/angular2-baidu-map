import {MapOptions, MarkerOptions} from './interfaces/Options';
import {PreviousMarker} from './interfaces/PreviousMarker';

import {setGeoCtrl} from './controls/GeoControl';
import {setScaleCtrl} from './controls/ScaleControl';
import {setOverviewMapCtrl} from './controls/OverviewMapControl';
import {setNavigationCtrl} from './controls/NavigationControl';
import {MarkerIcon} from "./enum/ControlAnchor";

export const reCenter = function(map: any, opts: MapOptions) {
    var BMap: any = (<any>window)['BMap'];
    if (opts.center) {
        map.setCenter(new BMap.Point(opts.center.longitude, opts.center.latitude));
    }
};

export const reZoom = function(map: any, opts: MapOptions) {
    if (opts.zoom) {
        map.setZoom(opts.zoom);
    }
};

export const createInstance = function(opts: MapOptions, element: any) {
    var BMap: any = (<any>window)['BMap'];
    // create map instance
    var map = new BMap.Map(element);

    // init map, set central location and zoom level
    map.centerAndZoom(new BMap.Point(opts.center.longitude, opts.center.latitude), opts.zoom);

    setNavigationCtrl(map, opts);
    setScaleCtrl(map, opts);
    setOverviewMapCtrl(map, opts);
    if (opts.enableScrollWheelZoom) {
        //enable scroll wheel zoom
        map.enableScrollWheelZoom();
    }
    setGeoCtrl(map, opts);
    return map;
};




export const createMarker = function(marker: MarkerOptions, pt: any) {
    var BMap: any = (<any>window)['BMap'];
    var opts: any = {};
    if (marker.icon) {
        var icon = new BMap.Icon(marker.icon, new BMap.Size(marker.width, marker.height));
        opts['icon'] = icon;
    }


    if(marker.category) {
        switch(marker.category) {
            case MarkerIcon.STOP : {
                 var icon = new BMap.Icon('http://api.map.baidu.com/img/markers.png', new BMap.Size(23, 25), {
                    offset: new BMap.Size(10, 25),
                    imageOffset: new BMap.Size(0, 0)
                });
                opts['icon'] = icon;
                break;
            }
            default : {
                var icon = new BMap.Icon('http://api.map.baidu.com/img/markers.png', new BMap.Size(23, 25), {
                    offset: new BMap.Size(10, 25),
                    imageOffset: new BMap.Size(0, 0 - 10 * 25)

                    // imageOffset: new BMap.Size(0, 0 - 10 * 25)
                });
                opts['icon'] = icon;
            }

        }
    }
    if (marker.enableDragging) {
        opts['enableDragging'] = true;
    }
    return new BMap.Marker(pt, opts);
};


// "stopLatBd" :
//     "stopLngBd" : ,
//     "stopName" : "英伦名苑",
//     "stopOrder" : 2,
//     "allStopOrder" : null

// previousMarkers: PreviousMarker[],
export const redrawPolyline = function (map: any, polyline: any, opts: MapOptions) {
    var BMap: any = (<any>window)['BMap'];
    let array = opts.routes ? opts.routes : []
    if(polyline) {
        map.removeOverlay(polyline);
    }
    if(array.length > 0 ) {
        let polylines = new BMap.Polyline(
            array.map(a => {
                return new BMap.Point(a.longitude, a.latitude);
            }), {
                strokeColor: 'blue',
                strokeWeight: 3,
                strokeOpacity: 0.5
            }
        );
        this.polyline = polylines;
        map.addOverlay(polylines);
    }
}

export const redrawMarkers = function(map: any, previousMarkers: PreviousMarker[], opts: MapOptions) {

    var BMap: any = (<any>window)['BMap'];
    var self = this;

    previousMarkers.forEach(function({marker, listeners}) {
        listeners.forEach(listener => { marker.removeEventListener('click', listener); });
        map.removeOverlay(marker);
    });

    previousMarkers.length = 0;

    if (!opts.markers) {
        return;
    }

    opts.markers.forEach(function(marker: MarkerOptions) {

        var marker2 = createMarker(marker, new BMap.Point(marker.longitude, marker.latitude));

        // add marker to the map
        map.addOverlay(marker2);
        let previousMarker: PreviousMarker = { marker: marker2, listeners: [] };
        previousMarkers.push(previousMarker);


        let onMarkerClickedListener = () => {
            self.onMarkerClicked.emit(marker2);
        };
        marker2.addEventListener('click', onMarkerClickedListener);
        previousMarker.listeners.push(onMarkerClickedListener);

        if (!marker.title && !marker.content) {
            return;
        }
        let msg = `<p>${marker.title || ''}</p><p>${marker.content || ''}</p>`;
        let infoWindow2 = new BMap.InfoWindow(msg, {
            enableMessage: !!marker.enableMessage
        });
        if (marker.autoDisplayInfoWindow) {
            marker2.openInfoWindow(infoWindow2);
        }
        let openInfoWindowListener = function() {
            this.openInfoWindow(infoWindow2);
        };
        previousMarker.listeners.push(openInfoWindowListener);
        marker2.addEventListener('click', openInfoWindowListener);
    });


    this.map.setViewport(opts.markers.map(marker => new BMap.Point(marker.longitude, marker.latitude)));
};
