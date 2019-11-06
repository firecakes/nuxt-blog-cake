<template>
  <section>
    <!-- search inputs -->
    <div class="flex">
      <div>
        <div class="flex">
          <p class="width-150 no-space text"> Filter by tag: </p> 
          <select class="black-text width-300" v-model="tagFilterInput">
            <option value=""></option>
            <option v-for="tag in tags">
              {{ tag }}
            </option>
          </select>
        </div>
        <div class="flex">
          <p class="width-150 no-space text"> Filter by collection: </p> 
          <select class="black-text width-300" v-model="collectionFilterInput">0
            <option value=""></option>
            <option v-for="collection in collections">
              {{ collection.name }}
            </option>
          </select>
        </div>
      </div>
      <button class="pure-button left-margin" @click="searchHandler(tagFilterInput, collectionFilterInput)">
        Search
      </button>
    </div>
  </section>
</template>

<script>
export default {
  name: "PostSearch",
  props: {
    searchHandler: Function
  },
  created: async function () {
    const responseTags = await this.$axios.$get('/api/search/tag').catch(err => false)
    if (!responseTags) {
      return console.error("Unable to retrieve tags!")
    }
    const responseColls = await this.$axios.$get('/api/search/collection').catch(err => false)
    if (!responseColls) {
      return console.error("Unable to retrieve collections!")
    }
    this.tags = responseTags.tags
    this.collections = responseColls.collections
  },
  data: function () {
    return {
      tags: [],
      collections: [],
      tagFilterInput: "",
      collectionFilterInput: "",
    }
  }
}
</script>

<style scoped>
  .space {
    margin-left: 20px;
  }
  .width-150 {
    width: 150px;
  }
  .width-300 {
    width: 300px;
  }
  .no-space {
    margin: 0px;
  }
  .left-margin {
    margin-left: 8px;
  }
  .text {
    display: flex;
    align-items: center;
  }

  @media only screen and (max-width: 1000px) {
    .width-150 {
      width: 100px;
      margin: 0px;
    }
    .width-300 {
      width: 150px;
      margin: 0px;
    }
    .text {
      font-size: 10px;
    }
  }

  @media only screen and (max-width: 600px) {
    .width-150 {
      width: 40px;
      margin: 0px;
    }
    .width-300 {
      width: 120px;
      margin: 0px;
    }
    .text {
      font-size: 7px;
    }
  }
</style>
