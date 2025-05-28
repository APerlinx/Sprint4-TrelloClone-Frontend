<template>
  <div class="date-picker">
    <VDatePicker
      expanded
      locale="en"
      v-model="date"
      mode="dateTime"
      is24hr
      hide-time-header
    />
  </div>
  <div role="button" @click="saveDueDate" class="btn-date-save">Save</div>
  <div role="button" @click="removeDueDate" class="btn-date-remove">Remove</div>
</template>

<script>
import { ref } from 'vue'

export default {
  emits: ['addDueDate'],
  components: {},
  data() {
    return {
      date: ref(new Date()),
    }
  },
  methods: {
    saveDueDate() {
      const date = Date.parse(this.date)
      this.$emit('addDueDate', date)
    },
  },
}
</script>
