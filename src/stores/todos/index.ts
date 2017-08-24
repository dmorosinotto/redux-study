namespace ngApp.Stores.Todos {
    export type State = {
        todos: List.State,
        filter: Filter.State
    };
    export type Actions = List.Actions | Filter.Actions;
}