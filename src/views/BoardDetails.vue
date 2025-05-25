<template>
  <section
    class="board-details"
    v-if="!isLoadingBoard && board"
    :style="this.boardStyle"
  >
    <BoardHeader
      :board="board"
      @searchTermChanged="handleSearchTermChange"
      @checkboxChanged="handleCheckboxChangeEvent"
    />
    <GroupList
      v-if="boardsLoaded && groups && groups.length > 0"
      :initialGroups="groups"
      :key="groups"
    />
    <RouterView />
  </section>

  <div v-if="isLoadingBoard"><Loader /></div>
</template>

<script>
import GroupList from '../cmps/GroupList.vue'
import BoardHeader from '../cmps/BoardHeader.vue'
import Loader from '../cmps/Loader.vue'

import {
  socketService,
  SOCKET_EMIT_SET_TOPIC,
} from '../services/socket.service.js'

export default {
  emits: ['changeHeaderClr'],
  async created() {
    this.loadBoardData()
    socketService.on('on-board-update', (board) =>
      this.$store.commit({ type: 'updateBoard', board })
    )
    this.$store.commit('setChangeClr', true)
  },

  data() {
    return {
      boardStyle: {
        backgroundImage: '',
        backgroundColor: '',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      },
      searchTerm: '',
      checkboxValues: {
        noDate: false,
        overdue: false,
        dueInNextDay: false,
      },
      boardsLoaded: false,
      showSidebar: false,
    }
  },

  methods: {
    toggleSidebar() {
      this.showSidebar = !this.showSidebar
    },
    async loadBoardData() {
      const { boardId } = this.$route.params
      if (!boardId) return
      await this.$store.dispatch('loadCurrentBoard', { boardId })
      // await this.$store.commit('addBoardToRecent', { boardId })
      this.boardsLoaded = true
      socketService.emit(SOCKET_EMIT_SET_TOPIC, boardId)
    },
    handleSearchTermChange(searchTerm) {
      this.searchTerm = searchTerm
    },
    handleCheckboxChangeEvent(checkboxEvent) {
      this.checkboxValues[checkboxEvent.name] = checkboxEvent.value
    },
  },

  computed: {
    isLoadingBoard() {
      return this.$store.getters.isLoadingBoard
    },
    board() {
      return JSON.parse(JSON.stringify(this.$store.getters.getCurrBoard))
    },
    groups() {
      const { boardId } = this.$route.params
      const newGroups = this.$store.getters.getFilteredGroups(
        this.checkboxValues,
        boardId
      )
      return newGroups
    },
  },

  watch: {
    'board.style': {
      deep: true,
      handler(newVal) {
        this.boardStyle = {
          backgroundImage: newVal.backgroundImage || '',
          backgroundColor: newVal.backgroundColor || '',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          height: '100vh',
        }
      },
    },
    '$route.params.boardId': {
      immediate: true,
      handler: 'loadBoardData',
    },
  },
  components: { GroupList, BoardHeader, Loader },
}
</script>
