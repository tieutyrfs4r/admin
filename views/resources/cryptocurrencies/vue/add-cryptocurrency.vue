<template>
  <div class="offcanvas offcanvas-end" tabindex="-1" :id="componentId" aria-modal="true" role="dialog">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title">{{cryptocurrencyInit?.id ? 'Cập nhật tiền số': 'Thêm một đồng tiền mới'}}</h5>
      <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body mx-0 flex-grow-0">
      <form class="ecommerce-customer-add pt-0 fv-plugins-bootstrap5 fv-plugins-framework" :id="formId" @submit.prevent="submitForm">
        <div class="ecommerce-cryptocurrency-add-basic mb-3">
          <div class="mb-3 fv-plugins-icon-container">
            <label class="form-label" :for="getRandomId('name')">Tên*</label>
            <input type="text" class="form-control" :id="getRandomId('name')" placeholder="Bitcoin" v-model="cryptocurrency.cryptocurrency_name" required>
            <div class="fv-plugins-message-container fv-plugins-message-container--enabled invalid-feedback"></div>
          </div>
          <div class="mb-3 fv-plugins-icon-container">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" :id="getRandomId('default-use-enabled')" v-model="cryptocurrency.default_use_enabled">
              <label class="form-check-label" :for="getRandomId('default-use-enabled')">Tạo ví mặc định cho người dùng</label>
            </div>
          </div>
          <div class="mb-3 fv-plugins-icon-container">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" :id="getRandomId('default_deposit_enabled')" v-model="cryptocurrency.default_deposit_enabled">
              <label class="form-check-label" :for="getRandomId('default_deposit_enabled')">Được phép nạp</label>
            </div>
          </div>
          <div class="mb-3 fv-plugins-icon-container">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" :id="getRandomId('default_exchange_enabled')" v-model="cryptocurrency.default_exchange_enabled">
              <label class="form-check-label" :for="getRandomId('default_exchange_enabled')">Được phép chuyển đổi</label>
            </div>
          </div>
          <div class="mb-3 fv-plugins-icon-container">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" :id="getRandomId('default_withdraw_enabled')" v-model="cryptocurrency.default_withdraw_enabled">
              <label class="form-check-label" :for="getRandomId('default_withdraw_enabled')">Được phép rút</label>
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label" :for="getRandomId('image')">Hình ảnh</label>
            <input type="file" @change="setFile" class="form-control">
            <img v-if="previewImage" :src="previewImage" class="mt-3" style="max-width: 200px;" alt="">
          </div>
          <div class="mb-3 fv-plugins-icon-container">
            <label class="form-label" :for="getRandomId('usd-rate')">Loại chênh lệch*</label>
            <select class="form-select" v-model="cryptocurrency.usdt_price_diff_type" required>
              <option value="percentage">Phần trăm</option>
              <option value="value">Giá trị</option>
              <option value="default">Mặc định</option>
            </select>
            <div class="fv-plugins-message-container fv-plugins-message-container--enabled invalid-feedback"></div>
          </div>
          <div class="mb-3 fv-plugins-icon-container">
            <label class="form-label" :for="getRandomId('usd-rate')">Tỉ giá chênh lệch*</label>
            <input type="number" step="0.00000001" :id="getRandomId('usd-rate')" class="form-control" placeholder="50000" v-model="cryptocurrency.usdt_price_diff" required>
            <span v-if="cryptocurrency.usdt_price_diff_type === 'value'" class="text-warning"> 1 USDC = ( Tỉ giá USDT binace + {{ cryptocurrency.usdt_price_diff }}) USDT</span>
            <span v-if="cryptocurrency.usdt_price_diff_type === 'percentage'" class="text-warning"> 1 USDC = ({{ (1 + (cryptocurrency.usdt_price_diff / 100)) }} * Tỉ giá USDT binace) USDT</span>

            <div class="fv-plugins-message-container fv-plugins-message-container--enabled invalid-feedback"></div>
          </div>
          <div class="mb-3 fv-plugins-icon-container" v-if="cryptocurrency.usdt_price_diff_type === 'default'">
            <label class="form-label" :for="getRandomId('usdt_price_diff_type')">Khoảng giá chênh lệch (USDT)*</label>
            <input type="number" step="0.00000001" :id="getRandomId('usdt_price_diff_type')" class="form-control" placeholder="0.001" v-model="cryptocurrency.usdt_price_diff_round" required>
            <span class="text-warning"> 1 USDC = ngẫu nhiên trong khoảng {{ cryptocurrency.usdt_price_diff -  cryptocurrency.usdt_price_diff_round}} đến {{ cryptocurrency.usdt_price_diff +  cryptocurrency.usdt_price_diff_round}} USDT</span>
            <div class="fv-plugins-message-container fv-plugins-message-container--enabled invalid-feedback"></div>
          </div>
          <div>
            <label class="form-label" :for="getRandomId('api')">API URL</label>
            <input type="text" :id="getRandomId('api')" class="form-control" placeholder="https://api.example.com" v-model="cryptocurrency.api_url">
          </div>
        </div>
        <div class="pt-3">
          <button type="submit" class="btn btn-primary me-sm-3 me-1 data-submit" :disabled="!isFormValid">
            {{ isEdit ? 'Lưu' : 'Tạo mới' }}
          </button>
          <button type="reset" class="btn bg-label-danger" @click="resetForm">
            Nhập lại
          </button>
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
    cryptocurrencyInit: {
      type: Object,
      default: () => ({
        cryptocurrency_name: '',
        usdt_price_diff_type: '',
        usdt_price_diff: null,
        default_use_enabled: false,
        default_withdraw_enabled: false,
        default_exchange_enabled: false,
        default_deposit_enabled: false,
        img_url: '',
        api_url: ''
      })
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    cryptocurrencyInit: {
      handler(value) {

        if(value){
          this.file = null
          this.cryptocurrency = value
        }else{
          this.resetForm()
        }
      },
      deep: true,
    }
  },
  data() {
    return {
      componentId: '',
      cryptocurrency: {
        cryptocurrency_name: '',
        usdt_price_diff_type: '',
        usdt_price_diff: null,
        usdt_price_diff_round: null,
        default_use_enabled: false,
        default_withdraw_enabled: false,
        default_deposit_enabled:false,
        default_exchange_enabled: false,
        img_url: '',
        vnd_exchange_rate: null,
        api_url: ''
      },
      file: null
    };
  },
  computed: {
    isFormValid() {
      return this.cryptocurrency.cryptocurrency_name &&
          this.cryptocurrency.usdt_price_diff_type &&
          this.cryptocurrency.usdt_price_diff !== null;
    },
    previewImage(){
      if(!this.file){
        return this.cryptocurrency.img_url
      }else{
        return URL.createObjectURL(this.file);
      }
    }
  },
  methods: {
    show() {
      const componentId = this.componentId;
      this.$nextTick(() => {
        $(`#${componentId}`).offcanvas('show');
      });
    },
    setFile(e){
      this.file = null
      if(e.target.files[0]) {
        this.file = e.target.files[0];
      }
    },
    async submitForm() {
      try{
        if (this.isEdit) {
          let updatedCryptocurrency = null;

          if (this.file) {
            const formData = new FormData();
            formData.append('image', this.file);

            const uploadResponse = await Api.post(`/api/cryptocurrencies/${this.cryptocurrency.id}/update-image`, formData);
            updatedCryptocurrency = uploadResponse.data;
          }
          const updateCryptocurrency = {
            cryptocurrency_name: this.cryptocurrency.cryptocurrency_name,
            usdt_price_diff: this.cryptocurrency.usdt_price_diff,
            usdt_price_diff_type: this.cryptocurrency.usdt_price_diff_type,
            usdt_price_diff_round: this.cryptocurrency.usdt_price_diff_round,
            vnd_exchange_rate: this.cryptocurrency.vnd_exchange_rate,
            api_url: this.cryptocurrency.api_url,
            default_use_enabled: this.cryptocurrency.default_use_enabled,
            default_withdraw_enabled: this.cryptocurrency.default_withdraw_enabled,
            default_deposit_enabled: this.cryptocurrency.default_deposit_enabled,
            default_exchange_enabled: this.cryptocurrency.default_exchange_enabled
          };

          const updateResponse = await Api.put(`/api/cryptocurrencies/${this.cryptocurrency.id}`, updateCryptocurrency);
          updatedCryptocurrency = updateResponse.data;

          this.$emit('update-cryptocurrency', updatedCryptocurrency);
          this.resetForm();
          $(`#${this.componentId}`).offcanvas('hide');
          Notify.success();
        } else {
          const newCryptocurrency = {
            cryptocurrency_name: this.cryptocurrency.cryptocurrency_name,
            usdt_price_diff_type: this.cryptocurrency.usdt_price_diff_type,
            usdt_price_diff_round: this.cryptocurrency.usdt_price_diff_round,
            usdt_price_diff: this.cryptocurrency.usdt_price_diff,
            vnd_exchange_rate: this.cryptocurrency.vnd_exchange_rate,
            api_url: this.cryptocurrency.api_url,
            default_use_enabled: this.cryptocurrency.default_use_enabled,
            default_withdraw_enabled: this.cryptocurrency.default_withdraw_enabled,
            default_deposit_enabled: this.cryptocurrency.default_deposit_enabled,
            default_exchange_enabled: this.cryptocurrency.default_exchange_enabled
          };

          const createResponse = await Api.post('/api/cryptocurrencies', newCryptocurrency);
          const createdCryptocurrency = createResponse.data.cryptocurrency;
          let img_url = createResponse.data.cryptocurrency.img_url
          if (this.file) {
            const formData = new FormData();
            formData.append('image', this.file);
            const rps = await Api.post(`/api/cryptocurrencies/${createdCryptocurrency.id}/update-image`, formData);
            img_url = rps.data.img_url
          }

          this.$emit('add-cryptocurrency', {
            img_url: img_url,
            ...createdCryptocurrency
          });
          this.resetForm();
          $(`#${this.componentId}`).offcanvas('hide');
          Notify.success();
        }
      }catch (error) {
        if (error.response && error.response.data) {
          Notify.error(null, error.response.data.error);
        } else {
          Notify.error();
        }
      }

    },
    resetForm() {
      if (this.isEdit) {
        this.cryptocurrency = { ...this.cryptocurrencyInit };
      } else {
        this.cryptocurrency = {
          cryptocurrency_name: '',
          usdt_price_diff_type: null,
          usdt_price_diff: null,
          img: '',
          vnd_exchange_rate: null,
          api_url: '',
          default_use_enabled: false,
          default_withdraw_enabled: false,
          default_deposit_enabled: false,
          default_exchange_enabled: false
        };
        this.file = null
      }
    },
    getRandomId(fieldName) {
      return `ecommerce-cryptocurrency-add-${fieldName}-${Math.random().toString(36).substring(7)}`;
    },
  },
  created() {
    this.componentId = 'toast-' + Math.random().toString(36).substring(7);
    this.formId = 'eCommerceCryptocurrencyAddForm-' + Math.random().toString(36).substring(7);
  }
};
</script>