import { mapGetters } from 'vuex';
export default {
    template: `
        <div id="app">
            {{ message }} {{count}}
            <button @click="inc">increment</button>
            <button @click="dec">decrement</button>
        </div>
    `,
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
        // this.message = this.$store.state.count;
    },
}
