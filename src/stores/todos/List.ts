namespace ngApp.Stores.Todos.List {
    // ACTIONS
    export type Actions = TodoAddAction | TodoDelAction | TodoToggleAction;
    export const enum _Actions {
        TODO_ADD = "TODO_ADD",
        TODO_DEL = "TODO_DEL",
        TODO_CHK = "TODO_CHK",
    }
    export interface TodoAddAction extends Redux.Action {
        type: _Actions.TODO_ADD,
        id: number,
        text: string
    }
    interface TodoDelAction extends Redux.Action {
        type: _Actions.TODO_DEL,
        id: number,
    }
    interface TodoToggleAction extends Redux.Action {
        type: _Actions.TODO_CHK,
        id: number,
    }
    export interface ITodo {
        text: string,
        done: boolean,
        id: number,
    }
    
    // STATE
    export interface State {
        list: ITodo[]
    }
    const initialState: State = {
        list: [],
    }

    // REDUCERS
    export const reducer: Redux.Reducer<State> = 
    (state: State = initialState, action: Actions) => {
        switch (action.type) {
            case _Actions.TODO_ADD:
            return {
                ...state, 
                list: state.list.concat([{
                    done: false,
                    text: action.text,
                    id:  action.id,
                }])
            };

            case _Actions.TODO_DEL:
            return {
                ...state,
                list: state.list.filter( item => item.id !== action.id )
            }
            
            case _Actions.TODO_CHK: 
            return {
                ... state,
                list: state.list.map( item => item.id === action.id ?
                                            { ...item, done: !item.done } : item ) 
            }

            default:
            return state;
        }
    };

    // ACTION CREATORS
    export const actTodoAdd: Redux.ActionCreator<TodoAddAction> 
        = (text:string) => ({ type: _Actions.TODO_ADD, text, id: new Date().valueOf() });
    export const actTodoDel: Redux.ActionCreator<TodoDelAction> 
        = (id:number) => ({ type: _Actions.TODO_DEL, id });
    export const actTodoToggle: Redux.ActionCreator<TodoToggleAction> 
        = (id:number) => ({ type: _Actions.TODO_CHK, id });
}
