<template>
  <div id="app" class="app">
    <section class="app-links">
      <router-link tag="button" :to="{ name: 'TableView' }" active-class="active" class="btn btn-outline-dark" exact>
        First Question
      </router-link>

      <router-link tag="button" :to="{ name: 'InfiniteScroller' }" active-class="active" class="btn btn-outline-dark">
        Second Question
      </router-link>
    </section>

    <section class="app-questions">
      <router-view />
    </section>
  </div>
</template>

<style lang="scss" scoped>
.app {
  height: 100%;
  display: flex;
  flex-flow: column;
  align-items: center;
  padding: 2rem;

  .app-links {
    flex: 0 1 auto;
    margin-bottom: 2rem;

    :not(:last-child) {
      margin-right: 1rem;
    }
  }

  .app-questions {
    flex: 1 1 auto;
    display: flex;
    flex-flow: column;
    width: 80%;
    box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.2);
  }
}
</style>

<style lang="scss">
html,
body {
  height: 100%;
  font-size: 16px;
}
</style>
