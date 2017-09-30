import {MapOptions, MarkerOptions} from './interfaces/Options';
// import {
//     PreviousAutoComplete, MarkerState, MarkerHandler, PreviousEditPolyLine, PreviousStateMarker, MarkerSate,
// } from './interfaces/MarkerState';

import {setGeoCtrl} from './controls/GeoControl';
import {setScaleCtrl} from './controls/ScaleControl';
import {setOverviewMapCtrl} from './controls/OverviewMapControl';
import {setNavigationCtrl} from './controls/NavigationControl';
import {MarkerIcon, RouteEditMode} from "./enum/ControlAnchor";
import {BaiduMap} from "./components/map";
import {PreviousPolygon} from "./interfaces/PreviousPolygon";
import {createMarker} from "./CoreOperations";
import {EditRoute, EditRouteRxState} from "./components/editRoute";
import {EditRouteActions} from "./components/editRoute.actions";
import {switchMap} from "rxjs/operator/switchMap";
import {MarkerHandler, MarkerSate, PreviousEditPolyLine, PreviousStateMarker} from "./interfaces/PreviousMarker";

      let getAllWaitPointsBetweenPoints = function (point1, point2, point_list) {
        let startIndex = undefined;
        let destinationIndex = undefined;
        for (let i = 0; i < point_list.length; i++) {
          let currentPoint = point_list[i];
          if (startIndex === undefined) {
            if (currentPoint.equals(point1)) {
              startIndex = i;
            }
          } else {
            if (currentPoint.equals(point2)) {
              destinationIndex = i;
              break;
            }
          }
        }
        if (destinationIndex === undefined) {
          for (let i = 0; i < startIndex; i++) {
            let currentPoint = point_list[i];
            if (currentPoint.equals(point2)) {
              destinationIndex = i;
              break;
            }
          }
        }

        if(startIndex > destinationIndex) {

            return [ destinationIndex, startIndex];
        }else {

            return [startIndex, destinationIndex];
        }
      };

export const redrawPolyLinEdit = function (map: any, previousPolyLine: PreviousEditPolyLine, markerHandler: MarkerHandler, opts: MapOptions) {

    var BMap: any = (<any>window)['BMap'];

    let self = this;
    if (previousPolyLine) {
        map.removeOverlay(previousPolyLine.polyLine);
    }

    if(markerHandler) {
        if(markerHandler.startMarker && markerHandler.endMarker) {
            let resArray = getAllWaitPointsBetweenPoints(markerHandler.startMarker.getPosition(),
                markerHandler.endMarker.getPosition(), opts.markers.map(res => new BMap.Point(res.longitude, res.latitude)));


            let pos = opts.markers.slice(resArray[0],  (resArray[1]  + 1)).map((a) => {
                        return new BMap.Point(a.longitude, a.latitude);
                    });

            let polylines = new BMap.Polyline(
                pos,
                {
                    strokeColor: 'red',
                    strokeWeight: 3,
                    strokeOpacity: 0.5
                }
            );
            self.previousPolyLine = {
                polyLine: polylines
            }

            map.addOverlay(polylines);

        }else {
        }
    }else {
    }

}

export const redrawDriveRoute = function (map: any, previousMarkers: PreviousStateMarker, state: EditRouteRxState) {

    var BMap: any = (<any>window)['BMap'];
    let route = this;

    if(previousMarkers) {
        if(! previousMarkers.polyLine) {
            previousMarkers.polyLine.forEach((res) => {
                map.addOverlay(map.removeOverlay(res.polyLine));
            });
        }
        if(previousMarkers.drivingRoute) {
           previousMarkers.drivingRoute.clearResults();
        }
    }

    if(state.enableSearch) {
        let driving = new BMap.DrivingRoute(map, {
            renderOptions: {map, autoViewport: true, enableDragging:false},
            onPolylinesSet: (routes) => {
                let searchRoute = routes[0].getPolyline();
                map.addOverlay(searchRoute.getPath());
                route._updateCurrentMarker(searchRoute.getPath());
            },
            onSearchComplete: function (results) {
            },
            onMarkersSet: function (routes) {
                map.removeOverlay(routes[0].marker);
                map.removeOverlay(routes[1].marker);
            }
        });
        route._updateDriveRoute(driving);

        let a = previousMarkers.markers[state.startIndex].marker.getPosition()

        let b = previousMarkers.markers[state.endIndex].marker.getPosition()
        driving.search(a, b, {});
    }
}

function drawCurrentPoint3(map: any,previousMarkers: PreviousStateMarker, route) {
    var BMap: any = (<any>window)['BMap'];
    route._getPolyLine().forEach((res) => {
        map.removeOverlay(res.polyLine);
    });
    let a = previousMarkers.currentPoints.map(res => {return res.marker.getPosition()})
    // let eP = new BMap.Point(endOption.longitude, endOption.latitude);
    // let b = [eP].concat(a);
    let polylines = new BMap.Polyline(
        a,
        {
            strokeColor: 'red',
            strokeWeight: 3,
            strokeOpacity: 0.5
        }
    );

    map.addOverlay(polylines);
    route._updatePolyLine(polylines)
}
function drawCurrentPoint2(endOption: MarkerOptions, map: any,previousMarkers: PreviousStateMarker, route) {
    var BMap: any = (<any>window)['BMap'];
    route._getPolyLine().forEach((res) => {
        map.removeOverlay(res.polyLine);
    });
    let a = previousMarkers.currentPoints.map(res => {return res.marker.getPosition()})
    let eP = new BMap.Point(endOption.longitude, endOption.latitude);
    let b = [eP].concat(a);
    let polylines = new BMap.Polyline(
        b,
        {
            strokeColor: 'red',
            strokeWeight: 3,
            strokeOpacity: 0.5
        }
    );

    map.addOverlay(polylines);
    route._updatePolyLine(polylines)
}

function drawCurrentPoint(startOption: MarkerOptions, endOption: MarkerOptions, map: any,previousMarkers: PreviousStateMarker, route) {
    var BMap: any = (<any>window)['BMap'];
    route._getPolyLine().forEach((res) => {
            map.removeOverlay(res.polyLine);
        });
    let a = previousMarkers.currentPoints.map(res => {return res.marker.getPosition()})
    let sP = new BMap.Point(startOption.longitude, startOption.latitude);
    let eP = new BMap.Point(endOption.longitude, endOption.latitude);
    let polylines = new BMap.Polyline(
        ([sP].concat(a)).concat(eP),
        {
            strokeColor: 'red',
            strokeWeight: 3,
            strokeOpacity: 0.5
        }
    );

    map.addOverlay(polylines);
    route._updatePolyLine(polylines)
}


export const redrawEditPolyline = function (map: any, previousMarkers: PreviousStateMarker, state: EditRouteRxState) {
    var BMap: any = (<any>window)['BMap'];
    let route = this;
    if (previousMarkers) {
        if(previousMarkers.polyLine) {
            previousMarkers.polyLine.forEach(line => {
                map.removeOverlay(line.polyLine)
            })
        } else {
            route.previousMarkers = {...previousMarkers, polyLine : []};
        }
    } else {
        return;
    }

    switch(state.editMode) {
        case RouteEditMode.SET_AND_MARKER: {

            let pos = previousMarkers.markers.slice(state.startIndex,  state.startIndex + 2).map(res => {
                    return res.marker.getPosition();
                });

            let polylines = new BMap.Polyline(
                pos,
                {
                    strokeColor: 'red',
                    strokeWeight: 3,
                    strokeOpacity: 0.5
                }
            );
            let a = [{polyLine: polylines, listener: []}];

            route.previousMarkers = {...previousMarkers, polyLine: a}
            map.addOverlay(polylines);

            break;
        }
        default: {
            if((state.startIndex !== -1) || (state.endIndex === -1)){
                let a_start = (state.startIndex > state.endIndex) ? state.endIndex: state.startIndex;
                let b = (state.startIndex > state.endIndex) ? state.startIndex: state.endIndex;
                let pos;
                switch (state.editMode) {
                    case RouteEditMode.SET_STRAIGHT: {
                        pos = previousMarkers.markers.slice(a_start,  a_start + 2).map(res => {
                            return res.marker.getPosition();
                        });
                        break;
                    }
                    default : {
                        pos = previousMarkers.markers.slice(a_start, b + 1).map(res => {
                            return res.marker.getPosition();
                        });
                    }
                }

                let polylines = new BMap.Polyline(
                    pos,
                    {
                        strokeColor: 'red',
                        strokeWeight: 3,
                        strokeOpacity: 0.5
                    }
                );
                let a = [{polyLine: polylines, listener: []}];

                route.previousMarkers = {...previousMarkers, polyLine: a}
                map.addOverlay(polylines);

            }
        }
    }
}


export const redrawStops= function (map: any, previousMarkers: PreviousStateMarker, state: EditRouteRxState) {
    var BMap: any = (<any>window)['BMap'];
    if (!BMap || !map) {
        return;
    }
    let route = this;
    if (previousMarkers) {
        if(previousMarkers.stops) {
            previousMarkers.stops.forEach(markerState => {
                map.removeOverlay(markerState.marker)
            });
            previousMarkers.stops.length = 0;
        } else {
            previousMarkers = {...previousMarkers, stops: []};
        }
    } else {
        previousMarkers = {...previousMarkers, stops: []};
    }

    if(state.stops) {
        state.stops.forEach(function(marker: MarkerOptions) {
            let marker2 = createMarker(marker, new BMap.Point(marker.longitude, marker.latitude));
            if (marker.indexNumber && marker.indexNumber < 100) {
                let icon = new BMap.Icon('/assets/img/ditu.png', new BMap.Size(20, 28), {
                    offset: new BMap.Size(10, 28),
                    imageOffset: new BMap.Size(0, 0 - (marker.indexNumber ) * 28)
                });
                marker2.setIcon(icon);
            }

            map.addOverlay(marker2);
            let previousMarker: MarkerSate = { marker: marker2, listeners: [], contextmenu: undefined};
            previousMarkers.stops.push(previousMarker);

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
        })

    }
}


export const clearMarker = function (map: any, markerClusterer: any,  previousMarkers: PreviousStateMarker, state: EditRouteRxState) {
    let route = this;
    var BMap: any = (<any>window)['BMap'];
    if (!BMap || !map) {
        return;
    }

    // var markerLab : any = (<any>window)['BMapLib']

    // let markerClusterer;
    // if(markerLab && markerLab.MarkerClusterer) {
    //     markerClusterer = new markerLab.MarkerClusterer(map, {});
    // }

    previousMarkers.markers.forEach(markerState => {
        if(markerState.contextmenu) {
            markerState.marker.removeContextMenu(markerState.contextmenu);
        }
        map.removeOverlay(markerState.marker);

        markerClusterer.removeMarker(markerState.marker)
    });
}

export const redrawEditState = function (map: any,  markerClusterer: any,  previousMarkers: PreviousStateMarker, state: EditRouteRxState) {
    let route = this;
    var BMap: any = (<any>window)['BMap'];
    if (!BMap || !map) {
        return;
    }

    var markerLab : any = (<any>window)['BMapLib']
    // var markerClusterer;

    var markerClustererBig = false;

    if(state.markers.length> 300) {
      markerClustererBig = true;
    }
    // if(markerLab && markerLab.MarkerClusterer && state.markers.length > 300) {
    //     markerClusterer = new markerLab.MarkerClusterer(map, {});
    // }else {
    //     if(markerLab && markerLab.MarkerClusterer ) {
    //         markerClusterer = new markerLab.MarkerClusterer(map, {});
    //     }else {
    //     }
    // }


    // prviousMarksers
    if (previousMarkers) {
            var preMarkerClusterer = markerLab && markerLab.MarkerClusterer && previousMarkers.markers.length > 300
            previousMarkers.markers.forEach(markerState => {
                if(markerState.contextmenu) {
                    markerState.marker.removeContextMenu(markerState.contextmenu);
                }
                if (preMarkerClusterer) {
                    markerClusterer.removeMarker(markerState.marker)
                } else {
                    map.removeOverlay(markerState.marker)
                }
            });

        previousMarkers.markers.length = 0;
        if (previousMarkers.currentPoints) {
            previousMarkers.currentPoints.forEach(m => {
                map.removeOverlay(m.marker)
            })
        }
    } else {
        route.previousMarkers = {...previousMarkers, markers: []};
    }

    if (previousMarkers) {
        if (previousMarkers.mapListener) {
            map.setDefaultCursor('default');
            map.removeEventListener('click', previousMarkers.mapListener);
        } else {
        }
    }

    let start_marker_icon = new BMap.Icon('/assets/img/ditu.png', new BMap.Size(20, 28), {
        offset: new BMap.Size(10, 28),
        imageOffset: new BMap.Size(0, 0 - 101 * 28)
    });

    let route_start_icon = new BMap.Icon('/assets/img/ditu.png', new BMap.Size(20, 28), {
        offset: new BMap.Size(10, 28),
        imageOffset: new BMap.Size(-20, 0 - 101 * 28)
    });

    let route_end_icon = new BMap.Icon('/assets/img/ditu.png', new BMap.Size(20, 28), {
        offset: new BMap.Size(10, 28),
        imageOffset: new BMap.Size(-20, 0 - 102 * 28)
    });

    let destination_marker_icon = new BMap.Icon('/assets/img/ditu.png', new BMap.Size(20, 28), {
        offset: new BMap.Size(10, 28),
        imageOffset: new BMap.Size(0, 0 - 102 * 28)
    });

    let trace_point_icon = new BMap.Icon('/assets/img/click_mark.png', new BMap.Size(20, 20), {imageOffset: new BMap.Size(0, 0)});


    /**
     * onMenuItemRemovePointListener
     */
    let onMenuItemRemovePointListener = function () {
        let marker = new BMap.Marker(this.getPosition(), {icon: trace_point_icon});
        route.addToCurrentPoints(marker);
        // console.log('markerClusterer.removeMarker');
        markerClusterer.removeMarker(marker);
        // console.log('map.removeremoveOverlay');
        map.removeOverlay(this);
    }

    let onMenuItemSetUnStartListener = function () {
        route._setUnStart();
    }

    let onMenuItemSetStartListener = function () {
        route._setStart(this.getPosition());
    }

    let onMenuItemUnSetDestinationListener = function () {
        route._setUnEnd();
    }

    let onMenuItemSetDestinationListener = function () {
        route._setEnd(this.getPosition());
    }

    let onMenuItemRemoveListener = function () {
        // route._removeEnd(this.getPosition());
    }

    let onMenuItemRemoveInLineDestinationListener = function () {
        route._removeEnd1(this.getPosition());
    }

    let onMenuItemRemoveDestinationListener = function () {
        route._removeEnd(this.getPosition());
    }

    route.previousMarkers.markers.length = 0;
    let markers_temps = [];

    function addOverlay(marker) {
        if (markerClustererBig) {
            markerClusterer.addMarker(marker);
        } else {
            map.addOverlay(marker);
        }
    }

    if (state.markers) {
        switch (state.editMode) {
            case RouteEditMode.SET_AND_MARKER: {
                state.markers.forEach(function (marker: MarkerOptions, index) {
                    if (index <= state.startIndex || index >= state.endIndex) {
                        let marker2 = createMarker(marker, new BMap.Point(marker.longitude, marker.latitude));
                        if (index === state.startIndex) {
                            marker2.setIcon(start_marker_icon);
                        } else if (index === state.endIndex) {
                            marker2.setIcon(destination_marker_icon);
                        } else {
                            marker2.setIcon(trace_point_icon);
                        }
                        markers_temps.push({
                            marker: marker2,
                            listeners: []
                        });
                        // map.addOverlay(marker2);
                        addOverlay(marker2);
                    }
                });
                break;
            }
            case RouteEditMode.SET_STRAIGHT: {
                state.markers.forEach(function (marker: MarkerOptions, index) {
                    if (index <= state.startIndex || index >= state.endIndex) {
                        let marker2 = createMarker(marker, new BMap.Point(marker.longitude, marker.latitude));
                        markers_temps.push({
                            marker: marker2,
                            listeners: []
                        });
                        // map.addOverlay(marker2);
                        addOverlay(marker2);
                    }
                });
                break;
            }
            case RouteEditMode.DRIVIVE_ROUTE: {
                state.markers.forEach(function (marker: MarkerOptions, index) {
                    let marker2 = createMarker(marker, new BMap.Point(marker.longitude, marker.latitude));
                    markers_temps.push({
                        marker: marker2,
                        listeners: []
                    });
                    // map.addOverlay(marker2);
                    addOverlay(marker2);
                })
                break;
            }
            case RouteEditMode.SET_EDIT_REMOVE: {
                let a = previousMarkers.currentPoints[0]
                state.markers.forEach(function (marker: MarkerOptions, index) {
                let marker2 = createMarker(marker, new BMap.Point(marker.longitude, marker.latitude));
               let cxm;
                            if (!marker2.getPosition().equals(a.marker.getPosition())) {
                                cxm = new BMap.ContextMenu();
                                let remove = new BMap.MenuItem('删除该点', onMenuItemRemovePointListener.bind(marker2));
                                cxm.addItem(remove);
                                marker2.addContextMenu(cxm);
                                addOverlay(marker2);
                                markers_temps.push({
                                    marker: marker2,
                                    listeners: [],
                                    contextmenu: cxm
                                });
                            }
                });
                break;
            }
            default: {
                let count = state.markers.length - 1;
                if (state.markers) {
                    state.markers.forEach(function (marker: MarkerOptions, index) {
                        let marker2 = createMarker(marker, new BMap.Point(marker.longitude, marker.latitude));
                        let cxm;
                        if (index === state.startIndex) {
                            marker2.setIcon(start_marker_icon);
                            cxm = new BMap.ContextMenu();
                            let item_un_start = new BMap.MenuItem('取消设为起点', onMenuItemSetUnStartListener.bind(marker2));

                            let remove = new BMap.MenuItem('删除该点', onMenuItemRemovePointListener.bind(marker2));
                            cxm.addItem(remove);

                            cxm.addItem(item_un_start);
                            marker2.addContextMenu(cxm);

                        } else if (index === state.endIndex) {
                            marker2.setIcon(destination_marker_icon);
                            cxm = new BMap.ContextMenu();
                            let item_un_end = new BMap.MenuItem('取消设为终点', onMenuItemUnSetDestinationListener.bind(marker2));


                            let remove = new BMap.MenuItem('删除该点', onMenuItemRemovePointListener.bind(marker2));
                            cxm.addItem(remove);
                            cxm.addItem(item_un_end);
                            marker2.addContextMenu(cxm);

                        } else {

                            cxm = new BMap.ContextMenu();

                            if (index === count) {
                                marker2.setIcon(route_end_icon)
                                let item_start = new BMap.MenuItem('设为终点', onMenuItemSetDestinationListener.bind(marker2));
                                let item_remove_end = new BMap.MenuItem('删除该点',onMenuItemRemoveInLineDestinationListener.bind(marker2));

                                cxm.addItem(item_start);
                                cxm.addItem(item_remove_end);

                            }else if (index  === 0) {
                                marker2.setIcon(route_start_icon);
                                let item_destination = new BMap.MenuItem('设为起点', onMenuItemSetStartListener.bind(marker2));
                                cxm.addItem(item_destination);

                            } else {
                                marker2.setIcon(trace_point_icon);
                                let item_start = new BMap.MenuItem('设为起点', onMenuItemSetStartListener.bind(marker2));
                                let item_destination = new BMap.MenuItem('设为终点', onMenuItemSetDestinationListener.bind(marker2));
                                cxm.addItem(item_start);
                                cxm.addItem(item_destination);
                                if( state.startIndex && state.endIndex &&  state.startIndex < index && index < state.endIndex) {
                                    let item_remove_end = new BMap.MenuItem('删除该点',onMenuItemRemoveInLineDestinationListener.bind(marker2));
                                    cxm.addItem(item_remove_end)
                                }
                            }


                            marker2.addContextMenu(cxm);
                        }
                        markers_temps.push({
                            marker: marker2,
                            contextmenu: cxm,
                            listeners: []
                        });

                        addOverlay(marker2);
                        // map.addOverlay(marker2);
                    });

                    if (state.viewports.length > 0) {
                        map.setViewport(state.viewports.map(marker => new BMap.Point(marker.longitude, marker.latitude)));
                    }
                }
            }
        }
        route._updateMarkers(markers_temps);
        // map.removeEventListener('rightclick', rightClick);
        // map.addEventListener('rightclick', rightClick);
    }

     function rightClick(e) {
        let s = e.point.lng;
        let w = e.point.lat;

        if (e.overlay) {
            let marker2 = e.overlay;

            let cxm = new BMap.ContextMenu();
            let item_start = new BMap.MenuItem('设为起点', onMenuItemSetStartListener.bind(marker2));
            let item_destination = new BMap.MenuItem('设为终点', onMenuItemSetDestinationListener.bind(marker2));
            cxm.addItem(item_start);
            cxm.addItem(item_destination);


            marker2.addContextMenu(cxm);
            // marker2.removeContextMenu(cxm);

            var a = new Event('rightclick');
            cxm.dispatchEvent(a, e);
            marker2.dispatchEvent(a, e);

            // map.dispatchEvent(a, e);

            // e.preventDefault();
            // e.stopPropagation();
        } else {
        }
    }

    function markClick(event) {
        let marker = new BMap.Marker(event.point, {icon: trace_point_icon});
        map.addOverlay(marker);
        route.addToCurrentPoints(marker);
        drawCurrentPoint(state.markers[state.startIndex], state.markers[state.endIndex], map, route.previousMarkers, route);
    }

    function markClickAddDestination( event ) {
        let marker = new BMap.Marker(event.point, {icon: trace_point_icon});
        map.addOverlay(marker);
        route.addToCurrentPoints(marker);
        drawCurrentPoint2(state.markers[state.endIndex], map, route.previousMarkers, route);
    }

    function markInitialClickAdd( event ) {
        let marker = new BMap.Marker(event.point, {icon: trace_point_icon});
        map.addOverlay(marker);
        route.addToCurrentPoints(marker);
       drawCurrentPoint3(map, route.previousMarkers, route);
    }

    if (state.enableMarkerClick) {
        route.previousMarkers.currentPoints = [];
        map.setDefaultCursor('crosshair');
        if(state.editMode === RouteEditMode.SET_ADD_MARKER_AFTER_DES ) {
            map.addEventListener('click', markClickAddDestination);
            route.addMarkerListener(markClickAddDestination);
        } else if(state.editMode === RouteEditMode.SET_ADD_INITIAL_MARKER) {
            map.addEventListener('click', markInitialClickAdd);
            route.addMarkerListener(markInitialClickAdd);
        } else {
            map.addEventListener('click', markClick);
            route.addMarkerListener(markClick);
        }
    }
}

