import {MapStatus} from '../enum/MapStatus';

export interface MapObjct {
    status: MapStatus,
    callbacks: Function[]
};

export declare let BMapLib: {
    DrawingManager: {
        new (map: any, options ?: any): any;
    }
    // EventWrapper: {
    //     trigger(target: any, event: any): void
    //     addListener(target: any, event: any, callback: any): void;
    //     removeListener(event: any): void;
    //     clearListeners(instance: any, type: string): void;
    // }
};

// export declare let BMAP_ANCHOR_TOP_RIGHT;
// export declare let BMAP_DRAWING_POLYLINE;
// export declare let BMAP_DRAWING_POLYGON;
