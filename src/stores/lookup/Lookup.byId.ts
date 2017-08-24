namespace ngApp.Stores.Lookup.Table.byId {
    // STATE
    export interface State {
        [id: number]: Data.State
    }
    const initialState: State = {}

    // REDUCERS
    export const reducer: Redux.Reducer<State> = 
    (state: State = initialState, action: Actions) => {
        switch (action.type) {
            case _Actions.ADD:
            case _Actions.UPD: 
                return {
                    ...state,
                    [action.id]: Data.reducer(state[action.id], action)
                };

            case _Actions.DEL:
                let newstate = {... state};
                delete newstate[action.id];
                return newstate
            
            default:
                return state;
        }
    };
}
