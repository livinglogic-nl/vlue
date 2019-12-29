import axios from 'axios';
import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

const state = {
    todos: null,
};
const mutations = {
    setTodos(state, payload) {
        state.todos = payload;
    },
};
const actions = {
    async loadTodos(store) {
        const result = await axios.get('/todos');
        store.commit('setTodos', result.data);
    },
};
const getters = {
    todos: s => s.todos,
};

export default new Vuex.Store({
    state,
    mutations,
    actions,
    getters,
});
