
namespace ngApp.Controllers {
    export class AsyncCtrl {
        static $inject = ["$http","Session"]
        constructor(private $http: ng.IHttpService, private Session: Models.Session) {
            this.obs = Rx.Observable.timer(0, 1000).take(10);
        }

        obs: Rx.Observable<number> | Promise<number> | ng.IPromise<number>;
        val: number;

        pro() {
            this.obs = Promise.resolve(Math.random())
        }

        http() { //http://numbersapi.com/random/?max=20&json=true
            this.obs = this.$http.get<string>(this.Session.baseAPI + "/random") 
                                .then(res => parseFloat(res.data!))
        }

        sub(n:number, scope:ng.IScope) {
            console.log("MANUAL SUBSCRIBE DON'T UPDATE UI",scope);
            Rx.Observable.create((o:Rx.Observer<number>)=>{
                var i=0; n=parseInt(String(n))||5;
                console.log("STARTING...", n);
                var t = setInterval(()=> ++i<n ? (Math.random()<0.1? o.error({shit:i}) : o.next(i)) : o.complete(), 1000);
                return ()=> console.info("CLEAR", t, clearInterval(t)) //unsubscribe
            })
            //Rx.Observable.of(1,2,3,4,5)
            //Rx.Observable.timer(0,1000).take(n)
            .subscribe( (v:number) => {
                this.val = v;
                console.log(v);
                //console.warn("MUST CALL", scope.$applyAsync(), "TO UPDATE UI");
            }, console.error
             , ()=> console.warn("COMPLETE", this.val, /*scope.$applyAsync()*/ ) );
        }

    }
}

