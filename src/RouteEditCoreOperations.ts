import {MapOptions, MarkerOptions} from './interfaces/Options';
import {
    PreviousAutoComplete, PreviousMarker, MarkerHandler, PreviousEditPolyLine, PreviousStateMarker,
} from './interfaces/PreviousMarker';

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
        } else {
            console.log('no driving Route');
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
        route._updateDriveRoute(driving)
        console.log('previous length in drive route: ' + previousMarkers.markers.length)

        let a = previousMarkers.markers[state.startIndex].marker.getPosition()
        console.log('startIndex: ' + state.startIndex);

        console.log('endIndex: ' + state.endIndex);
        let b = previousMarkers.markers[state.endIndex].marker.getPosition()
        driving.search(a, b, {});
    }
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

export const redrawEditState = function(map: any, previousMarkers: PreviousStateMarker, state: EditRouteRxState ) {
    let route = this;
    var BMap: any = (<any>window)['BMap'];
    if(!BMap) {
        return;
    }


    if (previousMarkers) {
        previousMarkers.markers.forEach(markerState => {
            map.removeOverlay(markerState.marker)
        });

        previousMarkers.markers.length = 0;
    } else {
        route.previousMarkers = {...previousMarkers, markers : []};
        // route.previousMarkers = {
        //     markers: []
        // }
    }

    let start_marker_icon = new BMap.Icon('http://api.map.baidu.com/img/markers.png', new BMap.Size(23, 25), {
        offset: new BMap.Size(10, 25),
        imageOffset: new BMap.Size(0, 0 - 10 * 25)
    });

    let destination_marker_icon = new BMap.Icon('/assets/img/markers_yellow.png', new BMap.Size(23, 25), {
        offset: new BMap.Size(10, 25),
        imageOffset: new BMap.Size(0, 0)
    });

    let trace_point_icon  = new BMap.Icon('/assets/img/click_mark.png', new BMap.Size(20, 20), {imageOffset: new BMap.Size(0, 0)});

        let onMenuItemSetStartListener = function () {
            route._setStart(this.getPosition());
        }

        let onMenuItemSetDestinationListener = function () {
            route._setEnd(this.getPosition());
        }

    route.previousMarkers.markers.length = 0;
    let a = [];

    if(state.markers) {
        switch (state.editMode) {
            case RouteEditMode.SET_STRAIGHT: {
                state.markers.forEach(function(marker: MarkerOptions, index ) {
                    if(index <= state.startIndex || index >= state.endIndex) {
                        let marker2 = createMarker(marker, new BMap.Point(marker.longitude, marker.latitude));
                        a.push({
                            marker: marker2,
                            listeners: []
                        });
                        map.addOverlay(marker2);
                    }
                });
                break;
            }
            case RouteEditMode.DRIVIVE_ROUTE: {
                state.markers.forEach(function(marker: MarkerOptions, index ) {
                    let marker2 = createMarker(marker, new BMap.Point(marker.longitude, marker.latitude));
                    a.push({
                        marker: marker2,
                        listeners: []
                    });
                    map.addOverlay(marker2);
                })
                break;
            }
            default: {
                state.markers.forEach(function(marker: MarkerOptions, index ) {
                    let marker2 = createMarker(marker, new BMap.Point(marker.longitude, marker.latitude));
                    if(index === state.startIndex) {
                        marker2.setIcon(start_marker_icon);
                    } else if(index === state.endIndex){
                        marker2.setIcon(destination_marker_icon);
                    } else {
                        marker2.setIcon(trace_point_icon)
                        let cxm = new BMap.ContextMenu();
                        let item_start = new BMap.MenuItem('设为起点', onMenuItemSetStartListener.bind(marker2));
                        let item_destination = new BMap.MenuItem('设为终点', onMenuItemSetDestinationListener.bind(marker2));
                        cxm.addItem(item_start);
                        cxm.addItem(item_destination);
                        marker2.addContextMenu(cxm);
                    }
                    a.push({
                        marker: marker2,
                        listeners: []
                    });
                    map.addOverlay(marker2);
                });
            }
        }
        route._updateMarkers(a);
    }
}

// export const redrawMarkersEdit = function(map: any, previousMarkers: PreviousMarker[], markerHandler: MarkerHandler, opts: MapOptions) {
//
//     var self = this as EditRoute ;
//
//     if(! markerHandler) {
//         self.markerHandler = {
//         }
//         console.log(self.markerHandler);
//     }
//
//     var BMap: any = (<any>window)['BMap'];
//     let start_marker_icon = new BMap.Icon('http://api.map.baidu.com/img/markers.png', new BMap.Size(23, 25), {
//         offset: new BMap.Size(10, 25),
//         imageOffset: new BMap.Size(0, 0 - 10 * 25)
//     });
//
//     let destination_marker_icon = new BMap.Icon('/assets/img/markers_yellow.png', new BMap.Size(23, 25), {
//         offset: new BMap.Size(10, 25),
//         imageOffset: new BMap.Size(0, 0)
//     });
//
//    let trace_point_icon  = new BMap.Icon('/assets/img/click_mark.png', new BMap.Size(20, 20), {imageOffset: new BMap.Size(0, 0)});
//
//
//     previousMarkers.forEach(function({marker, listeners}) {
//         listeners.forEach(listener => { marker.removeEventListener('click', listener); });
//         map.removeOverlay(marker);
//     });
//
//     previousMarkers.length = 0;
//
//     if (!opts.markers) {
//         return;
//     }
//
//     opts.markers.forEach(function(marker: MarkerOptions, index ) {
//         console.log('marker category');
//         let marker2 = createMarker(marker, new BMap.Point(marker.longitude, marker.latitude));
//         let item_start;
//         let item_destination;
//         let  item_unstart;
//         let  item_undestination;
//
//         let cxm = new BMap.ContextMenu();
//
//         let onMenuItemUnSetStartListener = function () {
//             let self = this;
//             let menuItem = cxm.getItem(1);
//             cxm.removeItem(menuItem);
//             cxm.addItem(item_start);
//             self.setIcon(trace_point_icon);
//         }
//
//         item_unstart = new BMap.MenuItem('取消起点', onMenuItemUnSetStartListener.bind(marker2));
//
//         let onMenuItemSetStartListener = function () {
//             // markerHandler.startMarker = this;
//
//             self._setStart(index);
//
//             this.setIcon(start_marker_icon);
//             self.markerHandler.startMarker = this;
//
//             let menuItem = cxm.getItem(0);
//             cxm.removeItem(menuItem);
//             let menuItem1 = cxm.getItem(1);
//             cxm.removeItem(menuItem);
//             cxm.removeItem(menuItem1);
//             cxm.addItem(item_unstart);
//             cxm.addItem(item_destination);
//             self._drawPolyLine()
//         }
//
//         let onMenuItemSetDestinationListener = function () {
//
//             self.markerHandler.endMarker = this;
//
//             this.setIcon(destination_marker_icon);
//
//
//             let menuItem = cxm.getItem(0);
//             cxm.removeItem(menuItem);
//             let menuItem1 = cxm.getItem(1);
//             cxm.removeItem(menuItem);
//             cxm.removeItem(menuItem1);
//             cxm.addItem(item_start);
//             cxm.addItem(item_undestination);
//             self._drawPolyLine()
//         }
//
//         let onMenuItemUnSetDestinationListener = function () {
//             let self = this
//             self.setIcon(trace_point_icon);
//
//             let menuItem = cxm.getItem(0);
//             cxm.removeItem(menuItem);
//             let menuItem1 = cxm.getItem(1);
//             cxm.removeItem(menuItem);
//             cxm.removeItem(menuItem1);
//
//             cxm.addItem(item_start);
//             cxm.addItem(item_destination);
//
//         }
//
//          item_start = new BMap.MenuItem('设为起点', onMenuItemSetStartListener.bind(marker2));
//          item_destination = new BMap.MenuItem('设为终点', onMenuItemSetDestinationListener.bind(marker2));
//
//         item_undestination = new BMap.MenuItem('取消终点', onMenuItemUnSetDestinationListener.bind(marker2));
//
//
//         cxm.addItem(item_start);
//         cxm.addItem(item_destination);
//         marker2.addContextMenu(cxm);
//
//         let previousMarker: PreviousMarker = { marker: marker2,cxm: cxm, listeners: [] };
//         previousMarkers.push(previousMarker);
//
//         map.addOverlay(marker2);
//         if (!marker.title && !marker.content) {
//             return;
//         }
//         let msg = `<p>${marker.title || ''}</p><p>${marker.content || ''}</p>`;
//         let infoWindow2 = new BMap.InfoWindow(msg, {
//             enableMessage: !!marker.enableMessage
//         });
//         if (marker.autoDisplayInfoWindow) {
//             marker2.openInfoWindow(infoWindow2);
//         }
//         let openInfoWindowListener = function() {
//             this.openInfoWindow(infoWindow2);
//         };
//         previousMarker.listeners.push(openInfoWindowListener);
//         marker2.addEventListener('click', openInfoWindowListener);
//     });
//
//     if(opts.markers.length > 0){
//         map.setViewport(opts.markers.map(marker => new BMap.Point(marker.longitude, marker.latitude)));
//     }
// };

