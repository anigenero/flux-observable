# react-reduce-observable

[![Build Status](https://travis-ci.org/anigenero/react-reduce-observable.svg?branch=main)](https://travis-ci.org/anigenero/react-reduce-observable)

A shameless "clone" of redux-observable for the built-in React reducer. The idea is to reduce or remove entirely the
redux footprint in components that don't require access to a global state tree but still need to manage dispatch events 
in an observable pattern.

## Install

```bash
npm install --save react-reduce-observable
```

## Usage

Like redux-observable, this library centers around the idea of epics. You can read more about how epics are constructed 
and its core concepts [here](https://redux-observable.js.org/docs/basics/Epics.html). To create your context, pass in your 
reducer, epics, and dependencies.

```typescript
const {Provider, useObservableContext} = createObservableReducerContext(myReducer, [
    myEpic
], dependencies);
```

```typescript jsx
<Provider options={{
    state: defaultState
}}>
    <MyComponent/>
</Provider>
```

```typescript jsx
import {FunctionComponent} from "react";

export const MyComponent: FunctionComponent = () => {

    const {state, dispatch} = useObservableContext();
    
    return (
        <button onClick={() => dispatch(myAction())}>
            Click Me!
        </button>
    );

}
```
