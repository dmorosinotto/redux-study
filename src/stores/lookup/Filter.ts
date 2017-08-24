namespace ngApp.Stores.Lookup.Filter {
    // ACTIONS
    export type Actions = SetFilterAction;
    export const enum _Actions {
        SET = "[Lookup/Filter] SET",
    }
    export interface SetFilterAction extends Redux.Action {
        type: _Actions.SET,
        filter: IFilter,
    }
    export type IFilter = "ALL"|"DONE"|"DATA";

    // STATE
    export interface State {
        current: IFilter
    }
    const initialState: State = {
        current: "ALL",
    }

    // REDUCERS
    export const reducer: Redux.Reducer<State> = 
    (state: State = initialState, action: Actions) => {
        switch (action.type) {
            case _Actions.SET:
            return {
                ...state, 
                current: action.filter
            };

            default:
            return state;
        }
    };

    // ACTION CREATORS
    export const doSetFilter: Redux.ActionCreator<SetFilterAction> 
        = (filter:IFilter) => ({ type: _Actions.SET, filter });
}
