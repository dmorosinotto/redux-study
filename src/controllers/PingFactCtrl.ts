
namespace ngApp.Controllers {
    export class PingFactCtrl {
        static $inject = ["store$","$rootScope"]; 
        constructor(store$: ngStore.store$Service, $rootScope: ng.IRootScopeService) {
            // CONSTRUCTOR SUBSCRIBE TO DATA
            this.root$ = store$.rootStore$();
            this.store = store$.rootStore$().store; //this.root$.store;
            this.unsub = this.store.subscribe(() => {
                this.isPinging = this.store.getState().ping.isPinging;
                console.warn("PASSO NEL store.subscribe LOG DI TUTTO", JSON.stringify(this.store.getState()));
                //$rootScope.$applyAsync(); //SE NON CHIAMO A MANO $rootScope.$applyAsync() angular non si aggiorna!
                //OPPURE DEVO INCLUDERE IL MIDDLEWARE "$digestMiddleware" QUANDO CREO LO STORE, MA NON FUNZIONA BENE 
                //CON DEVTOOLS NON VIENE INVOCA, OPPURE SOLUZIONE ELEGANTISSIMA USO | async NEL BINDING SUL TEMPLATE
                //VEDI COME HO FATTO SUL fact$|async:this E NEL COMPONENT A PARTE rxPingCmp -> isPinging$|async:this
            });
            this.fact$ = store$.createSelector$(this.store, state => state.fact.text)
            this.redIfErr$ = store$.createSelector$(this.store, store => store.fact.id>0?'black':'red')
        }
        private unsub: Redux.Unsubscribe;
        private store: Redux.Store<Stores.State>;
        public root$: ngStore.Store$<Stores.State, Stores.Actions>;
        public isPinging: boolean;
        public fact$: Rx.Observable<string>;
        public redIfErr$: Rx.Observable<string>;

        public ping() {
            this.store.dispatch(Stores.Ping.actPING());
        }

        public fact() {
            this.store.dispatch(Stores.Fact.actFactRequest(new Date()))
        }

        $onDestroy() {
            this.unsub();
        }
    }
}

