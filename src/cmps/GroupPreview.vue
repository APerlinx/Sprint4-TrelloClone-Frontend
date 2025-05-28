<template>
  <li class="group-preview">
    <div :class="{ 'group-card': true, 'zoomed-out': isZoomedOut }">
      <div class="group-header">
        <input
          class="group-title"
          type="text"
          :value="group.title"
          @input="updateTitle($event.target.value)"
        />
        <div>
          <span class="icon watch" v-if="group.isWatched"></span>
        </div>
        <div class="menu-btn" ref="menuButton" @click="toggleModal">
          <span class="icon"></span>
        </div>
      </div>
      <div class="scroll-container">
        <taskList
          @moveTasks="replaceTasks"
          @addTask="addTask"
          @closeTaskForm="closeTaskForm"
          :tasks="group.tasks"
          :groupId="group.id"
          :showAddTask="showTaskForm && currentGroupId === group.id"
          :openedFromModal="openedFromModal"
        />
      </div>
      <slot name="actions"></slot>
    </div>

    <div
      v-if="showModal"
      class="modal"
      :style="{ top: modalTop + 'px', left: modalLeft + 'px' }"
      v-click-outside="toggleModal"
    >
      <div class="modal-content">
        <div class="header">
          <span class="header-title">List actions</span>
          <button @click="toggleModal"><span class="icon"></span></button>
        </div>
        <div class="actions">
          <button class="action" @click="handleAction('addCard')">
            Add card...
          </button>
          <button class="action" @click="handleAction('duplicateGroup')">
            Duplicate group...
          </button>
          <button class="action" @click="handleAction('removeGroup')">
            Remove group...
          </button>

          <button class="action" @click="handleAction('watch')">
            Watch <span class="watch-on" v-if="group.isWatched"></span>
          </button>
          <hr />
        </div>
      </div>
    </div>
  </li>
</template>

<script>
import TaskList from './TaskList.vue'
import { Container, Draggable } from 'vue3-smooth-dnd'
import { clickOutsideDirective } from '../directives/index.js'

export default {
  props: {
    group: {
      type: Object,
      required: true,
    },
    showTaskForm: {
      type: Boolean,
      default: false,
    },
    currentGroupId: {
      type: String,
      default: '',
    },
    isZoomedOut: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isSourceGroup: false,
      sourceGroupId: null,
      targetGroupId: null,
      containerKey: 0,
      removedIndex: null,
      currBoard: {},
      currTask: {},
      showModal: false,
      modalTop: 0,
      modalLeft: 0,
      openedFromModal: false,
    }
  },
  components: {
    TaskList,
    Container,
    Draggable,
  },
  created() {
    this.currBoard = this.$store.getters.getCurrBoard
  },

  computed: {},
  methods: {
    handleAction(actionType) {
      this.$emit(actionType, this.group.id)
      if (actionType === 'addCard') {
        this.openedFromModal = true
      }
      this.showModal = actionType === 'watch'
    },
    replaceTasks(tasks) {
      let group = JSON.parse(JSON.stringify(this.group))
      this.$emit('updateGroup', { info: { tasks, group } })
    },
    toggleModal() {
      this.showModal = !this.showModal
      if (!this.showModal) {
        this.openedFromModal = false
      }
      if (this.showModal) {
        this.calculateModalPosition()
      }
    },
    calculateModalPosition() {
      const rect = this.$refs.menuButton.getBoundingClientRect()
      this.modalTop = rect.top + rect.height
      this.modalLeft = rect.left
    },
    addTask(task) {
      this.$emit('addTask', { ...task, openedFromModal: this.openedFromModal })
      this.openedFromModal = false
    },
    closeTaskForm() {
      this.$emit('closeTaskForm', this.openedFromModal)
      this.openedFromModal = false
    },
  },
  directives: {
    clickOutside: clickOutsideDirective,
  },
}
</script>
