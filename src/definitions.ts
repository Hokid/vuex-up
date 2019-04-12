import {
    ActionContext as VuexActionContext,
    Module as VuexModule,
    Action as VuexAction,
    Mutation as VuexMutation,
    Getter as VuexGetter,
    Store as VuexStore,
    ActionHandler as VuexActionHandler
} from 'vuex';

export enum MixingStrategy {
    shallow,
    deep
}

export interface MixingOptions {
    state: MixingStrategy;
}

export interface VuexModuleCreator {
    create<State, RootState>(): VuexModule<State, RootState>;
}

export interface AnyServices {
    [name: string]: any;
}

export interface VuexUpModuleWithExtractedState<
    State,
    RootState,
    Services extends AnyServices = {}
>  extends VuexUpModule<State, RootState, Services> {
    state?: State;
}

export interface VuexModuleWithExtractedState<State, RootState> extends VuexModule<State, RootState> {
    state?: State;
}

export type ModuleKeys = 'state' | 'mutations' | 'actions' | 'getters' | 'modules' | 'namespaced';

export type VuexUpState<State> = State | (() => State);

export type VuexUpActionHandler<State, RootState, Services extends AnyServices = {}> = (
    this: VuexStore<RootState>,
    injectee: VuexActionContext<State, RootState>,
    payload: any,
    services: Services
) => any;

export interface VuexUpActionObject<State, RootState, Services extends AnyServices = {}> {
    root?: boolean;
    handler: VuexUpActionHandler<State, RootState, Services>;
}

export type VuexUpGetter<State, RootState, Services extends AnyServices = {}> = (
    state: State,
    getters: any,
    rootState: RootState,
    rootGetters: any,
    services: Services
) => any;

export type VuexUpAction<State, RootState, Services extends AnyServices = {}>
    = VuexUpActionObject<State, RootState, Services>
    | VuexUpActionHandler<State, RootState, Services>;

export type VuexUpMutation<State, Services extends AnyServices = {}>
    = (state: State, payload: any, services: Services) => any;

export interface VuexUpModule<State, RootState, Services extends AnyServices = {}> {
    namespaced?: boolean;
    state?: VuexUpState<State>;
    getters?: {
        [name: string]: VuexUpGetter<State, RootState, Services>;
    };
    actions?: {
        [name: string]: VuexUpAction<State, RootState, Services>;
    };
    mutations?: {
        [name: string]: VuexUpMutation<State, Services>;
    }
    modules?: {
        [name: string]: VuexModule<any, any> | VuexModuleCreator;
    };
}

export interface Tree<T> {
    [name: string]: T;
}

export interface VuexUpMixin<State, RootState, Services = {}> {
    module: VuexUpModule<State, RootState, Services>;
    options?: MixingOptions;
}

export {
    VuexGetter,
    VuexModule,
    VuexAction,
    VuexActionHandler,
    VuexMutation
}
