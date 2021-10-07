# flux-observable

[![build](https://github.com/anigenero/flux-observable/actions/workflows/build.yml/badge.svg)](https://github.com/anigenero/flux-observable/actions/workflows/build.yml)

A shameless "clone" of redux-observable for the built-in React flux. The idea is to reduce or remove entirely the redux
footprint in components that don't require access to a global state tree but still need to manage dispatch events in an
observable pattern. This allows state to be contextual.

## Install

```bash
npm install --save flux-observable
```

## Usage

Like redux-observable, this library centers around the idea of epics. You can read more about how epics are constructed
and its core concepts [here](https://redux-observable.js.org/docs/basics/Epics.html). To create your context, pass in
your reducer, epics, and dependencies.

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

## Limitations

Due to the React's flux state being tied to the component tree lifecycle, there is no way to reliably provide a current
state to the epics. Any action(s) that requires visibility into the state will have to be done through the reducer.
