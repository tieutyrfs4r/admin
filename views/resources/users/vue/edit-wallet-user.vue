<template>
  <div class="card mb-3">
    <form @submit.prevent="updateWallet">
      <div class="card-body">
        <div class="d-flex align-items-center">
          <img :src="wallet.cryptocurrency.img_url" class="me-3" width="50" height="50" alt="">
          <div>
            <h5 class="card-title">{{ wallet.cryptocurrency.cryptocurrency_name }}</h5>
          </div>
        </div>
        <div class="mb-3 fv-plugins-icon-container">
          <label class="form-label" :for="getRandomId('balance')">Số dư</label>
          <input type="number" :id="getRandomId('balance')" class="form-control" placeholder="Nhập số dư" v-model="walletData.balance_amount" required>
        </div>
        <div class="mb-3 fv-plugins-icon-container">
          <label class="form-label" :for="getRandomId('withheld-amount')">Số tiền tạm giữ</label>
          <input type="number" :id="getRandomId('withheld-amount')" class="form-control" placeholder="Nhập số tiền tạm giữ" v-model="walletData.temporarily_withheld.amount">
        </div>
        <div class="mb-3 fv-plugins-icon-container" v-if="walletData.temporarily_withheld.amount > 0">
          <label class="form-label" :for="getRandomId('withheld-reason')">Lý do tạm giữ</label>
          <input type="text" :id="getRandomId('withheld-reason')" class="form-control" required placeholder="Nhập lý do tạm giữ" v-model="walletData.temporarily_withheld.reason">
        </div>
        <div class="mb-3 fv-plugins-icon-container" v-if="walletData.temporarily_withheld.amount > 0">
          <label class="form-label" :for="getRandomId('withheld-start-date')">Ngày bắt đầu tạm giữ</label>
          <input type="date" :id="getRandomId('withheld-start-date')" class="form-control" v-model="formattedStartDate">
        </div>
        <div class="mb-3 fv-plugins-icon-container" v-if="walletData.temporarily_withheld.amount > 0">
          <label class="form-label" :for="getRandomId('withheld-end-date')">Ngày kết thúc tạm giữ</label>
          <input type="date" :id="getRandomId('withheld-end-date')" class="form-control" v-model="formattedEndDate">
        </div>
        <div class="d-flex justify-content-end">
          <button type="submit" class="btn btn-primary me-2">Cập nhật</button>
          <button type="button" class="btn btn-secondary" @click="resetWallet">Nhập lại</button>
        </div>
      </div>
    </form>

  </div>
</template>
<script>
import Notify from "../../common/js/Notify";
import Api from "../../common/js/Api";
export default {
  props: {
    wallet: {
      type: Object,
      required: true
    }
  },
  computed: {
    formattedStartDate: {
      get() {
        return this.formatDate(this.walletData.temporarily_withheld.start_date_withheld);
      },
      set(value) {
        this.walletData.temporarily_withheld.start_date_withheld = value;
      }
    },
    formattedEndDate: {
      get() {
        return this.formatDate(this.walletData.temporarily_withheld.end_date_withheld);
      },
      set(value) {
        this.walletData.temporarily_withheld.end_date_withhel      }
    }
  },
  data() {
    return {
      walletData: JSON.parse(JSON.stringify(this.wallet))
    };
  },
  methods: {
    formatDate(date) {
      if (date) {
        return new Date(date).toISOString().split('T')[0];      }
      return null;
    },
    updateWallet() {
      const updateData = this.removeEmptyProperties(this.walletData)
      delete updateData.cryptocurrency
      delete updateData.id
      delete updateData.user
      Api.put(`/api/users/wallets/user/${this.wallet.user}/edit/${this.wallet.id}`, updateData).then(() => {
        this.$emit('update-wallet', this.walletData);
        Notify.success('Cập nhật thành công');
      }).catch(error => {
        if(error.response){
          Notify.error(null,error.response.data.error)
        }
        else{
          Notify.error('Cập nhật thất bại');
        }
      });
    },
    removeEmptyProperties(obj) {
      return Object.fromEntries(
          Object.entries(obj)
              .filter(([_, v]) => v != null && v !== '')
              .map(([k, v]) => [k, v === Object(v) ? this.removeEmptyProperties(v) : v])
      );
    },
    resetWallet() {
      this.walletData = JSON.parse(JSON.stringify(this.wallet));
    },
    getRandomId(fieldName) {
      return `wallet-update-${fieldName}-${Math.random().toString(36).substring(7)}`;
    }
  }
};
</script>