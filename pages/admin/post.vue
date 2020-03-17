<template>
  <section class="main-padded">
    <TopMenu></TopMenu>

    <PublishPost></PublishPost>
    <hr>
    <p class="title-text">Move posts back to staging or rename a post</p>
    <p>WARNING: Clicking the red button removes the content from public view! It will be put back in the staging folder</p>

    <div class="top-margin">

      <div class="flex">
        <p class="text-input-caption"> Filter by title: </p> <input type="text" v-model="titleInput" class="black-text grow">
      </div>
      <div class="flex">
        <p class="text-input-caption"> Filter by tag name: </p> <input type="text" v-model="tagInput" class="black-text grow">
      </div>

      <PostList class="top-margin" :posts="filteredPosts" v-slot:default="slotProps">
        <!-- rename title -->
        <p class="text-default inline"> Rename the title here: </p> 
        <input type="text" v-model="renameTitleInput[slotProps.post.id]" class="black-text grow inline">
        <button class="pure-button" @click="renameTitle(slotProps.post.id, renameTitleInput[slotProps.post.id])">
          Rename Title
        </button>
        <br>
        <!-- remove post -->
        <button class="pure-button color-button-warning" @click="unlinkPost(slotProps.post.id)">
          Move back to staging
        </button>
      </PostList>

    </div>

  </section>
</template>

<script>
import TopMenu from "~/components/admin/TopMenu.vue"
import PostList from "~/components/admin/PostList.vue"
import PublishPost from "~/components/admin/PublishPost.vue"

export default {
  async asyncData (context) {
    const response = await context.$axios.get('/api/search/post/all')
      .catch(err => {
        return false;
      });
    if (!response) {
      return console.error("Unable to retrieve posts!")
    }
    return {posts: response.data.posts};
  },
  components: {
    TopMenu,
    PostList,
    PublishPost
  },
  computed: {
    filteredPosts: function () {
      //filter by tagInput, then by titleInput, if they contain anything
      //don't do exact matches
      return this.posts.filter(post => {
        if (post.tags.length === 0  && this.tagInput === "") return true
        return post.tags.find(t => t.includes(this.tagInput))
      }).filter(post => {
        return post.title.includes(this.titleInput)
      });
    }
  },
  methods: {
    unlinkPost: async function (id) {
      const resPromise = this.$axios.delete('/api/post/link', {
        data: {
          id: id
        }
      });
      if(!(await this.apiHelper(resPromise, "Error with removing a post!"))) return;
      //success! refresh the page
      this.$router.go(0);
    },
    renameTitle: async function (id, newTitle) {
      if (newTitle === undefined) newTitle = ""; //set to empty string at least
      const resPromise = this.$axios.$post('/api/post/rename', {
        id: id,
        newTitle: newTitle,
      });
      if(!(await this.apiHelper(resPromise, "Error with renaming a title!"))) return;
      //success! refresh the page
      this.$router.go(0);
    },
    apiHelper: async function (promise, errorMsg) {
      const response = await promise.catch(err => false);
      let successPath = response.data ? response.data : response
      if (!successPath.success) {
        if (successPath.error) console.error(successPath.error)
        else console.error(errorMsg)
        return false
      }
      return true
    }
  },
  data: function () {
    return {
      tagInput: "",
      titleInput: "",
      renameTitleInput: {}
    }
  }
}
</script>

<style scoped>
  .text-input-caption {
    width: 150px;
    margin: 0px;
  }
  .inline {
    display: inline-block;
  }
</style>
