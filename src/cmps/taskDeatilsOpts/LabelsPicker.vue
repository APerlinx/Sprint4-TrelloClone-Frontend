<template>
  <div class="filter-label">
    <input
      type="text"
      @input="filterLabels"
      v-model="filterBy"
      placeholder="Search labels..."
      v-focus
    />
  </div>

  <div class="labels-container">
    <div class="edit-label" v-if="isEditModeModal">
      <EditLabel
        :labelToEdit="labelToEdit"
        @prevModal="closeEditMode"
        @closeEditModal="closeEditModal"
        @updateLabel="updateLabel"
        @removeLabel="removeLabel"
      />
    </div>

    <h6 class="sub-title">Labels</h6>

    <div class="label" v-for="label in filteredLabels" :key="label.id">
      <div
        @click="onSetLabel(label.id)"
        class="checkbox"
        :class="{ checked: isLabelChecked(label.id) }"
      >
        <span class="v-check"></span>
      </div>

      <div :style="{ backgroundColor: label.color }" class="label-picker-color">
        <h5 :style="{ color: isDarkColor(label.color) ? 'white' : '' }">
          {{ label.title }}
        </h5>
      </div>

      <img
        @click="isEditMode(label)"
        class="pencil"
        src="../../assets/styles/img/pencil.svg"
        alt="edit"
      />
    </div>

    <!-- <button @click="isEditMode('')" class="create-label">
      Create a new label
    </button> -->
    <div></div>
  </div>
</template>

<script>
import { utilService } from '../../services/util.service.js'
import EditLabel from './EditLabel.vue'

export default {
  props: {
    board: Object,
    taskToEdit: Object,
  },

  data() {
    return {
      isEditModeModal: false,
      labelToEdit: null,
      filtteredLabels: null,
      filterBy: '',
    }
  },
  methods: {
    onSetLabel(labelId) {
      this.$emit('saveLabel', labelId)
    },
    isLabelChecked(labelId) {
      return this.taskToEdit?.labels.includes(labelId)
    },
    isEditMode(label) {
      if (!label) {
        this.labelToEdit = null
      } else {
        console.log('label', label)
        this.labelToEdit = label
      }
      this.isEditModeModal = !this.isEditModeModal
    },
    updateLabel(label) {
      const labelId = label.id

      const labIdx = this.board.labels.findIndex(
        (label) => label.id === labelId
      )
      if (labIdx === -1) {
        this.board.labels.push(label)
      } else {
        this.board.labels.splice(labIdx, 1, label)
      }
      this.$emit('updateBoard', this.board)
      this.isEditModeModal = false
    },
    removeLabel(lab) {
      const labIdx = this.board.labels.findIndex((label) => label.id === lab.id)

      this.board.labels.splice(labIdx, 1)
      this.$emit('updateBoard', this.board)
      this.isEditModeModal = false
    },
    closeEditMode() {
      this.isEditModeModal = false
    },
    isDarkColor(c) {
      c = c.substring(1) // strip #
      const rgb = parseInt(c, 16) // convert rrggbb to decimal
      const r = (rgb >> 16) & 0xff // extract red
      const g = (rgb >> 8) & 0xff // extract green
      const b = (rgb >> 0) & 0xff // extract blue
      var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b // per ITU-R BT.709

      return luma < 100
    },
  },
  computed: {
    filteredLabels() {
      const byName = new RegExp(this.filterBy, 'i')
      return this.board?.labels.filter((label) => byName.test(label.title))
    },
  },
  components: {
    EditLabel,
  },
}
</script>
