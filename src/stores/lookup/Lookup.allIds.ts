namespace ngApp.Stores.Lookup.Table.allIds {
    // STATE
    export type State = number[];
    const initialState: State=[];

    // REDUCERS
    export const reducer: Redux.Reducer<State> = 
    (state: State = initialState, action: Actions) => {
        switch (action.type) {
            case _Actions.ADD:
                return [...state, action.id];
            case _Actions.DEL:
                return state.filter(id=>id!==action.id);

            default:
                return state;
        }
    };
}
