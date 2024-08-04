<template>
  <div class="container-xxl flex-grow-1 container-p-y">
    <div class="row">
      <div class="col-lg-12 mb-2">
        <TransactionHistories  :cryptocurrencies="cryptocurrencies" />
      </div>
    </div>
  </div>
</template>
<script>
import DataTableComponent from "../../common/vue/DataTableComponent.vue";
import Api from "../../common/js/Api";
import TransactionHistories from "./transactions/TransactionHistories.vue";
export default {
  components: {TransactionHistories, DataTableComponent},
  computed: {
    countItemSelected(){
      return this.items.filter(item => item.checked).length;
    }
  },
  data() {
    return {
      cryptocurrencies: []
    };
  },
  methods: {
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
  },
  created() {
    this.fetchCryptocurrencies()
  }
};
</script>
