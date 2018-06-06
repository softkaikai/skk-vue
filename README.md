## Skk-vue
**skk-vue** is a project for learning vue. So it's not surprised if you find some similar or completely same code. The library implement most of functions that belong to vue including **__ bind methods、bind data twoway、computed data、customize component  __** and so on.

## Install
Recommended Install
```
  npm install skk-vue
```

## How Can I use
The HTML structure looks like this:
``` HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        * {
            margin: 0;
            padding: 0;
        }
    </style>
</head>
<body>
<div id="container">
    <div id="my-app">
        <button type="button" v-on:click="changeName">click</button>
        <button type="button" v-on:click="getName">get</button>
        {{name}}
        <span v-text="name"></span>
        <input type="text" v-bind:placeholder="placeholder"
               v-model="temp"
        >

        <div v-html="myTemp"></div>
    </div>
</div>
<script src="../lib/vue.js"></script>
<script src="skk-vue.js"></script>
<script>
  var demo = new Sue({
        el: 'my-app',
        data () {
            return {
                placeholder: '请输入数字',
                myTemp: '<i>this is kaikai</i><button type="button">click</button>',
                name: 'kaikai',
                temp: 123,
                sname: {
                    a: '123',
                    b: '456'
                },
                sage: 22,
                arr: [1,2,3,4]
            }
        },
        methods: {
            changeName (e) {
                this.temp += 10;
            },
            getName (e) {
                console.log(this.temp);
            },
            changeAge (age) {
                this.sage = age;
            }
        }
    })
    demo.name = 'jiejie';
    console.log(demo);
</script>
</body>
</html>
```

## Support Directives
|dir|usage|
|---|---|
|v-html|`<div v-html="myTemplate"></div>`|
|v-text|`<div v-text="myText"></div>`|
|v-model|`<input v-model="myTemplate">`|
|v-bind|`<div v-bind:id="myId"></div>`|
|v-on|`<div v-on:click="myClick"></div>`|

## Support Coumputed
You can use computed property just as simple as vue, like below:
**Note:** don't use allow function in the computed property, which may cause unexpected errors
```
  var demo = new Sue({
      data: function() {
        return {
          firstName: 'xiao',
          lastName: 'ming'
        }
      }
      computed: {
        fullname: function() {
          return this.firstName + this.lastName;
        }
      }
    })
    console.log(demo.fullname) // xiaoming
```
## Customize Component
The function is developing. Please be patient :flags:

## Use Tips
The library is just for learning and at the stage of experiment. So I can percent determine the library that lacks of **complete Compatibility and Function tests** must have many bugs that are strange and unexpected.Before you insist on using it, I hope you can realize what you will face. :chicken:

## License
MIT license

[http://www.opensource.org/licenses/MIT](http://www.opensource.org/licenses/MIT)
