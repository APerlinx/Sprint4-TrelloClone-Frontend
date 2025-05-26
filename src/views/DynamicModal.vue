<template>
  <div class="dynamic-modal-container">
    <section class="dynamic-modal-header">
      <h4 class="dynamic-modal-title">{{ actionCmpName }}</h4>
      <span class="dynamic-modal-close" @click.stop="closeDynamicModal"></span>
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
