import {
    MixingOptions,
    MixingStrategy,
    VuexUpMixin,
    VuexModule,
    VuexUpModule,
    VuexUpMutation,
    AnyServices,
    Tree,
    VuexUpState,
    VuexModuleCreator,
    VuexUpAction,
    VuexUpGetter,
    VuexModuleWithExtractedState
} from './definitions';
import {
    injectServices,
    isActionObject,
    isFunction,
    isTree,
    mixModules
} from './core';

const injectServicesDestinations = ['actions', 'mutations', 'getters'] as ('actions' | 'mutations' | 'getters')[];

function resolveModule(module: VuexModule<any, any> | VuexModuleCreator): VuexModule<any, any> {
    if (module instanceof VuexUp) {
        return module.create();
    }
    return module as VuexModule<any, any>;
}

class VuexUp<State, RootState, Services extends AnyServices = {}> {
    static MixingStrategy = MixingStrategy;

    private mixins: VuexUpMixin<any, any, any>[] = [];
    private _services: { [key: string]: any } = {};

    constructor(base?: VuexUpModule<State, RootState, Services>) {
        if (base) {
            this.mixin(base);
        }
    }

    public create<State, RootState>(): VuexModuleWithExtractedState<State, RootState> {
        const result = mixModules<State, RootState>(this.mixins);

        for (const destKey of injectServicesDestinations) {
            const tree = result[destKey];
            if (isTree(tree)) {
                const treeKeys = Object.keys(tree);
                for (const treeKey of treeKeys) {
                    const treeValue = tree[treeKey];
                    if (isActionObject(treeValue)) {
                        tree[treeKey] = {
                            ...treeValue,
                            handler: injectServices(treeValue.handler, destKey, this._services)
                        }
                    } else if (isFunction(treeValue)) {
                        tree[treeKey] = injectServices(treeValue, destKey, this._services);
                    }
                }
            }
        }

        if (isTree(result.modules)) {
            const names = Object.keys(result.modules);
            for (const name of names) {
                result.modules[name] = resolveModule(result.modules[name]);
            }
        }

        return result as VuexModuleWithExtractedState<State, RootState>;
    }

    mixin<State, RootState, Services extends AnyServices = {}>(
        module: VuexUpModule<State, RootState, Services>,
        mixingOptions?: MixingOptions
    ) {
        this.mixins.push({
            module,
            options: mixingOptions
        });
        return this;
    }

    service<Service>(name: string, value: Service) {
        this._services[name] = value;
        return this;
    }

    services<Services extends AnyServices>(services: Services) {
        Object.assign(this._services, services);
        return this;
    }

    mutation<State, Services extends AnyServices = {}>(
        name: string,
        mutation: VuexUpMutation<State, Services>
    ) {
        this.mixin<State, any, Services>({
            mutations: {
                [name]: mutation
            }
        });
        return this;
    }

    mutations<State, RootState, Services extends AnyServices = {}>(
        mutations: Tree<VuexUpMutation<State, Services>>
    ) {
        this.mixin<State, RootState, Services>({
            mutations
        });
        return this;
    }

    state<State>(
        state: VuexUpState<State>,
        mixingStrategy: MixingStrategy = MixingStrategy.shallow
    ) {
        this.mixin<State, {}, {}>({
            state
        }, {state: mixingStrategy});
        return this;
    }

    module<State, RootState>(
        name: string,
        module: VuexModule<State, RootState> | VuexModuleCreator
    ) {
        this.mixin<any, any, any>({
            modules: {
                [name]: module
            }
        });
        return this;
    }

    modules(
        modules: Tree<VuexModule<any, any> | VuexModuleCreator>
    ) {
        this.mixin({
            modules: modules
        });
        return this;
    }

    action<State, RootState, Services extends AnyServices = {}>(
        name: string,
        action: VuexUpAction<State, RootState, Services>
    ) {
        this.mixin({
            actions: {
                [name]: action
            }
        });
        return this;
    }

    actions<State, RootState, Services extends AnyServices = {}>(
        actions: Tree<VuexUpAction<State, RootState, Services>>
    ) {
        this.mixin({
            actions
        });
        return this;
    }

    getter<State, RootState, Services extends AnyServices = {}>(
        name: string,
        getter: VuexUpGetter<State, RootState, Services>
    ) {
        this.mixin({
            getters: {
                [name]: getter
            }
        });
        return this;
    }

    getters<State, RootState, Services extends AnyServices = {}>(
        getters: Tree<VuexUpGetter<State, RootState, Services>>
    ) {
        this.mixin({
            getters
        });
        return this;
    }
}

export {VuexUp}
