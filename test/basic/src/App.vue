<template>
    <div id="app">
        <div a="trigger" b="an" c="eslint" d="error" />
        <router-view />
    </div>
</template>
<script>

export default {
    created() {
        this.$store.dispatch('loadTodos');
    },
}


</script>
<style>

body {
    font-family: "Source Sans Pro", "Helvetica Neue", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    word-spacing: 0.05em;
    color: #4f5959;
    display: block;
    margin: 60px auto;
    text-align: center;
    background: url('./background.svg');
}

#app {
}

</style>
