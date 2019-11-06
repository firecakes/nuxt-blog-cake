<template>
  <section>
    <div>
      <!-- Description section -->
      <p class="title-text">Move posts from staging to live</p>
      <p>What goes into a post?</p>
      <ol>
        <li>All content must be contained within the same directory. It will all be loaded together</li>
        <li>Every post needs an entry point. The entry point is the Vue file that holds your main content</li>
        <li>Every post needs a preview file. The preview is the Vue file that summarizes and links to your content</li>
        <li>A post may have any number of tags. Tags make your content searchable within the site</li>
      </ol>
      <hr>

      <!-- Directory + input section -->
      <p class="text-standout"> {{stepText}} </p> 
      <button class="pure-button" 
        :disabled="selectedEntry == ''" 
        v-if="!entryPicked" 
        @click="entryClick">
        Continue
      </button>
      <button class="pure-button" 
        :disabled="selectedPreview == ''" 
        v-if="entryPicked && !previewPicked"
        @click="previewClick">
        Continue
      </button>
      <DirectoryNode 
        :contents="filteredContents" 
        parentDir="/" 
        :clickHandler="clickHandler"
        v-if="!previewPicked">
      </DirectoryNode>
      <!-- Tag and title input -->
      <div v-if="previewPicked">
        Title your post:
        <input type="text" class="black-text" v-model="titleText">
      </div>
      <div v-if="previewPicked">
        Add tags: 
        <input type="text" class="black-text" v-model="tagInput">
        <button type="submit" class="pure-button" @click="addTag">Add tag</button>
        <button class="pure-button" @click="clearTag">Remove last tag</button>

        <p>Or pick from previously created tags: </p>
        <select class="black-text" v-model="selectedTag" @change="clickedTag">
          <option disabled value="">Select an existing tag</option>
          <option v-for="existingTag in existingTags">
            {{ existingTag }}
          </option>
        </select>
      </div>
      <hr>

      <!-- Selected section -->
      <p>Directory: 
        <a :href="linkedSelectedDirectory" class="item">
          {{selectedDirectory}}
        </a>
      </p>
      <p>Entry: {{selectedEntry}}</p>
      <p>Preview: 
        <a :href="linkedSelectedPreview" class="item">
          {{selectedPreview}}
        </a>
      </p>
      <p>Title: {{titleText}}</p>
      <p>Tags: {{tags.join(", ")}}</p>
      

      <button class="pure-button" 
        v-if="previewPicked && !hasSubmitted" 
        @click="submitClick">
        Submit
      </button>
    </div>
  </section>
</template>

<script>
import TopMenu from "~/components/admin/TopMenu.vue"
import DirectoryNode from "~/components/DirectoryNode.vue"

export default {
  created: async function () {
    const responsePosts = await this.$axios.get('/api/post')
      .catch(err => {
        return false;
      });
    if (!responsePosts) {
      return console.error("Unable to retrieve content!")
    }
    const responseTags = await this.$axios.get('/api/search/tag')
      .catch(err => {
        return false;
      });
    if (!responseTags) {
      return console.error("Unable to retrieve tags!")
    }
    this.contents = responsePosts.data.contents
    this.existingTags = responseTags.data.tags
  },
  components: {
    DirectoryNode,
    TopMenu
  },
  computed: {
    filteredContents: function () {
      //return only a directory's contents if an entry is picked
      //  /mmm/11/index.vue
      const selectedDirectoryName = this.selectedDirectory.split('/')[1] //get just the first directory name
      return this.entryPicked ? this.contents.filter(o => o.name === selectedDirectoryName) : this.contents
    },
    linkedSelectedDirectory: function () {
      return "/staging" + this.selectedDirectory
    },
    linkedSelectedPreview: function () { //remove the .vue extension for it to work
      let splitIndex = this.selectedPreview.lastIndexOf(".vue")
      //special case where the preview is the index.vue post. make the hyperlink work here
      if (this.selectedPreview.endsWith("index.vue")) splitIndex = this.selectedPreview.lastIndexOf("index.vue")
      const cutPreview = this.selectedPreview.substr(0, splitIndex)
      return "/staging" + cutPreview
    }
  },
  methods: {
    clickedTag: function () {
      this.tagInput = this.selectedTag;
    },
    clickHandler: function (file, directory) {
      if (!this.entryPicked) {
        this.selectedDirectory = directory
        this.selectedEntry = file;        
      }
      else if (this.entryPicked && !this.previewPicked) {
        if (directory !== this.selectedDirectory) {
          return alert("The preview vue file must be in the same directory as the entry point file!");
        }
        this.selectedPreview = file;    
      }
    },
    entryClick: function () {
      this.stepText = "Step 2: Select a preview file. This also must be a .vue file, but the name can be whatever";
      this.entryPicked = true;
    },
    previewClick: function () {
      this.stepText = "Step 3: Assign an optional title and tags to your post and submit!"
      this.previewPicked = true;
    },
    addTag: function () {
      //dont allow duplicated
      if (this.tags.indexOf(this.tagInput) === -1) {
        this.tags.push(this.tagInput);
      }
      this.tagInput = "";
    },
    clearTag: function () {
      this.tags.pop();
    },
    submitClick: async function () {
      const postData = {
        preview: this.selectedPreview,
        entry: this.selectedEntry,
        tags: this.tags,
        directory: this.selectedDirectory,
        title: this.titleText
      }
      const response = await this.$axios.$post('/api/post/link', postData)
        .catch(err => err);

      if (!response.success) {
        return alert("The post failed to move to live!")
      }

      //success!
      this.hasSubmitted = true;
      this.stepText = "Post submitted!"
    },
  },
  data: function () {
    return {
      contents: [],
      existingTags: [],
      selectedDirectory: "",
      selectedEntry: "",
      selectedPreview: "",
      titleText: "",
      tags: [],
      stepText: "Step 1: Select an index.vue file. This is what will be displayed when viewing a post. The file NEEDS to be called index.vue",
      entryPicked: false,
      previewPicked: false,
      hasSubmitted: false,
      tagInput: "",
      selectedTag: ""
    }
  }
}
</script>

<style scoped>
</style>
