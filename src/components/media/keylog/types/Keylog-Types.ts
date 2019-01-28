export interface KeyBuffer {
    keys: Array<KeyEvent>;
};

export interface KeyEvent {
    key: string;
    time: number;
}
