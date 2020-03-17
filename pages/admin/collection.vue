<template>
  <section class="main-padded">
    <TopMenu></TopMenu>
    <p class="title-text">Collection Manager</p>
    <p>Collections are useful for organizing posts into an ordered series.</p>
    <p>You can even assign a single post to multiple collections, similar to how tags work.</p>

    <!-- Create a collection -->
    <hr>
    <p class="title-text">Create a new collection</p>
    <p>All you need is a name</p>
    Collection name: <input type="text" v-model="collectionCreateInput" class="black-text grow">
    <button class="pure-button" @click="createCollection(collectionCreateInput)">
      Create Collection
    </button>
    <hr>

    <!-- Rename a collection -->
    <p class="title-text">Rename an existing collection</p>
    <p>Select from the dropdown which one you want to rename</p>
    From:
    <select class="black-text" v-model="collRenameInputSelect">
      <option disabled value="">Select a collection</option>
      <option v-for="collection in collections">
        {{ collection.name }}
      </option>
    </select>
    To: 
    <input type="text" v-model="collRenameInputText" class="black-text grow">
    <button class="pure-button" 
      :disabled="collections.findIndex( c => c.name === collRenameInputText ) !== -1" 
      @click="renameCollection(collRenameInputSelect, collRenameInputText)">
      Rename collection
    </button>
    <hr>

    <!-- Delete a collection -->
    <p class="title-text">Delete existing collections</p>
    <p>Select from the dropdown which one you want to delete</p>
    <p>Your posts will not be deleted! Only the collection itself is deleted</p>
    <select class="black-text" v-model="collectionDeleteInput">
      <option disabled value="">Select a collection</option>
      <option v-for="collection in collections">
        {{ collection.name }}
      </option>
    </select>
    <button class="pure-button" @click="deleteCollection(collectionDeleteInput)">
      Delete Collection
    </button>
    <hr>

    <!-- Search and manage posts to collections -->

    <p class="title-text">Manage Posts with Collections</p>
    <p>Add posts to collections or remove them from existing collections here</p>
    <div class="top-margin">

      <div class="flex">
        <p class="text-input-caption">Filter by collection name:</p> <input type="text" v-model="collectionFilterInput" class="black-text grow">
      </div>
      <div class="flex">
        <p class="text-input-caption">Filter by title:</p> <input type="text" v-model="titleInput" class="black-text grow">
      </div>
      <div class="flex">
        <p class="text-input-caption">Filter by tag name:</p> <input type="text" v-model="tagInput" class="black-text grow">
      </div>
      <br>
      <div class="flex">
        Select a collection for posts below to be added to: 
        <select class="black-text" v-model="collectionPostAttachInput">
          <option disabled value="">Select a collection</option>
          <option v-for="collection in collections">
            {{ collection.name }}
          </option>
        </select>
      </div>
      <PostList class="top-margin" :posts="filteredPosts" v-slot:default="slotProps">
        <p>In collections: {{slotProps.post.collections.map(c => `${c.name} (${c.order_number})`).join(", ")}}</p>
        <!-- add to selected collection button -->
        <div v-if="collectionPostAttachInput !== ''">
          <p>Choose the order of the post in the collection:</p>
          <input type="number" v-model="orderNumberInput" class="black-text grow">
          <button class="pure-button" @click="addToCollection(collectionPostAttachInput, slotProps.post, orderNumberInput)">
            Add to {{ collectionPostAttachInput }}
          </button>
        </div>
        <!-- remove from collection buttons -->
        <button v-for="coll in slotProps.post.collections" class="pure-button" @click="removeFromCollection(coll.id, coll.order_number)">
          Remove from {{ `${coll.name} (${coll.order_number})` }}
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
      //filter by collection affinity, then tagInput, then by titleInput, if they contain anything
      //don't do exact matches
      return this.posts.filter(post => {
        if (post.collections.length === 0  && this.collectionFilterInput === "") return true
        return post.collections.find(c => c.name.includes(this.collectionFilterInput))
      }).filter(post => {
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
      const responseColls = this.$axios.get('/api/search/collection');
      if (!(await this.apiHelper(responsePosts, "Unable to retrieve collections!"))) return;
      this.posts = (await responsePosts).data.posts
      this.collections = (await responseColls).data.collections
    },
    createCollection: async function (name) {
      const resPromise = this.$axios.$post('/api/collection', {
        name: name,
      });
      if (!(await this.apiHelper(resPromise, "Collection creation failed. Make sure you're not using an existing name"))) return;
      //success! refresh the page
      this.$router.go(0);
    },
    renameCollection: async function (from, to) {
      const resPromise = this.$axios.$post('/api/collection/rename', {
        oldName: from,
        newName: to,
      });
      if (!(await this.apiHelper(resPromise, "Collection renaming failed. Make sure you're not using an existing name"))) return;
      //success! refresh the page
      this.$router.go(0);      
    },
    deleteCollection: async function (name) {
      const resPromise = this.$axios.delete('/api/collection', {
        data: {
          name: name
        }
      });
      if (!(await this.apiHelper(resPromise, "Collection deletion failed!"))) return;
      //success! refresh the page
      this.$router.go(0);
    },
    addToCollection: async function (collectionName, post, orderNumber) {
      const resPromise = this.$axios.$post('/api/collection/post', {
        collectionName: collectionName,
        postId: post.id,
        order: orderNumber
      });
      if (!(await this.apiHelper(resPromise, "This collection already contains this order number!"))) return;

      this.loadContents();
    },
    removeFromCollection: async function (id, orderNumber) {
      const resPromise = this.$axios.delete('/api/collection/post', {
        data: {
          id: id,
          order: orderNumber
        }
      });
      if (!(await this.apiHelper(resPromise, "Post could not be removed from the collection!"))) return;

      this.loadContents();
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
      posts: [],
      collections: [],
      tagInput: "",
      titleInput: "",
      collectionFilterInput: "",
      collectionCreateInput: "",
      collRenameInputSelect: "",
      collRenameInputText: "",
      collectionDeleteInput: "",
      orderNumberInput: 0,
      collectionPostAttachInput: ""
    }
  }
}
</script>


<style scoped>
  .text-input-caption {
    width: 200px;
    margin: 0px;
  }
</style>
