<template>
    <div class="Home">
        <img class="logo" src="../logo.svg" />
        <h1>Todo App</h1>
        <div class="add-area">
            <input placeholder="Name of new todo" />
            <svg class="plus">
                <path
                    transform="translate(20,20)"
                    d="M-12,0l24,0M0,-12l0,24" />
            </svg>
        </div>
        <todo-list />
    </div>
</template>
<script>

import TodoList from './../components/TodoList';
export default {
    components: {
        TodoList
    },
    data() {
        return {
        };
    },
}


</script>
<style>

.Home {
    .logo {
        width: 64px;
    }

    .add-area {
        display: grid;
        width: 50%;
        grid-template-columns: 1fr 40px;
        grid-template-rows: 40px;
        grid-gap: 4px;
        margin: 0 auto;
        margin-bottom: 16px;
        position: relative;

        input {
            padding: 8px;
            border: 1px solid #eee;
            flex: 1;
        }
        .plus {
            cursor: pointer;
            border-radius: 4px;
            width: 40px;
            height: 40px;
            background: #00BF81;
            stroke: white;
            stroke-width: 6px;
            font-size: 30px;
            display: flex;
            justify-content: center;
            color: white;
            align-items: center;
        }
    }

}

</style>
