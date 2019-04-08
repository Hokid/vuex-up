import {
    MixingStrategy,
    StateMixingOption,
} from './definitions';
import deepmerge from 'deepmerge';

const mergeStrategies = [MixingStrategy.shallow, MixingStrategy.deep];

function isObject(value: any): value is Object {
    return value !== null && typeof value === 'object';
}

function isFunction(value: any): value is Function {
    return typeof value === 'function'
}

function shallowMix<A extends {}, B extends {}>(to: A, from: B): Pick<A, Exclude<keyof A, keyof B>> & B {
    return Object.assign({}, to, from);
}

function deepMix<A extends {}, B extends {}>(to: A, from: B): A & B {
    return deepmerge<A & B>(to, from);
}

function mix<A extends {}, B extends {}>(to: A, from: B, strategy: MixingStrategy) {
    switch (strategy) {
        case MixingStrategy.shallow:
            return shallowMix(to, from);
        case MixingStrategy.deep:
            return deepMix(to, from);
    }
    return to;
}

function isFunctionState<S>(state: S | (() => S)): state is (() => S) {
    return typeof state === 'function';
}

function extractState<S>(state: S | (() => S)): S {
    return isFunctionState(state) ? state() : state;
}

function mixingState<T extends {}>(list: StateMixingOption[]): T {
    const result = list.reduce((item: null | any, from) => {
        if (item === null) {
            return extractState(from.value);
        }
        return mix(item, extractState(from.value), from.strategy);
    }, null);
    return result as T;
}

function mixingObjects<T extends {}>(list: ({[key: string]: any})[]): T {
    const result = list.reduce((item: null | any, from) => {
        if (item === null) {
            return from;
        }
        return mix(item, from, MixingStrategy.shallow);
    }, null);
    return result as T;
}

function bindMethodsToContext<A extends {}>(target: A, ctx: any) {
    const keys = Object.keys(target) as (keyof A)[];
    for (const key of keys) {
        const value = target[key];
        if (isFunction(value)) {
            target[key] = value.bind(ctx);
        }
    }
}

function findValueKeyStrict(target: { [key: string]: any }, value: any): string | null {
    const keys = Object.keys(target);
    for (const key of keys) {
        if (target[key] === value) {
            return key;
        }
    }
    return null;
}

export {
    deepMix,
    shallowMix,
    mix,
    isObject,
    mixingState,
    mixingObjects,
    bindMethodsToContext,
    findValueKeyStrict
}
