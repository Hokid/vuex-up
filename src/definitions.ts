import {
    ActionContext,
    ActionTree as VuexActionTree,
    GetterTree as VuexGetterTree,
    Module as VuexModule,
    ModuleTree as VuexModuleTree,
    MutationTree as VuexMutationTree,
    Action as VuexAction,
    Mutation as VuexMutation,
    Getter as VuexGetter
} from 'vuex';

enum MixingStrategy {
    shallow,
    deep
}

interface MixingOptions {
    state: MixingStrategy;
}

type StateMixingOption = { value: any | (() => any), strategy: MixingStrategy };

type VuexUpActionHandler<S, R, Ctx> = (this: Ctx, injectee: ActionContext<S, R>, payload: any) => any;

interface VuexUpActionObject<S, R, Ctx> {
    root?: boolean;
    handler: VuexUpActionHandler<S, R, Ctx>;
}

type VuexUpGetter<S, R, Ctx> = (this: Ctx, state: S, getters: any, rootState: R, rootGetters: any) => any;
type VuexUpAction<S, R, Ctx> = VuexUpActionHandler<S, R, Ctx> | VuexUpActionObject<S, R, Ctx>;
type VuexUpMutation<S, Ctx> = (this: Ctx, state: S, payload: any) => any;

interface VuexUpModule<S, R, Ctx> {
    namespaced?: boolean;
    state?: S | (() => S);
    getters?: VuexUpGetterTree<S, R, Ctx>;
    actions?: VuexUpActionTree<S, R, Ctx>;
    mutations?: VuexUpMutationTree<S, Ctx>;
    modules?: VuexUpModuleTree<R>;
}

interface VuexUpModuleResult<S, R, Ctx> extends Required<VuexUpModule<S, R, Ctx>> {
    state: S;
    modules: {
        [key: string]: VuexModule<any, R> | VuexUpModuleResult<any, R, {}>
    }
}

interface VuexUpModuleTree<R> {
    [key: string]: VuexModule<any, R> | VuexUpCreator<any, R, any> | VuexUpModuleResult<any, R, {}>;
}

interface VuexUpGetterTree<S, R, Ctx> {
    [key: string]: VuexUpGetter<S, R, Ctx>;
}

interface VuexUpActionTree<S, R, Ctx> {
    [key: string]: VuexUpAction<S, R, Ctx>;
}

interface VuexUpMutationTree<S, Ctx> {
    [key: string]: VuexUpMutation<S, Ctx>;
}

interface VuexUpCreator<State, RootState, Services extends { [key: string]: any }> {
    create<S, R, Sr>(): VuexUpModuleResult<S, R, Sr>;
}

export {
    VuexModule,
    VuexModuleTree,
    VuexActionTree,
    VuexMutationTree,
    VuexGetterTree,
    VuexMutation,
    VuexAction,
    VuexGetter,

    MixingStrategy,
    MixingOptions,
    StateMixingOption,

    VuexUpCreator,

    VuexUpModule,
    VuexUpModuleResult,

    VuexUpModuleTree,
    VuexUpActionTree,
    VuexUpGetterTree,
    VuexUpMutationTree,

    VuexUpMutation,
    VuexUpAction,
    VuexUpGetter
}
