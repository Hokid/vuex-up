import {
    MixingOptions,
    MixingStrategy,
    VuexUpModuleTree,
    VuexUpModule,
    StateMixingOption,
    VuexUpCreator,
    VuexUpModuleResult,
    VuexUpActionTree,
    VuexModule,
    VuexGetterTree,
    VuexMutationTree,
    VuexActionTree,
    VuexUpGetterTree,
    VuexUpMutationTree,
    VuexUpMutation,
    VuexMutation,
    VuexAction,
    VuexUpAction,
    VuexGetter,
    VuexUpGetter
} from './definitions';
import {
    bindMethodsToContext,
    findValueKeyStrict,
    isObject,
    mixingObjects,
    mixingState
} from './core';

class VuexUp {
    static MixingStrategy = MixingStrategy;

    private _state: StateMixingOption[] = [];
    private _actions: (VuexActionTree<any, any> | VuexUpActionTree<any, any, any>)[] = [];
    private _getters: (VuexGetterTree<any, any> | VuexUpGetterTree<any, any, any>)[] = [];
    private _mutations: (VuexMutationTree<any> | VuexUpMutationTree<any, any>)[] = [];
    private _modules: (VuexUpModuleTree<any> | VuexUpModuleTree<any>)[] = [];
    private _namespaced: boolean = false;
    private _services: { [key: string]: any } = {};

    constructor(base?: VuexModule<any, any> | VuexUpModule<any, any, any>) {
        if (base) {
            this.mixin(base);
        }
    }

    public create<State, RootState, Services>(): VuexUpModuleResult<State, RootState, Services> {
        const state = this._state.length ? mixingState(this._state) : {};
        const actions = this._actions.length ? mixingObjects(this._actions) : {};
        const getters = this._getters.length ? mixingObjects(this._getters) : {};
        const mutations = this._mutations.length ? mixingObjects(this._mutations) : {};
        const modules: VuexUpModuleTree<any> = this._modules.length ? mixingObjects(this._modules) : {};

        bindMethodsToContext(actions, this._services);
        bindMethodsToContext(getters, this._services);
        bindMethodsToContext(mutations, this._services);

        const modulesNames = Object.keys(modules);

        if (modulesNames.length) {
            for(const name of modulesNames) {
                if ((modules as VuexUpModuleTree<any>)[name] instanceof VuexUp) {
                    modules[name] = (modules[name] as VuexUpCreator<any, any, {}> ).create<any, any, {}>();
                }
            }
        }

        return {
            state,
            actions,
            getters,
            mutations,
            modules,
            namespaced: this._namespaced
        } as VuexUpModuleResult<State, RootState, Services>;
    }

    mixin(module: VuexModule<any, any> | VuexUpModule<any, any, any>, mixingOptions: MixingOptions = {state: MixingStrategy.shallow}) {
        if (typeof module.state !== 'undefined') {
            this._state.push({value: module.state, strategy: mixingOptions.state});
        }
        if (isObject(module.actions)) {
            this._actions.push(module.actions);
        }
        if (isObject(module.mutations)) {
            this._mutations.push(module.mutations);
        }
        if (isObject(module.getters)) {
            this._getters.push(module.getters);
        }
        if (isObject(module.modules)) {
            const key = findValueKeyStrict(module.modules, this);
            if (key !== null) {
                throw new Error(
                    `Module "${key}" of the mixin includes reference to current VuexUp instance. \n`
                    + `Remove that module to avoid infinite loop when resolving mixins queue.`
                );
            }
            this._modules.push(module.modules);
        }
        if (typeof module.namespaced === 'boolean') {
            this._namespaced = module.namespaced;
        }
        return this;
    }

    service(name: string, value: any) {
        this._services[name] = value;
        return this;
    }

    services(services: { [name: string]: any }) {
        Object.assign(this._services, services);
        return this;
    }

    mutation(name: string, mutation: VuexMutation<any> | VuexUpMutation<any, any>) {
        this.mixin({
            mutations: {
                [name]: mutation
            }
        });
        return this;
    }

    mutations(mutations: VuexMutationTree<any> | VuexUpMutationTree<any, any>) {
        this.mixin({
            mutations
        });
        return this;
    }

    state(state: any | (() => any), mixingStrategy: MixingStrategy = MixingStrategy.shallow) {
        this.mixin({
            state
        }, {state: mixingStrategy});
        return this;
    }

    module(name: string, module: VuexModule<any, any> | VuexUpCreator<any, any, any>) {
        this.mixin({
            modules: {
                [name]: module
            }
        });
        return this;
    }

    modules(modules: VuexUpModuleTree<any>) {
        this.mixin({
            modules: modules
        });
        return this;
    }

    action(name: string, action: VuexAction<any, any> | VuexUpAction<any, any, any>) {
        this.mixin({
            actions: {
                [name]: action
            }
        });
        return this;
    }

    actions(actions: VuexActionTree<any, any> | VuexUpActionTree<any, any, any>) {
        this.mixin({
            actions
        });
        return this;
    }

    getter(name: string, getter: VuexGetter<any, any> | VuexUpGetter<any, any, any>) {
        this.mixin({
            getters: {
                [name]: getter
            }
        });
        return this;
    }

    getters(getters: VuexGetterTree<any, any> | VuexUpGetterTree<any, any, any>) {
        this.mixin({
            getters
        });
        return this;
    }
}

export {VuexUp}
