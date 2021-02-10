import React, {Dispatch, FunctionComponent, Reducer} from 'react';
import {create} from 'react-test-renderer';
import {from, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {createObservableReducerContext, Epic, ofType} from '../index';

export type Dependencies = {
    service: (task: string) => string;
};

export namespace TaskActionTypes {
    export const SET_TASK = 'set_task';

    export const START_TASK = 'start_task';

}

export type TaskState = {
    task: string;
};

export type TaskActions = {
    [TaskActionTypes.SET_TASK]: {
        type: typeof TaskActionTypes.SET_TASK;
        task: string;
    };

    [TaskActionTypes.START_TASK]: {
        type: typeof TaskActionTypes.START_TASK;
        task: string;
    };

};

export type TaskReducerAction =
    TaskActions[typeof TaskActionTypes.SET_TASK];

export type TaskAction =
    TaskReducerAction |
    TaskActions[typeof TaskActionTypes.START_TASK];

export namespace TaskDispatchActions {

    export const setTask = (task: string): TaskActions[typeof TaskActionTypes.SET_TASK] => ({
        type: TaskActionTypes.SET_TASK,
        task
    });

    export const startTask = (task: string): TaskActions[typeof TaskActionTypes.START_TASK] => ({
        type: TaskActionTypes.START_TASK,
        task
    });

}

export const defaultState: TaskState = {
    task: null
};

export const taskReducer: Reducer<TaskState, TaskReducerAction> = (prevState, action) => {
    switch (action.type) {

        case TaskActionTypes.SET_TASK: {
            return {
                task: action.task
            };
        }

        default: {
            return prevState;
        }

    }
};

export namespace ReducerEpics {

    export const startTask: Epic<TaskAction, TaskAction, TaskState, Dependencies> =
        (action$, state$, {service}) =>
            action$.pipe(
                ofType(TaskActionTypes.START_TASK),
                switchMap(({task}) =>
                    from(service(task)).pipe(
                        switchMap((result) => of(TaskDispatchActions.setTask(result)))
                    )
                )
            );

}

export type TaskComponentProps = {
    taskName: string;
    useContext: () => {
        dispatch: Dispatch<TaskAction>;
        state: TaskState;
    };
};

export const TaskComponent: FunctionComponent<TaskComponentProps> = ({taskName, useContext}) => {

    const {state, dispatch} = useContext();

    return (
        <div>
            {state.task}
            <button id="task-dispatch-btn" onClick={() =>
                dispatch(TaskDispatchActions.startTask(taskName))
            }/>
        </div>
    );

};

describe('createObservableReducerContext', () => {

    const serviceFunction = jest.fn().mockResolvedValue('task1');

    it('should create context', () => {

        const {Provider, useObservableContext} = createObservableReducerContext(taskReducer, [
            ReducerEpics.startTask
        ], {service: serviceFunction});

        const tree = create(
            <Provider options={{state: defaultState}}>
                <TaskComponent taskName="test"
                               useContext={useObservableContext}/>
            </Provider>
        ).toJSON();

        expect(tree).toMatchSnapshot();

    });

    // TODO: test epics lifecycle

});
