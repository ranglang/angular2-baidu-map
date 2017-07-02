import {MapOptions, MarkerOptions} from './interfaces/Options';
import {PreviousAutoComplete, PreviousMarker} from './interfaces/PreviousMarker';

import {setGeoCtrl} from './controls/GeoControl';
import {setScaleCtrl} from './controls/ScaleControl';
import {setOverviewMapCtrl} from './controls/OverviewMapControl';
import {setNavigationCtrl} from './controls/NavigationControl';
import {MarkerIcon} from "./enum/ControlAnchor";
import {BaiduMap} from "./components/map";
import {PreviousPolygon} from "./interfaces/PreviousPolygon";

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

export  const reCreatePolygon = function (
    map: any,
    previousPolygon :PreviousPolygon,
    opts: MapOptions
) {

    var BMap: any = (<any>window)['BMap'];

    if(previousPolygon) {
        if(previousPolygon.polygon) {
            map.removeOverlay(previousPolygon.polygon)
        }
    }

    if(opts.polygon) {
        let array = opts.polygon.map(p => new BMap.Point(p.longitude, p.latitude));
        let polyline = new BMap.Polygon(
            array, {
                strokeColor: 'red',
                fillColor: 'red',
                strokeWeight: 3,
                strokeOpacity: 0.5
            }
        );

        map.addOverlay(polyline);
        previousPolygon = {polygon: polyline, listeners: []}
        map.setViewport(array);
    }
}

export  const reCheckEditPolygon = function (
    map: any,
    previousPolygon :PreviousPolygon,
    opts: MapOptions
) {

    var BMap: any = (<any>window)['BMap'];
    var BMAP_ANCHOR_TOP_RIGHT: any = (<any>window)['BMAP_ANCHOR_TOP_RIGHT'];
    let BMAP_DRAWING_POLYGON: any = (<any>window)['BMAP_DRAWING_POLYGON'];

    var BMapLib: any = (<any>window)['BMapLib'];
    var self = this;


    if(self.previousPolygon) {
        self.previousPolygon.listeners.forEach((l) => {
           self.previousPolygon.polygon.removeEventListener('overlaycomplete', l)
        });
        map.removeOverlay(self.previousPolygon.polygon);
    }


    function polygoncomplete(e) {
        let editPolygon = e.overlay;
        self.previousPolygon = {...self.previousPolygon, polygon: editPolygon}
        self.onEditPolygonCompleted.emit(editPolygon.getPath())
    }

    if (opts.enableEditPolygon) {
        let styleOptions = {
            strokeColor: 'red',
            fillColor: 'red',
            strokeWeight: 3,
            strokeOpacity: 0.8,
            fillOpacity: 0.6,
            strokeStyle: 'solid'
        };

        console.log(map);
        console.log('BMAP_ANCHOR_TOP_RIGHT: ' + BMAP_ANCHOR_TOP_RIGHT);
        let drawingManager = new BMapLib.DrawingManager(map, {
            isOpen: false,
            drawingToolOptions: {
                anchor: BMAP_ANCHOR_TOP_RIGHT,
                offset: new BMap.Size(5, 5),
            },
            circleOptions: styleOptions,
            polylineOptions: styleOptions,
            polygonOptions: styleOptions,
            rectangleOptions: styleOptions
        });
        let dListner = drawingManager.addEventListener('overlaycomplete', polygoncomplete);
        self.previousPolygon = {polygon: undefined, listeners: [dListner]}
        console.log(drawingManager);
            drawingManager.open();
            drawingManager.setDrawingMode(BMAP_DRAWING_POLYGON);
    }
}

export const createAutoComplete = function (
    map: any,
                                            previousAutoComplete : PreviousAutoComplete,
                                            opts: MapOptions
) {
    var BMap: any = (<any>window)['BMap'];
    var self = this;

    function onSearchComplete() {
    }

    function G(id) {
        return document.getElementById(id);
    }

    let el = G('suggestId');

    if(previousAutoComplete) {
        previousAutoComplete.listeners.forEach((l)=> {
            previousAutoComplete.autoComplete.removeEventListener('onhighlight', l);
        })
    }

    previousAutoComplete = undefined;


    if(opts.enableAutoComplete) {
        let ac = new BMap.Autocomplete(
            {
                'input': G('suggestId'),
                'location': map,
            });

      let listner =   ac.addEventListener('onhighlight', function (e) {
            let str = '';
            let _value = e.fromitem.value;
            let value = '';
            if (e.fromitem.index > -1) {
                value = _value.province + _value.city + _value.district + _value.street + _value.business;
            }
            str = 'FromItem<br />index = ' + e.fromitem.index + '<br />value = ' + value;

            value = '';
            if (e.toitem.index > -1) {
                _value = e.toitem.value;
                value = _value.province + _value.city + _value.district + _value.street + _value.business;
            }
            str += '<br />ToItem<br />index = ' + e.toitem.index + '<br />value = ' + value;
            G('searchResultPanel').innerHTML = str;
        });

      let myValue;
        let listner2 = ac.addEventListener('onconfirm', function (e) {
            let _value = e.item.value;
            myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
            let local;

            function myFun(res) {
                let dataResult = local.getResults().getPoi(0);
                self.onSearchCompleted.emit(dataResult);
            }

            local = new BMap.LocalSearch(map, {
                onSearchComplete: myFun
            });
            local.search(myValue);
        });


        previousAutoComplete = {
            autoComplete: ac,
            listeners: [],
        };

        previousAutoComplete.listeners.push(listner);
        previousAutoComplete.listeners.push(listner2);
    }
};

export const createMarkerEdit = function(marker: MarkerOptions, pt: any) {
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
export const createMarker = function(marker: MarkerOptions, pt: any) {
    var BMap: any = (<any>window)['BMap'];
    var opts: any = {};
    if (marker.icon) {
        var icon = new BMap.Icon(marker.icon, new BMap.Size(marker.width, marker.height));
        opts['icon'] = icon;
    }

    if(marker.category) {
        console.log('marker.category'  + marker.category + ' VS ' + MarkerIcon.ROUTE);
        switch(marker.category) {
            case MarkerIcon.STOP : {
                 var icon = new BMap.Icon('http://api.map.baidu.com/img/markers.png', new BMap.Size(23, 25), {
                    offset: new BMap.Size(10, 25),
                    imageOffset: new BMap.Size(0, 0)
                });
                opts['icon'] = icon;
                break;
            }
            case MarkerIcon.ROUTE : {
                let trace_point_icon  = new BMap.Icon('/assets/img/click_mark.png', new BMap.Size(20, 20), {imageOffset: new BMap.Size(0, 0)});
                opts['icon'] = trace_point_icon;
                break;
            }
            default : {
                var icon = new BMap.Icon('http://api.map.baidu.com/img/markers.png', new BMap.Size(23, 25), {
                    offset: new BMap.Size(10, 25),
                    imageOffset: new BMap.Size(0, 0 - 10 * 25)
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
    console.log('redrawMarkers....');
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

        let onMarkerDraggedListener = () => {
            self.onMarkerDragged.emit(marker2);
        };
        marker2.addEventListener('dragend', onMarkerDraggedListener);

        previousMarker.listeners.push(onMarkerClickedListener);
        previousMarker.listeners.push(onMarkerDraggedListener);

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


    if(opts.markers.length > 0){
        map.setViewport(opts.markers.map(marker => new BMap.Point(marker.longitude, marker.latitude)));
    }
};


