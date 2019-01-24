import { useState, useMemo, useEffect } from "react";
import {
    Machine,
    StateMachine,
    EventObject,
    OmniEvent,
    State,
    StateSchema
} from "xstate";
import { interpret, Interpreter } from "xstate/lib/interpreter";
import {some, none, Option} from "fp-ts/lib/Option";

//Little helper to make a predicate-based event sender for a service
export const makeEventSender = 
    < T, TContext = any, TState extends StateSchema = any, TEvent extends EventObject = any >
        (service:Interpreter<TContext, TState, TEvent>) => 
        (pred:(value:T) => boolean) => 
        (value:T) => 
        (evt:OmniEvent<TEvent>):Option<() => State<TContext, TEvent>> => 
            pred(value)
                ? some(() => service.send(evt))
                : none;

//adapted from https://github.com/carloslfu/use-machine
export interface MachineHook
    < TContext = any, TState extends StateSchema = any, TEvent extends EventObject = any >
    {
        state: State<TContext, TEvent>;
        context: TContext;
        send: TSendFn<TContext, TEvent>;
        service: Interpreter<TContext, TState, TEvent>;
    }
export function useMachine<
    TContext = any,
    TState extends StateSchema = any,
    TEvent extends EventObject = any
    >(makeMachine:() => StateMachine<TContext, TState, TEvent>):MachineHook<TContext, TState, TEvent>  {
        const machine = useMemo(makeMachine, []);
        
        const [state, setState] = useState<State<TContext, TEvent>>(
            machine.initialState
        );
        const [context, setContext] = useState<TContext>(machine.context!);

        const service = useMemo(() => interpret<TContext, TState, TEvent>(machine)
            .onTransition(state => setState(state as any))
            .onChange(setContext)
            .start()
        , []);

        // Stop the service when unmounting.
        useEffect(() => {
            return () => service.stop();
        }, []);

        return { state, send: service.send, context, service};
    }

type TSendFn<TContext, TEvent extends EventObject> = (
    event: OmniEvent<TEvent>
) => State<TContext, TEvent>;

