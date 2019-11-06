<template>
  <section>
    <div class="main-padded top-margin">
      <h1>Feed list</h1>
      <p>These are all the RSS/ATOM/JSON feeds you are able to subscribe to.</p>
      <p>There are ones for all posts, and ones for each tag and collection for individual subscriptions.</p>
      <p>Use an RSS reader and paste in one or more of the URLs below to get updates from the site automatically!</p>
      <p>
          <a href="https://addons.mozilla.org/en-US/firefox/addon/feedbroreader/" target="_blank">
            Here's a feed reader you can use as an extension to Firefox
          </a>
      </p>
      <ul>
        <li v-for="feed in feeds">
          {{ feed }}
        </li>
      </ul>
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
    const response = await context.$axios.$get('/api/feed')
    if (!response.success) console.error("Could not retrieve feeds!")
    return {
      websiteString: context.env.websiteString,
      feeds: response.feeds
    }
  },
  created: async function () {
  },
  methods: {
  },
  data: function () {
    return {
    }
  }
}
</script>

<style scoped>
</style>
