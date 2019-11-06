<template>
  <section class="main-padded top-space">
    <h1>People and Groups I Follow</h1>
    <p class="subtitle-text">Yeah they're pretty cool</p>
    <ul>
      <li><a href="https://www.jadegroveart.com/">Jade the friendo</a></li>
      <li><a href="https://cheetakinz.tumblr.com/">Cheeta the friendo</a></li>
      <li><a href="http://frenpile.com/">Frenpile, a group of animators</a></li>
      <li><a href="https://twitter.com/Gulumunkus/">Gulumunkus, a fren</a></li>
      <li><a href="https://twitter.com/Desiitos/">Desitos, a fren</a></li>
    </ul>

    <p class="subtitle-text">Some Artists I Follow</p>
    <ul>
      <li><a href="https://twitter.com/RaoKurai">https://twitter.com/RaoKurai</a></li>
      <li><a href="https://thedorfmirrin.tumblr.com/">https://thedorfmirrin.tumblr.com/</a></li>
      <li><a href="http://aquabunny.creativeworlds.net/">http://aquabunny.creativeworlds.net/</a></li>
      <li><a href="https://ztoons.tumblr.com/">https://ztoons.tumblr.com/</a></li>
      <li><a href="https://twitter.com/8poke8">https://twitter.com/8poke8</a></li>
      <li><a href="https://chainchomped.tumblr.com/">https://chainchomped.tumblr.com/</a></li>
      <li><a href="https://nuclearlemons.tumblr.com/">https://nuclearlemons.tumblr.com/</a></li>
      <li><a href="https://friskymcnugget.tumblr.com/">https://friskymcnugget.tumblr.com/</a></li>
      <li><a href="https://teamprototype.tumblr.com/">https://teamprototype.tumblr.com/</a></li>
      <li><a href="https://bluphoenix45.tumblr.com/">https://bluphoenix45.tumblr.com/</a></li>
      <li><a href="https://raystarkitty.tumblr.com/">https://raystarkitty.tumblr.com/</a></li>
      <li><a href="https://twitter.com/CoobieC">https://twitter.com/CoobieC</a></li>
      <li><a href="https://fridayflareon.tumblr.com/">https://fridayflareon.tumblr.com/</a></li>
      <li><a href="https://millimole.tumblr.com/">https://millimole.tumblr.com/</a></li>
    </ul>
  </section>
</template>


<script>
export default {
  async asyncData (context) {
    let { posts } = await context.$axios.$get('/api/search/post/index')
    posts = posts.map(p => {
      p.link = `/data/live${p.directory}`
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
