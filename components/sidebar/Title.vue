<template>
  <a href="/" class="main hide-link title-bg-color">
    <p class="center-text title-text text-default">Nuxt Blog Cake</p>
  </a>
</template>

<script>
export default {

}
</script>

<style scoped>
  .main {
    display: flex;
    flex-grow: 1;
  }
  .title-text {
    font-size: 40px;
    padding: 0px;
    margin: 0px;
    margin-bottom: 10px;
  }

  @media only screen and (max-width: 1000px) {
    [class*="title-text"] {
      font-size: 30px;
    }
  }

  @media only screen and (max-width: 600px) {
    [class*="title-text"] {
      font-size: 15px;
    }
  }
</style>