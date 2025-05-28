<template>
  <div class="label-wrapper">
    <h5>Labels</h5>
    <div class="labels-details">
      <div v-for="labelId in task.labels" :key="labelId">
        <div
          class="label-details"
          :style="{ backgroundColor: getLabelColor(labelId) }"
        >
          <h6
            :style="{
              color: isDarkColor(getLabelColor(labelId)) ? 'white' : '',
            }"
          >
            {{ getLabelTitle(labelId) }}
          </h6>
        </div>
      </div>
      <button @click="toggleLabelModal" class="add-label">
        <span class="icon plus"> </span>
        <!-- <div v-if="isLabelModal" class="label-modal">
          <DynamicModal :actionCmpType="'LabelsPicker'" :actionCmpName="'Labels'" :taskToEdit="taskToEdit" :board="board"
            @saveLabel="saveLabel" @removeLabel="removeLabel" @updateLable="updateLable" />
        </div> -->
      </button>
    </div>
  </div>
</template>

<script>
import DynamicModal from '../views/DynamicModal.vue'
export default {
  props: {
    task: Object,
    board: Object,
  },
  data() {
    return {
      isLabelModal: false,
    }
  },
  methods: {
    getLabel(id) {
      return this.board.labels.find((label) => label.id === id)
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
    saveLabel(labelId) {
      this.$emit('saveLabel', labelId)
    },
    updateLable(board) {
      this.$emit('updateLable', board)
    },
    removeLabel(board) {
      this.$emit('removeLabel', board)
    },
    toggleLabelModal() {
      this.$emit('toggleLabelModal')
    },
  },
  computed: {
    getLabelTitle() {
      return (id) => {
        const label = this.board.labels.find((label) => label.id === id)
        return label ? label.title : ''
      }
    },
    getLabelColor() {
      return (id) => {
        const label = this.board.labels.find((label) => label.id === id)
        return label ? label.color : ''
      }
    },
  },
  components: {
    // LabelsPicker,
    DynamicModal,
  },
}
</script>

<style>
input:focus {
  outline: none;
}
</style>
