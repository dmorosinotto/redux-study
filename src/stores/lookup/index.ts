namespace ngApp.Stores.Lookup {
    export type State = {
        table: Table.State,
        filter: Filter.State
    };
    export type Actions = Table.Actions | Filter.Actions;

    // SELECTORS
    export const getAllData = (state:State) => Table.getAll(state.table);
}