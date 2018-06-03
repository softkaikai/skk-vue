let uid = 0;
export default class Dep {
    constructor () {
        this.id = uid++;
        // watchers
        this.subs = [];
    }
    addSub (watcher) {
        this.subs.push(watcher);
    }
    notify () {
        this.subs.forEach((sub) => {
            sub.update();
        })
    }
    depend () {
        if (Dep.target) {
            Dep.target.addDep(this)
        }
    }
}


Dep.target = null;