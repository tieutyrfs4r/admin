<template>
  <div class="modal fade" :id="modalId" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Chi tiết giao dịch</h5>
          <button type="button" class="btn-close" @click="hideModal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateTransaction">
            <div class="row">
              <div class="col-4">
                <div class="mb-3">
                  <label class="form-label">Loại giao dịch: <span class="text-danger text-body">{{ getTransactionTypeText(transaction.transaction_type) }}</span>
                  </label>
                </div>
              </div>
              <div class="col-4" v-if="showIn(['deposit', 'withdraw', 'sell', 'buy', 'exchange'])">
                <div class="mb-3">
                  <label class="form-label">Loại tiền: <span class="text-danger text-body">{{ getTransactionCryptocurrencyName(transaction.cryptocurrency) }}</span>
                  </label>
                </div>
              </div>
              <div class="col-12" v-if="showIn(['deposit','withdraw'])">
                <div class="mb-3">
                  <label class="form-label">Địa chỉ ví nhận: <span class="text-danger text-body">{{ transaction.receiver_wallet_address }}</span>
                  </label>
                  <i class="bx bx-clipboard ms-2" style="cursor: pointer; font-size:30px" @click="copyToClipboard(transaction.receiver_wallet_address)"></i>
                </div>
              </div>
              <div class="col-4" v-if="showIn(['deposit','withdraw'])">
                <div class="mb-3">
                  <label class="form-label">Mạng lưới giao dịch: <span class="text-danger text-body">{{ transaction.transaction_network }}</span>
                  </label>
                  <i class="bx bx-clipboard ms-2" style="cursor: pointer; font-size:30px" @click="copyToClipboard(transaction.transaction_network)"></i>
                </div>
              </div>
              <div class="col-4">
                <div class="mb-3">
                  <label class="form-label">Số tiền giao dịch: <span class="text-danger text-body">{{transaction.transaction_amount ? transaction.transaction_amount.toLocaleString('en-US', {maximumFractionDigits: 8}) : ''}}</span>
                  </label>
                  <i class="bx bx-clipboard ms-2" style="cursor: pointer; font-size:30px" @click="copyToClipboard(transaction.transaction_amount)"></i>
                </div>
              </div>
              <div class="col-4" v-if="showIn(['exchange', 'sell'])">
                <div class="mb-3">
                  <label class="form-label">Tỉ giá: <span class="text-danger text-body">{{transaction.transaction_rate ? transaction.transaction_rate.toLocaleString('en-US', {maximumFractionDigits: 8}) : ''}}</span>
                  </label>
                </div>
              </div>
              <div class="col-4" v-if="showIn(['exchange', 'sell'])">
                <div class="mb-3">
                  <label class="form-label">Tổng tiền nhận: <span class="text-danger text-body">{{(transaction.transaction_rate * transaction.transaction_amount).toLocaleString('en-US', {maximumFractionDigits: 8})}}</span>
                  </label>
                </div>
              </div>
              <div class="col-md-4" v-if="transaction.balance_before_transaction">
                <div class="mb-3">
                  <label class="form-label">Số dư trước giao dịch: <span class="text-danger text-body">{{transaction.balance_before_transaction !== undefined ? transaction.balance_before_transaction.toLocaleString('en-US', {maximumFractionDigits: 8}) : ''}}</span>
                  </label>
                </div>
              </div>
              <div class="col-md-4" v-if="transaction.balance_after_transaction">
                <div class="mb-3">
                  <label class="form-label">Số dư sau giao dịch: <span class="text-danger text-body">{{transaction.balance_after_transaction !== undefined ? transaction.balance_after_transaction.toLocaleString('en-US', {maximumFractionDigits: 8}) : ''}}</span>
                  </label>
                </div>
              </div>
              <div class="col-12" v-if="showIn(['withdraw-vnd'])">
                <div class="mb-3">
                  <label class="form-label">Thông tin ngân hàng</label>
                  <div class="row">
                    <div class="col-md-6">
                      <div class="d-flex align-items-center">
                        <label class="form-label">Tên ngân hàng: <span class="text-danger text-body">{{ transaction.local_bank_info.bank_name }}</span>
                        </label>
                        <i class="bx bx-clipboard ms-2" style="cursor: pointer; font-size:30px" @click="copyToClipboard(transaction.local_bank_info.bank_name)"></i>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Chi nhánh: <span class="text-danger text-body">{{ transaction.local_bank_info.branch_name }}</span>
                      </label>
                    </div>
                    <div class="col-md-6">
                      <div class="d-flex align-items-center">
                        <label class="form-label">Số tài khoản: <span class="text-danger text-body">{{ transaction.local_bank_info.account_number }}</span>
                        </label>
                        <i class="bx bx-clipboard ms-2" style="cursor: pointer; font-size:30px" @click="copyToClipboard(transaction.local_bank_info.account_number)"></i>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="d-flex align-items-center">
                        <label class="form-label">Tên tài khoản: <span class="text-danger text-body">{{ transaction.local_bank_info.account_name }}</span>
                        </label>
                        <i class="bx bx-clipboard ms-2" style="cursor: pointer; font-size:30px" @click="copyToClipboard(transaction.local_bank_info.account_name)"></i>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Số tiền: <span class="text-danger text-body">{{transaction.transaction_amount ? transaction.transaction_amount.toLocaleString('en-US', {maximumFractionDigits: 8}) : ''}}</span>
                        </label>
                        <i class="bx bx-clipboard ms-2" style="cursor: pointer; font-size:30px" @click="copyToClipboard(transaction.transaction_amount)"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-12">
                <div class="mb-3">
                  <label class="form-label">Trạng thái giao dịch</label>
                  <select v-model="transaction.transaction_status" class="form-select">
                    <option value="pending">Đang chờ xử lý</option>
                    <option value="success">Thành công</option>
                    <option value="failed">Thất bại</option>
                    <option value="cancelled">Hủy giao dịch</option>
                  </select>
                </div>
              </div>
              <div class="col-12" v-if="transaction.transaction_status === 'failed' || transaction.transaction_status === 'cancelled'">
                <div class="mb-3">
                  <label class="form-label">Lý do {{ transaction.transaction_status === 'failed'? 'thất bại' : 'hủy giao dịch' }}</label>
                  <textarea v-model="transaction.failure_reason" class="form-control" rows="3" placeholder="Nhập lý do thất bại"></textarea>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Ngày tạo</label>
                  <input type="datetime-local" :value="formattedCreatedAt" class="form-control" readonly />
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Ngày cập nhật</label>
                  <input type="datetime-local" :value="formattedUpdatedAt" class="form-control" readonly />
                </div>
              </div>
              <div class="col-12" v-if="showIn(['deposit'])">
                <div class="mb-3">
                  <label class="form-label">Hình ảnh giao dịch</label>
                  <div class="row">
                    <div v-for="(image, index) in transaction.transaction_images" :key="index" class="col-2">
                      <img style="cursor: pointer;" @click="openImageInNewTab(image.image_url)" class="img-fluid rounded my-4" height="250" width="250" alt="User avatar" :src="image.image_url">
                      <p>Hình ảnh: {{ index + 1 }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-12">
                <div class="mb-3">
                  <label class="form-label">Ghi chú của quản trị viên</label>
                  <textarea v-model="transaction.admin_notes" class="form-control" rows="3" placeholder="Nhập ghi chú của quản trị viên"></textarea>
                </div>
              </div>
            </div>
            <div class="d-flex justify-content-center mt-3">
              <button type="submit" class="btn btn-primary me-3">Cập nhật</button>
              <button type="button" class="btn btn-danger" @click="deleteTransaction">Xóa</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Api from '../../../common/js/Api';
import Notify from '../../../common/js/Notify';

export default {
  props: {
    transactionId: {
      type: String,
      required: true,
    },
    cryptocurrencies: {
      type: Array,
      required: true,
    },
  },
  computed: {
    formattedCreatedAt() {
      return this.formatDateTime(this.transaction.created_at);
    },
    formattedUpdatedAt() {
      return this.formatDateTime(this.transaction.updated_at);
    },
  },
  watch: {
    transactionId: {
      handler(value){
        if(value && value !==''){
          this.fetchTransactionDetail(value);
        }
      },
      deep: true
    }
  },
  data() {
    return {
      modalId: `transaction-detail-modal-${Math.random().toString(36).substr(2, 9)}`,
      transaction: {},
    };
  },
  methods: {
    showModal() {
      $(`#${this.modalId}`).modal('show');
    },
    hideModal() {
      $(`#${this.modalId}`).modal('hide');
    },
    showIn(transaction_types){
      return transaction_types.includes(this.transaction.transaction_type)
    },
    openImageInNewTab(url) {
      window.open(url, '_blank');
    },
    async fetchTransactionDetail(transactionId) {
      try {
        const response = await Api.get(`/api/transaction-histories/info/${transactionId}`);
        this.transaction = response.data;
        if(this.transaction.cryptocurrency){
          this.transaction.cryptocurrency = this.transaction.cryptocurrency.id
        }
        delete this.user
      } catch (error) {
        console.error('Error fetching transaction detail:', error);
        Notify.error('Có lỗi xảy ra khi lấy chi tiết giao dịch.');
      }
    },
    async updateTransaction() {
      try {
        const response = await Api.put(`/api/transaction-histories/edit/${this.transactionId}`, this.transaction);
        Notify.success('Cập nhật giao dịch thành công.');

        this.$emit('transaction-updated',response.data);
        this.hideModal()
      } catch (error) {
        console.error('Error updating transaction:', error);
        Notify.error('Có lỗi xảy ra khi cập nhật giao dịch.');
      }
    },
    copyToClipboard(text) {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
            .then(() => {
              Notify.success(null,`Đã sao chép nội dung ${text}`);
            })
            .catch((error) => {
              Notify.error(null,'Lỗi khi sao chép.');
              console.error('Error copying:', error);
            });
      } else {
        // Fallback để sao chép địa chỉ ví nếu Clipboard API không khả dụng
        try {
          let tempInput = document.createElement('input');
          tempInput.value = text;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
          Notify.success(null,`Đã sao chép nội dung ${text}`);
        } catch (error) {
          Notify.error(null,'Lỗi khi sao chép.');
          console.error('Error copying', error);
        }
      }
    },
    getTransactionTypeText(transactionType) {
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
    getTransactionCryptocurrencyName(cryptocurrency_id) {

      return this.cryptocurrencies.find(c => c.id === cryptocurrency_id)?.cryptocurrency_name;
    },
    async deleteTransaction() {
      if (confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
        try {
          await Api.delete(`/api/transaction-histories/${this.transactionId}`);
          Notify.success('Xóa giao dịch thành công.');
          this.$emit('transaction-deleted');
          this.hideModal();
        } catch (error) {
          console.error('Error deleting transaction:', error);
          Notify.error('Có lỗi xảy ra khi xóa giao dịch.');
        }
      }
    },
    formatDateTime(dateTime) {
      if (!dateTime) return '';
      const date = new Date(dateTime);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    },
  },
};
</script>