const {describe, it} = require('mocha');
const chai = require('chai');
const sinon = require('sinon');
const {vuexUp, MixingStrategy} = require('../dist/vuex-up.cjs');

chai.use(require('sinon-chai'));

const {expect} = chai;

const methodsContainers = ['actions', 'mutations', 'getters'];
const expectModule = (actual, expected) => {
    expect(actual.state, 'state').to.deep.equal(expected.state);
    expect(actual.namespaced, 'namespaced').to.equal(expected.namespaced);
    expect(actual.modules, 'modules').to.deep.equal(expected.modules);
    methodsContainers.forEach(name => {
        if (!expected[name]) return;
        Object.keys(expected[name]).forEach(key => {
            expect(actual[name][key], `${name}.${key}`).to.be.a('function');
        });
    });
};

describe('vuex-up', () => {
    describe('.create', () => {
        it('should return empty module if no base module and no mixins', () => {
            const module = vuexUp();

            expect(module.create())
                .to.deep.equal({});
        });

        it('should keep base module as is if no mixins', () => {
            const module = vuexUp({
                state: {a: {a: 1}},
                actions: {a() {}},
                getters: {a() {}},
                modules: {a: {state: 1}}
            });

            expectModule(
                module.create(),
                {
                    state: {a: {a: 1}},
                    actions: {a() {}},
                    getters: {a() {}},
                    modules: {a: {state: 1}}
                }
            );
        });

        it('should build all vuex-up modules in .modules', () => {
            const module = vuexUp({
                modules: {a: vuexUp({state: {a: 1}})}
            });
            expectModule(
                module.create(),
                {
                    modules: {
                        a: {state: {a: 1}}
                    }
                }
            )
        });
    });

    describe('.mixin', () => {
        it('should mixing state shallowly', () => {
            const module = vuexUp({
                state: {a: {a: {a: 1}}}
            })
                .mixin({state: {a: 2}});

            expectModule(
                module.create(),
                {
                    state: {a: 2}
                }
            );
        });

        it('should mixing state deeply', () => {
            const module = vuexUp({
                state: {a: {a: {a: 1}}}
            })
                .mixin({state: {a: {a: 2, b: 1}}}, {state: MixingStrategy.deep});

            expectModule(
                module.create(),
                {
                    state: {a: {a: 2, b: 1}}
                }
            );
        });

        it('should mixing state shallowly then deeply', () => {
            const module = vuexUp({
                state: {a: {a: 1}}
            })
                .mixin({state: {a: {c: 3}}}, {state: MixingStrategy.shallow})
                .mixin({state: {a: {b: 1}}}, {state: MixingStrategy.deep});

            expectModule(
                module.create(),
                {
                    state: {a: {c: 3, b: 1}}
                }
            );
        });

        it('should mixing if state defined as function that return state', () => {
            const module = vuexUp({
                state: () => ({a: {a: {a: 1}}})
            })
                .mixin({state: () => ({a: {a: 2, b: 1}})}, {state: MixingStrategy.deep});

            expectModule(
                module.create(),
                {
                    state: {a: {a: 2, b: 1}}
                }
            );
        });

        it('should mix arrays in state deeply', () => {
            const module = vuexUp({
                state: {array: [1]}
            })
                .mixin({state: {array: [2]}}, {state: MixingStrategy.deep});

            expectModule(
                module.create(),
                {
                    state: {array: [1, 2]}
                }
            );
        });

        it('should mix regexp in state as not mixable valueif set deep strategy', () => {
            const module = vuexUp({
                state: {r: /^$/}
            })
                .mixin({state: {r: /%%/}}, {state: MixingStrategy.deep});

            expectModule(
                module.create(),
                {
                    state: {r: /%%/}
                }
            );
        });

        it('should mix date in state as not mixable value if set deep strategy', () => {
            const a = new Date();
            const b = new Date();
            const module = vuexUp({
                state: {a}
            })
                .mixin({state: {a: b}}, {state: MixingStrategy.deep});

            expectModule(
                module.create(),
                {
                    state: {a: b}
                }
            );
        });

        it('should return state from mixins if no state in base module', () => {
            const module = vuexUp({})
                .mixin({
                    state: 1
                });
            expectModule(
                module.create(),
                { state: 1 }
            )
        });

        it('should return state from mixins if no state in base module', () => {
            const module = vuexUp({})
                .mixin({
                    state: 1
                });
            expectModule(
                module.create(),
                {state: 1}
            )
        });

        it('should return state from mixin if state in base module is not mixable value', () => {
            const module = vuexUp({ state: 1 })
                .mixin({
                    state: {}
                });
            expectModule(
                module.create(),
                {state: {}}
            )
        });

        it('should return state from mixin if state in mixin is not mixable value', () => {
            const module = vuexUp({state: {}})
                .mixin({
                    state: 1
                });
            expectModule(
                module.create(),
                {state: 1}
            )
        });

        it('should mixing actions', () => {
            const a = sinon.spy();
            const module = vuexUp({
                actions: {a() {}}
            })
                .mixin({
                    actions: {
                        a, b() {}
                    }
                });
            const result = module.create();
            expectModule(
                result,
                {
                    actions: {a() {}, b() {}}
                }
            );
            result.actions.a();
            expect(a).have.been.called;
        });

        it('should mixing mutations', () => {
            const a = sinon.spy();
            const module = vuexUp({
                mutations: {a() {}}
            })
                .mixin({
                    mutations: {
                        a, b() {}
                    }
                });
            const result = module.create();
            expectModule(
                result,
                {
                    mutations: {a() {}, b() {}}
                }
            );
            result.mutations.a();
            expect(a).have.been.called;
        });

        it('should mixing getters', () => {
            const a = sinon.spy();
            const module = vuexUp({
                getters: {a() {}}
            })
                .mixin({
                    getters: {
                        a, b() {}
                    }
                });
            const result = module.create();
            expectModule(
                result,
                {
                    getters: {a() {}, b() {}}
                }
            );
            result.getters.a();
            expect(a).have.been.called;
        });

        it('should mixing modules', () => {
            const module = vuexUp({
                modules: {
                    a: {state: {a: 1}},
                    b: {state: {a: 3}}
                }
            })
                .mixin({
                    modules: {
                        a: {state: {a: 1, b: 1}},
                        c: {state: {a: 2}}
                    }
                });
            expectModule(
                module.create(),
                {
                    modules: {
                        a: {state: {a: 1, b: 1}},
                        c: {state: {a: 2}},
                        b: {state: {a: 3}}
                    }
                }
            );
        });
    });

    describe('.state', () => {
        it('should mixing state shallowly by default', () => {
            const module = vuexUp({
                state: {a: {a: {a: 1}}}
            })
                .state({a: 2});

            expectModule(
                module.create(),
                {
                    state: {a: 2}
                }
            );
        });

        it('should mixing state shallowly', () => {
            const module = vuexUp({
                state: {a: {a: {a: 1}}}
            })
                .state({a: 2}, MixingStrategy.shallow);

            expectModule(
                module.create(),
                {
                    state: {a: 2}
                }
            );
        });

        it('should mixing if state defined as function that return state', () => {
            const module = vuexUp({
                state: {a: {a: {a: 1}}}
            })
                .state(() => ({a: 2}), MixingStrategy.shallow);

            expectModule(
                module.create(),
                {
                    state: {a: 2}
                }
            );
        });

        it('should mixing state deeply', () => {
            const module = vuexUp({
                state: {a: {a: {a: 1}}}
            })
                .state({a: {a: 2, b: 1}}, MixingStrategy.deep);

            expectModule(
                module.create(),
                {
                    state: {a: {a: 2, b: 1}}
                }
            );
        });
    });

    describe('.action', () => {
        it('should replace action', () => {
            const a = sinon.spy();
            const module = vuexUp({
                actions: {
                    a() {}
                }
            })
                .action('a', a);
            const result = module.create();
            expectModule(
                result,
                {
                    actions: {
                        a() {}
                    }
                }
            );
            result.actions.a();
            expect(a).have.been.called;
        });

        it('should add action', () => {
            const module = vuexUp({
                actions: {
                    a() {}
                }
            })
                .action('b', () => {});
            expectModule(
                module.create(),
                {
                    actions: {
                        a() {},
                        b() {}
                    }
                }
            );
        });
    });

    describe('.actions', () => {
        it('should replace actions', () => {
            const a = sinon.spy();
            const module = vuexUp({
                actions: {
                    a() {}
                }
            })
                .actions({a});
            const result = module.create();
            expectModule(
                result,
                {
                    actions: {
                        a() {}
                    }
                }
            );
            result.actions.a();
            expect(a).have.been.called;
        });

        it('should add actions', () => {
            const module = vuexUp({
                actions: {
                    a() {}
                }
            })
                .actions({b() {}});
            expectModule(
                module.create(),
                {
                    actions: {
                        a() {},
                        b() {}
                    }
                }
            );
        });
    });

    describe('.getter', () => {
        it('should replace getter', () => {
            const a = sinon.spy();
            const module = vuexUp({
                getters: {
                    a() {}
                }
            })
                .getter('a', a);
            const result = module.create();
            expectModule(
                result,
                {
                    getters: {
                        a() {}
                    }
                }
            );
            result.getters.a();
            expect(a).have.been.called;
        });

        it('should add getter', () => {
            const module = vuexUp({
                getters: {
                    a() {}
                }
            })
                .getter('b', () => {});
            expectModule(
                module.create(),
                {
                    getters: {
                        a() {},
                        b() {}
                    }
                }
            );
        });
    });

    describe('.getters', () => {
        it('should replace getters', () => {
            const a = sinon.spy();
            const module = vuexUp({
                getters: {
                    a() {}
                }
            })
                .getters({a});
            const result = module.create();
            expectModule(
                result,
                {
                    getters: {
                        a() {}
                    }
                }
            );
            result.getters.a();
            expect(a).have.been.called;
        });

        it('should add getters', () => {
            const module = vuexUp({
                getters: {
                    a() {}
                }
            })
                .getters({b() {}});
            expectModule(
                module.create(),
                {
                    getters: {
                        a() {},
                        b() {}
                    }
                }
            );
        });
    });

    describe('.mutation', () => {
        it('should replace mutation', () => {
            const a = sinon.spy();
            const module = vuexUp({
                mutations: {
                    a() {}
                }
            })
                .mutation('a', a);
            const result = module.create();
            expectModule(
                result,
                {
                    mutations: {
                        a() {}
                    }
                }
            );
            result.mutations.a();
            expect(a).have.been.called;
        });

        it('should add mutation', () => {
            const module = vuexUp({
                mutations: {
                    a() {}
                }
            })
                .mutation('b', () => {});
            expectModule(
                module.create(),
                {
                    mutations: {
                        a() {},
                        b() {}
                    }
                }
            );
        });
    });

    describe('.mutations', () => {
        it('should replace mutations', () => {
            const a = sinon.spy();
            const module = vuexUp({
                mutations: {
                    a() {}
                }
            })
                .mutations({a});
            const result = module.create();
            expectModule(
                result,
                {
                    mutations: {
                        a() {}
                    }
                }
            );
            result.mutations.a();
            expect(a).have.been.called;
        });

        it('should add mutations', () => {
            const module = vuexUp({
                mutations: {
                    a() {}
                }
            })
                .mutations({b() {}});
            expectModule(
                module.create(),
                {
                    mutations: {
                        a() {},
                        b() {}
                    }
                }
            );
        });
    });

    describe('.module', () => {
        it('should replace module', () => {
            const module = vuexUp({
                modules: {
                    a: {state: {a: 1}}
                }
            })
                .module('a', {state: {b: 1}});
            expectModule(
                module.create(),
                {
                    modules: {
                        a: {state: {b: 1}}
                    }
                }
            );
        });

        it('should add module', () => {
            const module = vuexUp({
                modules: {
                    a: {state: {a: 1}}
                }
            })
                .module('b', {state: {b: 1}});
            expectModule(
                module.create(),
                {
                    modules: {
                        a: {state: {a: 1}},
                        b: {state: {b: 1}}
                    }
                }
            );
        });
    });

    describe('.modules', () => {
        it('should replace modules', () => {
            const module = vuexUp({
                modules: {
                    a: {state: {a: 1}}
                }
            })
                .modules({a: {state: {b: 1}}});
            expectModule(
                module.create(),
                {
                    modules: {
                        a: {state: {b: 1}}
                    }
                }
            );
        });

        it('should add vuexUp', () => {
            const module = vuexUp({
                modules: {
                    a: {state: {a: 1}}
                }
            })
                .modules({b: {state: {b: 1}}});
            expectModule(
                module.create(),
                {
                    modules: {
                        a: {state: {a: 1}},
                        b: {state: {b: 1}}
                    }
                }
            );
        });
    });

    describe('.service', () => {
        it('should provide service to actions as last argument(replace `cb` arg)', () => {
            const serviceA = 1;
            const module = vuexUp({
                actions: {
                    a(context, payload, services) {
                        expect(services.serviceA).to.be.equal(serviceA);
                    }
                }
            })
                .service('serviceA', serviceA);
            module.create().actions.a(void 0, void 0, void 0);
        });

        it('should provide service to getters as last argument', () => {
            const serviceA = 1;
            const module = vuexUp({
                getters: {
                    a(_, services) {
                        expect(services.serviceA).to.be.equal(serviceA);
                    }
                }
            })
                .service('serviceA', serviceA);
            module.create().getters.a(void 0);
        });

        it('should provide service to mutations as last argument', () => {
            const serviceA = 1;
            const module = vuexUp({
                mutations: {
                    a(_, services) {
                        expect(services.serviceA).to.be.equal(serviceA);
                    }
                }
            })
                .service('serviceA', serviceA);
            module.create().mutations.a(void 0);
        });
    });

    describe('.services', () => {
        it('should provide services to actions as last argument(replace `cb` arg)', () => {
            const serviceA = 1;
            const module = vuexUp({
                actions: {
                    a(context, payload, services) {
                        expect(services.serviceA).to.be.equal(serviceA);
                    }
                }
            })
                .services({serviceA});
            module.create().actions.a(void 0, void 0, void 0);
        });

        it('should provide services to getters as last argument', () => {
            const serviceA = 1;
            const module = vuexUp({
                getters: {
                    a(_, services) {
                        expect(services.serviceA).to.be.equal(serviceA);
                    }
                }
            })
                .services({serviceA});
            module.create().getters.a(void 0);
        });

        it('should provide services to mutations as last argument', () => {
            const serviceA = 1;
            const module = vuexUp({
                mutations: {
                    a(_, services) {
                        expect(services.serviceA).to.be.equal(serviceA);
                    }
                }
            })
                .services({serviceA});
            module.create().mutations.a(void 0);
        });
    });
});
