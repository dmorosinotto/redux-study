namespace ngApp.Stores.Lookup.Table {
    // ACTIONS
    export type Actions = AddAction | DelAction | UpdAction;
    export const enum _Actions {
        ADD = "[Lookup/Table] ADD",
        DEL = "[Lookup/Table] DEL",
        UPD = "[Lookup/Table] UPD",
    }
    interface AddAction extends Redux.Action {
        type: _Actions.ADD,
        id: number,
        payload: Data.IPayload
    }
    interface DelAction extends Redux.Action {
        type: _Actions.DEL,
        id: number,
    }
    interface UpdAction extends Redux.Action {
        type: _Actions.UPD,
        id: number,
        payload: Partial<Data.IPayload>
    }
    
    
    // STATE
    export interface State {
        byId: byId.State,
        allIds: allIds.State
    }

    // REDUCERS
    export const reducer: Redux.Reducer<State> = Redux.combineReducers<State>({
        byId: byId.reducer,
        allIds: allIds.reducer
    });

    // SELECTORS
    export const getAll = (state: State) => {
        return state.allIds.map(id => state.byId[id])
    }

    // ACTION CREATORS
    export const doAdd = (payload:Data.IPayload): AddAction => 
        ({ type: _Actions.ADD, payload, id: new Date().valueOf() });
    export const doDel = (id:number): DelAction => 
        ({ type: _Actions.DEL, id });
    export const doUpd = (id:number, payload: Partial<Data.IPayload>): UpdAction => 
        ({ type: _Actions.UPD, id, payload });
}
