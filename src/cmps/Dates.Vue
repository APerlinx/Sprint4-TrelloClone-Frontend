<template>
  <div class="due-date-container" v-if="task.dueDate">
    <h5>Due-date</h5>
    <div class="due-date-checkbox">
      <input type="checkbox" v-model="dateStatus" @change="checkDueDate" />
      <button class="btn due-date-long-date" @click="openDueDate">
        <span>{{ formatDate(task.dueDate) }}&nbsp;</span> at
        <span>&nbsp;{{ formatTime(task.dueDate) }}</span>
        <div
          class="due-date-status"
          :class="`due-date ${dueDateStatus} ${task.status}`"
          v-if="task.dueDate"
          @click.stop="toggleStatus"
        >
          <span
            class="status overduelong"
            v-if="dueDateStatus === 'Overdue-long'"
            >Overdue</span
          >
          <span class="status overdueshort" v-if="dueDateStatus === 'Overdue'"
            >Overdue</span
          >
          <span class="status duesoon" v-if="dueDateStatus === 'Due-soon'"
            >Due soon</span
          >
          <span class="status done1" v-if="dueDateStatus === 'Completed'"
            >Completed</span
          >
        </div>
      </button>
    </div>
  </div>
</template>

<script>
import { format } from 'date-fns'

export default {
  props: {
    task: Object,
  },
  data() {
    return {
      dateStatus: false,
    }
  },
  created() {
    if (this.task.status === 'done') this.dateStatus = true
  },
  methods: {
    formatDate(timestamp) {
      return format(new Date(timestamp), 'MMM dd')
    },
    formatTime(timestamp) {
      return format(new Date(timestamp), 'h:mm aa')
    },
    openDueDate() {
      this.$emit('addDueDate')
    },
    checkDueDate() {
      this.dateStatus = !!this.dateStatus

      this.$emit('updateTaskStatus', this.dateStatus)
    },
    toggleStatus() {
      this.$store.dispatch('toggleStatus', {
        groupId: this.groupId,
        task: this.task,
      })
    },
  },
  computed: {
    dueDateStatus() {
      // console.log("🚀 ~ file: Dates.vue:67 ~ dueDateStatus ~ this.task.status:", this.task.status)
      if (!this.task.dueDate) return 'no-due-date'
      if (this.task.status === 'done') return 'Completed'
      console.log(this.task.status)

      const now = Date.now()
      const dueDate = new Date(this.task.dueDate).getTime()
      const diffHours = (dueDate - now) / 1000 / 60 / 60

      if (diffHours < -48) return 'Overdue-long'
      if (diffHours < 0) return 'Overdue'
      if (diffHours < 24) return 'Due-soon'
    },
  },
}
</script>
