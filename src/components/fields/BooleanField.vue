<i18n>
{
  "en": {
    "true": "Yes",
    "false": "No"
  }
}
</i18n>

<template>
  <span class="boolean-field">{{ value ? $t('true') : $t('false') }}</span>
</template>

<script>
export default {
  name: 'BooleanField',
  props: {
    value: {
      type: Boolean
    }
  }
}
</script>

<style lang="scss" scoped>
.boolean-field {
  font-size: 1rem;
}
</style>
