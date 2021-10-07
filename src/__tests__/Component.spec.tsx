import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, {Dispatch, FunctionComponent, Reducer} from 'react';
import {from, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {createObservableReducerContext, Epic, ofType} from '../index';

export type Dependencies = {
    service: (task: string) => string;
};

export namespace TaskActionTypes {
    export const BAD_TASK = 'bad_task';
    export const SET_TASK = 'set_task';

    export const START_TASK = 'start_task';

}

export type TaskState = {
    task: string;
};

export type TaskActions = {

    [TaskActionTypes.BAD_TASK]: {
        type: typeof TaskActionTypes.BAD_TASK;
        task: string;
    };

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
    TaskActions[typeof TaskActionTypes.BAD_TASK] |
    TaskActions[typeof TaskActionTypes.START_TASK];

export namespace TaskDispatchActions {

    export const badTask = (task: string): TaskActions[typeof TaskActionTypes.BAD_TASK] => ({
        type: TaskActionTypes.BAD_TASK,
        task
    });

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

    export const startTask: Epic<TaskAction, TaskAction, Dependencies> =
        (action$, {service}) =>
            action$.pipe(
                ofType(TaskActionTypes.START_TASK),
                switchMap(({task}) =>
                    from(service(task)).pipe(
                        switchMap((result) => of(TaskDispatchActions.setTask(result)))
                    )
                )
            );

    export const badTask: Epic<TaskAction, TaskAction, Dependencies> =
        () => null;

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
            <button data-testid="taskButton" onClick={() =>
                dispatch(TaskDispatchActions.startTask(taskName))
            }/>
            <button data-testid="badTaskButton" onClick={() =>
                dispatch(TaskDispatchActions.badTask(taskName))
            }/>
        </div>
    );

};

describe('createObservableReducerContext', () => {

    const serviceFunction = jest.fn().mockResolvedValue('task1');

    it('should create context', () => {

        const {Provider, useObservableContext} = createObservableReducerContext<TaskAction, TaskState, Reducer<TaskState, TaskAction>>(
            taskReducer, [
                ReducerEpics.startTask
            ], {service: serviceFunction});

        const {asFragment} = render(
            <Provider options={{state: defaultState}}>
                <TaskComponent taskName="test"
                               useContext={useObservableContext}/>
            </Provider>
        );

        expect(asFragment()).toMatchSnapshot();

    });

    it('should dispatch event', () => {

        const {Provider, useObservableContext} = createObservableReducerContext<TaskAction, TaskState, Reducer<TaskState, TaskAction>>(
            taskReducer, [
                ReducerEpics.startTask
            ], {service: serviceFunction}
        );

        const {asFragment} = render(
            <Provider options={{state: defaultState}}>
                <TaskComponent taskName="test"
                               useContext={useObservableContext}/>
            </Provider>
        );

        const firstRender = asFragment();
        expect(firstRender).toMatchSnapshot();

        userEvent.click(screen.getAllByTestId('taskButton')[0]);

        expect(firstRender).toMatchSnapshot(asFragment());

        userEvent.click(screen.getAllByTestId('taskButton')[0]);

        expect(firstRender).toMatchSnapshot(asFragment());

    });

    it('should error out for bad stream', () => {

        const {Provider, useObservableContext} = createObservableReducerContext<TaskAction, TaskState, Reducer<TaskState, TaskAction>>(
            taskReducer, [
                ReducerEpics.badTask
            ], {service: serviceFunction}
        );

        const {asFragment} = render(
            <Provider options={{state: defaultState}}>
                <TaskComponent taskName="test"
                               useContext={useObservableContext}/>
            </Provider>
        );

        expect(asFragment()).toMatchSnapshot();

    });

});
