# Contents

  * [Usage](#usage)
  * [VuexUp mixin interface](#vuexup-mixin-interface)
  * [Mixing stategy](#mixing-stategy)
  * [Mixing options interface](#mixing-options-interface)
  * [VuexUp API](#vuexup-api)

# Usage

Import using ES6 module syntax:

```javascript
import vuexUp, {VuexUp, MixingStrategy} from 'vuex-up';
```

```javascript
import {VuexUp, MixingStrategy, vuexUp} from 'vuex-up';
```

Import using CommonJS syntax:

```javascript
const {vuexUp, VuexUp, MixingStrategy} = require('vuex-up');
```

Import in browser:

```html
<script src="https://unpkg.com/vuex-up/dist/vuex-up.umd.js"></script>
<script>
    const {vuexUp, VuexUp, MixingStrategy} = window.VuexUp;
</script>
```
```html
<script type="module">
    import vuexUp, {VuexUp, MixingStrategy} from 'https://unpkg.com/vuex-up/dist/vuex-up.esm.js';
</script>
```

Create a vuex up instance in factory style:

```javascript
import vuexUp, {VuexUp, MixingStrategy} from 'vuex-up';

const vuexUpInstance = vuexUp({
    state: {
        count: 0
    }
});
```

Create a vuex up instance with constructor:

```javascript
import vuexUp, {VuexUp, MixingStrategy} from 'vuex-up';

const vuexUpInstance = new VuexUp({
    state: { 
        count: 0
    }
});
```

Passing mixing strategy as option:

```javascript
import vuexUp, {VuexUp, MixingStrategy} from 'vuex-up';

const vuexUpInstance = new VuexUp({
    state: {
        count: 0   
    }
});

vuexUpInstance
    .mixin({
        state: {
            list: []
        }
    }, { 
        state: MixingStrategy.deep
    });

vuexUpInstance
    .state(() => ({
        state: {
            isLoading: false   
        }
    }), MixingStrategy.shallow);

// or

vuexUpInstance
    .state(() => ({
        state: {
            isLoading: false
            
        }
    }), vuexUp.MixingStrategy.shallow);

// or

vuexUpInstance
    .state(() => ({
        state: {
            isLoading: false
        }
    }), VuexUp.MixingStrategy.shallow);
```

# VuexUp mixin interface

Extends [VuexModule](https://vuex.vuejs.org/api/#modules)

```typescript
interface VuexUpModule {
    state?: any | (() => any);
    actions?: {
        [key: string]: Function;
    },
    mutations?: {
        [key: string]: Function;
    },
    getters?: {
        [key: string]: Function;
    },
    modules?: {
        [key: string]: VuexModule | VuexUpModule;
    }
}
```

Example:

```javascript
vuexUp({
    state: {
        count: 0
    },
    mutations: {
        increaseCounter(state) {
            state.count++;
        },
        set(state, value) {
            state.count = value;
        }
    },
    actions: {
        reset({ commit }) {
            commit('set', 0);
        }
    },
    getters: {
        currentCount(state) {
            return state.count;
        }
    },
    modules: {
        emails: {
            state: {
                list: []
            }
        },
        users: vuexUp({
            state: {
                list: []
            }    
        })
    }
});
```

```javascript
new VuexUp({
    state: {
        count: 0
    },
    mutations: {
        increaseCounter(state) {
            state.count++;
        },
        set(state, value) {
            state.count = value;
        }
    },
    actions: {
        reset({ commit }) {
            commit('set', 0);
        }
    },
    getters: {
        currentCount(state) {
            return state.count;
        }
    },
    modules: {
        emails: {
            state: {
                list: []
            }
        },
        users: new VuexUp({
            state: {
                list: []
            }    
        })
    }
});
```

# Mixing stategy

There is two strategies **shallow** and **deep**. 
Shallow mixing strategy gives result like `Object.assign()` gives. 
Deep mixing strategy deeply merge all mixins together.

```typescript
enum MixingStrategy {
    shallow,
    deep
}
```

# Mixing options interface

```typescript
interface MixingOptions {
    state: MixingStrategy;
}
```

# VuexUp API

  * [.mixin( module, mixingOptions )](#mixin-module-mixingoptions-)
  * [.service( name, service )](#service-name-service-)
  * [.services( services )](#services-services-)
  * [.create()](#create)
  * [.state( state, mixingStrategy )](#state-state-mixingstrategy-)
  * [.action( name, action )](#action-name-action-)
  * [.actions( actions )](#actions-actions-)
  * [.getter( name, getter )](#getter-name-getter-)
  * [.getters( getters )](#getters-getters-)
  * [.mutation( name, mutation )](#mutation-name-mutation-)
  * [.mutations( mutations )](#mutations-mutations-)
  * [.module( name, module )](#module-name-module-)
  * [.modules( modules )](#modules-modules-)
  
#### .mixin( module, mixingOptions )

[↑ back](#vuexup-api)

Add mixin

```typescript
mixin( module: VuexModule | VuexUpModule, mixingOptions: MixingOptions = { state: MixinStrategy.shallow }): VuexUp
```


Example with shallow mixing:

```javascript
vuexUp({
    state: {count: 0}
})
.mixin({
    state: {list: []}
})
.create();
```

Will produce:

```javascript
{
    state: {
        count: 0,
        list: []
    },
    actions: {},
    mutations: {},
    getters: {},
    modules: {}
}
```

Example with deep mixing:

```javascript
vuexUp({
    state: {
        emails: {
            counter: 0
        }
    }
})
.mixin({
    state: {
        emails: {
            list: []
        }
    }
}, {
    state: MixingStrategy.deep
})
.create();
```

Will produce:

```javascript
{
    state: {
        emails: {
            count: 0,
            list: []
        }
    },
    actions: {},
    mutations: {},
    getters: {},
    modules: {}
}
```

#### .service( name, service )

[↑ back](#vuexup-api)

Add service that accessible for use in actions, mutations and getters.

```typescript
service(name: string, service: any): VuexUp
```

Example:

```javascript
vuexUp({
    actions: {
        addItem({ commit }, id) {
            commit('add', this.Items.get(id));
        }
    }
})
.service('Items', { 
    get(id) { return `I\`m item with id "${id}"`; }
});
```

#### .services( services )

[↑ back](#vuexup-api)

Add services that accessible for use in actions, mutations and getters.

```typescript
services({ [name: string]: any }): VuexUp
```

Example:

```javascript
vuexUp({
    actions: {
        addItem({ commit }, id) {
            commit('add', this.Items.get(this.type, id));
        }
    }
})
.services({ 
    Items: {
        get(type, id) {
            return `I\`m item of type "${type}" with id "${id}"`;
        }
    },
    type: 'Simple'
})
```

#### create()

[↑ back](#vuexup-api)

Produce normal vuex module for passing to VuexStore.

```typescript
create(): VuexModule
```

Example:

```javascript
const counter = vuexUp({
    state: { count: 0 }
});

counter.mixin({
    mutations: {
        increaseCount(state) {
            state.count++;
        }
    }
});

new Vuex.Store({
    modules: {
        counter: counter.create();
    }
});
```

#### .state( state, mixingStrategy )

[↑ back](#vuexup-api)

Add state mixin.

```typescript
state(state: any | (() => any), mixingStrategy: MixingStrategy = MixingStrategy.shallow): VuexUp
```

Examples:

```javascript
vuexUp({
    state: { counter: 0 }
})
.state({ isLoading: false });
```

```javascript
vuexUp({
    state: () => ({ counter: 0 })
})
.state(() => ({ isLoading: false }));
```

```javascript
vuexUp({
    state: { 
        emails: {
            counter: 0
        }
    }
})
.state(() => ({
    emails: {
        isLoading: false
    }
}), MixingStrategy.deep);
```

#### .action( name, action )

[↑ back](#vuexup-api)

Add or replace action.

```typescript
action(name: string, action: Function): VuexUp
```

Example:

```javascript
vuexUp({
    state: { list: [] },
    mutations: {
        add(state, item) {
            state.list.push(item);
        }
    }
})
.action('addItem', ({ commit }, item) => commit('add', item));
```

#### .actions( actions )

[↑ back](#vuexup-api)

Add actions mixin.

```typescript
actions(actions: { [name: string]: Function }): VuexUp
```

Example:

```javascript
vuexUp({
    state: { list: [] },
    mutations: {
        add(state, item) {
            state.list.push(item);
        },
        remove(state, item) {
            state.list.splice(state.list.indexOf(item), 1);
        }
    }
})
.actions({
    addItem({ commit }, item) { 
        commit('add', item);
    },
    removeItem({ commit }, item) {
        commit('remove', item);
    }
});
```

#### .getter( name, getter )

[↑ back](#vuexup-api)

Add or replace getter.

```typescript
getter(name: string, getter: Function): VuexUp
```

Example:

```javascript
vuexUp({
    state: { list: [] }
})
.getter('count', (state) => state.list.length);
```

#### .getters( getters )

[↑ back](#vuexup-api)

Add getters mixin.

```typescript
getters(getters: { [name: string]: Function }): VuexUp
```

Example:

```javascript
vuexUp({
    state: { list: [] }
})
.getters({
    count(state) {
        return state.list.length;
    },
    find(state){
        return (token) => 
            state.list
                .find(item => item.includes(token))
    }
});
```

#### .mutation( name, mutation )

[↑ back](#vuexup-api)

Add or replace mutation.

```typescript
mutation(name: string, mutation: Function): VuexUp
```

Example:

```javascript
vuexUp({
    state: { list: [] }
})
.mutation('add', (state, item) => {
    state.list.push(item);
});
```

#### .mutations( mutations )

[↑ back](#vuexup-api)

Add mutations mixin.

```typescript
mutations(mutations: { [name: string]: Function }): VuexUp
```

Example:

```javascript
vuexUp({
    state: { list: [] }
})
.mutations({
    add(state, item) {
        state.list.push(item);
    },
    removed(state, item){ 
        state.list.splice(state.list.indexOf(item), 1);
    }
});
```

#### .module( name, module )

[↑ back](#vuexup-api)

Add or replace mutation.

```typescript
module(name: string, module: VuexModule | VuexUp): VuexUp
```

Examples:

```javascript
vuexUp().module('list', {
    state: { list: [] },
    mutations: {
        add(state, item) {
            state.list.push(item);
        }
    }
});
```

```javascript
const listModule = vuexUp({
    state: { list: [] },
    mutations: {
        add(state, item) {
            state.list.push(item);
        }
    }
});

vuexUp().module('list', listModule);
```

#### .modules( modules )

[↑ back](#vuexup-api)

Add modules mixin.

```typescript
modules(modules: { [name: string]: VuexModule | VuexUp }): VuexUp
```

Example:

```javascript
vuexUp().modules({
    list: {
        state: { list: [] }
    },
    counter: vuexUp({
        state: { count: 0 }
    })
});
```
