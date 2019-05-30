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
    methods: {
        inc() {
            this.$store.commit('increment');
        },
        dec() {
            this.$store.commit('decrement');
        },
    },
    data() { return {
        message: 'Hello Vue'
    }},
    computed: {
        ...mapGetters([
            'count',
        ]),
    },
}

</script>
<style>

body {
    background: white;
}

</style>
