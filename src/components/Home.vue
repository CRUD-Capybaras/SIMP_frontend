<template>
  <div class="home">
    <h1>Strona główna</h1>
    <router-link to="/mapa">
      <button>Mapa</button>
    </router-link>
    <router-link to="/wyszukiwanie">
      <button>Wyszukiwanie</button>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'Home'
};
</script>

<style scoped>
button {
  margin: 10px;
  padding: 10px;
  font-size: 16px;
}
</style>
