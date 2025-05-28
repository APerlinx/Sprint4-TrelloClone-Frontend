<template>
  <section class="group-list-section">
    <ul class="group-list">
      <Container
        :get-child-payload="getGroupPayload"
        @drop="onDrop($event)"
        orientation="horizontal"
        drag-class="card-ghost"
        drop-class="card-ghost-drop"
        :drop-placeholder="upperDropPlaceholderOptions"
        class="group-container"
        v-if="groups"
        group-name="col"
      >
        <Draggable
          v-for="group in groupList"
          :key="group._id"
          :class="{ 'zoomed-out': isZoomedOut }"
        >
          <GroupPreview
            :group="group"
            :key="group.id"
            :showTaskForm="showTaskForm"
            :currentGroupId="currentGroupId"
            :isZoomedOut="isZoomedOut"
            @update-title="updateGroup"
            @removeGroup="removeGroup"
            @duplicateGroup="duplicateGroup"
            @watch="watchGroup"
            @updateGroup="updateGroups"
            @addTask="addTask"
            @closeTaskForm="closeTaskForm"
          >
            <template #actions>
              <div class="group-actions">
                <button
                  v-if="!(showTaskForm && currentGroupId === group.id)"
                  @click="showAddTaskForm(group.id)"
                  class="group-btn"
                >
                  <span class="icon"></span> Add a card
                </button>
              </div>
            </template>
          </GroupPreview>
        </Draggable>
      </Container>

      <li
        class="list-btn-wrapper"
        v-if="!toggleAddForm"
        @click="toggleAddForm = !toggleAddForm"
      >
        <button class="list-btn">
          <span class="icon"></span> Add another list
        </button>
      </li>
      <li
        class="open-form-wrapper"
        v-if="toggleAddForm"
        v-click-outside="handleCloseComponent"
      >
        <AddGroup @addGroup="addGroup" @close="handleCloseComponent" />
      </li>
      <button @click="saveMsg" style="padding: 0px">.</button>
    </ul>
    <button @click="toggleZoom" class="zoom-btn">
      <template v-if="isZoomedOut">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          class="bi bi-zoom-in"
          width="16"
          height="16"
        >
          <circle
            cx="6"
            cy="6"
            r="5"
            stroke="#ffffff"
            fill="none"
            stroke-width="2"
          />
          <line x1="6" y1="4" x2="6" y2="8" stroke="#ffffff" stroke-width="2" />
          <line x1="4" y1="6" x2="8" y2="6" stroke="#ffffff" stroke-width="2" />
          <line
            x1="11"
            y1="11"
            x2="14"
            y2="14"
            stroke="#ffffff"
            stroke-width="2"
          />
        </svg>
      </template>
      <template v-else>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          class="bi bi-zoom-out"
          width="16"
          height="16"
        >
          <circle
            cx="6"
            cy="6"
            r="5"
            stroke="#ffffff"
            fill="none"
            stroke-width="2"
          />
          <line x1="4" y1="6" x2="8" y2="6" stroke="#ffffff" stroke-width="2" />
          <line
            x1="11"
            y1="11"
            x2="14"
            y2="14"
            stroke="#ffffff"
            stroke-width="2"
          />
        </svg>
      </template>
    </button>
  </section>
</template>

<script>
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'
import { boardService } from '../services/board.service.js'
import { clickOutsideDirective } from '../directives/index.js'
import { Container, Draggable } from 'vue3-smooth-dnd'
import { scrollHorizontalDirective } from '../directives/index.js'
import { applyDrag } from '../services/util.service.js'
import {
  socketService,
  SOCKET_EVENT_ADD_MSG,
  SOCKET_EMIT_SEND_MSG,
  SOCKET_EVENT_REMOVE_MSG,
  SOCKET_EVENT_ADDTASK_MSG,
} from '../services/socket.service.js'

import GroupPreview from './GroupPreview.vue'
import AddGroup from './AddGroup.vue'
import AddTask from './AddTask.vue'

export default {
  name: 'group-list',
  props: {
    initialGroups: {
      type: Array,
    },
  },
  data() {
    return {
      title: '',
      toggleAddForm: false,
      currentGroupId: null,
      showTaskForm: false,
      groups: this.initialGroups || [],
      currBoard: {},
      groupsStack: [],
      upperDropPlaceholderOptions: {
        className: 'cards-drop-preview',
        animationDuration: '0',
        showOnTop: false,
      },
      isZoomedOut: false,
    }
  },
  computed: {
    loggedInUser() {
      return this.$store.getters.loggedinUser
    },
    groupList() {
      if (this.initialGroups && this.initialGroups.length > 0) {
        return [...this.initialGroups]
      }
      const boardId = this.$route.params.boardId
      this.groups = this.$store.getters.getGroupsByBoardId(boardId)
      return this.groups
    },
  },
  created() {
    const boardId = this.$route.params.boardId
    if (!this.groups.length && boardId) {
      this.groups = this.$store.getters.getGroupsByBoardId(boardId)
    }

    this.groups = JSON.parse(JSON.stringify(this.groups))
    this.currBoard = this.$store.getters.getCurrBoard
    // socketService.on(SOCKET_EVENT_ADD_MSG, this.addGroup);
    // socketService.on(SOCKET_EVENT_REMOVE_MSG, this.removeGroup);
    // socketService.on(SOCKET_EVENT_ADDTASK_MSG, this.addTask);
  },
  methods: {
    getGroupPayload(index) {
      return this.groups[index]
    },
    onDrop(dropRes) {
      const newGroups = applyDrag(this.groupList, dropRes)
      this.$store.dispatch({
        type: 'saveGroups',
        groups: newGroups,
        currBoard: this.currBoard,
      })
    },
    updateGroups({ info }) {
      info.group.tasks = info.tasks
      this.groupsStack.push(info.group)

      if (this.groupsStack.length === this.currBoard.groups.length) {
        let boardToUpdate = JSON.parse(JSON.stringify(this.currBoard))
        boardToUpdate.groups = this.groupsStack

        this.$store.dispatch({
          type: 'saveBoard',
          board: boardToUpdate,
        })

        this.groupsStack = []
      }
    },
    async addGroup(groupTitle) {
      try {
        const groupToAdd = boardService.getEmptyGroup()
        groupToAdd.title = groupTitle

        await this.$store.dispatch({
          type: 'addGroup',
          group: groupToAdd,
        })

        this.unscrollOnAction()
      } catch (err) {
        console.log(err)
      }
    },
    async removeGroup(groupId) {
      try {
        console.log('happen')
        await this.$store.dispatch({
          type: 'removeGroup',
          groupId,
        })
        showSuccessMsg('Group removed')
        this.unscrollOnAction()
      } catch (err) {
        console.log(err)
        showErrorMsg('Cannot remove group')
      }
    },
    async updateGroup(group, changes) {
      try {
        group = { ...group, ...changes }
        await this.$store.dispatch(getActionUpdateGroup(group))
        showSuccessMsg('Group updated')
      } catch (err) {
        console.log(err)
        showErrorMsg('Cannot update group')
      }
    },
    async addTask({ groupId, taskTitle, openedFromModal }) {
      try {
        this.showTaskForm = true
        await this.$store.dispatch({
          type: 'addTask',
          groupId,
          task: { title: taskTitle },
          board: this.currBoard,
          openedFromModal,
        })
        // this.unscrollOnAction() // TODO : FIX JUMPING SCROLL
        this.scrollToBottomOnAction()
      } catch (err) {
        console.log(err)
        showErrorMsg('Cannot add task')
      }
    },
    async duplicateGroup(groupId) {
      try {
        this.$store.dispatch('duplicateGroup', { groupId })
        showSuccessMsg('Group duplicated')
      } catch {
        showErrorMsg('Cannot duplicate Group ')
      }
    },
    watchGroup(groupId) {
      try {
        this.$store.dispatch('watchGroup', { groupId })
      } catch {}
    },
    closeTaskForm() {
      this.showTaskForm = false
    },
    handleCloseComponent() {
      this.toggleAddForm = false
    },
    showAddTaskForm(groupId) {
      this.currentGroupId = groupId
      this.showTaskForm = true
      this.scrollToBottomOnAction()
    },
    unscrollOnAction() {
      this.$nextTick(() => {
        const container = document.querySelector('.group-list-section')
        container.scrollLeft = container.scrollWidth
      })
    },
    scrollToBottomOnAction() {
      this.$nextTick(() => {
        const container = document.getElementById(this.currentGroupId)
        if (container) container.scrollTop = container.scrollHeight
      })
    },
  },
  components: {
    GroupPreview,
    AddGroup,
    AddTask,
    Container,
    Draggable,
  },
  directives: {
    clickOutside: clickOutsideDirective,
    scrollHorizontal: scrollHorizontalDirective,
  },
}
</script>

<style>
.card-container {
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.12), 0 1px 1px rgba(0, 0, 0, 0.24);
}

.card-ghost {
  transition: transform 0.18s ease;
  transform: rotateZ(5deg);
}

.card-ghost-drop {
  transition: transform 0.18s ease;
  transform: rotateZ(0deg);
}

.cards-drop-preview {
  background-color: rgba(44, 44, 51, 0.2);
  border-radius: 12px;
  width: 256px;
}
</style>
