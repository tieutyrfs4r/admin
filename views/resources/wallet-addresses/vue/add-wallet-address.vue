<template>
  <div class="offcanvas offcanvas-end" tabindex="-1" :id="componentId" aria-modal="true" role="dialog">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title">{{ isEdit ? 'Sửa địa chỉ ví' : 'Thêm địa chỉ ví mới' }}</h5>
      <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body mx-0 flex-grow-0">
      <form class="wallet-address-add pt-0 fv-plugins-bootstrap5 fv-plugins-framework" :id="formId" @submit.prevent="submitForm">
        <div class="wallet-address-add-basic mb-3">
          <div class="mb-3 fv-plugins-icon-container">
            <label class="form-label" :for="randomIds.cryptocurrency">Đồng tiền mã hóa*</label>
            <select class="form-select" :id="randomIds.cryptocurrency" v-model="walletAddress.cryptocurrency" required>
              <option value="">Chọn đồng tiền mã hóa</option>
              <option v-for="crypto in cryptocurrencies" :key="crypto.id" :value="crypto.id">{{ crypto.cryptocurrency_name }}</option>
            </select>
          </div>
          <div class="mb-3 fv-plugins-icon-container">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" :id="randomIds.use_enabled" v-model="walletAddress.use_enabled">
              <label class="form-check-label" :for="randomIds.use_enabled">Kích hoạt</label>
            </div>
          </div>
          <div class="mb-3 fv-plugins-icon-container">
            <label class="form-label" :for="randomIds.address">Địa chỉ ví*</label>
            <input type="text" class="form-control" :id="randomIds.address" placeholder="Nhập địa chỉ ví" v-model="walletAddress.address" required>
          </div>
          <div class="mb-3 fv-plugins-icon-container">
            <label class="form-label" :for="randomIds.network">Mạng lưới*</label>
            <select class="form-select" :id="randomIds.network" v-model="walletAddress.network" required>
              <option value="">Chọn mạng lưới</option>
              <option v-for="network in networks" :key="network.id" :value="network.id">{{ network.name }}</option>
            </select>
          </div>
          <div class="mb-3 fv-plugins-icon-container">
            <label class="form-label" :for="randomIds.description">Mô tả</label>
            <textarea class="form-control" :id="randomIds.description" rows="3" placeholder="Nhập mô tả" v-model="walletAddress.description"></textarea>
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
    walletAddressInit: {
      type: Object,
      default: () => ({
        cryptocurrency: '',
        address: '',
        network: '',
        description: ''
      })
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    cryptocurrencies: {
      type: Array,
      required: true
    },
    networks: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      componentId: '',
      formId: '',
      walletAddress: {
        cryptocurrency: '',
        address: '',
        network: '',
        use_enabled: false,
        description: ''
      },
      randomIds: {
        cryptocurrency: '',
        address: '',
        network: '',
        description: '',
        use_enabled: ''
      },
    };
  },
  watch: {
    walletAddressInit: {
      handler(value) {
        if (value) {
          const walletAddress = {};
          Object.assign(walletAddress, value);
          if(value.cryptocurrency){
            walletAddress.cryptocurrency = value.cryptocurrency.id;
          }
          if(value.network){
            walletAddress.network = value.network.id;
          }
          this.walletAddress = walletAddress;
        } else {
          this.resetForm();
        }
      },
      deep: true
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
        const updateWalletAddress = {
          cryptocurrency: this.walletAddress.cryptocurrency,
          address: this.walletAddress.address,
          network: this.walletAddress.network,
          description: this.walletAddress.description,
          use_enabled: this.walletAddress.use_enabled
        };
        Api.put(`/api/wallet-addresses/${this.walletAddress.id}`, updateWalletAddress)
            .then(response => {
              this.$emit('update-wallet-address', response.data);
              this.resetForm();
              $(`#${this.componentId}`).offcanvas('hide');
              Notify.success('Cập nhật địa chỉ ví thành công');
            })
            .catch(error => {
              console.log(error)
              if(error.response && error.response.data){
                Notify.error(null,error.response.data.error);
              }
              else{
                Notify.error()
              }
            });
      } else {
        const newWalletAddress = {
          cryptocurrency: this.walletAddress.cryptocurrency,
          address: this.walletAddress.address,
          network: this.walletAddress.network,
          description: this.walletAddress.description,
          use_enabled: this.walletAddress.use_enabled
        };
        Api.post('/api/wallet-addresses', newWalletAddress)
            .then(response => {
              this.$emit('add-wallet-address', response.data);
              this.resetForm();
              $(`#${this.componentId}`).offcanvas('hide');
              Notify.success('Thêm địa chỉ ví thành công');
            })
            .catch(error => {
              console.log(error)
              if(error.response && error.response.data){
                Notify.error(null,error.response.data.error);
              }
              else{
                Notify.error()
              }
            });
      }
    },
    resetForm() {
      if (this.isEdit) {
        const walletAddress = {};
        Object.assign(walletAddress, this.walletAddressInit);
        if(this.walletAddressInit.cryptocurrency){
          walletAddress.cryptocurrency = this.walletAddressInit.cryptocurrency.id;
        }
        if(this.walletAddressInit.network){
          walletAddress.network = this.walletAddressInit.network.id;
        }
        this.walletAddress = walletAddress;
      } else {
        this.walletAddress = {
          cryptocurrency: '',
          address: '',
          network: '',
          use_enabled: false,
          description: ''
        };
      }
    },
    getRandomId(fieldName) {
      return `wallet-address-add-${fieldName}-${Math.random().toString(36).substring(7)}`;
    },
    generateRandomIds() {
      for (const field in this.randomIds) {
        this.randomIds[field] = Math.random().toString(36).substring(7);
      }
    }
  },
  created() {
    this.componentId = 'toast-' + Math.random().toString(36).substring(7);
    this.formId = 'walletAddressAddForm-' + Math.random().toString(36).substring(7);
    this.generateRandomIds();
  }
};
</script>