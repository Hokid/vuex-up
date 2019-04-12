<div align="center">
    <img title="VuexUp Logo" src="https://raw.githubusercontent.com/Hokid/vuex-up/master/logo.png" width="270" />
</div>
<div align="center">
Extends <a href="https://github.com/vuejs/vuex">vuex</a> module features
</div>
<hr/>
<div align="center">
    <a href="docs/api.md">Documentation</a>
</div>
<hr/>
<div align="center">
    <a href="https://www.npmjs.com/package/vuex-up"><img src="https://img.shields.io/npm/v/vuex-up.svg" alt="Version" /></a>
    <a href="https://www.npmjs.com/package/vuex-up"><img src="https://img.shields.io/npm/types/vuex-up.svg" alt="Typings" /></a>
</div>

# Install

```shell
$ npm install -S vuex-up
```

# CDN

 * umd: `https://unpkg.com/vuex-up/dist/vuex-up.umd.js`
 * esm/mjs: `https://unpkg.com/vuex-up/dist/vuex-up.esm.js`
 * commonjs: `https://unpkg.com/vuex-up/dist/vuex-up.cjs.js`
 
# Mixing modules

```javascript
const listWithCounterModule = vuexUp(listModule);

listWithCounterModule
    .mixin(counterModule)
    .mixin({
        actions: {
            addItem({ commit }, item) {
                commit('add', item);
                commit('increaseCounter');
            }
        }
    });

new Vuex.Store({
    state: {},
    modules: {
        list: listWithCounterModule.create()
    }
});
```

<details>
    <summary>Full code:</summary>

[live example](https://jsfiddle.net/mr_hokid/wqy79z2g/1/)

```javascript
import Vue from 'vue';
import Vuex from 'vuex';
import {vuexUp} from 'vuex-up';

Vue.use(Vuex);

const counterModule = {
    state: {
        count: 0
    },
    mutations: {
        increaseCounter(state) {
            state.count++;
        }
    }
};

const listModule = {
    state: {
        list: []
    },
    mutations: {
        add(state, item) {
            state.list.push(item);
        }
    }
};

const listWithCounterModule = vuexUp(listModule);

listWithCounterModule
    .mixin(counterModule)
    .mixin({
        namespaced: true,
        actions: {
            addItem({ commit }) {
                const item = 'I`m item';
                commit('add', item);
                commit('increaseCounter');
            }
        }
    });

const store = new Vuex.Store({
    state: {},
    modules: {
        list: listWithCounterModule.create()
    }
});

store.dispatch('list/addItem');

console.log(store.state.list.count); // 1

store.commit('list/increaseCounter');

console.log(store.state.list.count); // 2
```

</details>

# Services in actions, getters and mutations

```javascript
const listModule = vuexUp(baseListModule);

listModule.mixin({
    namespaced: true,
    actions: {
        addItem({ commit }, id, services) {
            const item = services.Items.get(id);
            commit('add', item);
        }
    }
});

listModule.service('Items', {
    get(id) {
        return `I\`m item with id "${id}"`;
    }
});

const store = new Vuex.Store({
    state: {},
    modules: {
        list: listModule.create()
    }
});

```

<details>
    <summary>Full code:</summary>

[live example](https://jsfiddle.net/mr_hokid/1u96xscm/2/)

```javascript
import Vue from 'vue';
import Vuex from 'vuex';
import {vuexUp} from 'vuex-up';

Vue.use(Vuex);

const baseListModule = {
    state: {
        list: []
    },
    mutations: {
        add(state, item) {
            state.list.push(item);
        }
    }
};

const listModule = vuexUp(baseListModule);

listModule.mixin({
    namespaced: true,
    actions: {
        addItem({ commit }, id, services) {
            const item = services.Items.get(id);
            commit('add', item);
        }
    }
});

listModule.service('Items', {
    get(id) {
        return `I\`m item with id "${id}"`;
    }
});

const store = new Vuex.Store({
    state: {},
    modules: {
        list: listModule.create()
    }
});

store.dispatch('list/addItem', '1');

console.log(store.state.list.list); // ['I`m item with id "1"']
```

</details>

***

<div align="center">
    <a href="docs/api.md">More examples in documentation</a>
</div>
