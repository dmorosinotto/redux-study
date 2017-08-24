namespace ngApp.Stores.Count {
    // ACTIONS
    const enum _Actions {
        INCR = "INCR",
        DECR = "DECR",
        START = "START",
        DELTA = "DELTA",
        STOP = "STOP",
    }
    interface CountStartAction extends Redux.Action {
        type: _Actions.START,
        delta: number;
    }
    interface CountDeltaAction extends Redux.Action {
        type: _Actions.DELTA,
        delta: number;
    }
    export type Actions = { type: _Actions } 
                          | CountStartAction | CountDeltaAction

    // STATE
    export interface State {
        counter: number;
    }
    const initialState: State = { counter: 0 }; 

    // REDUCERS
    export const reducer: Redux.Reducer<State> =
    (state: State = initialState, action: Actions) => {
        switch (action.type) {
            case _Actions.INCR:
                return { counter: state.counter+1 };
        
            case _Actions.DECR:
                return { counter: state.counter-1 };
            
            default:
                return state;
        }
    };

    // ACTION CREATORS
    export const actINCR: Redux.ActionCreator<Actions> = 
        () => ({ type: _Actions.INCR });

    export const actDECR: Redux.ActionCreator<Actions> = 
        () => ({ type: _Actions.DECR });

    export const actSTOP: Redux.ActionCreator<Actions> = 
        () => ({ type: _Actions.STOP });

    export const actSTART: Redux.ActionCreator<CountStartAction> = 
        (delta: string|number) => ({ type: _Actions.START, 
                                    delta: parseInt(String(delta),10)||+1 });

    export const actDELTA: Redux.ActionCreator<CountDeltaAction> = 
        (delta: number) => ({ type: _Actions.DELTA, delta });

    // EPICS
    export const epicStartStop: ReduxObservable.Epic<Stores.Actions, Stores.State> = 
        (action$) => {
            return action$.ofType(_Actions.START)
                .switchMap( (act: CountStartAction) => 
                    Rx.Observable.timer(0, 500)
                    .do( (_)=>console.log(">>> EPIC EMIT DELTA", act.delta))
                    .mapTo( actDELTA(act.delta) ) 
                    .takeUntil( action$.ofType(_Actions.STOP) )
                );
        }

    export const epicDelta: ReduxObservable.Epic<Stores.Actions, Stores.State> = 
        (action$) => {
            return action$.ofType(_Actions.DELTA)
                .mergeMap( (act: CountDeltaAction) => {
                    let arr = new Array(Math.abs(act.delta))
                                .fill(act.delta>0 ? actINCR() : actDECR());
                    return Rx.Observable.from(arr);
                })
        }
}
      