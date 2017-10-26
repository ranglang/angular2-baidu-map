export enum ControlAnchor {
    BMAP_ANCHOR_TOP_LEFT = 0,
    BMAP_ANCHOR_TOP_RIGHT = 1,
    BMAP_ANCHOR_BOTTOM_LEFT = 2,
    BMAP_ANCHOR_BOTTOM_RIGHT = 3
}

export enum MarkerIcon {
    STOP = 0,
    ROUTE = 1,
    OVERSPEED = 2,
    RETUREN = 3,
    SELECTED_STOP = 4,
    ROUTE_START = 5,
    ROUTE_END = 6
}

export enum RouteEditMode {
    SELECT_MODE = -1,
    DRIVIVE_ROUTE = 1,
    SET_STRAIGHT = 2,
    SET_AND_MARKER = 3,
    SET_ADD_MARKER_AFTER_DES =4,
    SET_ADD_INITIAL_MARKER = 5,
    SET_EDIT_REMOVE = 6,
    SET_ADD_MARKER_BEFORE_START =7,
    SET_REMOVE_START_START = 8, //删除线段起点模式
}
