<template>
    <div class="TodoItem">
        <span>{{todo.name}}</span>
            <svg class="plus">
                <path
                    transform="translate(20,20) rotate(45)"
                    d="M-12,0l24,0M0,-12l0,24" />
            </svg>
    </div>
</template>
<script>
export default {
    props: [
        'todo',
    ],

}
</script>
<style lang="scss">

.TodoItem {
    display: flex;
    align-items: center;
    background: #314860;
    color: white;
    padding: 8px;
    border: 1px solid #eee;
    border-radius: 4px;
    span {
        flex: 1;
    }
    .plus {
            cursor: pointer;
        width: 40px;
        height: 40px;
        stroke: white;
        stroke-width: 6px;
        font-size: 30px;
        display: flex;
        justify-content: center;
        color: white;
        align-items: center;
    }
}

</style>
