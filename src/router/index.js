import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'TableView',
    component: () => import(/* webpackChunkName: "table-view" */ '../views/TableViewQuestion.vue')
  },
  {
    path: '/infinite-scroller',
    name: 'InfiniteScroller',
    component: () => import(/* webpackChunkName: "infinite-scroller" */ '../views/InfiniteScrollerQuestion.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
