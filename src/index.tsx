import React, {createContext, Dispatch, FunctionComponent, Reducer, ReducerState, useContext, useReducer} from 'react';
import {EMPTY, Subject} from 'rxjs';
import {switchMap} from 'rxjs/operators';
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
        epics: Epic<A, A, D>[],
        dependencies?: D
    ): ObservableContext<A, S, R> => {

        const Context = createContext<{
            state: ReducerState<R>;
            dispatch: Dispatch<A>;
        }>(null);

        const Provider: FunctionComponent<{ options: Options<A, S, R> }> =
            ({options: {state: defaultState}, children}) => {

                const [state, dispatch] = useReducer(reducer, defaultState);

                const defaultEpic: Epic<A, A, D> =
                    (action$) =>
                        action$.pipe(
                            switchMap((action) => {
                                dispatch(action as any);
                                return EMPTY;
                            })
                        );

                const epic$ = new Subject<Epic<A, A, D>>();
                const cDispatch = dispatchWrapper<A, D>(epic$, dispatch, dependencies);
                const rootEpic = combineEpics(
                    ...epics,
                    defaultEpic
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
