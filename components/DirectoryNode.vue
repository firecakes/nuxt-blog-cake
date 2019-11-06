<template>
  <section>
    <ul>
      <li v-for="(content, index) in contents">
        <!-- The content -->
        <div v-if="content.contents">
          <p>{{content.name}}</p>
        </div>
        <div v-else>
          <a style="cursor: pointer" 
            @mouseover="hoverIn(index)" 
            @mouseout="hoverOut(index)" 
            @click="clickHandler(parentDir + content.name, parentDir)">
            <p :class="styles[index]">{{content.name}}</p>
          </a>
        </div>        
        <!-- The subdirectory -->
        <div v-if="content.contents">
          <DirectoryNode 
            :contents="content.contents" 
            :parentDir="parentDir + content.name + '/'"
            :clickHandler="clickHandler" 
            style="margin-left:20px"></DirectoryNode>
        </div>
      </li>
    </ul>
  </section>
</template>

<script>
export default {
  name: "DirectoryNode",
  props: {
    contents: Array,
    parentDir: String,
    clickHandler: Function
  },
  created: function () {
    this.styles = this.contents.map(c => {
      return ["selectable-off", "color-selectable"];
    }) 
  },
  methods: {
    //NOTE: Vue is NOT reactive when you are modifying just an element of an array!
    //change the array reference on update
    hoverIn: function (index) {
      this.styles.splice(index, 1, ["selectable-on", "color-selectable-hover"])
    },
    hoverOut: function (index) {
      this.styles.splice(index, 1, ["selectable-off", "color-selectable"])
    }
  },
  data: function () {
    return {
      styles: []
    }
  }
}
</script>

<style scoped>
  ul {
    list-style: none;
    padding-left: 5px;
  }
  li {
    list-style: none;
    padding-left: 5px;
  }
  .selectable-off {
    border-style: solid;
    border-width: 1px;
  }
  .selectable-on {
    border-style: solid;
    border-width: 1px;
  }
</style>
