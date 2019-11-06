<template>
  <div id="app" class="text-default">
    <div class="sidebar">
      <Sidebar></Sidebar>
    </div>
    <div class="main-content">
      <nuxt />
    </div>
  </div>
</template>

<script>
import Sidebar from '~/components/sidebar/Sidebar.vue'

export default {
  components: {
    Sidebar
  }
}
</script>

<style>
  body {
    margin: 0px;
  }
  a:link { /* hyperlinks. they are underlined, and by default will show the same color regardless if it was clicked before */
    color: #333333;
  }
  a:visited {
    color: #333333;
  }
  #app { /* applies to all components */
    position: absolute;
    font-family: 'Voces', 'Helvetica';
    background-color: #ededed; /* changes the background of the whole website! */
    display: flex;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
  .text-default { /* changes the text color of the whole website! */
    color: #333333;
  }
  .hide-link { /* remove the underline in the hyperlink */
    text-decoration: none
  }
  .color-button-warning { /* for dangerous buttons */
    background: rgb(202, 60, 60);
  }
  .color-selectable { /* a special color in the admin pages when something can be interacted with */
    color: #33e520;
  }
  .color-selectable-hover { /* a special color in the admin pages that appears when the mouse is hovered over an element */
    color: #1adbce;
  }
  .title-bg-color {  /* the background of the title card of the website */
    background-color: #ededed;
  }
  .text-standout { /* a special color in the admin pages that signifies importance */
    color: #bb17c6;
  }
  .error-text {
    color: #FF0000;
  }
  .black-text {
    color: #000000;
  }
  .top-margin {
    margin-top: 20px;
  }
  .grow {
    flex-grow: 1;
  }
  .flex {
    display: flex;
  }
  .title-text { /* the size of text in admin pages */
    font-size: 28px;
  }
  .subtitle-text { /* like title text but smaller */
    font-size: 22px;
  }
  .sidebar { /* sidebar width */
    display: flex;
    width: 300px;
  }
  .main-content { /* the window with all the changing content depending on the page you're in */
    display: flex;
    flex-grow: 1;
    word-wrap: break-word;
    width: 0;
    overflow: auto;
  }
  .container { /* Fills up the viewport of the screen */
    display: flex;
    min-height: 100vh;
  }
  .center-text { /* utility class to center text */
    text-align: center;
  }
  .main-padded { /* put some space between the main content and the side bar */
    margin-left: 30px;
  }
  .dynamic-text { /* will change depending on screen size. useful for posts that want to opt in for resizing text */

  }
  .dynamic-image { /* will change depending on screen size. useful for posts that want to opt in for resizing images */

  }

  @font-face {
    font-family: 'Voces';
    src: url('~static/fonts/voces-v7-latin-regular.woff') format('woff'),
      url('~static/fonts/voces-v7-latin-regular.ttf') format('truetype');
  }

  @media only screen and (max-width: 1000px) {
    .sidebar {
      width: 150px;
    }
    .dynamic-image {
      max-width: 400px;
    }
    .dynamic-text-large {
      font-size: 20px;
    }
    .dynamic-text-small {
      font-size: 10px;
    }
    .main-padded {
      margin-left: 15px;
    }
  }

  @media only screen and (max-width: 600px) {
    .sidebar {
      width: 75px;
    }
    .dynamic-image {
      max-width: 240px;
    }
    .dynamic-text-large {
      font-size: 12px;
    }
    .dynamic-text-small {
      font-size: 5px;
    }
    .main-padded {
      margin-left: 7px;
    }
  }
</style>
