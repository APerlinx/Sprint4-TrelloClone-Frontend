<template>
  <Container
    class="tasks-container"
    orientation="vertical"
    v-if="tasks"
    :get-child-payload="getChildPayload"
    group-name="col-items"
    @drop="onDrop($event)"
    :dragClass="'card-ghost'"
    :drop-placeholder="dropPlaceholderOptions"
  >
    <AddTask
      v-if="openedFromModal"
      :groupId="groupId"
      @addTask="addTask"
      @close="closeTaskForm"
      class="opend-from-modal"
    />
    <!-- Task Preview -->
    <!-- <Draggable></Draggable> The div below was Draggable tag but drag n'drop don't work properly for tasks / Commented out until it's FIXED! -->
    <div
      v-for="item in items"
      :key="item.id"
      class="draggable-item"
      drag-class="card-ghost"
    >
      <div class="card">
        <task-preview :taskId="item.id" :groupId="groupId" />
      </div>
    </div>
    <AddTask
      v-if="showAddTask && !openedFromModal"
      :groupId="groupId"
      @addTask="addTask"
      @close="closeTaskForm"
    />
  </Container>
</template>

<script>
import taskPreview from './TaskPreview.vue'
import { Container, Draggable } from 'vue3-smooth-dnd'
import { applyDrag } from '../services/util.service.js'
import AddTask from './AddTask.vue'

export default {
  name: 'task-list',
  props: {
    groupId: {
      type: String,
    },
    tasks: {
      type: Array,
    },
    showAddTask: {
      type: Boolean,
      default: false,
    },
    openedFromModal: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      items: [],
      dropPlaceholderOptions: {
        className: 'drop-preview',
        animationDuration: '0',
        showOnTop: false,
      },
    }
  },
  watch: {
    tasks: {
      immediate: true,
      handler(newVal) {
        // if(!newVal) return
        this.items = JSON.parse(JSON.stringify(newVal))
      },
    },
  },
  methods: {
    onDrop(dropRes) {
      this.items = applyDrag(this.items, dropRes)
      this.$emit('moveTasks', this.items)
    },
    getChildPayload(idx) {
      return this.items[idx]
    },
    addTask(task) {
      this.$emit('addTask', task)
    },
    closeTaskForm() {
      this.$emit('closeTaskForm')
    },
  },

  components: {
    taskPreview,
    AddTask,
    Container,
    Draggable,
  },
}
</script>

<style>
.drop-preview {
  background-color: rgba(150, 150, 200, 0.1);
  border-radius: 8px;
}

.card-ghost {
  transition: transform 0.18s ease;
  transform: rotateZ(0deg);
}

.opend-from-modal {
  margin-bottom: 8px;
}
</style>
