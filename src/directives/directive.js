import Watcher from '../watcher';

export default class Directive {
    constructor (des, vm) {
        this.vm = vm;
        this.el = des.el;
        this.compileTemplate = des.compileTemplate;
        this.tagName = des.tag;
        for (let key of  Object.keys(des.dirOperations)) {
            this[key] = des.dirOperations[key];
        }
        this.dir = des.dir;
        this.dirValue = des.dirValue;
        this.dirParam = des.dirParam;
    }
    _bind () {
        let that = this;
        this.dirBind(this.el, this.dirValue);
        let watchValue = this.dirValue;
        if (this.dir === 'v-for') {
            watchValue = this.vfor_dataField;
        }
        if (this.dir === 'prop') {
            return false;
        }

        new Watcher(this.vm, watchValue, function (newVal, oldVal) {
            if (this.dirValue === 'firstname') {
                console.log(this.vm, watchValue);
            }
            that.dirUpdate(that.el, newVal);
        }, {
            deep: true,
            sync: false
        })
    }
    _update (newVal, oldVal) {
        this.dirUpdate(this.el, newVal);
    }
}