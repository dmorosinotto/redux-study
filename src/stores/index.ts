namespace ngApp.Stores {
    export type State = {
        ping: Ping.State,
        fact: Fact.State,
        count: Count.State
    };
    export type Actions = Ping.Actions | Fact.Actions | Count.Actions;
}