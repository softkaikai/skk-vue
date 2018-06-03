export default {
    dirBind: function (el, value) {
        this.updateAttr = 'value';
        this.el.removeAttribute(this.dir);
        this.dirUpdate(el, this.vm[this.dirValue]);
        this.el.addEventListener('input', (e) => {
            this.dirUpdate(el, el.value);
        })
    },
    dirUpdate: function (el, value) {
        el[this.updateAttr] = value.toString();
    }
}