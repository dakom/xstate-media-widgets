export const getTimecode = (sec_num:number):string => {
    const hours   = Math.floor(sec_num / 3600);
    const minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    const seconds = sec_num - (hours * 3600) - (minutes * 60);

    const sHours = (hours   < 10) ? "0" + hours : hours.toString();
    const sMinutes = (minutes < 10) ? "0" + minutes : minutes.toString();
    const sSeconds = (seconds < 10) ? "0" + seconds : seconds.toString();
    return sHours + ':' + sMinutes + ':' + sSeconds;
}
