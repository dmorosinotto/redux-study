namespace ngApp.Configs {
    // DEFINE CLIENT-SIDE ROUTING
    storeCfg.$inject = ["store$Provider"];
    export function storeCfg(store$: ngStore.store$Provider) {
        store$.setDefaultStoreOptions({ devtools: { name: "PIPPO" } })
        store$.setRootStore$({
            ping: Stores.Ping.reducer, 
            fact: Stores.Fact.reducer,
            count: Stores.Count.reducer,
        }, [
            Stores.Ping.epicPong,
            "epicFactFetch",
            Stores.Count.epicStartStop,
            Stores.Count.epicDelta
        ], /* [ "$digestMiddleware" ] */);
    }
}