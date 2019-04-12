import {AnyServices, VuexUpModule} from './definitions';
import {VuexUp} from './VuexUp';
import {MixingStrategy} from './definitions';

function vuexUp<State, RootState, Services extends AnyServices = {}>(
    base?: VuexUpModule<State, RootState, Services>
) {
    return new VuexUp<State, RootState, Services>(base);
}

namespace vuexUp {
    export var MixingStrategy: MixingStrategy;
}

export * from './definitions';
export {VuexUp} from './VuexUp';
export {vuexUp, vuexUp as default}
