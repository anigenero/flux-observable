import {merge, Observable} from 'rxjs';

export interface Action<T = any> {
    type: T;
}

export type Epic<A extends Action, O extends A = A, D = any> = (
    action$: Observable<A>,
    dependencies: D
) => Observable<O>;

export const combineEpics =
    <A extends Action, O extends A = A, D = any>(
        ...epics: Epic<A, O, D>[]
    ): Epic<A, O, D> => {

        const merger = (...args: Parameters<Epic<A, O, D>>) => merge(
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
