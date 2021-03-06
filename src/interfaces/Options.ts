import {Size} from './Size';
import {Icon} from './Icon';
import {ControlAnchor, MarkerIcon} from '../enum/ControlAnchor';

import {ScaleControlOptions} from '../controls/ScaleControl';
import {GeolocationControlOptions} from '../controls/GeoControl';
import {OverviewMapControlOptions} from '../controls/OverviewMapControl';
import {NavigationControlOptions} from '../controls/NavigationControl';

export interface RouteOptions {
    longitude: number;
    latitude: number;
}
export interface MarkerOptions {
    longitude: number;
    latitude: number;
    icon?: string;
    width?: number;
    height?: number;
    title?: string;
    content?: string;
    enableMessage?: boolean;
    autoDisplayInfoWindow?: boolean;
    enableDragging?: boolean;
    category ?: number;
    indexNumber ?: number;
}

export interface MapDefaultOptions {
    navCtrl?: boolean | NavigationControlOptions;
    scaleCtrl?: boolean | ScaleControlOptions;
    overviewCtrl?: boolean | OverviewMapControlOptions;
    enableScrollWheelZoom?: boolean;
    geolocationCtrl?: boolean | GeolocationControlOptions;
    zoom?: number;
    enableAutoComplete ?: boolean;
    enableEditPolygon ?: boolean;
}

export interface MapOptions extends MapDefaultOptions {
    center: { longitude: number, latitude: number, };

    viewports ?: { longitude: number, latitude: number, }[]

    markers?: MarkerOptions[];
    routes?: RouteOptions[];
    stops ?: MarkerOptions[];
    polygon?: RouteOptions[];
}

export interface OfflineOptions {
    retryInterval?: number,
    txt?: string
}
