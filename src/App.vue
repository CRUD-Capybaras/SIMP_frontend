<template>
  <div id="app">
    <nav>
      <router-link to="/">Strona główna</router-link>
      <router-link to="/mapa">Mapa</router-link>
      <router-link to="/wyszukiwanie">Wyszukiwanie</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  margin: 0 15px;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
