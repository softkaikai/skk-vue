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
|v-show|`<div v-show="show"></div>`|

## v-for
You can use it like following:
``` HTML
  <ul>
      <li v-for="(val, valIndex) of textArr">
          {{valIndex}}-----{{val}}
      </li>
  </ul>
```

## Support Coumputed
You can use computed property just as simple as vue, like below: <br />
**Note:** don't use allow function in the computed property, which may cause unexpected errors
``` javascript
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
    console.log(demo.fullname) // xiao
```
## Customize filter
function Sue.filter(name, fn) <br />
parameter: name {string} - the name of filter <br />
parameter: fn {function} - a function that processes data and achieve data as the first argument.<br />
If calling Sue.filter() successfully which will return Sue. So you can chain call filter like following:
``` javascript
  Sue.filter('toUpper', (val) => {
      return val.toUpperCase();
  }).filter('addMoreStr', (val) => {
      return val + '123456'
  });
```
## Customize Component
Support custom component :flags: You can use props just like vue easily.

The following is the js code:
``` javascript
  const FirstComponent = Sue.extend({
      template: '<div><strong>{{firstname}} 23</strong><hr><strong>{{lastname}} 45</strong></div>',
      data () {
          return {
              name: 'jiejie123',
              age: 22
          }
      },
      props: {
          firstname: '',
          lastname: ''
      },
      created () {
          this.$on('getName', function(name) {
              console.log('I get the data' + name);
          })
          setTimeout(() => {
              this.$emit('getAge', 333);
          }, 1000);
      },
      mounted () {
          console.log('This is component mounted hook');
      },
  })
  Sue.component('first-component', FirstComponent);
```
Here is the html code:
``` HTML
  <first-component v-bind:firstname="firstName" lastname="hong"></first-component>
```
## Hook Function
When data is all ready, a function named created will be called.<br />
When dom is all ready and mounted, a function named mounted will be called.<br />
``` javascript
  created () {
    console.log('This is created')
  }
  mounted () {
    console.log('This is mounted')
  }
```

## Use Tips
The library is just for learning and at the stage of experiment. So I can percent determine the library that lacks of **complete Compatibility and Function tests** must have many bugs that are strange and unexpected.Before you insist on using it, I hope you can realize what you will face. :chicken:

## License
MIT license

[http://www.opensource.org/licenses/MIT](http://www.opensource.org/licenses/MIT)
