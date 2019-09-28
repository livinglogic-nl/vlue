<template>
    <div class="Axios">
        Hello Axios!
        <button @click="reload">reload</button>
        <div v-if="result" id="result">{{result}}</div>
        <div v-if="error" id="error">{{error}}</div>
    </div>
</template>
<script>

import axios from 'axios';

export default {
    data() {
        return {
            error: null,
            result: null,
        }
    },
    methods: {
        async reload() {
            this.error = null;
            this.result = null;

            try {
                this.result = (await axios.get('/api/example')).data;
            } catch(e) {
                this.error = e;
            }
        },
    },
}


</script>
<style>

</style>
