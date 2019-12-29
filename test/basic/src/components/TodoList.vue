<template>
    <div class="TodoList">
        <todo-item v-for="todo in todos" :key="todo.id"
            :todo="todo" />
    </div>
</template>
<script>

import { mapGetters } from 'vuex';
import TodoItem from './TodoItem';

export default {
    components: {
        TodoItem
    },
    computed: {
        ...mapGetters([
            'todos',
        ]),
    },

}
</script>
<style lang="scss">

.TodoList {
}

</style>
