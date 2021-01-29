import React from 'react';
import {create} from 'react-test-renderer';
import {TaskComponent} from '../__testutils__/TaskComponent';
import {defaultState, ReducerEpics, taskReducer} from '../__testutils__/taskReducer';
import {createObservableReducerContext} from '../index';

describe('createObservableReducerContext', () => {

    const serviceFunction = jest.fn().mockResolvedValue('task1');

    it('should create context', () => {

        const {Provider, useObservableContext} = createObservableReducerContext(taskReducer, [
            ReducerEpics.startTask
        ], {service: serviceFunction});

        const tree = create(
            <Provider options={{state: defaultState}}>
                <TaskComponent useContext={useObservableContext}/>
            </Provider>
        ).toJSON();

        expect(tree).toMatchSnapshot();

    });

});
