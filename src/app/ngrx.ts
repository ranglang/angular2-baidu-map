
import { compose } from '@ngrx/core/compose';
import { ActionReducer, combineReducers } from '@ngrx/store';

import * as reducerModule from  '../components/editRoute.reducer'
import {EditRouteRxState} from "../components/editRoute";

// export interface AppRxState {
//     routeEdit: EditRouteRxState;
// }

 export declare interface StoneState {
     // lineInfo: LineInfoState;
     routeEdit: EditRouteRxState
 }


// const modules = {
//     'routeEdit': reducerModule,
// };
//
// export const syncReducers = {
//     routeEdit: reducerModule.editRouteReducer
// };
//
// const deepCombineReducers = (allReducers: any) => {
//     Object.getOwnPropertyNames(allReducers).forEach((prop) => {
//         if (allReducers.hasOwnProperty(prop)
//             && allReducers[prop] !== null
//             && typeof allReducers[prop] !== 'function') {
//             allReducers[prop] = deepCombineReducers(allReducers[prop]);
//         }
//     });
//     return combineReducers(allReducers);
// };
//
// const createReducer = (asyncReducers = {}) => {
//     let allReducers = { ...syncReducers, ...asyncReducers };
//     return deepCombineReducers(allReducers);
// };
//
// // Generate a reducer to set the root state in dev mode for HMR
// // function stateSetter(reducer: ActionReducer<any>): ActionReducer<any> {
// //     return function (state, action) {
// //         if (action.type === 'SET_ROOT_STATE') {
// //             return action.payload;
// //         }
// //         return reducer(state, action);
// //     };
// // }
//
// const resetOnLogout = (reducer: Function) => {
//     return function (state, action) {
//         let newState;
//         if (action.type === '[User] Logout Success') {
//             newState = Object.assign({}, state);
//             Object.keys(modules).forEach((key) => {
//                 newState[key] = modules[key]['initialState'];
//             });
//         }
//         return reducer(newState || state, action);
//     };
// };
//
// const productionReducer = compose(resetOnLogout);
//
// export function rootReducer(state: any, action: any, asyncReducer) {
//     return productionReducer(createReducer(asyncReducer))(state, action);
// }
