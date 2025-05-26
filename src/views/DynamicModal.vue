<template>
  <div class="dynamic-modal-container">
    <section class="dynamic-modal-header">
      <div>
        <svg
          width="20px"
          height="20px"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
          fill="#ffffff"
        >
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <path
              fill="#ffffff"
              d="M195.2 195.2a64 64 0 0 1 90.496 0L512 421.504 738.304 195.2a64 64 0 0 1 90.496 90.496L602.496 512 828.8 738.304a64 64 0 0 1-90.496 90.496L512 602.496 285.696 828.8a64 64 0 0 1-90.496-90.496L421.504 512 195.2 285.696a64 64 0 0 1 0-90.496z"
            ></path>
          </g>
        </svg>
      </div>
      <h4 class="dynamic-modal-title">{{ actionCmpName }}</h4>

      <div
        role="button"
        class="dynamic-modal-close"
        @click.stop="closeDynamicModal"
      >
        <svg
          width="20px"
          height="20px"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
          fill="#000000"
        >
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <path
              fill="#000000"
              d="M195.2 195.2a64 64 0 0 1 90.496 0L512 421.504 738.304 195.2a64 64 0 0 1 90.496 90.496L602.496 512 828.8 738.304a64 64 0 0 1-90.496 90.496L512 602.496 285.696 828.8a64 64 0 0 1-90.496-90.496L421.504 512 195.2 285.696a64 64 0 0 1 0-90.496z"
            ></path>
          </g>
        </svg>
      </div>
    </section>
    <section>
      <component
        :board="boardToUpdate"
        :is="actionCmpType"
        :taskToEdit="taskToEdit"
        @updateBoard="updateBoard"
        @toggleMember="toggleMember"
        @checklist="addChecklist"
        @saveLabel="saveLabel"
        @addDueDate="addDueDate"
        @removeLabel="removeLabel"
        @setCover="setCover"
        @closeEditModal="closeDynamicModal"
        @addAttachment="addAttachment"
      >
      </component>
    </section>
  </div>
</template>
<script>
import ChecklistPicker from '../cmps/taskDeatilsOpts/ChecklistPickerTEMP.vue'
import LabelsPicker from '../cmps/taskDeatilsOpts/LabelsPicker.vue'
import MemberPicker from '../cmps/taskDeatilsOpts/MemberPicker.vue'
import DueDatePicker from '../cmps/taskDeatilsOpts/DueDatePicker.vue'
import CoverPicker from '../cmps/taskDeatilsOpts/CoverPicker.vue'
import AttachmentPicker from '../cmps/taskDeatilsOpts/AttachmentPicker.vue'

export default {
  props: {
    taskToEdit: Object,
    board: Object,
    actionCmpType: String,
    actionCmpName: String,
  },
  data() {
    return {
      boardToUpdate: null,
    }
  },
  created() {
    this.fetchBoard()
  },
  methods: {
    fetchBoard() {
      if (!this.$props.board) {
        this.boardToUpdate = this.$store.getters.getCurrBoard
      } else {
        this.boardToUpdate = this.board
      }
    },
    setCover(cover) {
      this.$emit('setCover', cover)
    },
    saveLabel(labelId) {
      this.$emit('saveLabel', labelId)
    },
    toggleMember(member) {
      this.$emit('toggleMember', member)
    },
    addChecklist(newChecklist) {
      this.$emit('checklist', newChecklist)
    },
    addAttachment(newAttachment) {
      this.$emit('attachment', newAttachment)
    },
    addDueDate(newDueDate) {
      this.$emit('dueDate', newDueDate)
    },
    updateBoard(board) {
      this.$emit('updateBoard', board)
    },
    removeLabel(label) {
      this.$emit('removeLabel', label)
    },
    closeDynamicModal() {
      this.$emit('closeDynamicModal')
    },
  },
  components: {
    ChecklistPicker,
    LabelsPicker,
    MemberPicker,
    DueDatePicker,
    CoverPicker,
    AttachmentPicker,
  },
}
</script>
