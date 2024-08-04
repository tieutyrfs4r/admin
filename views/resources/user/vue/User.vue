<template>
  <div class="container-xxl flex-grow-1 container-p-y">
    <div class="row">
      <UserInfo :user-id="userId" :user="user" :wallet_addresses="wallet_addresses" :cryptocurrencies="cryptocurrencies" :levels="levels" :networks="networks" @user-updated="handleUserUpdated" />
      <div class="col-xl-9 col-lg-8 col-md-8 order-1 order-md-1">
        <TransactionHistories :user-id="userId" :cryptocurrencies="cryptocurrencies" />
        <VerifyHistoriesUser :user-id="userId" :cryptocurrencies="cryptocurrencies" />
      </div>
    </div>
  </div>
</template>
<script>
import Notify from '../../common/js/Notify.js';
import Api from "../../common/js/Api";
import DataTableComponent from "../../common/vue/DataTableComponent.vue";
import UserInfo from "./info/UserInfo.vue";
import LoginHistoryUser from "./LoginHistoryUser.vue";
import VerifyHistoriesUser from "./verifies/VerifyHistoriesUser.vue";
import TransactionHistories from "../../transaction-histories/vue/transactions/TransactionHistories.vue";
export default {
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  components: {
    TransactionHistories,
    VerifyHistoriesUser,
    LoginHistoryUser,
    UserInfo,
    DataTableComponent,

  },
  computed: {
    countItemSelected() {
      return this.items.filter(item => item.checked).length;
    }
  },
  data() {
    return {
      user: {},
      levels: [],
      cryptocurrencies: [],
      networks: [],
      wallet_addresses: []
    };
  },
  methods: {
    showUser(item) {
      this.itemSelected = item.data
      $('#confirm-model').modal('show');
    },
    showActionUser(isEditUserType = false, item = null) {
      this.isEditUserType = isEditUserType
      if (item) {
        this.itemSelected = item.data
      } else {
        this.itemSelected = null
      }
      this.$refs.AddUser.show()
    },
    showActionEditWalletUser(item) {
      this.itemSelected = item.data
      this.$refs.EditWalletUser.show()
    },
    confirmAction() {
      Api.delete(`/api/users/delete/${this.itemSelected.id}`).then(response => {
        Notify.success()
        $('#confirm-model').modal('hide');
        this.items = this.items.filter(item => item.data.id !== this.itemSelected.id)
        this.itemSelected = null;
      }).catch(error => {
        if(error.response && error.response.data){

          Notify.error(null,error.response.data.error);
        }
        else{
          Notify.error()
        }
      })
    },
    onUpdateWallet(updatedWallet) {
      this.items.forEach(item => {
        if(item.data.id === this.itemSelected.id) {
          const index = item.data.wallets.findIndex(wallet => wallet.id === updatedWallet.id);
          if (index !== -1) {
            Object.assign(item.data.wallets[index],updatedWallet)
          }
        }
      })
    },
    async fetchUser() {
      try {
        const response = await Api.get(`/api/users/info/${this.userId}`);
        this.user = response.data
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },
    async fetchLevels() {
      try {
        const response = await Api.get(`/api/levels`,{
          params: {
            limit: 1000
          }
        });
        this.levels = response.data.docs
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },
    async fetchNetworks() {
      try {
        const response = await Api.get(`/api/networks`,{
          params: {
            limit: 1000
          }
        });
        this.networks = response.data.networks
      } catch (error) {
        console.error('Error fetching networks:', error);
      }
    },
    async fetchWalletAddresses() {
      try {
        const response = await Api.get(`/api/wallet-addresses`,{
          params: {
            limit: 1000
          }
        });
        this.wallet_addresses = response.data.docs
      } catch (error) {
        console.error('Error fetching networks:', error);
      }
    },
    async fetchCryptocurrencies() {
      try {
        const response = await Api.get(`/api/cryptocurrencies`,{
          params: {
            limit: 1000
          }
        });
        this.cryptocurrencies = response.data.docs
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },

    addUserAction(data) {
      this.items.push({
        selected: false,
        data: data
      });
    },
    handleUserUpdated(data){
      this.user = data
    }
  },
  mounted() {
    this.fetchUser();
    this.fetchLevels();
    this.fetchCryptocurrencies();
    this.fetchNetworks();
    this.fetchWalletAddresses();
  },
};
</script>