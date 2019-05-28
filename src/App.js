export default {
    template: `
    <div id="app">
        {{ message }}
    </div>
    `,
    data() { return {
        message: 'Hello Vue 1'
    }},

    created() {
        this.message = this.$store.state.count;
    },
}
