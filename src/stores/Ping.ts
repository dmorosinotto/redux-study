namespace ngApp.Stores.Ping {
    // ACTIONS
    export type Actions = { type: _Actions }
    const enum _Actions {
        PING = "PING",
        PONG = "PONG"
    }

    // STATE
    export interface State {
        isPinging: boolean;
    }
    const initialState: State = { isPinging: false }; 
    
    
    // REDUCERS
    export const reducer: Redux.Reducer<State> =
    (state: State = initialState, action: Actions) => {
        switch (action.type) {
            case _Actions.PING:
                return { isPinging: true };
        
            case _Actions.PONG:
                return { isPinging: false };

            default:
                return state;
        }
    };

    // ACTION CREATORS
    export const actPING: Redux.ActionCreator<Actions> = 
        () => ({ type: _Actions.PING }) 

    export const actPONG: Redux.ActionCreator<Actions> = 
        () => ({ type: _Actions.PONG }) 

    // EPICS
    export const epicPong: ReduxObservable.Epic<Stores.Actions, Stores.State> = 
        (action$) => {
            return action$.ofType(_Actions.PING)
                .delay(1000) // Asynchronously wait 1000ms then continue
                .do( ()=>console.log(">>> EPIC EMIT PONG!"))
                .mapTo( actPONG() )
        }
}
      