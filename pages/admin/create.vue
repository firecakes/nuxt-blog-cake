<template>
  <section class="main-padded max-width">
    <div class="container column">
      <TopMenu></TopMenu>

      <div class="editor">
        <div class="left-side column">
          <h1 class="center-text">Markdown</h1>
          <textarea autofocus class="text-area" v-model="markdown"></textarea>
        </div>
        <div class="right-side column">
          <h1 class="center-text">HTML Preview</h1>
          <span style="flex-grow: 1" v-html="htmlOutput"></span>
        </div>
      </div>
      <div class="bottom-row">
        <div class="bottom-row">
          <p>{{ inputText }}   </p> <input type="text" v-model="postName"><br>
        </div>
        <button class="pure-button" 
          style="width: 250px" 
          @click.prevent="submitPost" 
          :disabled="markdown.length === 0">
          Save Post
        </button>
      </div>
    </div>
  </section>
</template>
 
<script>
  import TopMenu from "~/components/admin/TopMenu.vue"
  import Showdown from "showdown";

  export default {
    components: {
      TopMenu
    },
    data () {
      return {
        converter: new Showdown.Converter({
          tables: true, //enable table rendering
        }),
        markdown: "# Hello, Markdown!",
        postName: "post-name",
        inputText: "Folder name for post:"
      }
    },
    computed: {
      htmlOutput: function () {
        return this.converter.makeHtml(this.markdown);
      }
    },
    methods: {
      submitPost: async function () {
        const resPromise = this.$axios.post('/api/post/markdown', {
          title: this.postName,
          markdown: this.markdown
        })
        if(!(await this.apiHelper(resPromise, "The name entered must contain alphanumerics or - or _"))) return;
        //success. redirect to admin/post to see the content on staging
        this.$router.push('/admin/post');
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
  }
</script>

<style scoped>
  .max-width {
    width: 100%;
  }
  .column {
    display: flex;
    flex-direction: column;
  }
  .editor {
    flex-grow: 1;
    flex-direction: row;
    display: flex;
  }
  .left-side {
    flex-grow: 1;
    width: 0;
  }
  .right-side {
    flex-grow: 1;
    word-wrap: break-word;
    width: 0;
  }
  .text-area {
    flex-grow: 1;
    resize: none;
    color: #111111;
    font-size: 18px;
  }
  .bottom-row {
    display: flex;
    justify-content: space-evenly;
  }
  input {
    color: #111111;
  }
  p {
    white-space: pre;
  }
</style>

