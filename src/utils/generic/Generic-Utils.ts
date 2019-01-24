import { Option} from 'fp-ts/lib/Option';

export type Thunk = () => void;

export type OptionalThunk = Option<Thunk>;

export const optionIs = <T>(option:Option<T>) => (value:T):boolean => 
    option.fold(false, v => v === value);

export const arrayHas = <T>(arr:Array<T>) => (value:T):boolean => 
    arr.indexOf(value) !== -1;
    
