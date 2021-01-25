import React, {createContext, Dispatch, FunctionComponent, Reducer, ReducerState, useContext, useReducer} from 'react';
import {Subject} from 'rxjs';
import {Action, combineEpics, Epic} from './combine.epics';
import {dispatchWrapper} from './dispatchWrapper';

export {Epic, Action} from './combine.epics';
export {ofType} from './ofType';
export {StateObservable} from './state.observable';

export interface Options<A extends Action, S, R extends Reducer<S, A>> {
    state: ReducerState<R>;
}

export interface ObservableContext<A extends Action, S, R extends Reducer<S, A>> {
    Provider: FunctionComponent<{ options: Options<A, S, R> }>;
    useObservableContext: () => {
        dispatch: Dispatch<A>;
        state: S;
    };
}

export const createObservableReducerContext =
    <A extends Action, S, R extends Reducer<S, A>, D = any>(
        reducer: R,
        epics: Epic<A, A, S, D>[],
        dependencies?: D
    ): ObservableContext<A, S, R> => {

        const epic$ = new Subject<Epic<A, A, S, D>>();

        const Context = createContext<{
            state: ReducerState<R>;
            dispatch: Dispatch<A>;
        }>(null);

        const Provider: FunctionComponent<{ options: Options<A, S, R> }> =
            ({options: {state: defaultState}, children}) => {

                const [state, dispatch] = useReducer(reducer, defaultState);

                const cDispatch = dispatchWrapper<A, S, R, D>(epic$, dispatch, state, dependencies);
                const rootEpic = combineEpics(
                    ...epics
                );

                epic$.next(rootEpic);

                return (
                    <Context.Provider value={{state, dispatch: cDispatch}}>
                        {children}
                    </Context.Provider>
                );

            };

        const useObservableContext = () => {

            const {dispatch, state} = useContext(Context);

            return {
                dispatch,
                state
            };

        };

        return {
            Provider,
            useObservableContext,
        };

    };
