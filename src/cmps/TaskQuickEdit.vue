<template>
  <div v-if="quickEditDisplay">
    <section class="task-preview-container">
      <div class="quickEditScreen"></div>
      <div class="quickEdit" ref="quickEdit" :style="quickEditPosition">
        <TaskCover :task="task" />

        <div class="labels" @click.stop>
          <div
            v-for="labelId in task.labels"
            :key="labelId"
            class="label"
            :class="{ expanded: areLabelsVisible }"
            :style="{
              backgroundColor:
                (getLabel(labelId) || {}).color || 'defaultColor',
            }"
            @click.stop="toggleLabel(labelId)"
          >
            <span v-if="areLabelsVisible">{{ getLabel(labelId).title }}</span>
          </div>
        </div>

        <div class="title-edit">
          <textarea
            v-model="localTask.title"
            autofocus
            ref="titleInput"
          ></textarea>
        </div>

        <div class="tool-tip-edit">
          <div
            class="date"
            :class="`due-date ${dueDateStatus} ${task.status}`"
            v-if="task.dueDate"
            @click.stop.prevent="toggleStatus"
          >
            <span class="icon date"></span>
            <span class="date-counter">{{ formatDate(task.dueDate) }}</span>
          </div>

          <div v-if="task.attachments && task.attachments.length > 0">
            <span class="icon attachment"></span>
            <span class="attachment-counter">{{
              task.attachments.length
            }}</span>
          </div>
          <div v-if="task.description">
            <span class="icon desc"></span>
          </div>

          <div v-if="task.comments && task.comments.length > 0">
            <span class="icon comment"></span>
            <span class="comment-counter">{{ task.comments.length }}</span>
          </div>

          <div
            v-if="task.checklists && task.checklists.length > 0"
            :class="{
              'completed-checklist': doneChecklists === totalChecklists,
            }"
          >
            <span class="icon checklist"></span>
            <span class="checklist-counter"
              >{{ doneChecklists }}<span class="slash">/</span
              >{{ totalChecklists }}</span
            >
          </div>
        </div>
        <div class="avatar-container">
          <div class="member-avatar" v-if="task.members">
            <img
              v-for="member in taskToEdit.members"
              :key="member.id"
              :src="member.imgUrl"
              class="avatar"
              alt="Avatar"
            />
          </div>
        </div>
      </div>

      <div class="save-button" ref="saveButton" :style="saveButtonPosition">
        <button @click="saveTitle">Save</button>
      </div>

      <div
        class="action-buttons"
        :class="actionButtonsClass"
        v-if="quickEditDisplay"
        :style="buttonPosition"
      >
        <button @click="openTaskDetails">
          <span class="card-icon"></span>Open card
        </button>

        <button
          v-for="btn in actionBtns"
          :key="btn.type"
          @click.stop="openModal(btn.type)"
        >
          <span :class="btn.icon"></span>
          {{ btn.txt }}
        </button>
        <div @click.stop="removeTask">
          <span class="archive-icon"></span>
        </div>
        <button @click="closeQuickEdit">Close</button>

        <DynamicModal
          v-if="cmpType"
          :actionCmpType="cmpType"
          :taskToEdit="localTask"
          :actionCmpName="CmpName"
          @toggleMember="toggleMember"
          @saveLabel="saveLabel"
          @removeLabel="removeLabel"
          @updateLable="updateLable"
          @DueDate="addDueDate"
          @setCover="setCover"
          @closeDynamicModal="closeDynamicModal"
        />
      </div>
    </section>
  </div>
</template>

<script>
import { watch } from 'vue'

import DynamicModal from '../views/DynamicModal.vue'
import TaskCover from './TaskCover.vue'
import Popper from 'vue3-popper'

export default {
  name: 'task-preview',
  components: {
    DynamicModal,
    TaskCover,
    Popper,
  },
  props: {
    taskId: {
      type: String,
    },
    groupId: {
      type: String,
    },
    quickEditDisplay: {
      type: Boolean,
      required: true,
    },
    getLabel: {
      type: Function,
      required: true,
    },
    totalChecklists: {
      type: Number,
      required: true,
    },
    doneChecklists: {
      type: Number,
      required: true,
    },
    dueDateStatus: {
      type: String,
      required: true,
    },
    formatDate: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      actionBtns: [
        { txt: 'Edit labels', icon: 'labels-icon', type: 'LabelsPicker' },
        { txt: 'Change members', icon: 'members-icon', type: 'MemberPicker' },
        { txt: 'Change cover', icon: 'cover-icon', type: 'CoverPicker' },
        { txt: 'Edit dates', icon: 'dates-icon', type: 'DueDatePicker' },
        { txt: 'Archive', icon: 'archive-icon', type: 'archive' },
      ],
      cmpType: null,
      cmpName: '',
      buttonPosition: {},
      isNearBottom: false,
      saveButtonPosition: {},
      rect: null,
      containerPosition: {},
      quickEditPosition: {},
      quickEditDisplayStyle: {},
      localTask: null,
      actionButtonsClass: '',
      taskToEdit: null,
      group: null,
      board: null,
      hideBtn: false,
      isWatchActive: false,
      watch: 'Watch',
      isDynamicModal: false,
      actionCmpType: null,
      actionCmpName: null,
      isCoverActive: false,
      coverColor: '',
      currColor: '',
    }
  },
  created() {
    this.localTask = JSON.parse(JSON.stringify(this.task))
    this.setTask()
  },
  mounted() {
    document.addEventListener('click', this.onClickOutside)
  },
  unmounted() {
    console.log('TaskQuickEdit unmounted unexpectedly')

    document.removeEventListener('click', this.onClickOutside)
  },

  computed: {
    task() {
      const board = this.$store.getters.getCurrBoard
      const group = board.groups.find((group) => group.id === this.groupId)
      return group?.tasks.find((task) => task.id === this.taskId)
    },

    areLabelsVisible() {
      return this.$store.getters.areLabelsVisible
    },
    cmpOrder() {
      return this.$store.getters.cmpsOrder
    },
  },
  methods: {
    closeDynamicModal() {
      this.isDynamicModal = false
      this.cmpType = null
    },
    closeQuickEdit() {
      this.$emit('close')
      this.quickEditPosition = {}
      this.buttonPosition = {}
      this.saveButtonPosition = {}
    },

    saveTitle() {
      this.$store.dispatch('saveTaskTitle', {
        task: this.localTask,
        groupId: this.groupId,
      })
    },
    set(cmp, idx) {
      this.isDynamicModal = true
      this.actionCmpType = cmp
      this.actionCmpName = this.dynamicNames[idx]
    },

    setCover(cover) {
      if (this.taskToEdit.hasOwnProperty('cover')) {
        this.taskToEdit.cover = cover
      } else {
        this.taskToEdit = { ...this.taskToEdit, cover: cover }
      }
      this.editTask()
    },

    removeLabel(board) {
      this.board = board
      this.editTask()
    },
    updateLable(board) {
      this.board = board
      this.editTask()
    },
    addDueDate(date) {
      this.taskToEdit.dueDate = date

      this.editTask()
    },
    saveLabel(labelId) {
      const idx = this.taskToEdit.labels?.findIndex(
        (label) => label === labelId
      )
      if (idx >= 0) this.taskToEdit.labels?.splice(idx, 1)
      else {
        this.taskToEdit.labels.push(labelId)
      }
      if (this.localTask?.title && this.taskToEdit) {
        this.taskToEdit.title = this.localTask.title
      }
      this.$store.dispatch({ type: 'updateBoard', board: this.board })
    },
    toggleMember(clickedMember) {
      if (!this.taskToEdit.members) {
        this.taskToEdit.members = []
        this.taskToEdit.members.push(clickedMember)
      } else {
        if (
          this.taskToEdit.members.some(
            (member) => member.id === clickedMember.id
          )
        ) {
          const idx = this.taskToEdit.members.findIndex(
            (member) => member.id === clickedMember.id
          )
          this.taskToEdit.members.splice(idx, 1)
        } else {
          this.taskToEdit.members.push(clickedMember)
        }
      }
      // this.editTask()
    },
    setTask() {
      try {
        if (!this.board) {
          // TODO : find a way to fetch the board only once probably using an action
          const board = this.$store.getters.getCurrBoard
          this.board = JSON.parse(JSON.stringify(board))
        }

        const taskId = this.task.id
        const groupId = this.groupId

        this.group = this.board.groups.find((group) => group.id === groupId)
        this.taskToEdit = this.group.tasks.find((task) => task.id === taskId)
      } catch (err) {
        console.log('error in setTask', err)
      }
    },
    togglecover() {
      this.isCoverActive = !this.isCoverActive
    },

    editTask() {
      if (this.localTask?.title && this.taskToEdit) {
        this.taskToEdit.title = this.localTask.title
      }

      const editedTask = JSON.parse(JSON.stringify(this.taskToEdit))
      const taskIdx = this.group.tasks.findIndex(
        (task) => task.id === this.taskToEdit.id
      )
      this.group.tasks.splice(taskIdx, 1, this.taskToEdit)

      this.$store.dispatch({ type: 'updateBoard', board: this.board })
    },
    closeComponent() {
      this.taskTitle = ''
      // this.$emit('close')
    },
    openModal(type) {
      switch (type) {
        case 'LabelsPicker':
          this.cmpType = 'LabelsPicker'
          this.CmpName = 'Edit labels'
          break
        case 'MemberPicker':
          this.cmpType = 'MemberPicker'
          this.CmpName = 'Change Members'

          break
        case 'CoverPicker':
          this.cmpType = 'CoverPicker'
          this.CmpName = 'Change cover'

          break
        case 'DueDatePicker':
          this.cmpType = 'DueDatePicker'
          this.CmpName = 'Edit dates'

          break
        default:
          this.cmpType = null
          break
      }
    },
    toggleStatus() {
      this.$emit('status-toggled')
    },
    toggleLabel() {
      this.$store.commit('toggleLabelsVisibility')
    },
    openTaskDetails() {
      const boardId = this.$route.params.boardId
      this.$router.push(
        `/details/${boardId}/group/${this.groupId}/task/${this.task.id}`
      )
    },
  },
  mounted() {
    watch(
      () => this.quickEditDisplay,
      (newVal, oldVal) => {
        if (newVal !== oldVal && newVal) {
          this.localTask = JSON.parse(JSON.stringify(this.task))
          this.$nextTick(() => {
            const rect = this.$refs.quickEdit.getBoundingClientRect()

            const distanceFromBottom =
              window.innerHeight - (rect.top + rect.height)

            const distanceFromRight =
              window.innerWidth - (rect.left + rect.width)

            this.isNearBottom = distanceFromBottom < 100
            const isNearRight = distanceFromRight < 200
            this.actionButtonsClass = isNearRight ? 'modal-left' : 'modal-right'
            const adjustedTop = rect.top - 100

            this.$refs.titleInput.focus()
            this.$refs.titleInput.select()

            if (this.isNearBottom && isNearRight) {
              this.buttonPosition = {
                position: 'fixed',
                top: `${adjustedTop - rect.height + 115}px`,
                left: `${rect.left - rect.width + 125}px`,
              }
            } else if (this.isNearBottom) {
              this.buttonPosition = {
                position: 'fixed',
                top: `${adjustedTop - rect.height + 115}px`,
                left: `${rect.left + 256}px`,
              }
            } else if (isNearRight) {
              this.buttonPosition = {
                position: 'fixed',
                top: `${adjustedTop}px`,
                left: `${rect.left - rect.width + 80}px`,
              }
            } else {
              this.buttonPosition = {
                position: 'fixed',
                top: `${adjustedTop}px`,
                left: `${rect.left + rect.width}px`,
              }
            }
            this.saveButtonPosition = {
              position: 'fixed',
              top: `${adjustedTop + rect.height}px`,
              left: `${rect.left}px`,
            }

            this.quickEditPosition = {
              position: 'fixed',
              top: `${adjustedTop}px`,
              left: `${rect.left}px`,
            }
          })
        }
      },
      { immediate: true }
    )
  },
}
</script>
