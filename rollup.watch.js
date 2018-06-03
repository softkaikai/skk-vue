var rollup = require('rollup');

var watcher = rollup.watch({
    input: 'src/index.js',
    output: {
        file: 'dist/skk-vue.js',
        format: 'iife',
        name: 'Sue'
    },
    watch: {
        clearScreen: true
    }
});


watcher.on('event', (e) => {
    if (e.code === 'END') {
        console.log('finished building all bundles');
    } else if (e.code === 'FATAL') {
        console.log(e);
        watcher.close();
    } else if (e.code === 'ERROR') {
        console.log(e);
    }
})