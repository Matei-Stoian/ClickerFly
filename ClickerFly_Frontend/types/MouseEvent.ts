export enum clickType {
    LEFT = 'left',
    RIGHT = 'right',
    MIDDLE = 'middle',
}


export type MouseEventType = {
    dx:number;
    dy:number;
    clickType?: clickType | null;
}

