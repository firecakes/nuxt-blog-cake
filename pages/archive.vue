<template>
  <section class="main-padded top-space">
    <h1>Post Index</h1>
    <table v-if="posts.length !== 0" class="pure-table pure-table-horizontal">
      <tr>
        <th><p class="dynamic-text-small">Title</p></th>
        <th><p class="dynamic-text-small">Link</p></th>
        <th><p class="dynamic-text-small">Upload Date</p></th>
      </tr>
      <tr v-for="post in posts">
        <td class="space"><p class="dynamic-text-small">{{ post.title }}</p></td>
        <td class="space"><a :href="post.link"><p class="dynamic-text-small">{{ post.link }}</p></a></td>
        <td class="space"><p class="dynamic-text-small">{{ post.timestamp_human }}</p></td>
      </tr>
    </table>
    <p class="subtitle-text" v-else>Nothing here yet...</p>
  </section>
</template>


<script>
export default {
  async asyncData (context) {
    let { posts } = await context.$axios.$get('/api/search/post/index')
    posts = posts.map(p => {
      p.link = `/post${p.directory}`
      return p
    }) 
    return { posts: posts }
  },
  data: function () {
    return {
      posts: [],
    }
  }
}
</script>

<style scoped>
  .space {
    padding: 10px;
  }
  .top-space {
    margin-top: 20px;
  }
</style>
