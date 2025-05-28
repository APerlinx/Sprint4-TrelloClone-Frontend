<template>
  <h6>Size</h6>
  <div class="layout">
    <div
      class="layout1"
      @click="setLayout(false)"
      :style="{
        background: hasCover,
        'background-size': 'cover',
        'background-position': 'center',
      }"
    >
      <div class="bottom-section">
        <div
          class="line1"
          :style="{ background: hasCover ? '#ececec' : '' }"
        ></div>
        <div
          class="line2"
          :style="{ background: hasCover ? '#ececec' : '' }"
        ></div>
        <div class="bottom-line">
          <div
            class="line3"
            :style="{ background: hasCover ? '#ececec' : '' }"
          ></div>
          <div
            class="line3"
            :style="{ background: hasCover ? '#ececec' : '' }"
          ></div>
          <div
            class="circle"
            :style="{ background: hasCover ? '#ececec' : '' }"
          ></div>
        </div>
      </div>
    </div>

    <div
      class="layout2"
      @click="setLayout(true)"
      :style="{
        background: hasCover,
        'background-size': 'cover',
        'background-position': 'center',
      }"
    >
      <div class="div"></div>
      <div class="bottom-section">
        <div
          class="line4"
          :style="{ background: hasCover ? 'white' : '' }"
        ></div>
        <div
          class="line5"
          :style="{ background: hasCover ? 'white' : '' }"
        ></div>
      </div>
    </div>
  </div>

  <div v-if="isCover" class="remove-cover">
    <div
      @click=";(isCover = false), (coverToEdit.color = ''), (lastPick = '')"
      role="button"
    >
      Remove cover
    </div>
  </div>

  <h6 class="colors-title">Colors</h6>

  <section class="color-pallate-wide">
    <div
      v-for="(color, index) in colorOptions"
      :key="index"
      @click="setBgColor(color)"
      :class="colorClass[index]"
    ></div>
  </section>

  <div class="attachments">
    <h6>Attachment</h6>
    <ImgUploader @uploaded="onUploaded" />
  </div>

  <h6>Photos from unsplash</h6>

  <div class="img-pallate-wide">
    <div
      class="imgDiv"
      v-for="(img, index) in imgUrls"
      :key="index"
      @click="setBgImg(img)"
      :style="{
        background: `url(${img})`,
        'background-size': 'cover',
        'background-position': 'center',
      }"
    ></div>
  </div>

  <div class="search-container">
    <input
      class="img-input"
      type="text"
      v-model="query"
      placeholder="Search for photos..."
    />
  </div>
</template>

<script>
import ImgUploader from '../../cmps/ImgUploader.vue'
import debounce from 'lodash.debounce'

export default {
  props: {
    taskToEdit: Object,
  },
  created() {
    this.debouncedGetResult = debounce(this.fetchListOfPhotos, 1000)
    this.fetchListOfPhotos(this.query)
  },
  data() {
    return {
      coverToEdit: {
        color: '',
        img: '',
        isFull: false,
      },
      accesKey: 'MW3WlTYHFpvQZJwkJp360WPZFpDiNui3_1sdi4VjuhY',
      imgUrls: [],
      query: '',
      isCover: false,
      lastPick: '',
      colorOptions: [
        //green
        '#4dce97',

        //purple
        '#d574e9',

        //gold
        '#e1b304',

        //orange
        '#faa63d',

        //light-orange
        '#e4c296',

        //blue
        '#589dff',

        //tourq
        '#61c7d2',

        //pink
        '#f77cb2',

        //grey
        '#8591a2',

        //red
        '#e85151',
      ],
      colorClass: [
        'green',
        'purple',
        'gold',
        'orange',
        'light-orange',
        'blue',
        'tourq',
        'pink',
        'grey',
        'red',
      ],
    }
  },
  methods: {
    onUploaded(imgUrl) {
      this.coverToEdit.color = ''
      this.coverToEdit.img = imgUrl
      this.setCover()
    },
    async fetchListOfPhotos() {
      try {
        let query
        if (this.query) query = this.query

        const response = await fetch(
          `https://api.unsplash.com/search/photos?client_id=${this.accesKey}&query=${query}`
        )
        const json = await response.json()
        const imageUrls = json.results.map((img) => img.urls.regular)

        const res = imageUrls.splice(0, 6)
        this.imgUrls = res
      } catch (err) {
        console.log('Cannot load photos', err)
        throw err
      }
    },
    setBgColor(color) {
      if (this.lastPick === color && this.isCover) {
        this.isCover = false
        this.lastPick = ''
        this.coverToEdit.color = ''
      } else {
        this.coverToEdit.img = ''
        this.isCover = true
        this.lastPick = color
        this.coverToEdit.color = color
      }
      this.setCover()
    },
    setBgImg(img) {
      if (this.lastPick === img && this.isCover) {
        this.isCover = false
        this.lastPick = ''
        this.coverToEdit.img = ''
      } else {
        this.coverToEdit.color = ''
        this.isCover = true
        this.lastPick = img
        this.coverToEdit.img = img
      }
      this.setCover()
    },
    setLayout(state) {
      this.coverToEdit.isFull = state
      this.setCover()
    },
    setCover() {
      this.$emit('setCover', this.coverToEdit)
    },
  },

  computed: {
    hasCover() {
      if (this.taskToEdit.cover?.color) {
        return this.taskToEdit.cover?.color
      } else if (this.taskToEdit.cover?.img) {
        return `url(${this.taskToEdit.cover?.img})`
      } else {
        return ''
      }
    },
  },

  watch: {
    query() {
      this.debouncedGetResult()
    },
  },

  components: {
    ImgUploader,
  },
}
</script>
