import {MapStatus} from '../enum/MapStatus';

export interface MapObjct {
    status: MapStatus,
    callbacks: Function[]
};

export declare let BMapLib: {
    DrawingManager: {
        new (map: any, options ?: any): any;
    }
};
