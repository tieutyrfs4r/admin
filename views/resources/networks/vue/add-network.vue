<template>
  <div class="offcanvas offcanvas-end" tabindex="-1" :id="componentId" aria-modal="true" role="dialog">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title">{{ isEdit ? 'Chỉnh sửa mạng lưới' : 'Thêm một mạng lưới mới' }}</h5>
      <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body mx-0 flex-grow-0">
      <form class="ecommerce-network-add pt-0 fv-plugins-bootstrap5 fv-plugins-framework" :id="formId" @submit.prevent="submitForm">
        <div class="ecommerce-network-add-basic mb-3">
          <div class="mb-3 fv-plugins-icon-container">
            <label class="form-label" :for="getRandomId('name')">Tên mạng lưới*</label>
            <input type="text" class="form-control" :id="getRandomId('name')" placeholder="Ethereum" v-model="network.name" required>
          </div>
          <div class="mb-3 fv-plugins-icon-container">
            <label class="form-label" :for="getRandomId('short_name')">Tên viết tắt*</label>
            <input type="text" class="form-control" :id="getRandomId('short_name')" placeholder="ETH" v-model="network.short_name" required>
          </div>
          <div class="mb-3 fv-plugins-icon-container">
            <label class="form-label" :for="getRandomId('description')">Mô tả</label>
            <textarea class="form-control" :id="getRandomId('description')" rows="3" v-model="network.description"></textarea>
          </div>
        </div>
        <div class="pt-3">
          <button type="submit" class="btn btn-primary me-sm-3 me-1 data-submit">
            {{ isEdit ? 'Lưu' : 'Tạo mới' }}
          </button>
          <button type="reset" class="btn bg-label-danger" @click="resetForm">Nhập lại</button>
        </div>
      </form>
    </div>
  </div>
</template>
<script>
import Notify from "../../common/js/Notify";
import Api from "../../common/js/Api";
export default {
  props: {
    networkInit: {
      type: Object,
      default: () => ({
        name: '',
        short_name: '',
        description: '',
      })
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      componentId: '',
      formId: '',
      network: {
        name: '',
        short_name: '',
        description: '',
      },
    };
  },
  watch: {
    networkInit: {
      handler(value) {
        if (value) {
          this.network = value;
        } else {
          this.resetForm();
        }
      },
      deep: true,
    }
  },
  methods: {
    show() {
      const componentId = this.componentId;
      this.$nextTick(() => {
        $(`#${componentId}`).offcanvas('show');
      });
    },
    submitForm() {
      if (this.isEdit) {
        const updateNetwork = {
          name: this.network.name,
          short_name: this.network.short_name,
          description: this.network.description,
        };
        Api.put(`/api/networks/${this.network.id}`, updateNetwork).then(response => {
          this.$emit('update-network', this.network);
          this.resetForm();
          $(`#${this.componentId}`).offcanvas('hide');
          Notify.success();
        }).catch(error => {
          if (error.response && error.response.data) {
            Notify.error(null, error.response.data.error);
          } else {
            Notify.error();
          }
        });
      } else {
        const newNetwork = {
          name: this.network.name,
          short_name: this.network.short_name,
          description: this.network.description,
        };
        Api.post('/api/networks', newNetwork).then(response => {
          this.$emit('add-network', response.data);
          this.resetForm();
          $(`#${this.componentId}`).offcanvas('hide');
          Notify.success();
        }).catch(error => {
          if (error.response && error.response.data) {
            Notify.error(null, error.response.data.error);
          } else {
            Notify.error();
          }
        });
      }
    },
    resetForm() {
      if (this.isEdit) {
        this.network = {
          ...this.networkInit
        };
      } else {
        this.network = {
          name: '',
          short_name: '',
          description: '',
        };
      }
    },
    getRandomId(fieldName) {
      return `ecommerce-network-add-${fieldName}-${Math.random().toString(36).substring(7)}`;
    }
  },
  created() {
    this.componentId = 'toast-' + Math.random().toString(36).substring(7);
    this.formId = 'eCommerceNetworkAddForm-' + Math.random().toString(36).substring(7);
  }
};
</script>