<template>
  <section class="fl" :style="styling">
    <div class="fl col">
      <slot></slot>
    </div>
  </section>
</template>

<script>
export default {
  name: "PaddedCenter",
  props: {
    styling: Object
  },
  data: function () {
    return {
      styleOuter: this.styling
    }
  }
}
</script>

<style scoped>
  .fl {
    display: flex;
    justify-content: center;
  }
  .col {
    flex-direction: column;
  }
</style>
