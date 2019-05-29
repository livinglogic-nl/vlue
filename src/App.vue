<template>
    <div id="app">
        {{ message }} {{count}}
        <button @click="inc">increment</button>
        <button @click="dec">decrement</button>
    </div>
</template>
<script>

import { mapGetters } from 'vuex';
export default {
    data() { return {
        message: 'Hello Vue'
    }},

    methods: {
        inc() {
            this.$store.commit('increment');
        },
        dec() {
            this.$store.commit('decrement');
        },
    },
    computed: {
        ...mapGetters([
            'count',
        ]),
    },

    created() {
    },
}

</script>
<style>

body {
    background: white;

    margin: 0;
}

</style>
