import { NgModule, ModuleWithProviders } from '@angular/core';

import { BaiduMap } from './components/map';
import {EditRoute} from "./components/editRoute";

@NgModule({
    declarations: [
        BaiduMap,
        EditRoute,
    ],
    exports: [
        BaiduMap,
        EditRoute,
    ]
})
export class BaiduMapModule {}

export { MarkerOptions, MapDefaultOptions, MapOptions, OfflineOptions } from './interfaces/Options';
export { GeolocationControlOptions } from './controls/GeoControl';
export { ScaleControlOptions } from './controls/ScaleControl';
export { OverviewMapControlOptions } from './controls/OverviewMapControl';
export { NavigationControlOptions } from './controls/NavigationControl';
export { Icon } from './interfaces/Icon';
export { Size } from './interfaces/Size';
export { ControlAnchor } from './enum/ControlAnchor';
export * from './enum/NavigationControlType';
export { MapStatus } from './enum/MapStatus';
