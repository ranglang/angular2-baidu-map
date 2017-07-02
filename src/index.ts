import { NgModule, ModuleWithProviders } from '@angular/core';
import {StoreModule} from '@ngrx/store';
import { BaiduMap } from './components/map';
import {EditRoute} from "./components/editRoute";
import {rootReducer} from "./app/ngrx";

@NgModule({
    imports: [
        StoreModule.provideStore(rootReducer),
        ],
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
