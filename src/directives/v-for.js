import FragFactory from '../frag/fragFactory';
import {trim} from '../util/index'

export default {
    dirBind: function (el, value) {
        el.removeAttribute(this.dir);

        this.processVFor(value);

        // this.parentScope = this.vm;
        // this._scope = Object.create(this.vm);
        this.parentNode = el.parentNode;
        this.refStart = document.createComment('v-for-start');
        this.refEnd = document.createComment('v-for-end');
        this.parentNode.insertBefore(this.refEnd, el);
        this.parentNode.insertBefore(this.refStart, this.refEnd);
        this.parentNode.removeChild(el);
        this.dirUpdate(el, this.vm[this.vfor_dataField]);
    },
    dirUpdate: function (el, arrValue) {
        this.frags = [];
        if (!Array.isArray(arrValue)) {
            throw new Error('The map value of v-for must be a array');
        }
        this.clearNode();
        arrValue.forEach((val, index) => {
            this.frags.push(new FragFactory(this.vm, this.el, this.vfor, index, this.compileTemplate))
        });
        this.insertNode();
    },
    clearNode () {
        let next = this.refStart.nextSibling;
        while (next !== this.refEnd) {
            this.parentNode.removeChild(next);
            next = this.refStart.nextSibling;
        }
    },
    insertNode () {
        this.frags.forEach((value, index) => {
            this.parentNode.insertBefore(value.frag, this.refEnd);
        });
    },
    processVFor: function (value) {
        const reg = /(.*) (?:in|of) (.*)/;
        let inMatch = value.match(reg);

        this.vfor_dataField = trim(inMatch[2]);
        if (inMatch) {
            let itMatch = inMatch[1].match(/\((.*),(.*)\)/);
            if (itMatch) {
                this.vfor_val = trim(itMatch[1]);
                this.vfor_key = trim(itMatch[2]);
            } else {
                this.vfor_val = trim(inMatch[1]);
            }
        } else {
            throw new Error('The express of v-for is wrong');
        }
        this.vfor = {
            dataField: this.vfor_dataField,
            val: this.vfor_val,
            key: this.vfor_key || 'index'
        }
    }
}
