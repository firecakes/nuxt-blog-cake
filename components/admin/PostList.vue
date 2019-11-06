<template>
  <section>
    <div v-for="post in posts">
      <div class="post color-selectable">
        <p>Title: {{post.title}}</p>
        <p>Post location: {{post.entry}}</p>
        <p>Tags: {{post.tags.join(", ")}}</p>
        <slot v-bind:post="post"></slot> <!-- make each post accessible to the parent component -->
      </div>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    posts: Array
  },
}
</script>

<style scoped>
  .post {
    border-style: solid;
    border-width: 1px;
    margin: 5px;
  }
</style>
