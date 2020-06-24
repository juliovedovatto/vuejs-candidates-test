<template>
  <div class="select-input select-lg">
    <select :id="id" :name="name" :disabled="disabled" :required="required" :multiple="multiple" />
  </div>
</template>

<script>
import 'select2/dist/css/select2.css'

import $ from 'jquery'
import select2 from 'select2'
import { v1 as uuidv1 } from 'uuid'
import { isArray } from 'lodash'

select2($)
// https://github.com/select2/select2/issues/3125
$.fn.select2.amd.require(['select2/dropdown/attachBody', 'select2/utils'], (AttachBody, Utils) => {
  AttachBody.prototype._attachPositioningHandler = function(decorated, container) {
    var self = this
    var scrollEvent = 'scroll.select2.' + container.id
    var resizeEvent = 'resize.select2.' + container.id
    var orientationEvent = 'orientationchange.select2.' + container.id
    var $watchers = this.$container.parents().filter(Utils.hasScroll)
    $watchers.each(function() {
      $(this).data('select2-scroll-position', {
        x: $(this).scrollLeft(),
        y: $(this).scrollTop()
      })
    })
    $watchers.on(scrollEvent, function() {
      var position = $(this).data('select2-scroll-position')
      if ($(this).find('.select2-container--open').length > 0) {
        $(this).scrollTop(position.y)
      }
    })
    $(window).on(scrollEvent + ' ' + resizeEvent + ' ' + orientationEvent, function() {
      self._positionDropdown()
      self._resizeDropdown()
    })
  }
})

export default {
  name: 'SelectInput',
  props: {
    value: null,
    name: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: '100%'
    },
    options: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    },
    closeOnSelect: {
      type: Boolean,
      default: true
    },
    url: {
      type: String
    },
    queryParams: {
      type: Object
    },
    limitPerPage: {
      type: Number,
      default: 100
    },
    isOffset: {
      type: Boolean,
      default: false
    },
    dataTerm: {
      type: String,
      default: 'term'
    },
    dataOffset: {
      type: String,
      default: 'page'
    },
    dataLimit: {
      type: String,
      default: 'limit'
    },
    dataResults: {
      type: String,
      default: 'results'
    },
    dataHasMore: {
      type: String,
      default: 'next'
    },
    dataId: {
      type: String,
      default: 'id'
    },
    dataText: {
      type: String,
      default: 'label'
    },
    withCredentials: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      id: uuidv1(),
      select2: null,
      ajax: {
        url: this.url,
        dataType: 'json',
        delay: 500,
        xhrFields: {
          withCredentials: this.withCredentials
        },
        data: this.getData,
        processResults: this.processResults
      }
    }
  },
  mounted() {
    this.setSelect2()
    this.setValue(this.value)
  },
  beforeDestroy() {
    if (this.select2) {
      this.select2.select2('destroy')
    }
  },
  computed: {
    computedOptions() {
      if (!this.url) {
        return this.options
      }
      return this.options.map(option => {
        return {
          id: option[this.dataId],
          text: option[this.dataText]
        }
      })
    }
  },
  methods: {
    getData(params) {
      const page = params.page || 1
      const offset = this.isOffset ? (page - 1) * this.limitPerPage : page

      const parameters = {
        ...this.queryParams,
        [this.dataTerm]: params.term || '',
        [this.dataOffset]: offset,
        [this.dataLimit]: this.limitPerPage
      }

      return parameters
    },
    processResults(data) {
      const results = data[this.dataResults].map(data => {
        return {
          id: data[this.dataId],
          text: data[this.dataText]
        }
      })

      return {
        results,
        pagination: {
          more: Boolean(data[this.dataHasMore])
        }
      }
    },
    setSelect2() {
      this.select2 = $(this.$el)
        .find('select')
        .select2({
          width: this.width,
          placeholder: this.placeholder,
          closeOnSelect: this.closeOnSelect,
          data: this.computedOptions,
          ajax: this.url ? this.ajax : null
        })
        .on('select2:select select2:unselect', () => {
          $('.select2-search--inline')[0].lastChild.value = ''
          this.$emit('input', this.select2.val())
        })
    },
    setOptions() {
      this.select2.select2({
        placeholder: this.placeholder,
        data: this.computedOptions,
        ajax: this.url ? this.ajax : null
      })

      this.setValue(this.value)
    },
    setValue(value) {
      if (isArray(value)) {
        this.select2.val([...value])
      } else {
        this.select2.val([value])
      }

      this.select2.trigger('change')
    }
  },
  watch: {
    value() {
      this.setSelect2()
      this.setValue(this.value)
    }
  }
}
</script>
