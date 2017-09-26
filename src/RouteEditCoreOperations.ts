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
            console.log('markerHandler.startMarker && markerHandler.endMarker should be all settled');
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


    console.log('state.stops');
    console.log(state.stops);
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
                // console.log('openInfoWindowListener ');
                this.openInfoWindow(infoWindow2);
            };
            previousMarker.listeners.push(openInfoWindowListener);
            marker2.addEventListener('click', openInfoWindowListener);
        })

    }
}


export const redrawEditState = function (map: any, previousMarkers: PreviousStateMarker, state: EditRouteRxState) {
    let route = this;
    var BMap: any = (<any>window)['BMap'];
    if (!BMap || !map) {
        return;
    }

    var markerLab : any = (<any>window)['BMapLib']
    var markerClusterer;

    var markerClustererBig = false;

    if(markerLab && markerLab.MarkerClusterer && state.markers.length > 300) {
        markerClustererBig = true;
        markerClusterer = new markerLab.MarkerClusterer(map, {});
        console.log('has MarkerClusterer');
    }else {
        if(markerLab && markerLab.MarkerClusterer ) {
            markerClusterer = new markerLab.MarkerClusterer(map, {});
        }
        console.log('no MarkerClusterer');
    }


    // prviousMarksers
    if (previousMarkers) {
        // if(markerClusterer) {
            // markerClusterer.removeMarkers(previousMarkers.markers.map(res => res.marker))
        // } else {
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

        // }

        // markerClusterer.removeMarkers(previousMarkers.map(res => res.marker));

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

    let destination_marker_icon = new BMap.Icon('/assets/img/ditu.png', new BMap.Size(20, 28), {
        offset: new BMap.Size(10, 28),
        imageOffset: new BMap.Size(0, 0 - 102 * 28)
    });

    let trace_point_icon = new BMap.Icon('/assets/img/click_mark.png', new BMap.Size(20, 20), {imageOffset: new BMap.Size(0, 0)});

    let onMenuItemSetStartListener = function () {
        console.log('setStartMarkder');
        route._setStart(this.getPosition());
    }

    let onMenuItemSetDestinationListener = function () {
        console.log('setStartEnd');
        route._setEnd(this.getPosition());
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
            default: {
                console.log('default foreach ')
                if (state.markers) {
                    state.markers.forEach(function (marker: MarkerOptions, index) {
                        let marker2 = createMarker(marker, new BMap.Point(marker.longitude, marker.latitude));
                        let cxm;
                        if (index === state.startIndex) {
                            marker2.setIcon(start_marker_icon);
                        } else if (index === state.endIndex) {
                            marker2.setIcon(destination_marker_icon);
                        } else {
                            marker2.setIcon(trace_point_icon)
                            cxm = new BMap.ContextMenu();
                            let item_start = new BMap.MenuItem('设为起点', onMenuItemSetStartListener.bind(marker2));
                            let item_destination = new BMap.MenuItem('设为终点', onMenuItemSetDestinationListener.bind(marker2));
                            cxm.addItem(item_start);
                            cxm.addItem(item_destination);
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
        console.log('rightClick');
        let s = e.point.lng;
        let w = e.point.lat;

        if (e.overlay) {
            console.log('覆盖福');
            console.log(s);
            console.log(w);

            console.log(e.overlay)
            let marker2 = e.overlay;

            // map.addEventListener('contextmenu', function(e) {
            //     console.log('contextmenu');
            // });

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
            console.log('非覆盖物');
        }
    }

    function markClick(event) {
        let marker = new BMap.Marker(event.point, {icon: trace_point_icon});
        map.addOverlay(marker);
        route.addToCurrentPoints(marker);
        drawCurrentPoint(state.markers[state.startIndex], state.markers[state.endIndex], map, route.previousMarkers, route);
    }

    if (state.enableMarkerClick) {
        route.previousMarkers.currentPoints = [];
        map.setDefaultCursor('crosshair');
        map.addEventListener('click', markClick);
        route.addMarkerListener(markClick);
    }
}

