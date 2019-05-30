import Vuex from 'vuex';

const store = new Vuex.Store({
    state: {
        count: 0
    },
    mutations: {
        increment (state) {
            state.count++;
        },
        decrement (state) {
            state.count--;
        }
    },
    getters: {
        count: s => s.count,
    },
});

export default store;
