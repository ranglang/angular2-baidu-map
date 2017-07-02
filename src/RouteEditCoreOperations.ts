import {MapOptions, MarkerOptions} from './interfaces/Options';
import {PreviousAutoComplete, PreviousMarker} from './interfaces/PreviousMarker';

import {setGeoCtrl} from './controls/GeoControl';
import {setScaleCtrl} from './controls/ScaleControl';
import {setOverviewMapCtrl} from './controls/OverviewMapControl';
import {setNavigationCtrl} from './controls/NavigationControl';
import {MarkerIcon} from "./enum/ControlAnchor";
import {BaiduMap} from "./components/map";
import {PreviousPolygon} from "./interfaces/PreviousPolygon";
import {createMarker} from "./CoreOperations";

// export const createMarker = function(marker: MarkerOptions, pt: any) {
//     var BMap: any = (<any>window)['BMap'];
//     var opts: any = {};
//     if (marker.icon) {
//         var icon = new BMap.Icon(marker.icon, new BMap.Size(marker.width, marker.height));
//         opts['icon'] = icon;
//     }
//
//     if(marker.category) {
//         switch(marker.category) {
//             case MarkerIcon.STOP : {
//                 var icon = new BMap.Icon('http://api.map.baidu.com/img/markers.png', new BMap.Size(23, 25), {
//                     offset: new BMap.Size(10, 25),
//                     imageOffset: new BMap.Size(0, 0)
//                 });
//                 opts['icon'] = icon;
//                 break;
//             }
//             default : {
//                 var icon = new BMap.Icon('http://api.map.baidu.com/img/markers.png', new BMap.Size(23, 25), {
//                     offset: new BMap.Size(10, 25),
//                     imageOffset: new BMap.Size(0, 0 - 10 * 25)
//                 });
//                 opts['icon'] = icon;
//             }
//
//         }
//     }
//     if (marker.enableDragging) {
//         opts['enableDragging'] = true;
//     }
//     return new BMap.Marker(pt, opts);
// };

export const redrawMarkersEdit = function(map: any, previousMarkers: PreviousMarker[], opts: MapOptions) {

    var BMap: any = (<any>window)['BMap'];


    let start_marker_icon = new BMap.Icon('http://api.map.baidu.com/img/markers.png', new BMap.Size(23, 25), {
        offset: new BMap.Size(10, 25),
        imageOffset: new BMap.Size(0, 0 - 10 * 25)
    });

    let destination_marker_icon = new BMap.Icon('/assets/img/markers_yellow.png', new BMap.Size(23, 25), {
        offset: new BMap.Size(10, 25),
        imageOffset: new BMap.Size(0, 0)
    });

   let trace_point_icon  = new BMap.Icon('/assets/img/click_mark.png', new BMap.Size(20, 20), {imageOffset: new BMap.Size(0, 0)});

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
        console.log('marker category');
        console.log(marker.category);

        let marker2 = createMarker(marker, new BMap.Point(marker.longitude, marker.latitude));

        let item_start;
        let item_destination;
        let  item_unstart;
        let  item_undestination;

        let cxm = new BMap.ContextMenu();

        let onMenuItemUnSetStartListener = function () {
            let self = this;
            console.log('unSetStart');
            let menuItem = cxm.getItem(1);
            cxm.removeItem(menuItem);
            cxm.addItem(item_start);
            self.setIcon(trace_point_icon);
        }

        item_unstart = new BMap.MenuItem('取消起点', onMenuItemUnSetStartListener.bind(marker2));

        let onMenuItemSetStartListener = function () {
            let self = this
            console.log('setStart');
            console.log(self.point);
            self.setIcon(start_marker_icon);

            let menuItem = cxm.getItem(0);
            cxm.removeItem(menuItem);
            let menuItem1 = cxm.getItem(1);
            cxm.removeItem(menuItem);
            cxm.removeItem(menuItem1);

            cxm.addItem(item_unstart);
            cxm.addItem(item_destination);
        }

        let onMenuItemSetDestinationListener = function () {
            let self = this
            console.log('setDestination');
            self.setIcon(destination_marker_icon);


            let menuItem = cxm.getItem(0);
            cxm.removeItem(menuItem);
            let menuItem1 = cxm.getItem(1);
            cxm.removeItem(menuItem);
            cxm.removeItem(menuItem1);

            cxm.addItem(item_start);
            cxm.addItem(item_undestination);

            console.log(self.point);
        }

        let onMenuItemUnSetDestinationListener = function () {
            let self = this
            console.log('setDestination');
            self.setIcon(trace_point_icon);

            let menuItem = cxm.getItem(0);
            cxm.removeItem(menuItem);
            let menuItem1 = cxm.getItem(1);
            cxm.removeItem(menuItem);
            cxm.removeItem(menuItem1);

            cxm.addItem(item_start);
            cxm.addItem(item_destination);

            console.log(self.point);
        }

         item_start = new BMap.MenuItem('设为起点', onMenuItemSetStartListener.bind(marker2));
         item_destination = new BMap.MenuItem('设为终点', onMenuItemSetDestinationListener.bind(marker2));

        item_undestination = new BMap.MenuItem('取消终点', onMenuItemUnSetDestinationListener.bind(marker2));


        cxm.addItem(item_start);
        cxm.addItem(item_destination);
        marker2.addContextMenu(cxm);

        let previousMarker: PreviousMarker = { marker: marker2,cxm: cxm, listeners: [] };
        previousMarkers.push(previousMarker);

        map.addOverlay(marker2);
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

