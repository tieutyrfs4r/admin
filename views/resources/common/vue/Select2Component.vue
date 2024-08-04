<template>
  <div :id="'parent-'+select2ComponentId">
    <select :id="select2ComponentId" v-bind="multiple ? { multiple: true } : {}" class="form-control" data-width="100%" :disabled="disabled" :required="required">
      <option v-if="multiple" value="" disabled></option>
      <option v-else></option>
      <option v-for="option in options" :key="option.id" :selected="isSelected(option.value)" :value="option.value">{{option.text}}</option>
    </select>
  </div>
</template>

<script>
export default {
  props: {
    options: {
      type: Array
    },
    multiple: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    value: {

    },
    required: {

    },
    placeholder: {
      type: String
    }
  },
  methods: {
    isSelected(optionValue) {
      if (this.multiple) {
        return this.value.includes(optionValue);
      } else {
        return this.value == optionValue;
      }
    },
    changeSelect(e) {

    }
  },
  data() {
    return {
      select2Node: null,
      select2ComponentId: ''
    }
  },
  watch: {
    value: {
      handler(newValue, oldValue) {
// Cập nhật giá trị của Select2 khi prop "value" thay đổi
        if(typeof newValue != 'object' && !Array.isArray(newValue)){
          const vm = this
          if (vm.select2Node) {
            vm.select2Node.val(newValue).trigger('change')
          }
        }

      },
      deep: true, // Theo dõi sự thay đổi sâu bên trong mảng "value",
      immediate: true
    }
  },
  mounted() {
    const vm = this
    this.select2ComponentId = 'select2-' + Math.random().toString(36).substring(7);
    console.log(this.options)
    this.$nextTick(() => {
      $(`#${vm.select2ComponentId}`).select2({
        placeholder: vm.placeholder ??"Select one or more items",
        dropdownParent: $(`#${vm.select2ComponentId}`).parent()
      }).on('change', function (e) {
        vm.$emit('input', $(this).val())
        vm.$emit('change', e)
      });
      vm.select2Node = $(`#${vm.select2ComponentId}`)
    });

  },

  async beforeDestroy() {
    const vm = this
    // Hủy Select2 trước khi component bị hủy
    //vm.select2Node.select2('destroy')
  }
}
</script>