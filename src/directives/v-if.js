
export default {
    dirBind: function (el, value) {
        el.removeAttribute(this.dir);

        this.parentScope = this.vm;
        this._scope = Object.create(this.vm);
        this.parentNode = el.parentNode;
        this.refStart = document.createComment('v-if-start');
        this.refEnd = document.createComment('v-if-end');
        this.parentNode.insertBefore(this.refEnd, el);
        this.parentNode.insertBefore(this.refStart, this.refEnd);
        this.parentNode.removeChild(el)

        if (this.vm[value]) {
            this.dirInsert();
        }
    },
    dirUpdate: function (el, value) {
        if (value) {
            this.dirInsert();
        } else {
            this.dirRemove();
        }
    },
    dirInsert: function () {
        this.cloneEl = this.el.cloneNode(true);
        this.frag = this.compileTemplate(this._scope, this.cloneEl);
        this.parentNode.insertBefore(this.frag, this.refEnd);
    },
    dirRemove: function () {
        let removeEl = this.refStart.nextElementSibling;
        this.parentNode.removeChild(removeEl)
    }
}