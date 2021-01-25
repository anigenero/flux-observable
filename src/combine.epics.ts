import {merge, Observable} from 'rxjs';
import {StateObservable} from './state.observable';

export interface Action<T = any> {
    type: T;
}

export type Epic<A extends Action, O extends A = A, S = any, D = any> = (
    action$: Observable<A>,
    state$: StateObservable<S>,
    dependencies: D
) => Observable<O>;

export const combineEpics =
    <A extends Action, O extends A = A, S = any, D = any>(
        ...epics: Epic<A, O, S, D>[]
    ): Epic<A, O, S, D> => {

        const merger = (...args: Parameters<Epic<A, O, S, D>>) => merge(
            ...epics.map((epic) => {
                const output$ = epic(...args);
                if (!output$) {
                    throw new TypeError(`combineEpics: one of the provided Epics "${epic.name || '<anonymous>'}" does not return a stream`);
                }
                return output$;
            })
        );

        // Technically the `name` property on Function's are supposed to be read-only.
        // While some JS runtimes allow it anyway (so this is useful in debugging)
        // some actually throw an exception when you attempt to do so.
        try {
            Object.defineProperty(merger, 'name', {
                value: `combineEpics(${epics.map((epic) => epic.name || '<anonymous>').join(', ')})`
            });
        } catch (e) {
            // don't do anything
        }

        return merger;

    };
