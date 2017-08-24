namespace ngApp.Stores.Todos.Filter {
    // ACTIONS
    export type Actions = FilterSetAction;
    export const enum _Actions {
        SET_FILTER = "[Lookup/Filter] SET",
    }
    export interface FilterSetAction extends Redux.Action {
        type: _Actions.SET_FILTER,
        filter: IFilter,
    }
    export type IFilter = "ALL"|"DONE"|"TODO";

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
            case _Actions.SET_FILTER:
            return {
                ...state, 
                current: action.filter
            };

            default:
            return state;
        }
    };

    // ACTION CREATORS
    export const actFilterSet: Redux.ActionCreator<FilterSetAction> 
        = (filter:IFilter) => ({ type: _Actions.SET_FILTER, filter });
}
