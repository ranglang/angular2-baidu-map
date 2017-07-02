export interface PreviousMarker {
    marker: any;
    cxm ?: any;
    contextMenusInfo ?: {
        contextMenu: any;
        menuItems: {
            menuItem: any;
            menuItemListener: any;
        }
    };
    listeners: Function[];
}

export interface PreviousAutoComplete {
    autoComplete: any;
    listeners: Function[];
}
