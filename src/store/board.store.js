// import { boardService } from '../services/board.service.local'
import { boardService } from '../services/board.service'
import { utilService } from '../services/util.service.js'
import {
  socketService,
  SOCKET_EVENT_ADD_MSG,
  SOCKET_EMIT_SEND_MSG,
} from '../services/socket.service.js'

export function getActionRemoveBoard(boardId) {
  return {
    type: 'removeBoard',
    boardId,
  }
}
export function getActionAddBoard(board) {
  return {
    type: 'addBoard',
    board,
  }
}
export function getActionUpdateBoard(board) {
  return {
    type: 'updateBoard',
    board,
  }
}
export function getActionAddBoardMsg(boardId) {
  return {
    type: 'addBoardMsg',
    boardId,
    txt: 'Stam txt',
  }
}

export const boardStore = {
  state: {
    boards: [],
    recentBoards: [],
    currentBoard: null,
    savedBoard: null,
    currentGroup: null,
    currentTask: null,
    filterBy: '',
    dropResults: [],
    areLabelsVisible: false,
    loadingBoard: false,
    changeClr: false,
    cmpsOrder: [
      'MemberPicker',
      'LabelsPicker',
      'ChecklistPicker',
      'DueDatePicker',
      'AttachmentPicker',
      'CoverPicker',
      'Custom Fields',
    ],
  },

  mutations: {
    setBoards(state, { boards }) {
      state.boards = boards
    },
    setChangeClr(state, value) {
      state.changeClr = value
    },
    setLoadingBoard(state, isLoading) {
      state.loadingBoard = isLoading
    },
    saveTitle(state, { title }) {
      state.currentBoard.title = title
    },
    setCurrentBoard(state, board) {
      state.currentBoard = board
    },
    setCurrBoard(state, { currBoard }) {
      if (currBoard === undefined) return
      state.currBoard = currBoard
    },
    addBoard(state, { board }) {
      state.boards.push(board)
      state.savedBoard = board
    },
    updateBoard(state, { board }) {
      const idx = state.boards.findIndex((c) => c._id === board._id)
      state.boards.splice(idx, 1, board)
      state.currentBoard = board
    },
    removeBoard(state, { boardId }) {
      state.boards = state.boards.filter((board) => board._id !== boardId)
    },
    addGroup(state, { boardId, group }) {
      const boardIndex = state.boards.findIndex(
        (board) => board._id === boardId
      )
      if (boardIndex === -1) return
      const newGroups = [...state.boards[boardIndex].groups, group]
      const newBoard = { ...state.boards[boardIndex], groups: newGroups }
      state.boards.splice(boardIndex, 1, newBoard)

      if (state.currentBoard._id === boardId) {
        state.currentBoard = newBoard
      }
    },
    removeGroup(state, { boardId, groupId }) {
      const boardIndex = state.boards.findIndex(
        (board) => board._id === boardId
      )
      if (boardIndex === -1) return
      const newGroups = state.boards[boardIndex].groups.filter(
        (group) => group.id !== groupId
      )
      const newBoard = { ...state.boards[boardIndex], groups: newGroups }
      state.boards.splice(boardIndex, 1, newBoard)

      if (state.currentBoard._id === boardId) {
        state.currentBoard = newBoard
      }
    },
    setCurrTask(state, { task }) {
      state.currentTask = task
    },
    saveBoardToRecent(state, { board }) {
      if (state.recentBoards.length >= 3) {
        state.recentBoards.splice(0, 1, board)
      } else {
        state.recentBoards.push(board)
      }
    },
    setTask(state, { groupId, task }) {
      if (state.currentGroup) groupId = state.currentGroup._id
      const groupIdx = state.currentBoard.groups.findIndex(
        (group) => group._id === groupId
      )
      if (task._id) {
        const taskIdx = state.currentBoard.groups[groupIdx].tasks.findIndex(
          (currTask) => currTask._id === task._id
        )
        state.currentBoard.groups[groupIdx].tasks.splice(taskIdx, 1, task)
      } else {
        task._id = utilService.makeId()
        state.currentBoard.groups[groupIdx].tasks.push(task)
      }
    },
    removeTask(state, { task }) {
      const taskIdx = state.currentBoard.groups[task.groupIdx].tasks.findIndex(
        (currTask) => currTask._id === task.taskId
      )
      state.currentBoard.groups[task.groupIdx].tasks.splice(taskIdx, 1)
    },
    setFilterBy(state, { filterBy }) {
      state.filterBy = filterBy
    },
    addTaskToGroup(state, { groupId, task, board, openedFromModal }) {
      const group = board.groups.find((group) => group.id === groupId)
      if (!group) throw new Error('Group not found')

      if (openedFromModal) {
        group.tasks.unshift(task)
      } else {
        group.tasks.push(task)
      }
    },
    removeTask(state, { group, index }) {
      group.tasks = [
        ...group.tasks.slice(0, index),
        ...group.tasks.slice(index + 1),
      ]
    },
    addTask(state, { group, task, index }) {
      group.tasks.splice(index, 0, task)
    },
    toggleTaskStatus(state, payload) {
      const { groupIndex, taskIndex, board } = payload
      const task = board.groups[groupIndex].tasks[taskIndex]
      task.status = task.status === 'done' ? 'in-progress' : 'done'
    },
    toggleLabelsVisibility(state) {
      state.areLabelsVisible = !state.areLabelsVisible
    },
    setBoardBgClr(state, { color }) {
      state.currentBoard.style.backgroundImage = ''
      state.currentBoard.style.backgroundColor = color
    },
    setBoardBgGrad(state, { gradient }) {
      state.currentBoard.style.backgroundColor = ''
      state.currentBoard.style.backgroundImage = `url(${gradient})`
    },
    addActivity(state, { newActivity }) {
      state.currentBoard.activities.push(newActivity)
    },
    saveTaskTitle(state, { task, groupId }) {
      const group = state.currentBoard.groups.find(
        (group) => group.id === groupId
      )
      if (group) {
        const idx = group.tasks.findIndex((t) => t.id === task.id)
        if (idx !== -1) {
          group.tasks.splice(idx, 1, task)
        }
      }
    },
  },

  actions: {
    async loadBoards({ commit }) {
      try {
        const boards = await boardService.query()
        commit({ type: 'setBoards', boards })
      } catch (err) {
        console.log('boardStore: Error in loadBoards', err)
        throw err
      }
    },
    async addBoard({ commit }, { board }) {
      try {
        board = await boardService.save(board)

        commit(getActionAddBoard(board))
        return board
      } catch (err) {
        console.log('boardStore: Error in addBoard', err)
        throw err
      }
    },
    async loadCurrentBoard({ commit }, { boardId }) {
      try {
        commit('setLoadingBoard', true)
        const board = await boardService.getById(boardId)
        commit('setCurrentBoard', board)
        commit('setLoadingBoard', false)
      } catch (err) {
        throw err
      }
    },
    async updateBoard({ commit }, { board }) {
      try {
        const updateBoard = await boardService.save(board)
        commit(getActionUpdateBoard(updateBoard))
        return updateBoard
      } catch (err) {
        console.log('boardStore: Error in updateBoard', err)
        throw err
      }
    },
    async updateTask({ commit, state, dispatch }, { taskDetails }) {
      try {
        let board = state.boards.find(
          (board) => board._id === taskDetails.boardId
        )
        const boardCopy = JSON.parse(JSON.stringify(board))

        let group = boardCopy.groups.find(
          (group) => taskDetails.groupId === group.id
        )
        let groupIdx = boardCopy.groups.findIndex(
          (group) => taskDetails.groupId === group.id
        )

        const taskIdx = group.tasks.findIndex(
          (task) => task.id === taskDetails.task.id
        )

        let updateGroup = group.tasks.splice(taskIdx, 1, taskDetails.task)

        boardCopy.groups.splice(groupIdx, 1, updateGroup)

        dispatch({ type: 'updateBoard', board: boardCopy })

        // commit({ type: 'updateBoard', board: boardCopy })

        // const savedBoard = await boardService.save(boardCopy)
        // console.log(savedBoard);

        // return savedBoard
        return taskDetails.task
      } catch (err) {
        console.log('boardStore: Error in updateTask', err)
        throw err
      }
    },
    async removeBoard(context, { boardId }) {
      try {
        await boardService.remove(boardId)
        context.commit(getActionRemoveBoard(boardId))
      } catch (err) {
        console.log('boardStore: Error in removeBoard', err)
        throw err
      }
    },
    async addBoardMsg(context, { boardId, txt }) {
      try {
        const msg = await boardService.addBoardMsg(boardId, txt)
        context.commit({ type: 'addBoardMsg', boardId, msg })
      } catch (err) {
        console.log('boardStore: Error in addBoardMsg', err)
        throw err
      }
    },
    async addGroup({ commit, state, dispatch }, { group }) {
      try {
        if (!state.currentBoard) throw new Error('Current board not found')

        const newGroups = [...state.currentBoard.groups, group]

        const updatedBoard = { ...state.currentBoard, groups: newGroups }

        const savedBoard = await boardService.save(updatedBoard)

        commit({ type: 'addGroup', boardId: savedBoard._id, group })

        dispatch('addActivity', {
          activity: `Added ${group.title} to this board`,
        })
      } catch (err) {
        console.log('boardStore: Error in addGroup', err)
        throw err
      }
    },
    async removeGroup({ commit, state, dispatch }, { groupId }) {
      try {
        if (!state.currentBoard) throw new Error('Current board not found')

        const groupIndex = state.currentBoard.groups.findIndex(
          (group) => group.id === groupId
        )
        if (groupIndex === -1) throw new Error('Group not found')

        const updatedBoard = {
          ...state.currentBoard,
          groups: state.currentBoard.groups.filter(
            (group) => group.id !== groupId
          ),
        }

        const savedBoard = await boardService.save(updatedBoard)

        commit({ type: 'removeGroup', boardId: savedBoard._id, groupId })
        dispatch('addActivity', { activity: `Removed ${groupId}` })
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    async addBoardToRecent({ commit, state }, { boardId }) {
      try {
        const isBoardInRecent = state.recentBoards.some(
          (board) => board._id === boardId
        )
        if (isBoardInRecent) return

        const board = await boardService.getById(boardId)
        commit({ type: 'saveBoardToRecent', board })
        console.log('happen')
      } catch (err) {
        console.log(err)
      }
    },
    async setTask({ commit, state, dispatch }, { groupId, task }) {
      try {
        commit({ type: 'setTask', groupId, task })
        dispatch({ type: 'saveBoard', board: state.currentBoard })
      } catch (err) {
        console.log(err)
      }
    },
    async addTask(
      { commit, state, dispatch },
      { groupId, task, board, openedFromModal }
    ) {
      try {
        const group = state.currentBoard.groups.find(
          (group) => group.id === groupId
        )

        const newTask = boardService.getEmptyTask(task.title)
        commit('addTaskToGroup', {
          groupId,
          task: newTask,
          board,
          openedFromModal,
        })
        const savedBoard = await boardService.save(board)
        commit({ type: 'updateBoard', board: savedBoard })

        dispatch('addActivity', { activity: 'added Task to', group })
        dispatch({ type: 'loadBoards' })
      } catch (err) {
        console.error('Error in addTask', err)
        throw err
      }
    },
    async saveGroups({ commit, state, dispatch }, { groups, currBoard }) {
      // TODO : Optimistic implemntation of dnd, need to find a better solution
      // the size of the board object cause the dnd to look bugy
      // probably need to save not the whole board but only groups
      const prevBoard = JSON.parse(JSON.stringify(state.currentBoard))

      try {
        currBoard = JSON.parse(JSON.stringify(currBoard))
        currBoard.groups = groups
        commit({ type: 'updateBoard', board: currBoard })

        const savedBoard = await boardService.save(currBoard)
      } catch (err) {
        commit({ type: 'updateBoard', board: prevBoard }) // TODO: Check if needed or causing bugs
        throw err
      }
    },
    async saveBoard({ commit, dispatch }, { board }) {
      try {
        const savedBoard = await boardService.save(board)
        commit({ type: 'updateBoard', board: savedBoard })
        dispatch({ type: 'loadBoards' })
      } catch (err) {
        console.log('Cannot save board', err)
        throw err
      }
    },
    async toggleStatus({ commit, state, dispatch }, { groupId, task }) {
      try {
        let board
        let groupIndex = -1

        for (let i = 0; i < state.boards.length; i++) {
          const index = state.boards[i].groups.findIndex(
            (group) => group.id === groupId
          )
          if (index !== -1) {
            board = state.boards[i]
            groupIndex = index
            break
          }
        }
        const taskIndex = board.groups[groupIndex].tasks.findIndex(
          (t) => t.id === task.id
        )
        commit('toggleTaskStatus', { groupIndex, taskIndex, board })
        const savedBoard = await boardService.save(board)
        commit({ type: 'updateBoard', board: savedBoard })
        dispatch('addActivity', { activity: 'marked the due date on', task })
        dispatch({ type: 'loadBoards' })
      } catch (error) {
        console.error(error.message)
        throw err
      }
    },
    async duplicateGroup({ state, commit, dispatch }, { groupId }) {
      try {
        const currBoard = JSON.parse(JSON.stringify(state.currentBoard))
        const groupToDuplicate = currBoard.groups.find(
          (group) => group.id === groupId
        )
        if (!groupToDuplicate) throw new Error('Group not found')

        const newGroupId = utilService.makeId()

        let duplicatedGroup = { ...groupToDuplicate, id: newGroupId }

        duplicatedGroup.tasks = duplicatedGroup.tasks.map((task) => ({
          ...task,
          id: utilService.makeId(),
          groupId: newGroupId,
        }))

        currBoard.groups.push(duplicatedGroup)

        const savedBoard = await boardService.save(currBoard)
        commit({ type: 'updateBoard', board: savedBoard })
        dispatch('addActivity', {
          activity: 'duplicated list',
          duplicatedGroup,
        })
        dispatch({ type: 'loadBoards' })
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    async watchGroup({ state, commit, dispatch }, { groupId }) {
      try {
        const currBoard = JSON.parse(JSON.stringify(state.currentBoard))
        const groupToWatch = currBoard.groups.find(
          (group) => group.id === groupId
        )
        if (!groupToWatch) throw new Error('Group not found')

        groupToWatch.isWatched = !groupToWatch.isWatched

        const savedBoard = await boardService.save(currBoard)
        commit({ type: 'updateBoard', board: savedBoard })
        dispatch({ type: 'loadBoards' })
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    async changeBoardBgClr({ state, commit }, payload) {
      try {
        commit('setBoardBgClr', payload)
        await boardService.save(state.currentBoard)
      } catch (err) {}
    },
    async changeBoardBgGrad({ state, commit }, payload) {
      try {
        commit('setBoardBgGrad', payload)
        await boardService.save(state.currentBoard)
      } catch (err) {
        throw err
      }
    },
    async addActivity({ commit, state }, { activity, task = {}, group = {} }) {
      try {
        const newActivity = boardService.getEmptyActivity(activity, task, group)
        commit('addActivity', { newActivity })

        await boardService.save(state.currentBoard)
      } catch (err) {
        throw err
      }
    },
    async saveTitle({ commit, state, dispatch }, title) {
      try {
        // commit('saveTitle', title)
        console.log('title', title)
        // await boardService.save(state.currentBoard)
        dispatch('addActivity', { activity: 'Changed board title' })
      } catch (err) {
        throw err
      }
    },
    async saveTaskTitle({ commit, state, dispatch }, { task, groupId }) {
      try {
        commit('saveTaskTitle', { task, groupId })
        await boardService.save(state.currentBoard)
        dispatch('addActivity', { activity: 'Changed title to task', task })
      } catch (err) {
        throw err
      }
    },
  },

  getters: {
    getFilteredGroups:
      (state) =>
      (dueDateFilters = {}, boardId) => {
        let currentTime = new Date().getTime()
        let twentyFourHours = 24 * 60 * 60 * 1000

        const board = state.boards.find((board) => board._id === boardId)
        if (!board) {
          console.error('No board found with ID:', boardId)
          return []
        }

        let isFilterSelected = Object.values(dueDateFilters).some(
          (value) => value === true
        )

        if (!isFilterSelected) {
          return [...board.groups]
        }

        return board.groups.map((group) => {
          return {
            ...group,
            tasks: group.tasks.filter((t) => {
              if (t.status === 'done') {
                return false
              }

              let matchesDueDateFilters = false

              if (dueDateFilters.noDate) {
                matchesDueDateFilters = !t.dueDate
              } else if (dueDateFilters.overdue) {
                matchesDueDateFilters = t.dueDate && currentTime - t.dueDate > 0
              } else if (dueDateFilters.dueInNextDay) {
                let startOfNextDay = currentTime
                let endOfNextDay = currentTime + twentyFourHours
                matchesDueDateFilters =
                  t.dueDate >= startOfNextDay && t.dueDate <= endOfNextDay
              }

              return matchesDueDateFilters
            }),
          }
        })
      },
    boards({ boards }) {
      return boards
    },
    starredBoards({ boards }) {
      return boards.filter((board) => board.isStarred)
    },
    filteredBoards({ boards, filterBy }) {
      const byName = new RegExp(filterBy, 'i')
      return boards.filter((board) => byName.test(board.title))
    },
    recentBoards({ boards }) {
      return boards
        .filter((board) => board.isRecent)
        .sort((a, b) => a.recentAt - b.recentAt)
        .slice(-4)
    },
    fullRecentBoards({ boards }) {
      return boards
        .filter((board) => board.isRecent)
        .sort((a, b) => a.recentAt - b.recentAt)
        .slice(-8)
    },
    savedBoard({ savedBoard }) {
      return savedBoard
    },
    getGroupsByBoardId: (state) => (boardId) => {
      const board = state.boards.find((board) => board._id === boardId)
      return board ? board.groups : []
    },
    getCurrenBoard({ currentBoard }) {
      const board = currentBoard
      return board
    },
    getCurrBoard({ currentBoard }) {
      const board = currentBoard
      return board
    },
    getCurrTask({ currentTask }) {
      return currentTask
    },
    cmpsOrder({ cmpsOrder }) {
      return cmpsOrder
    },
    getLabelById: (state) => (id) => {
      const board = state.currentBoard
      if (board && board.labels) {
        return board.labels.find((label) => label.id === id)
      }
      return null
    },
    areLabelsVisible: (state) => state.areLabelsVisible,
    isLoadingBoard(state) {
      return state.loadingBoard
    },
    changeClr({ changeClr }) {
      return changeClr
    },
  },
}
