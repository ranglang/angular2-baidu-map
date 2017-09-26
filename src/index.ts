import { NgModule, ModuleWithProviders } from '@angular/core';
import {StoreModule} from '@ngrx/store';
import { BaiduMap } from './components/map';
import {EditRoute} from "./components/editRoute";
// import {rootReducer} from "./app/ngrx";
import {CommonModule} from "@angular/common";
import {ClarityModule, ClrModalModule, ClrTooltipModule} from "u-clarity-angular";
import {EditRouteActions} from "./components/editRoute.actions";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
@NgModule({
    imports: [
            // StoreModule.provideStore(rootReducer),
        CommonModule,
       ClarityModule.forRoot(),
        ClrTooltipModule,
        ClrModalModule,
        BrowserAnimationsModule,
        ],
    declarations: [
        BaiduMap,
        EditRoute,
    ],
    providers: [
        EditRouteActions,
    ],
    exports: [
        BaiduMap,
        EditRoute,
        // EditRouteActions,
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
