import {VuexModule, VuexUpModule} from './definitions';
import {VuexUp} from './VuexUp';
import {MixingStrategy} from './definitions';

function vuexUp(base?: VuexModule<any, any> | VuexUpModule<any, any, any>): VuexUp {
    return new VuexUp(base);
}

vuexUp.MixingStrategy = MixingStrategy;

export * from './definitions';
export {VuexUp, vuexUp, vuexUp as default}
