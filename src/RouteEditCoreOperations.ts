import {MapOptions, MarkerOptions} from './interfaces/Options';
import {
    PreviousAutoComplete, PreviousMarker, MarkerHandler, PreviousEditPolyLine, PreviousStateMarker,
} from './interfaces/PreviousMarker';

import {setGeoCtrl} from './controls/GeoControl';
import {setScaleCtrl} from './controls/ScaleControl';
import {setOverviewMapCtrl} from './controls/OverviewMapControl';
import {setNavigationCtrl} from './controls/NavigationControl';
import {MarkerIcon} from "./enum/ControlAnchor";
import {BaiduMap} from "./components/map";
import {PreviousPolygon} from "./interfaces/PreviousPolygon";
import {createMarker} from "./CoreOperations";
import {EditRoute, EditRouteRxState} from "./components/editRoute";

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

//           if (resArray[0] > resArray[1]) {
//             let temp = resArray[0];
      };

export const redrawPolyLinEdit = function (map: any, previousPolyLine: PreviousEditPolyLine, markerHandler: MarkerHandler, opts: MapOptions) {

    var BMap: any = (<any>window)['BMap'];

    let self = this;
    if (previousPolyLine) {
        map.removeOverlay(previousPolyLine.polyLine);
    }

    if(markerHandler) {
        console.log('markerHandler is defined');
        if(markerHandler.startMarker && markerHandler.endMarker) {
            let resArray = getAllWaitPointsBetweenPoints(markerHandler.startMarker.getPosition(),
                markerHandler.endMarker.getPosition(), opts.markers.map(res => new BMap.Point(res.longitude, res.latitude)));

            console.log(resArray);

            console.log(' a: ' + resArray[0] + '             b:' + (resArray[1] + 1))
            let pos = opts.markers.slice(resArray[0],  (resArray[1]  + 1)).map((a) => {
                        return new BMap.Point(a.longitude, a.latitude);
                    });
            console.log(pos);

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
        console.log('markerHandler is undefined');
    }

}

export const redrawDriveRoute = function (map: any, previousMarkers: PreviousStateMarker, state: EditRouteRxState) {
    var BMap: any = (<any>window)['BMap'];

    if(state.enableSearch) {
        console.log('enableSearch');
        let driving = new BMap.DrivingRoute(map, {
            renderOptions: {map, autoViewport: true, enableDragging: true},
            onPolylinesSet: (routes) => {
                console.log(' search result');

                let searchRoute = routes[0].getPolyline();
                console.log(searchRoute);
                console.log(map);
                map.addOverlay(searchRoute);

                // let array = [];
                // let a = searchRoute.getPath();
                // for (let i = 0; i < a.length; i++) {
                //   array = array.concat(a[i]);
                // }
                // _DATA.trace_point = array;
            },
            onSearchComplete: function (results) {
                console.log('onSearchComplete')
                // _DATA.drivingRoute = driving;
            },
            onMarkersSet: function (routes) {
                // _Bmap.removeOverlay(routes[0].marker);
                // _Bmap.removeOverlay(routes[1].marker);
            }
        });
        driving.search(previousMarkers.markers[state.startIndex].marker.getPosition(), previousMarkers.markers[state.startIndex].marker.getPosition(), {});
    }else {
        console.log('Search diabled');
    }
}



export const redrawEditPolyline = function (map: any, previousMarkers: PreviousStateMarker, state: EditRouteRxState) {
    var BMap: any = (<any>window)['BMap'];
    let route = this;

    if (previousMarkers) {
        console.log('has previousMarkers');
        console.log(previousMarkers);

        if(previousMarkers.polyLine) {
            console.log('previousMarkers.polyLine is defiend');
            console.log('length: ' + previousMarkers.polyLine.length);

            previousMarkers.polyLine.forEach(line => {
                map.removeOverlay(line.polyLine)
            })
        } else {
            console.log('previousMarkers.polyLine is undefiend');
            route.previousMarkers = {...previousMarkers, polyLine : []};
        }
    } else {
        return;
    }

    if((state.startIndex !== -1) || (state.endIndex === -1)){
        let a_start = (state.startIndex > state.endIndex) ? state.endIndex: state.startIndex;
        let b = (state.startIndex > state.endIndex) ? state.startIndex: state.endIndex;
        console.log('a start' +  a_start + 'end : ' + b);
        let pos = previousMarkers.markers.slice(a_start, b + 1).map(res => {
            return res.marker.getPosition();
        });

        console.log(pos);

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
    console.log('redrawEditState .......');
    var BMap: any = (<any>window)['BMap'];
    if(!BMap) {
        console.log('BMap is undefined');
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
    // route.previousMarkers.markers = [];
    let a = [];

    if(state.markers) {
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

    if(state.markers.length > 0){
        map.setViewport(state.markers.map(marker => new BMap.Point(marker.longitude, marker.latitude)));
    }
        route.previousMarkers.markers =a;
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
//         console.log(marker.category);
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
//             console.log('unSetStart');
//             console.log('markerHandler.startMarker');
//             console.log(markerHandler.startMarker);
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
//             console.log('setDestination');
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
//             console.log('setDestination');
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
//             console.log(self.point);
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

