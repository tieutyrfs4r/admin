<template>
  <div class="container-xxl flex-grow-1 container-p-y">
    <div class="row">
      <div class="col-lg-12 mb-2">
        <div class="card">
          <div class="d-flex align-items-end row">
            <div class="col-sm-7">
              <div class="card-body">
                <h5 class="card-title text-primary">Chào ngày mới! 🎉</h5>
                <p class="mb-4">Thời gian hiện tại: {{currentDateTime }}</p>
              </div>
            </div>
            <div class="col-sm-5 text-center text-sm-left">
              <div class="card-body pb-0 px-0 px-md-4">
                <img
                    src="/assets/img/illustrations/man-with-laptop-light.png"
                    height="140"
                    alt="View Badge User"
                    data-app-dark-img="illustrations/man-with-laptop-dark.png"
                    data-app-light-img="illustrations/man-with-laptop-light.png"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-12 mb-2">
        <TransactionHistories default-transaction-status="pending"  :cryptocurrencies="cryptocurrencies" />
      </div>
      <div class="col-lg-12 mb-2">
        <Users />
      </div>
    </div>
  </div>
</template>
<script>
import AddTransaction from "./add-transaction.vue";
import DataTableComponent from "../../common/vue/DataTableComponent.vue";
import Api from "../../common/js/Api";
import Users from "./users/users.vue";
import TransactionHistories from "../../transaction-histories/vue/transactions/TransactionHistories.vue";
export default {
  components: {TransactionHistories, Users,   DataTableComponent, AddTransaction},
  computed: {
    countItemSelected(){
      return this.items.filter(item => item.checked).length;
    }
  },
  data() {
    return {
      cryptocurrencies: [],
      currentDateTime: ''
    };
  },
  methods: {
    updateCurrentDateTime() {
      const now = new Date();
      this.currentDateTime = now.toLocaleString('en-US', {maximumFractionDigits: 8});
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
  },
  created() {
    this.fetchCryptocurrencies()
    this.updateCurrentDateTime();
    setInterval(this.updateCurrentDateTime, 1000);
  }
};
</script>
