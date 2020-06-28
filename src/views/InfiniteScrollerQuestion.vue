<template>
  <div class="infinite-scroller-question">
    <section class="question">
      <p>
        The challenge for this task is to resolve the bug that appears for when you switch from "Movies" to "TV Shows"
        tab. You will notice that the description divs are not displaying correctly in the "TV Shows" tab.
      </p>
      <strong>Expected outcome:</strong>
      <p class="mb-0">
        The "TV Shows" tab content should display properly with the divs resized correctly based on the height of the
        element.
      </p>
    </section>

    <section class="movies-filter">
      <b-button-group size="sm">
        <b-button :pressed="isMovies" variant="dark" @click="onFilter('Movie')">Movies</b-button>
        <b-button :pressed="isTVShows" variant="dark" @click="onFilter('TV Show')">TV Shows</b-button>
      </b-button-group>
    </section>

    <section class="movies-columns">
      <div class="movies-column">Title</div>
      <div class="movies-column">Description</div>
      <div class="movies-column">Genre</div>
    </section>

    <div class="movies__container">
      <section :class="{ movies: true, hidden: !isMovies }">
        <infinite-scroller :items="allMovies">
          <template #default="{ item }">
            <div class="movie">
              <div class="movie-info">
                <div class="movie-info--content">{{ item.title }}</div>
              </div>
              <div class="movie-info">
                <div class="movie-info--content">{{ item.description }}</div>
              </div>
              <div class="movie-info">
                <div class="movie-info--content">{{ item.listed_in }}</div>
              </div>
            </div>
          </template>
        </infinite-scroller>
      </section>
      <section :class="{ movies: true, hidden: !isTVShows }">
        <infinite-scroller :items="allTVShows">
          <template #default="{ item }">
            <div class="movie">
              <div class="movie-info">
                <div class="movie-info--content">{{ item.title }}</div>
              </div>
              <div class="movie-info">
                <div class="movie-info--content">{{ item.description }}</div>
              </div>
              <div class="movie-info">
                <div class="movie-info--content">{{ item.listed_in }}</div>
              </div>
            </div>
          </template>
        </infinite-scroller>
      </section>
    </div>
  </div>
</template>

<script>
import { BButtonGroup, BButton } from 'bootstrap-vue'
import { InfiniteScroller } from '@/components/infinite-scroller'

export default {
  name: 'InfiniteScrollerQuestion',
  components: {
    BButtonGroup,
    BButton,
    InfiniteScroller
  },
  data() {
    return {
      movies: [],
      movieType: 'Movie'
    }
  },
  mounted() {
    fetch('/data/netflix.json').then(response => {
      response.json().then(data => {
        this.movies = data
      })
    })
  },
  computed: {
    allMovies() {
      return this.movies.filter(movie => movie.type === 'Movie')
    },
    allTVShows() {
      return this.movies.filter(movie => movie.type === 'TV Show')
    },
    isMovies() {
      return this.movieType === 'Movie'
    },
    isTVShows() {
      return this.movieType === 'TV Show'
    }
  },
  methods: {
    onFilter(type) {
      this.movieType = type
    }
  }
}
</script>

<style lang="scss" scoped>
.infinite-scroller-question {
  flex: 1 1 auto;
  display: flex;
  flex-flow: column;
  background-color: #222831;

  .question {
    flex: 0 1 auto;
    background-color: $light;
    padding: 0.5rem 1rem;
  }

  .movies-filter {
    flex: 0 1 auto;
    margin-bottom: 1rem;
    padding: 1rem;

    .btn {
      background-color: #393e46;
      color: #5e646d;
      border: 1px solid #393e46;
      font-weight: bold;

      &:focus {
        box-shadow: none;
      }

      &:hover {
        color: $white;
      }

      &.active {
        background-color: #222831;
        color: #32e0c4;
      }
    }
  }

  .movies-columns {
    flex: 0 1 auto;
    display: flex;

    .movies-column {
      flex: 1 1 0px;
      padding: 1rem;
      color: #5e646d;
      font-size: 0.75rem;
      font-weight: bold;
      text-transform: uppercase;
    }
  }

  .movies__container {
    position: relative;
    flex: 1 1 auto;
    display: flex;
    flex-wrap: wrap;

    .movies {
      overflow: auto;
      flex: 1 1 auto;

      &.hidden {
        position: absolute !important;
        top: -100vw !important;
        left: -100vw !important;
        width: 100%;
        height: 100%;
      }

      .movie {
        display: flex;
        color: #32e0c4;

        .movie-info {
          flex: 1 1 0px;
          display: flex;
          align-items: center;
          padding: 1rem;

          &--content {
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
          }
        }
      }
    }
  }

}
</style>

<style lang="scss">
.infinite-scroller__item {
  &:not(:last-child) {
    .movie {
      border: 1px solid #393e46;
    }
  }
}
</style>
