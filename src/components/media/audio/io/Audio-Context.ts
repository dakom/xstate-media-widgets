let _audioContext:AudioContext;
export const getAudioContext = () => {
    if(_audioContext === undefined) {
        const ctor = (window as any).AudioContext || (window as any).webkitAudioContext || undefined;

        if (!ctor) {
            alert("Sorry, but the Web Audio API is not supported by your browser. Please, consider upgrading to the latest version or downloading Google Chrome or Mozilla Firefox");
        }

        _audioContext = new ctor() as AudioContext;
    }

    return _audioContext;
    
}
