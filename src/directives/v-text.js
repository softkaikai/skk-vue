export default {
    dirBind: function (el, value) {
        this.updateAttr = el.nodeType === 3 ? 'data' : 'textContent';
        if (el.nodeType !== 3) {
            this.el.removeAttribute(this.dir);
        }
        let realValue = '';
        if (typeof value === 'function') {
            realValue = value.call(this.vm);
        } else {
            realValue = this.vm[value];
        }
        this.dirUpdate(el, realValue);
    },
    dirUpdate: function (el, value) {
        el[this.updateAttr] = value.toString();
    }
}