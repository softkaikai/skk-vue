import Watcher from "../watcher";

export default {
    dirBind: function () {
        let that = this;
        this.parentScope = this.vm.parentScope;
        if (!this.parentScope) {
            throw new Error('component compile error, parentScope not existing');
        }
        this.dirUpdate(null, this.parentScope[this.dirValue]);
        new Watcher(this.parentScope, this.dirValue, function (newVal, oldVal)  {
            that.dirUpdate(this.el, newVal);
        }, {
            deep: true,
            sync: false
        })
    },
    dirUpdate: function (el, value) {
        this.vm[this.dirParam] = value;
    }
}