<template>
  <section class="main-padded">
    <TopMenu></TopMenu>
    <p class="title-text">Tag Manager</p>
    <p>Tags are attached to posts which categorizes them and makes them become searchable.</p>
    <p>You can assign any number of tags to a single post</p>
    <hr>

    <!-- Create a tag -->
    <p class="title-text">Create a new tag</p>
    <p>All you need is a name</p>
    Tag name: <input type="text" v-model="tagCreateInput" class="black-text grow">
    <button class="pure-button" @click="createTag(tagCreateInput)">
      Create Tag
    </button>
    <hr>

    <!-- Rename a tag -->
    <p class="title-text">Rename an existing tag</p>
    <p>Select from the dropdown which one you want to rename</p>
    <p>Existing posts will no longer be searchable with the old tag name</p>
    From:
    <select class="black-text" v-model="tagRenameInputSelect">
      <option disabled value="">Select a tag</option>
      <option v-for="tag in tags">
        {{ tag }}
      </option>
    </select>
    To: 
    <input type="text" v-model="tagRenameInputText" class="black-text grow">
    <button class="pure-button" :disabled="tags.indexOf(tagRenameInputText) !== -1" @click="renameTag(tagRenameInputSelect, tagRenameInputText)">
      Rename tag
    </button>
    <hr>

    <!-- Delete a tag -->
    <p class="title-text">Delete existing tags</p>
    <p>Select from the dropdown which one you want to delete</p>
    <p>Existing posts will no longer be searchable with the deleted tag</p>
    <select class="black-text" v-model="tagDeleteInput">
      <option disabled value="">Select a tag</option>
      <option v-for="tag in tags">
        {{ tag }}
      </option>
    </select>
    <button class="pure-button" @click="deleteTag(tagDeleteInput)">
      Delete tag
    </button>
    <hr>

    <!-- Search and manage posts with tags -->
    <p class="title-text">Manage Posts with Tags</p>
    <p>Add tags to posts or remove them from existing posts here</p>
    <div class="top-margin">

      <div class="flex">
        <p class="text-input-caption">Filter by title:</p> <input type="text" v-model="titleInput" class="black-text grow">
      </div>
      <div class="flex">
        <p class="text-input-caption">Filter by tag name:</p> <input type="text" v-model="tagInput" class="black-text grow">
      </div>
      <br>

      <div class="flex">
        Select a tag to add to posts below
      </div>
      <select class="black-text" v-model="selectedTag" @change="clickedTag">
        <option disabled value="">Select an existing tag</option>
        <option v-for="tag in tags">
          {{ tag }}
        </option>
      </select>

      <PostList class="top-margin" :posts="filteredPosts" v-slot:default="slotProps">
        <!-- add tag buttons -->
        <button type="submit" 
          class="pure-button" 
          v-if="tagPostAttachInput !== '' && slotProps.post.tags.indexOf(tagPostAttachInput) === -1"
          @click="addTag(slotProps.post.id, tagPostAttachInput)">
          Add {{ tagPostAttachInput }}
        </button>
        <!-- remove tag buttons -->
        <button v-for="tag in slotProps.post.tags" 
          class="pure-button" 
          @click="clearTag(slotProps.post.id, tag)">
          Remove {{ tag }}
        </button>
      </PostList>

    </div>

  </section>
</template>

<script>
import TopMenu from "~/components/admin/TopMenu.vue"
import PostList from "~/components/admin/PostList.vue"

export default {
  created: function () {
    this.loadContents();
  },
  components: {
    TopMenu,
    PostList
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
    loadContents: async function () {
      const responsePosts = this.$axios.get('/api/search/post/all');
      if (!(await this.apiHelper(responsePosts, "Unable to retrieve posts!"))) return;
      const responseTags = this.$axios.get('/api/search/tag');
      if (!(await this.apiHelper(responseTags, "Unable to retrieve tags!"))) return;
      this.posts = (await responsePosts).data.posts
      this.tags = (await responseTags).data.tags
    },
    createTag: async function (name) {
      const resPromise = this.$axios.$post('/api/tag', {
        name: name,
      });
      if (!(await this.apiHelper(resPromise, "Tag creation failed. Make sure you're not using an existing name"))) return;
      //success! refresh the page
      this.$router.go(0);
    },
    renameTag: async function (from, to) {
      const resPromise = this.$axios.$post('/api/tag/rename', {
        oldName: from,
        newName: to,
      });
      if (!(await this.apiHelper(resPromise, "Tag renaming failed. Make sure you're not using an existing name"))) return;
      //success! refresh the page
      this.$router.go(0);      
    },
    deleteTag: async function (name) {
      const resPromise = this.$axios.delete('/api/tag', {
        data: {
          name: name
        }
      });
      if (!(await this.apiHelper(resPromise, "Tag deletion failed!"))) return;
      //success! refresh the page
      this.$router.go(0);
    },
    clickedTag: function () {
      this.tagPostAttachInput = this.selectedTag;
    },
    addTag: async function (postId, tagInput) {
      const resPromise = this.$axios.$post('/api/tag/post', {
        postId: postId,
        tagName: tagInput
      });
      if (!(await this.apiHelper(resPromise, "Tag could not be added to the post!"))) return;
      this.loadContents();
    },
    clearTag: async function (postId, tag) {
      const resPromise = this.$axios.delete('/api/tag/post', {
        data: {
          postId: postId,
          tagName: tag,
        }
      });
      if (!(await this.apiHelper(resPromise, "Could not remove tag!"))) return;
      this.loadContents();      
    },
    apiHelper: async function (promise, errorMsg) {
      const response = await promise.catch(err => false);
      let successPath = response.data ? response.data : response
      if (!successPath.success) {
        if (successPath.error) alert(successPath.error)
        else alert(errorMsg)
        return false
      }
      return true
    }
  },
  data: function () {
    return {
      posts: [],
      tags: [],
      selectedTag: "",
      tagInput: "",
      titleInput: "",
      tagCreateInput: "",
      tagRenameInputSelect: "",
      tagRenameInputText: "",
      tagDeleteInput: "",
      tagPostAttachInput: ""
    }
  }
}
</script>

<style scoped>
  .text-input-caption {
    width: 150px;
    margin: 0px;
  }
</style>
