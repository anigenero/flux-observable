import React, {Dispatch, FunctionComponent} from 'react';
import {TaskAction, TaskState} from './taskReducer';

export type TaskComponentProps = {
    useContext: () => {
        dispatch: Dispatch<TaskAction>;
        state: TaskState;
    };
};

export const TaskComponent: FunctionComponent<TaskComponentProps> = ({useContext}) => {

    const {state, dispatch} = useContext();

    return (
        <div>
            {state.task}
        </div>
    );

};
