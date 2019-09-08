<template>
    <div class="Axios">
        Hello Axios!
        <div v-if="result" id="result">{{result}}</div>
    </div>
</template>
<script>

import axios from 'axios';

export default {
    data() {
        return {
            result: null,
        }
    },
    async created() {
        const result = await axios.get('http://worldtimeapi.org/api/timezone/Europe/Amsterdam');
        this.result = result.data;
    },
}


</script>
<style>

</style>
