namespace ngApp.Stores.Fact {
    // ACTIONS
    export type Actions = FactRequestAction | FactSuccessAction | FactFailureAction;
    export const enum _Actions {
        FACT_REQUEST = "FACT_REQUEST",
        FACT_SUCCESS = "FACT_SUCCESS",
        FACT_FAILURE = "FACT_FAILURE",
    }
    export interface FactRequestAction extends Redux.Action {
        type: _Actions.FACT_REQUEST,
        day: Date|string
    }
    interface FactSuccessAction extends Redux.Action {
        type: _Actions.FACT_SUCCESS,
        payload: IFactResult
    }
    interface FactFailureAction extends Redux.Action {
        type: _Actions.FACT_FAILURE,
        error?: any
    }
    export interface IFactResult {
        text: string,
        number: number,
        year: number,
        found: boolean,
    }

    // STATE
    export interface State {
        id: number;
        text: string;
    }
    const initialState: State = {
        id: 0,
        text: ""
    }

    // REDUCERS
    export const reducer: Redux.Reducer<State> = 
    (state: State = initialState, action: Actions) => {
        switch (action.type) {
            case _Actions.FACT_SUCCESS:
            return {
                ...state,
                // `id` is the number.year
                id: action.payload.number + action.payload.year/10000,
                text: action.payload.text
            };
            
            case _Actions.FACT_FAILURE: 
            return {
                ... state,
                id: -1,
                text: "ERROR: " + JSON.stringify(action.error)
            };

            default:
            return state;
        }
    };

    // ACTION CREATORS
    export const actFactRequest: Redux.ActionCreator<FactRequestAction> 
        = (day:Date|string) => ({ type: _Actions.FACT_REQUEST, day });
    export const actFactSuccess: Redux.ActionCreator<FactSuccessAction> 
        = (payload:IFactResult) => ({ type: _Actions.FACT_SUCCESS, payload });
    export const actFactFailure: Redux.ActionCreator<FactFailureAction> 
        = (error:any) => ({ type: _Actions.FACT_FAILURE, error });
}

// EPICS
namespace ngApp.Factories {
    epicFactFetch.$inject = ["$http"]
    export function epicFactFetch($http: angular.IHttpService): ReduxObservable.Epic<Stores.Actions, Stores.State> {
        console.log("$HTTP", $http);
        return action$ => {
            return action$.ofType(Stores.Fact._Actions.FACT_REQUEST)
                .mergeMap( (action: Stores.Fact.FactRequestAction) => {
                    var d: Date = typeof action.day === "string" ? new Date(action.day) : action.day; 
                    console.log(d.getDate(), d.getMonth(), `CALL -> http://numbersapi.com/${d.getMonth()}/${d.getDate()}/date?json=true`)
                    return Rx.Observable.fromPromise( 
                            $http.get<Stores.Fact.IFactResult>(`http://numbersapi.com/${d.getMonth()}/${d.getDate()}/date?json=true`)
                                .then( res => res.data! )
                                .then( d => { if(d.year>=1900) return d; console.error(d); throw "I WAS NOT BORN IN " + d.year; } )
                    ).do( ()=>console.log(">>> EPIC EMIT FACT_SUCCESS!"))         
                    .map( payload => Stores.Fact.actFactSuccess(payload))
                    .catch( err => Rx.Observable.of( Stores.Fact.actFactFailure(err) ) )
                });
        }
    }
}
