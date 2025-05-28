<template>
  <div v-if="quickEditDisplay">
    <section class="task-preview-container">
      <div class="quickEditScreen"></div>
      <div class="quickEdit" ref="quickEdit" :style="quickEditPosition">
        <TaskCover :task="taskToEdit" />

        <!-- Task's Labels  -->
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
        <button @click="saveTitle" :disabled="isSaving">Save</button>
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
          :taskToEdit="taskToEdit"
          :actionCmpName="CmpName"
          @toggleMember="toggleMember"
          @saveLabel="saveLabel"
          @removeLabel="removeLabel"
          @updateLabel="updateLabel"
          @DueDate="addDueDate"
          @setCover="onSetCover"
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
      isSaving: false,
    }
  },
  created() {
    this.localTask = JSON.parse(JSON.stringify(this.task))
    this.setTask()
  },
  computed: {
    task() {
      const board = JSON.parse(JSON.stringify(this.$store.getters.getCurrBoard))
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
    async closeQuickEdit() {
      try {
        await this.$store.dispatch('saveUpdatedBoard')
        this.$emit('closeQuickEdit')
      } catch (error) {
        console.error('Error closing quick edit')
      }
      this.quickEditPosition = {}
      this.buttonPosition = {}
      this.saveButtonPosition = {}
    },
    async saveTitle() {
      if (this.isSaving) return
      this.isSaving = true
      try {
        await this.$store.dispatch('saveTaskTitle', {
          task: this.localTask,
          groupId: this.groupId,
        })
        setTimeout(() => {
          this.isSaving = false
        }, 1000)
      } catch (err) {
        console.error('Failed to save:', err)
        this.isSaving = false
      }
    },

    set(cmp, idx) {
      this.isDynamicModal = true
      this.actionCmpType = cmp
      this.actionCmpName = this.dynamicNames[idx]
    },
    onSetCover(cover) {
      this.taskToEdit.cover = cover
      this.editTask()
    },
    removeLabel(board) {
      this.board = board
      this.editTask()
    },
    updateLabel(board) {
      this.board = board
      this.editTask()
    },
    addDueDate(date) {
      this.taskToEdit.dueDate = date
      this.editTask()
    },
    saveLabel(labelId) {
      const labels = [...(this.taskToEdit.labels || [])]

      const idx = labels.findIndex((label) => label === labelId)
      if (idx >= 0) labels.splice(idx, 1)
      else labels.push(labelId)

      this.taskToEdit.labels = labels

      if (this.localTask?.title && this.taskToEdit) {
        this.taskToEdit.title = this.localTask.title
      }

      this.editTask()
    },
    setTask() {
      this.taskToEdit = JSON.parse(JSON.stringify(this.task))
    },
    editTask() {
      if (this.localTask?.title && this.taskToEdit) {
        this.taskToEdit.title = this.localTask.title
      }

      this.$store.commit('updateTaskInPlace', {
        groupId: this.groupId,
        task: this.taskToEdit,
      })
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
    openTaskDetails() {
      const boardId = this.$route.params.boardId
      this.$router.push(
        `/details/${boardId}/group/${this.groupId}/task/${this.task.id}`
      )
    },
    toggleMember(clickedMember) {
      const members = [...(this.taskToEdit.members || [])]

      const idx = members.findIndex((member) => member.id === clickedMember.id)

      if (idx >= 0) {
        members.splice(idx, 1)
      } else {
        members.push(clickedMember)
      }

      this.taskToEdit.members = members
      this.editTask()
    },
    toggleStatus() {
      this.$emit('status-toggled')
    },
    toggleLabel() {
      this.$store.commit('toggleLabelsVisibility')
    },
    togglecover() {
      this.isCoverActive = !this.isCoverActive
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
