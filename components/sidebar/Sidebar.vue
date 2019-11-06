<template>
  <div class="main">
    <div class="title">
      <Title></Title>
    </div>
    <div class="contents">     
      <div class="sidebar-parent">
        <a v-for="elem in paginatedElements" class="hide-link sidebar-link" :href="elem.link">
          <img class="image" :src="elem.image"/>
          <p class="text">{{elem.text}}</p>
        </a>
        <!-- pagination buttons -->
        <div class="half" v-if="!isPaginated.pageLeft"></div>
        <button class="pure-button half" 
          v-if="isPaginated.pageLeft"
          @click="pageLeft">
          <p class="button-text">Previous</p>
        </button>
        <div class="half" v-if="!isPaginated.pageRight"></div>
        <button class="pure-button half" 
          v-if="isPaginated.pageRight"
          @click="pageRight">
          <p class="button-text">Next</p>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Title from './Title.vue'

export default {
  components: {
    Title
  },
  computed: {
    paginatedElements: function () {
      return this.sidebarElements.slice(this.currentIndex, this.currentIndex + this.maxElements)
    },
    isPaginated: function () {
      return {
        pageLeft: this.currentIndex !== 0,
        pageRight: this.currentIndex + this.maxElements < this.sidebarElements.length,
      }
    }
  },
  methods: {
    pageLeft: function () {
      let newIndex = this.currentIndex - this.maxElements
      newIndex = Math.max(0, newIndex)
      this.currentIndex = newIndex
    },
    pageRight: function () {
      let newIndex = this.currentIndex + this.maxElements
      newIndex = Math.min(this.sidebarElements.length - this.maxElements, newIndex)
      newIndex = Math.max(0, newIndex)
      this.currentIndex = newIndex
    }
  },
  data: function () {
    return {
      currentIndex: 0,
      maxElements: 6,
      sidebarElements: [{
        text: "Archive",
        image: "",
        link: "/archive"
      },{
        text: "Source Code",
        image: "/icons/GitHub-Mark-120px-plus.png",
        link: "https://github.com/firecakes/nuxt-blog-cake"
      },{
        text: "Feed",
        image: "/icons/feed-icon.svg",
        link: "/feed"
      }],
    }
  }
}
</script>

<style scoped>
  .main {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .title {
    display: flex;
  }
  .contents {
    display: flex;
    overflow: auto;
  }
  .sidebar-parent {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
  }
  .sidebar-link {
    display: flex;
    flex-direction: column;
    width: 50%;
    height: 150px;
  }
  .half {
    width: 50%;
  }
  .image {
    width: 100%;
    height: 100%;
    max-height: 120px;
    object-fit: contain;
  }
  .text {
    display: flex;
    height: 30px;
    margin: 0px;
    justify-content: center;
  }
  .button-text {
    margin: 10px;
  }

  @media only screen and (max-width: 1000px) {
    .sidebar-link {
      width: 100%;
    }
    .button-text {
      font-size: 12px;
    }
    button {
      padding-left: 0px;
      padding-right: 0px;
    }
  }

  @media only screen and (max-width: 600px) {
    .image {
      max-height: 60px;
    }
    .sidebar-link {
      height: 75px;
    }
    .text {
      font-size: 10px;
    }
    .button-text {
      margin: 2px;
      font-size: 7px;
    }
    button {
      padding-left: 0px;
      padding-right: 0px;
    }
  }
</style>
