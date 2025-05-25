<template>
  <div>
    <header
      :style="headerStyle"
      class="board-header text-item"
      v-if="board"
      ref="header"
    >
      <nav class="nav-bar text-item">
        <div class="title-container">
          <div class="title-tool-tip text-item">
            <h1
              v-if="!isEditingTitle"
              @click="handleTitleClick"
              class="board-title text-item"
              ref="title"
            >
              {{ boardTitle }}
            </h1>

            <input
              ref="myInput"
              v-else
              type="text"
              class="text-item"
              v-model="boardTitle"
              v-click-outside="handleOutsideClick"
              :style="{ width: `${inputWidth}px` }"
              id="myInput"
              @focus="handleFocus"
            />

            <span
              @click="toggeleIsStarred"
              :class="icon"
              class="star-icon text-item"
            ></span>
          </div>
        </div>
        <div class="navbar-container">
          <div class="tool-tip-menu"></div>
          <div class="tool-tip text-item">
            <!-- Filter Button - Filter not fully ready so it will not show for now -->
            <!-- <button
              class="filter text-item"
              @click="toggleFilter"
              ref="filterButton"
            >
              <span class="filter-icon text-item">
                <svg
                  class="text-item"
                  width="16"
                  height="16"
                  role="presentation"
                  focusable="false"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M4.61799 6C3.87461 6 3.39111 6.78231 3.72356 7.44721L3.99996 8H20L20.2763 7.44721C20.6088 6.78231 20.1253 6 19.3819 6H4.61799ZM10.8618 17.7236C10.9465 17.893 11.1196 18 11.309 18H12.6909C12.8803 18 13.0535 17.893 13.1382 17.7236L14 16H9.99996L10.8618 17.7236ZM17 13H6.99996L5.99996 11H18L17 13Z"
                    fill="#fff"
                  ></path>
                </svg>
              </span>
              <span class="filter-text">Filter</span>
            </button> -->

            <span class="line text-item"></span>

            <div class="members text-item">
              <div
                class="member text-item"
                v-for="member in board.members"
                :key="member.id"
              >
                <img
                  :src="member.imgUrl"
                  :alt="member.fullname"
                  class="member-image"
                />
              </div>
            </div>

            <span class="menu-icon text-item" @click="toggleMenu"></span>
          </div>
        </div>
      </nav>
    </header>

    <BoardMenu
      :menuOpen="menuOpen"
      :colorOption="board.backGround"
      :styleOption="board.style"
      :boardActivity="board.activities"
      @closeMenu="menuOpen = false"
    />

    <GroupFilter
      class="filter"
      ref="filterMenu"
      v-show="isFilterOpen"
      :labels="board.labels"
      :members="board.members"
      @searchTermChanged="handleSearchTermChange"
      @checkboxChanged="handleCheckboxChangeEvent"
    />
  </div>
</template>

<script>
import { clickOutsideDirective } from '../directives/index.js'
import { Draggable, Container } from 'vue3-smooth-dnd'
import { FastAverageColor } from 'fast-average-color'
import { defineComponent } from 'vue'

import BoardMenu from './BoardMenu.vue'
import GroupFilter from './GroupFilter.vue'

export default {
  props: {
    board: {
      type: Object,
    },
  },
  directives: {
    clickOutside: clickOutsideDirective,
  },
  data() {
    return {
      isEditingTitle: false,
      boardTitle: this.board.title,
      inputWidth: 0,
      isStarred: false,
      menuOpen: false,
      darkClr: '#172B4D',
      LightClr: '#FFFFFF',
      isFilterOpen: false,
      popperInstance: null,
      filterStyle: {},
    }
  },
  created() {
    this.inputWidth = this.calculateInputWidth(this.boardTitle)
    if (this.board?.isStarred) this.isStarred = this.board.isStarred
  },
  mounted() {
    this.calculateAndApplyColor()
    // this.setPosition()
    window.addEventListener('resize', this.setPosition)
  },
  methods: {
    closeFilter() {
      this.isFilterOpen = false
    },
    handleSearchTermChange(searchTerm) {
      this.$emit('searchTermChanged', searchTerm)
    },
    handleCheckboxChangeEvent(checkboxEvent) {
      this.$emit('checkboxChanged', checkboxEvent)
    },
    setPosition() {
      // const button = this.$refs.filterButton
      // const rect = button.getBoundingClientRect()
      // const maxHeight = window.innerHeight - rect.bottom - 20
      // this.filterStyle = {
      //   top: `${rect.bottom}px`,
      //   left: `${rect.left}px`,
      //   maxHeight: `${maxHeight}px`,
      // }
    },
    toggleFilter() {
      this.isFilterOpen = !this.isFilterOpen
    },
    handleFocus(event) {
      this.$nextTick(() => event.target.select())
    },
    handleTitleClick() {
      this.isEditingTitle = true
      this.$nextTick(() => {
        this.$refs.myInput.focus()
      })
    },
    async calculateAndApplyColor() {
      const imageUrl = this.board.style.backgroundImage
        .slice(4, -1)
        .replace(/"/g, '')
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.src = imageUrl
      img.onload = async () => {
        const fac = new FastAverageColor()
        const color = await fac.getColorAsync(img)

        let backgroundColor = color.rgb
          .replace(')', ', 0.2)')
          .replace('rgb', 'rgba')

        // Extract the r, g, b values to check darkness
        const [r, g, b] = backgroundColor.match(/\d+/g).map(Number)
        const brightness = (r * 299 + g * 587 + b * 114) / 1000

        // If the color is dark, set to specific value
        if (brightness < 128) {
          backgroundColor = '#0000003d'
        }

        this.$refs.header.style.backgroundColor = backgroundColor
        this.$refs.header.style.backdropFilter = 'blur(5px)'

        // Determine text color based on background
        const textColor = color.isLight ? this.darkClr : this.LightClr
        const textItems = document.querySelectorAll('.text-item')
        textItems.forEach((item) => {
          item.style.color = textColor
        })
        const svgItems = document.querySelectorAll('.text-item svg path')
        svgItems.forEach((svg) => {
          svg.setAttribute('fill', textColor)
        })
      }
    },
    handleOutsideClick() {
      this.isEditingTitle = false
      this.saveTitle()
    },
    toggeleIsStarred() {
      this.isStarred = !this.isStarred
      this.$store.dispatch({
        type: 'updateBoard',
        board: { ...this.board, isStarred: this.isStarred },
      })
    },
    saveTitle() {
      this.$store.dispatch({
        type: 'updateBoard',
        board: { ...this.board, title: this.boardTitle },
      })
    },
    calculateInputWidth(text) {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      context.font = '20px Arial'
      const metrics = context.measureText(text + 100)
      return metrics.width
    },
    toggleMenu() {
      this.menuOpen = !this.menuOpen
    },
  },
  computed: {
    icon() {
      return this.isStarred ? 'full-star' : 'star'
    },
    headerStyle() {
      return this.menuOpen ? { width: '1600px' } : {}
    },
  },
  watch: {
    boardTitle(newValue) {
      this.inputWidth = this.calculateInputWidth(newValue)
    },
    'board.style.backgroundImage': {
      immediate: true,
      handler() {
        this.calculateAndApplyColor()
      },
    },
  },
  components: {
    BoardMenu,
    Draggable,
    Container,
    GroupFilter,
    defineComponent,
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.setPosition)
  },
}
</script>

<style scoped>
.filter-text {
  margin-inline-start: 0.6em;
  vertical-align: text-bottom;
  align-self: center;
}

@media only screen and (max-width: 600px) {
  .filter-text {
    display: none;
  }

  .members {
    display: none;
  }

  h1.board-title {
    font-size: 16px !important;
  }
}
</style>
