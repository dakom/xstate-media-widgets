export interface KeyBuffer {
    keys: Array<KeyEvent>;
    finalStop: number;
};

export interface KeyEvent {
    key: string;
    time: number;
}
