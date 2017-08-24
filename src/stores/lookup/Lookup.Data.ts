namespace ngApp.Stores.Lookup.Table.Data {
    // STATE
    export interface IPayload {
        value: string,
        done: boolean,
    }
    export interface State extends IPayload {
        id: number,
    }
    const initialState: State = {} as any

    // REDUCERS
    export const reducer: Redux.Reducer<State> = 
    (state: State = initialState, action: Actions) => {
        switch (action.type) {
            case _Actions.ADD:
            return { 
                    id: action.id,
                    ... action.payload 
                };

            case _Actions.UPD: 
            return {
                    ...state,
                    ...action.payload
                };

            default:
            return state;
        }
    };
}
