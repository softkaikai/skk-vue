export default {
    dirBind: function (el, value) {
        this.toggle(this.vm[value]);
    },
    dirUpdate: function (el, value) {
        this.toggle(value);
    },
    toggle (value) {
        this.el.style.display = !!value ? '' : 'none';
    }
}