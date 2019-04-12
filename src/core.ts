import {
    AnyServices,
    MixingOptions,
    MixingStrategy, ModuleKeys,
    Tree, VuexAction, VuexActionHandler, VuexGetter,
    VuexModule, VuexModuleCreator, VuexMutation, VuexUpAction, VuexUpActionHandler, VuexUpActionObject, VuexUpGetter,
    VuexUpMixin,
    VuexUpModule,
    VuexUpModuleWithExtractedState, VuexUpMutation
} from './definitions';
import deepmerge from 'deepmerge';

const notMixableValueTags = [
    'number',
    'null',
    'undefined',
    'string',
    'date',
    'regexp',
    'bigint',
    'function',
    'set',
    'map'
];

function getTag(value?: any): string {
    return Object.prototype.toString.call(value).slice(8, -1).toLocaleLowerCase();
}

export function isFunction(value?: any): value is Function {
    return getTag(value) === 'function';
}

export function isMixable(value?: any) {
    return !notMixableValueTags.includes(getTag(value));
}

export function isTree(value?: any): value is Tree<any> {
    return getTag(value) === 'object';
}

export function isActionObject(value?: any): value is VuexUpActionObject<any, any, any> {
    return isTree(value)
        && isFunction(value.handler);
}

function shallowMix<A extends Tree<any>, B extends Tree<any>>(to: A, from: B): Pick<A, Exclude<keyof A, keyof B>> & B {
    return Object.assign({}, to, from);
}

function deepMix<A extends Tree<any>, B extends Tree<any>>(to: A, from: B): A & B {
    return deepmerge<A & B>(to, from, {
        isMergeableObject: isMixable
    });
}

function mix<A extends {}, B extends {}>(to: A, from: B, strategy: MixingStrategy) {
    if (!isMixable(to) || !isMixable(from)) {
        return from;
    }

    switch (strategy) {
        case MixingStrategy.shallow:
            return shallowMix(to, from);
        case MixingStrategy.deep:
            return deepMix(to, from);
    }

    return from;
}

function isFunctionState<S>(state: S | (() => S)): state is (() => S) {
    return typeof state === 'function';
}

function extractState<S>(state: S | (() => S)): S {
    return isFunctionState(state) ? state() : state;
}

function extractStateInModule(module: VuexUpModule<any, any, any>): VuexUpModuleWithExtractedState<any, any, any> {
    const result = {...module};
    if (module.hasOwnProperty('state')) {
        result.state = extractState<any>(module.state);
    }
    return result;
}

function resolveStrategy(prop: string, options?: MixingOptions): MixingStrategy {
    if (prop === 'state') {
        if (options) {
            if (options.state !== MixingStrategy.shallow) {
                return options.state;
            }
        }
    }
    return MixingStrategy.shallow;
}

const mixProps = ['actions', 'state', 'mutations', 'getters', 'modules', 'namespaced'] as ModuleKeys[];

export function mixModules<State, RootState, Services = any>(
    list: VuexUpMixin<any, any>[]
): VuexUpModuleWithExtractedState<State, RootState, Services> {
    return list.reduce((toModule: VuexUpModuleWithExtractedState<any, any, any>, from) => {
        const fromModule = extractStateInModule(from.module);

        for (const prop of mixProps) {
            if (from.module.hasOwnProperty(prop)) {
                toModule[prop] = mix(toModule[prop], fromModule[prop], resolveStrategy(prop, from.options));
            }
        }

        return toModule;
    }, {});
}

export function injectServices<Services extends AnyServices>(
    method: VuexActionHandler<any, any>,
    dest: string,
    services: Services
): VuexUpActionHandler<any, any, Services>;
export function injectServices<Services extends AnyServices>(
    method: VuexUpActionHandler<any, any, any>,
    dest: string,
    services: Services
): VuexUpActionHandler<any, any, Services>;
export function injectServices<Services extends AnyServices>(
    method: VuexMutation<any>,
    dest: string,
    services: Services
): VuexUpMutation<any, Services>;
export function injectServices<Services extends AnyServices>(
    method: VuexUpMutation<any, any>,
    dest: string,
    services: Services
): VuexUpMutation<any, Services>;
export function injectServices<Services extends AnyServices>(
    method: VuexGetter<any, any>,
    dest: string,
    services: Services
): VuexUpGetter<any, any, Services>;
export function injectServices<Services extends AnyServices>(
    method: VuexUpGetter<any, any, any>,
    dest: string,
    services: Services
): VuexUpGetter<any, any, Services>;
export function injectServices<Services extends AnyServices>(
    method:
        VuexActionHandler<any, any>
        | VuexUpActionHandler<any, any, any>
        | VuexMutation<any>
        | VuexUpMutation<any, any>
        | VuexGetter<any, any>
        | VuexUpGetter<any, any, any>
    ,
    dest: string,
    services: Services
): VuexUpActionHandler<any, any, Services>
    | VuexUpMutation<any, Services>
    | VuexUpGetter<any, any, Services>
{
    return function withServices(this: any, ...args: any[]) {
        // Vuex call action with 3 arguments: `context`, `payload` and `cb`(no referees in docs).
        // `cb` argument don`t have it`s represent in type definitions and unused at all.
        // Instead of appending services as last argument we replace `cb` with it.
        // https://github.com/vuejs/vuex/blob/4c0d0ae0abcd48f1df2c0c263402a94a214168b2/src/store.js#L434
        if (dest === 'actions') {
            args[args.length - 1] = services;
        } else {
            args.push(services);
        }
        return (method as any).apply(this, args);
    };
}

