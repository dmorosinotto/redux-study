
namespace ngApp.Controllers {
    export class ProvaCtrl {

        static $inject = ["Session", "debugSvc"];
        constructor(Session: Models.Session, public dbg: Services.debugSvc) {
            this.title = Session.baseAPI;
            this.dbg.info("Prova CTOR", this);
        }

        title: string;

        log(val: angular.IScope) {
            console.log(val);
            setTimeout(()=>{
                this.title="call $digest";
                val.$digest(); //qui posso usare $digest e propaga modfica al figlio
                                //, ma meglio $applyAsync() così funziona sempre!!!
            },1000);
        }

        show() {
            this.dbg.warn("Prova THIS", this);
            alert(this.title);
        }
    }
}

