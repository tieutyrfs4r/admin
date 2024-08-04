<template>
  <div class="offcanvas offcanvas-end" tabindex="-1" :id="componentId" aria-modal="true" role="dialog">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title">Cập nhật thông tin ví</h5>
      <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body mx-0 flex-grow-0">
      <edit-wallet-user
          v-for="(wallet, index) in wallets"
          :key="wallet.id"
          :wallet="wallet"
          @update-wallet="onUpdateWallet"
      ></edit-wallet-user>
    </div>
  </div>
</template>
<script>
import Api from "../../common/js/Api";

import EditWalletUser from "./edit-wallet-user.vue";

export default {
  components: {
    EditWalletUser,
  },
  props: {
    userId: {
      type: String,
    }
  },
  watch: {
    userId(value) {
      if (value) {
        this.fetchWallets();
      }
    }
  },
  data() {
    return {
      componentId: '',
      wallets: []
    };
  },
  methods: {
    show() {
      const componentId = this.componentId;
      this.$nextTick(() => {
        $(`#${componentId}`).offcanvas('show');
      });
    },
    fetchWallets() {
      Api.get(`/api/users/wallets/user/${this.userId}`)
          .then(response => {
            this.wallets = response.data;
          })
          .catch(error => {
            console.error('Error fetching wallets:', error);
          });
    },
    onUpdateWallet(updatedWallet) {
      const index = this.wallets.findIndex(wallet => wallet.id === updatedWallet.id);
      if (index !== -1) {
        this.wallets.splice(index, 1, updatedWallet);
        this.$emit('update-wallet', updatedWallet);
      }
    }
  },
  created() {
    this.componentId = 'toast-' + Math.random().toString(36).substring(7);
  }
};
</script>