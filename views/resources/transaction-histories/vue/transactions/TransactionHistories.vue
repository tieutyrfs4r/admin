<template>
  <div class="card mb-4">
    <h5 class="card-header">Lịch sử giao dịch</h5>
    <div class="card-body">
      <DataTableComponent
          :columns="transactions_columns"
          :items="items"
          :selectable="true"
          :current-page.sync="currentPage"
          :per-page="perPage"
          :total-items="totalItems"
          @delete-selected="deleteItemSelected"
          @sort="handleSort"
          @update:current-page="onPageChange"
      >
      <template v-slot:other-actions>
        <div class="row mb-3 align-items-center">
          <div class="col-md-auto mb-3">
            <div class="dropdown">
              <button class="btn buttons-collection dropdown-toggle btn-label-primary me-2" :disabled="countItemSelected === 0" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                <span>
                  <i class="bx bx-down-arrow me-sm-1"></i>
                  <span class="d-sm-inline-block">Chức năng khác</span>
                </span>
              </button>
              <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                <li><a class="dropdown-item" href="javascript:void(0);" @click="deleteItemSelected"><i class="bx bx-trash"></i> Xóa các mục đã chọn</a></li>
              </ul>
            </div>
          </div>
          <div class="col-md mb-3" v-if="searchUser">
            <label class="d-flex align-items-center">
              <span class="text-nowrap me-1">Người dùng</span>
              <input class="form-control" v-model="searchUserKeyword" placeholder="Nhập tên hoặc email người dùng"/>
             
            </label>
          </div>
          <div class="col-md mb-3">
            <label class="d-flex align-items-center">
              <span class="text-nowrap me-1">Hiển thị</span>
              <select class="form-select" v-model="selectedPerPage" @change="changePerPage">
                <option v-for="option in perPageOptions" :value="option" :key="option">{{ option }}</option>
              </select>
              <span class="text-nowrap ms-1">mục</span>
            </label>
          </div>
          <div class="col-md mb-3">
            <label class="d-flex align-items-center">
              <span class="text-nowrap me-1">Loại giao dịch:</span>
              <select class="form-select" v-model="selectedTransactionType" @change="fetchTransactions">
                <option value="">Tất cả</option>
                <option value="deposit">Nạp tiền</option>
                <option value="sell">Bán tiền điện tử</option>
                <option value="exchange">Quy đổi tiền điện tử</option>
                <option value="withdraw-vnd">Rút tiền về ngân hàng</option>
                <option value="withdraw">Rút tiền số</option>
              </select>
            </label>
          </div>
          <div class="col-md mb-3">
            <label class="d-flex align-items-center">
              <span class="text-nowrap me-1">Trạng thái:</span>
              <select class="form-select" v-model="selectedTransactionStatus" @change="fetchTransactions">
                <option value="">Tất cả</option>
                <option value="success">Thành công</option>
                <option value="pending">Đang chờ</option>
                <option value="failed">Thất bại</option>
                <option value="cancelled">Bị hủy</option>
              </select>
            </label>
          </div>
        </div>
      </template>
        <template v-slot:actions="{ item }">
          <div class="demo-inline-spacing">
            <div class="btn-group">
              <button type="button" class="btn btn-sm btn-outline-dark dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">Các chức năng khác</button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item"@click="showConfirmModal(item.data.id, 'confirm')" v-if="item.data.transaction_status === 'pending'" href="javascript:void(0);"><i class="bx bx-check"></i> Xác nhận giao dịch</a></li>
                <li><a class="dropdown-item" @click="showConfirmModal(item.data.id, 'cancel')" v-if="item.data.transaction_status === 'pending'" href="javascript:void(0);"><i class="bx bx-minus"></i> Hủy giao dịch</a></li>
                <li><a class="dropdown-item" @click="showConfirmModal(item.data.id, 'delete')" href="javascript:void(0);"><i class="bx bx-trash"></i> Xóa giao dịch này</a></li>
              </ul>
            </div>
            
            <button type="button" class="btn btn-sm btn-outline-info" @click="showTransactionDetailModal(item.data.id)">
              <i class="bx bx-show me-1"></i> Chi tiết giao dịch
            </button>
           

          </div>
        </template>
        <template v-slot:user_info="{ item }">
          <div class="d-flex justify-content-left align-items-center">
            <div class="avatar-wrapper">
              <div class="avatar avatar-sm me-3">
                <img :src="item.data.user.avatar" :alt="item.data.user.full_name" class="rounded-circle">
              </div>
            </div>
            <div class="d-flex flex-column">
              <a :href="`/users/${item.data.user.id}`" target="_blank" class="text-body text-truncate">
                <span class="fw-medium">{{item.data.user.full_name}}</span>
              </a>
              <small class="text-muted">{{item.data.user.email}}</small>
            </div>
          </div>
        </template>
        <template v-slot:transaction_info="{ item }">
          <span class="mb-2 fw-semibold" :class="getTransactionAmountClass(item.data.transaction_type)">
            <i :class="getTransactionIcon(item.data.transaction_type)"></i> {{ item.data.transaction_amount.toLocaleString('en-US', {maximumFractionDigits: 8}) }}
          </span>
        </template>
        <template v-slot:cryptocurrency_info="{ item }">
          <div class="d-flex justify-content-left align-items-center">
            <div class="avatar-wrapper">
              <div class="avatar avatar-sm me-3">
                <img v-if="item.data.transaction_type !== 'withdraw-vnd'" :src="item.data?.cryptocurrency?.img_url" alt="Avatar" class="rounded-circle">
                <img v-else src="https://uxwing.com/wp-content/themes/uxwing/download/e-commerce-currency-shopping/coin-vietnamese-dong-vnd-icon.png" alt="Avatar" class="rounded-circle">
              </div>
            </div>
            <div class="d-flex flex-column">
              <span v-if="item.data.transaction_type !== 'withdraw-vnd'" class="fw-medium">{{item.data?.cryptocurrency?.cryptocurrency_name}}</span>
              <span v-else class="fw-medium">VNĐ</span>
            </div>
          </div>
        </template>
        <template v-slot:transaction_type_info="{ item }">
          <span class="badge" :class="getTransactionTypeClass(item.data.transaction_type)">
            {{ getTransactionTypeLabel(item.data.transaction_type) }}
          </span>
        </template>
        <template v-slot:status_info="{ item }">
                <span class="badge" :class="getStatusClass(item.data.transaction_status)">
                  {{ getStatusText(item.data.transaction_status) }}
                </span>
        </template>
      </DataTableComponent>
    </div>
    <ConfirmTransactionModal
        :transaction-id="selectedTransactionId??''"
        :action="selectedAction"
        @confirm="handleConfirm"
        ref="confirmModal"
    />
    <TransactionDetailModal
        :transaction-id="selectedTransactionId??''"
        :cryptocurrencies="cryptocurrencies"
        ref="transactionDetailModal"
        @transaction-updated="updatedTransaction"
    />
  </div>
</template>
<script>
import DataTableComponent from "../../../common/vue/DataTableComponent.vue";
import Api from "../../../common/js/Api";
import Notify from "../../../common/js/Notify";
import ConfirmTransactionModal from "./ConfirmTransactionModal.vue";
import TransactionDetailModal from "./TransactionDetailModal.vue";
export default {
  props: {
    searchUser: {
      type: Boolean,
      default: false
    },
    cryptocurrencies: {
      type: Array,
      required: true
    },
    userId: {
      type: String
    },
    defaultTransactionStatus:{
      type: String
    },
  },
  components: {
    TransactionDetailModal,
    ConfirmTransactionModal,
    DataTableComponent
  },
  computed: {
    countItemSelected() {
      return this.items.filter(item => item.checked).length;
    }
  },
  data() {
    return {
      transactions_columns: [
        { slot: 'actions', label: 'Thao tác' },
        { slot: 'status_info', label: 'Trạng thái',sortable: true,  sortBy: 'transaction_status' },
        { slot: 'user_info', label: 'Người dùng', sortable: true, sortBy: 'user' },
        { slot: 'transaction_info', label: 'Số tiền', sortable: true, sortBy: 'transaction_amount' },
        { slot: 'cryptocurrency_info', label: 'Loại tiền', sortable: true, sortBy: 'cryptocurrency' },
        { slot: 'transaction_type_info', label: 'Loại giao dịch', sortable: true,  sortBy: 'transaction_type'  },
    
       
      ],
      searchKeyword: '',
      itemSelected: null,
      perPageOptions: [7, 10, 25, 50, 75, 100],
      selectedPerPage: 10,
      currentPage: 1,
      perPage: 10,
      totalItems: 0,
      items: [],
      accept_transaction_confirm: true,
      sortBy: null,
      sortOrder: -1,
      selectedTransactionId: null,
      selectedAction: 'confirm',
      selectedTransactionStatus: '',
      selectedTransactionType: ''
    }
  },
  methods: {
    async changePerPage() {
      this.perPage = this.selectedPerPage;
      this.currentPage = 1;
      await this.fetchTransactions()
    },
    
    // async changeTransactionTypes() {
    //   this.transactionStatus = this.selectedTransactionStatus;
    //   this.currentPage = 1;
    //   await this.fetchTransactions()
    // },
    async fetchTransactions() {
      const params = {
        page: this.currentPage,
        limit: this.perPage,
      }
      if(this.userId){
        params.user = this.userId
      }
      if(this.defaultTransactionStatus){
        params.transaction_status = [this.defaultTransactionStatus]
      }
      if(this.selectedTransactionStatus){
        params.transaction_status = [this.selectedTransactionStatus]
      }
      if(this.selectedTransactionType){
        params.transaction_types = [this.selectedTransactionType]
      }
      if(this.searchKeyword && this.searchKeyword.trim() !== ''){
        params.keyword = this.searchKeyword
      }
      if(this.sortBy){
        params.sort_by = this.sortBy
        params.sort_order = this.sortOrder
      }
      try {
        const response = await Api.get('/api/transaction-histories', {
          params
        });
        this.items = response.data.docs.map(item => ({
          data: item,
          checked: false,
        }));
        this.totalItems = response.data.totalDocs;
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },
    updatedTransaction(data) {
      const transactionIndex = this.items.findIndex(item => item.data.id === this.selectedTransactionId);
      if (transactionIndex !== -1) {
        const { user, ...updateData } = data;
        this.items[transactionIndex].data = {
          ...this.items[transactionIndex].data,
          ...updateData
        };
      }
    },
    async searchUsers() {
      this.currentPage = 1;
      await this.fetchUsers();
    },
    async onPageChange(page) {
      this.currentPage = page;
      await this.fetchTransactions();
    },
    deleteItemSelected() {
      if (confirm(`Bạn đồng ý xóa ${this.countItemSelected} người dùng chứ?`)) {
        const ids = this.items.filter(item => (item.checked)).map(item => item.data.id);
        Api.post("/api/transaction-histories/delete-many", {
          transactionIds: ids
        }).then(response => {
          Notify.success()
          $('#confirm-model').modal('hide');
          this.items = this.items.filter(item => !item.checked)
        }).catch(error => {
          if(error.response && error.response.data){

            Notify.error(null,error.response.data.error);
          }
          else{
            Notify.error()
          }
        })
      }
    },
    getStatusClass(status) {
      switch (status) {
        case 'pending':
          return 'bg-info';
        case 'cancelled':
          return 'bg-warning';
        case 'success':
          return 'bg-success';
        case 'failed':
          return 'bg-danger';
        default:
          return 'bg-secondary';
      }
    },
    getStatusText(status) {
      switch (status) {
        case 'pending':
          return 'Đang đợi xác nhận';
        case 'cancelled':
          return 'Đã hủy';
        case 'success':
          return 'Đã hoàn thành';
        case 'failed':
          return 'Bị chặn';
        default:
          return 'Không rõ';
      }
    },
    handleSort(sort){
      this.sortBy = sort.column.sortBy
      this.sortOrder = sort.order === 'asc' ? 1: -1

      this.fetchTransactions()
    },
    showConfirmModal(transactionId, action) {
      this.selectedTransactionId = transactionId;
      this.selectedAction = action;
      this.$refs.confirmModal.showModal();
    },
    showTransactionDetailModal(transactionId){
      this.selectedTransactionId = transactionId;
      this.$refs.transactionDetailModal.showModal();
    },
    handleConfirm(transactionId) {
      switch (this.selectedAction) {
        case 'confirm':
          this.confirmTransaction(transactionId,'success');
          break;
        case 'cancel':
          this.confirmTransaction(transactionId,'failed');
          break;
        case 'delete':
          this.deleteTransaction(transactionId);
          break;
      }
    },
    async confirmTransaction(transactionId,status) {
      try {
        await Api.put(`/api/transaction-histories/edit/${transactionId}`,{
          transaction_status: status
        });
        const item = this.items.find(item => item.data.id === transactionId);
        item.data.transaction_status = status;
        Notify.success();
      } catch (error) {
        if(error.response && error.response.data){

          Notify.error(null,error.response.data.error);
        }
        else{
          Notify.error()
        }
      }
    },
    async deleteTransaction(transactionId) {
      try {
        await Api.delete(`/api/transaction-histories/delete/${transactionId}`);
        this.items = this.items.filter(item => item.data.id !== transactionId);
        Notify.success('Giao dịch đã được xóa thành công.');
      } catch (error) {
        console.error('Error deleting transaction:', error);
        if(error.response && error.response.data){

          Notify.error(null,error.response.data.error);
        }
        else{
          Notify.error()
        }
      }
    },
    getTransactionTypeClass(transactionType) {
      switch (transactionType) {
        case 'deposit':
          return 'bg-label-success';
        case 'withdraw':
          return 'bg-label-danger';
        case 'sell':
          return 'bg-label-warning';
        case 'buy':
          return 'bg-label-info';
        case 'exchange':
          return 'bg-label-primary';
        default:
          return 'bg-label-secondary';
      }
    },
    getTransactionTypeLabel(transactionType) {
      switch (transactionType) {
        case 'deposit':
          return 'Nạp tiền';
        case 'withdraw':
          return 'Rút tiền';
        case 'sell':
          return 'Bán';
        case 'buy':
          return 'Mua';
        case 'exchange':
          return 'Quy đổi';
        case 'withdraw-vnd':
          return 'Rút VNĐ về ngân hàng địa phương';
        default:
          return 'Không rõ';
      }
    },
    getTransactionAmountClass(transactionType) {
      switch (transactionType) {
        case 'withdraw':
          return 'text-danger';
        case 'deposit':
          return 'text-success';
        case 'sell':
          return 'text-warning';
        case 'buy':
          return 'text-info';
        case 'exchange':
          return 'text-primary';
        case 'withdraw-vnd':
          return 'text-secondary';
        default:
          return 'text-secondary';
      }
    },
    getTransactionIcon(transactionType) {
      switch (transactionType) {
        case 'withdraw':
          return 'bx bx-down-arrow-alt';
        case 'deposit':
          return 'bx bx-up-arrow-alt';
        case 'sell':
          return 'bx bx-transfer-alt';
        case 'buy':
          return 'bx bx-transfer-alt';
        case 'exchange':
          return 'bx bx-refresh';
        case 'withdraw-vnd':
          return 'bx bxs-chevrons-down';
        default:
          return 'bx bx-question-mark';
      }
    },
  },
  mounted() {
    this.fetchTransactions();
    if(this.userId){
      this.transactions_columns = this.transactions_columns.filter(item => {
        return item.slot !=='user_info'
      })
    }
  }
}
</script>