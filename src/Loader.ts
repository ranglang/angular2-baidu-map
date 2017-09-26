import {MapObjct} from './interfaces/MapObjct';
import {MapStatus} from './enum/MapStatus';
import {OfflineOptions} from './interfaces/Options';

export const loader = function(ak: string, offlineOpts: OfflineOptions, callback: Function, protocol: string, id: string) {
    let realProtocol = protocol || location.protocol;
    let MAP_URL: string = `${realProtocol}//api.map.baidu.com/api?v=2.0&ak=${ak}&callback=baidumapinit&s=${realProtocol === 'https:' ? 1 : 0}`;

    let DrawingManager_MAP_URL : string = `${realProtocol}//api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js`;

    let markerClustererURL : string = `${realProtocol}//api.map.baidu.com/library/MarkerClusterer/1.2/src/MarkerClusterer_min.js`;

    let textIconURL : string = `${realProtocol}//api.map.baidu.com/library/TextIconOverlay/1.2/src/TextIconOverlay_min.js`;


    let win: any = (<any>window);

    let baiduMap: MapObjct = win['baiduMap'];
    if (baiduMap && baiduMap.status === MapStatus.LOADING) {
        return baiduMap.callbacks.push(callback);
    }

    if (baiduMap && baiduMap.status === MapStatus.LOADED) {
        return callback();
    }

    win['baiduMap'] = { status: MapStatus.LOADING, callbacks: [] };

    win['baidumapinit'] = function() {
        win['baiduMap'].status = MapStatus.LOADED;
        console.log('lllllllllllllllllllllllllllllll');

        // let baiduMap: MapObjct = win['baiduMap'];
        var BMapLib: any = (<any>window)['BMapLib'];
        // console.log('BMapLib');
        // console.log(BMapLib);

        if(!BMapLib || !BMapLib.DrawingManager) {
            console.log('loading drawing2')
            createTag1();
        }

        if(!BMapLib || !BMapLib.DrawingManager) {
            console.log('loading drawing1')
            createTagDrawingManager();
        }

        if(!BMapLib || !BMapLib.TextIconOverlay) {
            console.log('loading drawing1')
            createTag2();
        }
            // console.log(' skip loadding drawing');
        // }

            // console.log(' skip loadding drawing');
        // }


        // if(!!BMapLib) {
            // console.log('loading drawing')
            // createTagDrawingManager();
        // } else {
        //     console.log(' skip loadding drawing');
        // }
        //

        console.log('callback');
        callback();
        win['baiduMap'].callbacks.forEach((cb: Function) => cb());
        win['baiduMap'].callbacks = [];

    };

    let createTagDrawingManager = function() {
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = DrawingManager_MAP_URL;
        script.onerror = function() {
            console.log('onerror');
            // Array.prototype
            //     .slice
            //     .call(document.querySelectorAll('baidu-map div'))
            //     .forEach(function(node: any) {
            //         node.style.opacity = 1;
            //     });
            // document.body.removeChild(script);
            setTimeout(createTagDrawingManager, offlineOpts.retryInterval);
        };
        document.body.appendChild(script);
    };

    let createTag2 = function() {
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = textIconURL;
        script.onerror = function() {
            console.log('onerror ');
            // Array.prototype
            //     .slice
            //     .call(document.querySelectorAll('baidu-map div'))
            //     .forEach(function(node: any) {
            //         node.style.opacity = 1;
            //     });
            // document.body.removeChild(script);
            setTimeout(createTag2, offlineOpts.retryInterval);
        };
        document.body.appendChild(script);
    };
    let createTag1 = function() {
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = markerClustererURL;
        script.onerror = function() {
            console.log('onerror ');
            // Array.prototype
            //     .slice
            //     .call(document.querySelectorAll('baidu-map div'))
            //     .forEach(function(node: any) {
            //         node.style.opacity = 1;
            //     });
            // document.body.removeChild(script);
            setTimeout(createTag1, offlineOpts.retryInterval);
        };
        document.body.appendChild(script);
    };

    let createTag = function() {
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = MAP_URL;
        script.onerror = function() {
            Array.prototype
                .slice
                .call(document.querySelectorAll(id + ' div'))
                .forEach(function(node: any) {
                    node.style.opacity = 1;
                });
            document.body.removeChild(script);
            setTimeout(createTag, offlineOpts.retryInterval);
        };
        document.body.appendChild(script);
    };

    createTag();
};
