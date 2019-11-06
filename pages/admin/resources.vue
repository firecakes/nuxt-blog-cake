<template>
  <section class="main-padded">
    <TopMenu></TopMenu>
    <p class="title-text">Resources</p>
    <p class="subtitle-text">Things that may be useful when developing on this website</p>
    <ul>
      <li><a href="https://nuxtjs.org/">The main framework that this site uses</a></li>
      <li><a href="https://purecss.io/">The CSS library this site uses</a></li>
      <li><a href="https://yoksel.github.io/flex-cheatsheet/">Flexbox cheat sheet 1</a></li>
      <li><a href="https://css-tricks.com/snippets/css/a-guide-to-flexbox/">Flexbox cheat sheet 2</a></li>
      <li><a href="https://www.w3schools.com/howto/howto_google_fonts.asp">Available Google Fonts (this site uses Voces)</a></li>
      <li><a href="https://google-webfonts-helper.herokuapp.com/fonts">Easily downloadable Google Fonts</a></li>
      <li><a href="https://sqliteonline.com/">Run SQLite code online for testing</a></li>
      <li><a href="https://www.regexpal.com/">Test out regular expressions</a></li>
      <li><a href="https://moment.github.io/luxon/docs/manual/tour.html">The Luxon library for the server</a></li>
      <li><a href="https://github.com/showdownjs/showdown">The Showdown library which converts markdown to HTML</a></li>
    </ul>

    <p class="title-text">Media Query Info</p>
    <p>The sidebar will shrink to half width once the viewport width passes under 1000px.</p>
    <p>More things will get affected once the viewport width passes under 600px. The following files are affected:</p>
    <ul>
      <li>layouts/default.vue</li>
      <li>components/sidebar/Sidebar.vue</li>
      <li>components/sidebar/Title.vue</li>
      <li>components/PostSearch.vue</li>
      <li>pages/index.vue</li>
    </ul>
    <p>The following classes are exposed for all pages to allow for dynamic resizing of images and texts depending on the device's screen size:</p>
    <ul>
      <li>dynamic-image</li>
      <li>dynamic-text-large</li>
      <li>dynamic-text-small</li>
    </ul>

  </section>
</template>

<script>
import TopMenu from "~/components/admin/TopMenu.vue"

export default {
  components: {
    TopMenu,
  }
}
</script>

<style scoped>
</style>
