import {Dispatch, Reducer} from 'react';
import {from, queueScheduler, Subject} from 'rxjs';
import {QueueScheduler} from 'rxjs/internal/scheduler/QueueScheduler';
import {map, mergeMap, observeOn, subscribeOn} from 'rxjs/operators';
import {Action, Epic} from './combine.epics';
import {StateObservable} from './state.observable';

type QueueSchedulerType = typeof queueScheduler;
const uniqueQueueScheduler: QueueSchedulerType = new QueueScheduler(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (queueScheduler as any).SchedulerAction
);

// creates a wrapper for dispatch that will send to the epic's observable chain
export const dispatchWrapper =
    <A extends Action, S, R extends Reducer<S, A>, D = any>(
        epic$: Subject<Epic<A, A, S, D>>,
        dispatch: Dispatch<any>,
        state: S,
        dependencies: D
    ): Dispatch<A> => {

        const actionSubject$ = new Subject<A>();
        const stateSubject$ = new Subject<S>();
        const action$ = actionSubject$
            .asObservable()
            .pipe(observeOn(uniqueQueueScheduler));

        const state$ = new StateObservable(
            stateSubject$.pipe(observeOn(uniqueQueueScheduler)),
            state
        );

        const result$ = epic$.pipe(
            map((epic) => {

                const output$ = epic(action$, state$, dependencies);

                if (!output$) {
                    throw new TypeError(
                        `Your root Epic "${epic.name ||
                        '<anonymous>'}" does not return a stream. Double check you\'re not missing a return statement!`
                    );
                }

                return output$;

            }),
            mergeMap((output$) =>
                from(output$).pipe(
                    subscribeOn(uniqueQueueScheduler),
                    observeOn(uniqueQueueScheduler)
                )
            )
        );

        result$.subscribe(dispatch);

        return (action) => {

            stateSubject$.next(state);
            actionSubject$.next(action);

        };

    };
