<template>
  <section>
    <!-- search inputs -->
    <PostSearch :searchHandler="search" class="main-padded top-margin"></PostSearch>
    <br>
    <noscript>
      <div class="main-padded">
        JavaScript is disabled! Previews won't be available.
      </div>
      <br>
    </noscript> 
    <!-- post grid -->
    <div class="flex grid-view main-padded">
      <template v-for="post in posts">
        <a :href="post.link" class="hide-link bottom-space"> <!-- add some spacing between rows of posts -->
          <div class="text-default">
            <component :is="post.previewComp">
            </component>
            <p class="center-text no-space title-text">{{ post.title }}</p>
            <p class="center-text no-space date-text">{{ post.timestamp_human }}</p>
          </div>
        </a>
        <!-- add spacing between each element -->
        <div class="left-space">
        </div>
      </template>
    </div>
    <!-- pagination -->
    <div class="center-text top-margin">
      <p v-if="pageNumber > 1" class="same-line cursor-click" @click="search(tagInput, collectionInput, pageNumber - 1)">
        &lt;&lt;
      </p>
      <p v-if="!end || pageNumber > 1" class="same-line">
        Page {{ pageNumber }}
      </p>
      <p v-if="!end" class="same-line cursor-click" @click="search(tagInput, collectionInput, pageNumber + 1)">
        &gt;&gt;
      </p>
    </div>
  </section>
</template>

<script>
import PostSearch from "~/components/PostSearch.vue"
export default {
  components: {
    PostSearch,
  },
  async asyncData (context) {
    //get url query parameters here
    let { page, tag, collection } = context.route.query;
    if (tag === undefined) tag = "";
    if (collection === undefined) collection = "";
    if (page === undefined) page = 1;

    // perform a search. duplicate the logic of searching since we have no access to methods...
    const searchObj = {
      urlTagInput: tag,
      urlcollectionInput: collection,
      pageNumber: page,
    }

    const queryObj = {
      page: page
    }
    if (tag !== '') {
      queryObj.tag = tag
    }
    if (collection !== '') {
      queryObj.collection = collection
    }

    const response = await context.$axios.$get('/api/search/post', {
      params: queryObj
    }).catch(err => false);

    let successPath = response.data ? response.data : response
    if (!successPath.success) {
      if (successPath.error) alert(successPath.error)
      else alert("Unable to retrieve content!")
    } else {
      //successful query
      const end = response.end
      const posts = response.posts.map(p => {
        //p.previewComp = () => import(`@/pages/post${p.preview}`)
        p.link = `/post${p.directory}`
        return p
      })
      searchObj.end = end
      searchObj.posts = posts
    }

    return searchObj
  },
  created: async function () {
    //initial auto-search using tag input
    await this.search(this.urlTagInput, this.urlcollectionInput, this.pageNumber); 
  },
  methods: {
    getPosts: async function (query) {
      const resPromise = this.$axios.$get('/api/search/post', {
        params: query
      });
      if(!(await this.apiHelper(resPromise, "Unable to retrieve content!"))) return;
      //successful query
      const posts = (await resPromise).posts
      this.end = (await resPromise).end
      this.posts = posts.map(p => {
        p.previewComp = () => import(`@/pages/post${p.preview}`)
        p.link = `/post${p.directory}`
        return p
      })  
    },
    search: async function (tagInput, collectionInput, pageNumber = 1) {
      this.tagInput = tagInput;
      this.collectionInput = collectionInput;
      this.pageNumber = pageNumber;
      //store the inputs for future use
      const queryObj = {
        page: pageNumber
      }
      if (tagInput !== '') {
        queryObj.tag = tagInput
      }
      if (collectionInput !== '') {
        queryObj.collection = collectionInput
      }
      this.getPosts(queryObj)
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
      end: false,
      tagInput: "",
      collectionInput: "",
      pageNumber: 1,
      urlTagInput: "",
      urlcollectionInput: "",
    }
  }
}
</script>

<style scoped>
  .grid-view {
    flex-wrap: wrap;
    justify-content: space-evenly;
    align-content: flex-start;
  }
  .left-space {
    margin-left: 40px;
  }
  .bottom-space {
    margin-bottom: 60px;
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
  .same-line {
    display: inline;
  }
  .cursor-click {
    cursor: pointer;
  }
  .title-text {
    font-size: 20px;
  }
  .date-text {
    font-size: 12px;
  }

  @media only screen and (max-width: 1000px) {
    .title-text {
      font-size: 14px;
    }
    .date-text {
      font-size: 8px;
    }
    .left-space {
      margin-left: 20px;
    }
  }

  @media only screen and (max-width: 600px) {
    .title-text {
      font-size: 8px;
    }
    .date-text {
      font-size: 6px;
    }
    .left-space {
      margin-left: 10px;
    }
  }
</style>
