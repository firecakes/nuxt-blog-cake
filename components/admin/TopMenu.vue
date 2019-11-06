<template>
  <div class="main">
    <div class="links">
      <a href="/admin/create" class="item">
        <p>Create a Post</p>
      </a>
      <a href="/admin/post" class="item">
        <p>Posts</p>
      </a>
      <a href="/admin/collection" class="item">
        <p>Collections</p>
      </a>
      <a href="/admin/tag" class="item">
        <p>Tags</p>
      </a>
      <a href="/admin/resources" class="item">
        <p>Resources</p>
      </a>
    </div>
  </div>
</template>

<script>

export default {
  components: {
  }
}
</script>

<style scoped>
  .main {
    height: 50px;
    width: 600px;
  }
  .text {
    top: 50%;
  }
  .links {
    display: flex;
    justify-content: space-evenly;
  }
  .item {
    display: flex;
    font-size: 20px;
  }
</style>
