<template>
  <header class="app-header" v-click-outside="closeModals">
    <nav :class="{ 'header-changed': changeClr }">
      <div class="left">
        <RouterLink to="/board">
          <div class="logo">
            <i class="fa fa-trello"></i>
            <h2>Trio</h2>
          </div>
        </RouterLink>

        <div class="recent">
          <div
            class="header-btn"
            @click="toggleRecentModal"
            :class="{ checked: isPickerModalRecent }"
          >
            Recent
            <i class="fa-solid fa-chevron-down"></i>
          </div>
          <RecentPicker v-if="isPickerModalRecent" />
        </div>

        <div class="starred">
          <div
            class="header-btn"
            @click="toggleStarredModal"
            :class="{ checked: isPickerModalStarred }"
          >
            Starred
            <i class="fa-solid fa-chevron-down"></i>
          </div>
          <StarredPicker v-if="isPickerModalStarred" @star="starBoard" />
        </div>

        <!-- Display only in mobile -->
        <div class="middle">
          <div class="more">
            <p>More</p>
            <i class="fa-solid fa-chevron-down"></i>
          </div>

          <div class="plus-btn">
            <span
              @click="isAddBoardMobile = !isAddBoardMobile"
              class="plus-icon"
            ></span>
            <div class="mobile-add-board">
              <AddBoard
                v-if="isAddBoardMobile"
                @save="saveBoard"
                v-click-outside="closeMobileModal"
                @closeModal="closeMobileModal"
              />
            </div>
          </div>
        </div>
        <!-- ---------------------- -->

        <div
          class="create-btn"
          :style="{ backgroundColor: isAddBoardDesktop ? '#e9f3ff' : '' }"
        >
          <button
            @click="toggleAddBordDestktop"
            :style="{ color: isAddBoardDesktop ? '#0c66e4' : '' }"
          >
            Create
          </button>

          <div class="header-add-board">
            <AddBoard
              v-if="isAddBoardDesktop"
              @save="saveBoard"
              @closeModal="toggleAddBordDestktop"
              v-click-outside="toggleAddBordDestktop"
            />
          </div>
        </div>
      </div>

      <div class="right">
        <div class="filter-container">
          <BoardFilter @filterByTxt="filterByTxt" />
        </div>

        <div class="notifiction-icon" @click="readNotifications">
          <i class="fa-regular fa-bell fa-lg"></i>
          <div class="notifiction-dot" v-if="unreadNotification">
            <p>{{ unreadNotification }}</p>
          </div>
        </div>

        <div class="user-container" @click="isAccountOpen = !isAccountOpen">
          <span class="user" :class="{ 'user-changed': changeClr }">
            <p>{{ loggedInUser }}</p>
            <Account v-if="isAccountOpen" />
          </span>
        </div>
      </div>
    </nav>
  </header>

  <div class="notification-container">
    <Notification @closeNotification="closeNotification" v-if="isNotifiction" />
  </div>
</template>

<script>
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service'
import AddBoard from '../cmps/AddBoard.vue'
import BoardFilter from '../cmps/BoardFilter.vue'
import RecentPicker from '../cmps/RecentPicker.vue'
import StarredPicker from '../cmps/StarredPicker.vue'
import Notification from '../cmps/Notification.vue'
import Account from '../cmps/Account.vue'

import { clickOutsideDirective } from '../directives/index.js'

import { defineComponent } from 'vue'
import Popper from 'vue3-popper'

export default {
  data() {
    return {
      isPickerModalStarred: false,
      isPickerModalRecent: false,
      isAddBoardMobile: false,
      isAddBoardDesktop: false,
      isNotifiction: false,
      isAccountOpen: false,
    }
  },

  methods: {
    closeMobileModal() {
      this.isAddBoardMobile = false
    },
    async readNotifications() {
      try {
        this.isNotifiction = !this.isNotifiction

        if (!this.isNotifiction) return
        await this.$store.dispatch({ type: 'markNotificationsAsRead' })
      } catch (error) {
        console.log(error)
      }
    },
    closeNotification() {
      this.isNotifiction = false
    },
    closeAddBoardTop() {
      this.isAddBoardTop = false
    },
    toggleAddBordBottom() {
      this.closeModals()
      this.isAddBoardBottom = !this.isAddBoardBottom
    },
    toggleAddBordDestktop() {
      this.closeModals()
      this.isAddBoardDesktop = !this.isAddBoardDesktop
    },
    toggleRecentModal() {
      this.isPickerModalStarred = false
      this.isAddBoardDesktop = false
      this.isPickerModalRecent
        ? this.closeModals()
        : (this.isPickerModalRecent = true)
    },
    toggleStarredModal() {
      this.isPickerModalRecent = false
      this.isAddBoardDesktop = false
      this.isPickerModalStarred
        ? this.closeModals()
        : (this.isPickerModalStarred = true)
    },
    isUnreadNotifiction() {
      return this.fullUser.notifications.some(
        (notification) => !notification.isRead
      )
    },
    async saveBoard(board) {
      try {
        await this.$store.dispatch({
          type: 'addBoard',
          board,
        })
        this.isAddBoardDesktop = false
        this.closeModal()
        this.$router.push('/details/' + this.savedBoard._id)
      } catch (err) {
        console.log(err)
      }
    },
    async starBoard(board) {
      try {
        await this.$store.dispatch({ type: 'updateBoard', board })
      } catch (err) {
        console.log(err)
        showErrorMsg('Cant star board')
      }
    },
    closeModals() {
      this.isPickerModalStarred = false
      this.isPickerModalRecent = false
    },
    filterByTxt(filterBy) {
      this.$store.commit({ type: 'setFilterBy', filterBy })
    },
  },

  computed: {
    changeClr() {
      return this.$store.state.boardStore.changeClr
    },
    unreadNotification() {
      const loggedinUser = this.$store.getters.loggedinUser
      const unreadNotifications = loggedinUser?.notifications.filter(
        (not) => !not.isRead
      )
      return unreadNotifications ? unreadNotifications.length : 0
    },
    loggedInUser() {
      const user = this.$store.getters.loggedinUser?.fullname
      if (!user) return ''
      const names = user.split(' ')
      if (names.length === 1) {
        return names[0].charAt(0)
      } else {
        return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`
      }
    },
    fullUser() {
      return this.$store.getters.fullUser
    },
    userNotifications() {
      return this.fullUser?.notifications
    },
    savedBoard() {
      return this.$store.getters.savedBoard
    },
  },

  directives: {
    clickOutside: clickOutsideDirective,
  },

  components: {
    AddBoard,
    BoardFilter,
    Popper,
    defineComponent,
    RecentPicker,
    StarredPicker,
    Notification,
    Account,
  },
}
</script>
