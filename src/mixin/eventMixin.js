export default function eventMixin(vm) {
    vm._events = {};
    // 添加监听事件
    vm.$on = function(eventName, fn) {
        vm._events[eventName] = vm._events[name] || [];
        vm._events[eventName].push(fn);
    };
    // 广播事件
    vm.$broadcast = function(eventName, ...args) {
        broadcast(vm, eventName, ...args);
    };

    vm.$emit = function(eventName, ...args) {
        emit(vm, eventName, ...args);
    }
}

function broadcast (vm, eventName, ...args) {
    if (vm.$children.length) {
        vm.$children.forEach(child => {
            const eventFns = child._events[eventName] || [];
            eventFns.forEach(fn => {
                // return false 停止广播
                const result = fn(...args);

                if (child.$children.length && result !== false) {
                    broadcast(child, eventName, ...args);
                }
            })
        })
    }
}

function emit (vm, eventName, ...args) {
    if (vm.parentScope) {
        const eventFns = vm.parentScope._events[eventName] || [];
        eventFns.forEach(fn => {
            // return false 停止广播
            const result = fn(...args);

            if (vm.parentScope.parentScope && result !== false) {
                emit(child, eventName, ...args);
            }
        })
    }
}
