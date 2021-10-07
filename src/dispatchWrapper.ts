import {Dispatch} from 'react';
import {from, queueScheduler, Subject} from 'rxjs';
import {map, mergeMap, observeOn, subscribeOn} from 'rxjs/operators';
import {Action, Epic} from './combine.epics';

const QueueScheduler: any = queueScheduler.constructor;
const uniqueQueueScheduler: typeof queueScheduler = new QueueScheduler(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (queueScheduler as any).schedulerActionCtor
);

// creates a wrapper for dispatch that will send to the epic's observable chain
export const dispatchWrapper =
    <A extends Action, D = any>(
        epic$: Subject<Epic<A, A, D>>,
        dispatch: Dispatch<any>,
        dependencies: D
    ): Dispatch<A> => {

        const actionSubject$ = new Subject<A>();
        const action$ = actionSubject$
            .asObservable()
            .pipe(observeOn(uniqueQueueScheduler));

        const result$ = epic$.pipe(
            map((epic) => {

                const output$ = epic(action$, dependencies);

                /* istanbul ignore if */
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

        const _dispatch = (action: A) => {
            actionSubject$.next(action);
        };

        result$.subscribe((action) => _dispatch(action));

        return _dispatch;

    };
