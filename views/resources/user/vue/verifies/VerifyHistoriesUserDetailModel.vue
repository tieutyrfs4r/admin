<template>
  <div class="modal fade" :id="modalId" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel1">{{ isEditMode ? 'Chỉnh sửa' : 'Thêm mới' }} xác minh người dùng</h5>
          <button type="button" class="btn-close" @click="hideModal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="row">
              <div class="col-12">
                <div class="mb-3">
                  <label class="form-label">Loại xác minh</label>
                  <input type="text" v-model="formData.subject" class="form-control" placeholder="Nhập loại xác minh" />
                </div>
              </div>
              <div class="col-12">
                <div class="mb-3">
                  <label class="form-label">Tin nhắn đến khách hàng</label>
                  <input type="text" v-model="formData.requested" class="form-control" placeholder="Nhập yêu cầu xác minh" />
                </div>
              </div>
              <div class="col-12" v-if="isEditMode && formData.submitted_information.length > 0">
                <div class="mb-2">
                  <label class="form-label">Hình ảnh khách hàng gửi để xác minh:</label>
                  <div class="row">
                    <div v-for="(file, fileIndex) in formData.submitted_information" :key="fileIndex" class="col-2">
                      <img style="cursor: pointer;" @click="openImageInNewTab(file.file_url)" class="img-fluid rounded my-1" height="400" width="400" :alt="file.file_name" :src="file.file_url">
                      <p>{{ file.file_name }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-12" v-if="isEditMode">
                <div class="mb-3">
                  <label class="form-label">Trạng thái xác minh</label>
                  <select v-model="formData.status" class="form-select">
                    <option value="pending">Đang chờ xử lý</option>
                    <option value="success">Thành công</option>
                    <option value="failed">Thất bại</option>
                  </select>
                </div>
              </div>
              <div class="col-12" v-if="isEditMode && formData.status !== 'success'">
                <div class="form-check mb-3">
                  <input class="form-check-input" type="checkbox" v-model="formData.allow_appeal">
                  <label class="form-check-label">Cho phép khiếu nại</label>
                </div>
              </div>
              <div class="col-12" v-if="formData.status === 'failed'">
                <div class="mb-3">
                  <label class="form-label">Lý do thất bại</label>
                  <textarea v-model="formData.fail_reason" class="form-control" placeholder="Nhập lý do thất bại" />
                </div>
              </div>
              <div class="col-12">
                <div class="form-check mb-3">
                  <input class="form-check-input" type="checkbox" v-model="formData.enable_payment_request">
                  <label class="form-check-label">Bật yêu cầu thanh toán</label>
                </div>
              </div>
              <div class="col-12" v-if="formData.enable_payment_request">
                <div class="mb-3">
                  <label class="form-label">Loại tiền điện tử yêu cầu thanh toán</label>
                  <select v-model="formData.payment_request_cryptocurrency" class="form-select">
                    <option v-for="crypto in cryptocurrencies" :key="crypto.id" :value="crypto.id">{{ crypto.cryptocurrency_name }}</option>
                  </select>
                </div>
              </div>
              
              <!-- <div class="col-12" v-if="formData.enable_payment_request && this.isEditMode">
                <div class="form-check mb-3">
                  <input class="form-check-input" type="checkbox" v-model="formData.payment_request_counted">
                  <label class="form-check-label">Đã cộng tiền vào ví người dùng (Nếu chưa thì khi trạng thái là thành công sẽ tự động cộng thêm vào ví người dùng)</label>
                </div>
              </div> -->
              
              <div class="col-12" v-if="formData.enable_payment_request && this.isEditMode">
                <div class="mb-3">
                  <label class="form-label">Địa chỉ ví người nhận yêu cầu thanh toán</label>
                  <input type="text" v-model="formData.payment_request_receiver_wallet_address" class="form-control" placeholder="Nhập địa chỉ ví người nhận yêu cầu thanh toán" />
                </div>
              </div>
              <div class="col-12" v-if="formData.enable_payment_request && this.isEditMode">
                <div class="mb-3">
                  <label class="form-label">Mạng giao dịch yêu cầu thanh toán</label>
                  <input type="text" v-model="formData.payment_request_transaction_network" class="form-control" placeholder="Nhập mạng giao dịch yêu cầu thanh toán" />
                </div>
              </div>
            </div>
            <div class="d-flex justify-content-center mt-3">
              <button type="submit" class="btn btn-primary me-3">{{ isEditMode ? 'Cập nhật' : 'Thêm mới' }}</button>
              <button type="button" class="btn btn-secondary" @click="hideModal">Hủy</button>
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
      verifyUserId: {
        type: String,
        default: null,
      },
      userId: {
        type: String,
        required: true,
      },
      cryptocurrencies: {
        type: Array,
        required: true,
      },
    },
    data() {
      return {
        modalId: `verification-detail-modal-${Math.random().toString(36).substr(2, 9)}`,
        formData: {
          subject: '',
          update_at: '',
          requested: '',
          status: 'pending',
          fail_reason: '',
          allow_appeal: false,
          submitted_information: [],
          enable_payment_request: false,
          payment_request_cryptocurrency: null,
          payment_request_amount: 0,
       
          payment_request_counted: false,
       
          payment_request_receiver_wallet_address: '',
          payment_request_transaction_network: '',
        },
      };
    },
    computed: {
      isEditMode() {
        return !!this.verifyUserId;
      },
      formattedUpdateAt: {
        get() {
          return this.formatDateTime(this.formData.update_at);
        },
        set(value) {
          this.formData.update_at = value;
        },
      },
    },
    watch: {
      verifyUserId: {
        handler(value) {
          if (value) {
            this.fetchVerificationDetail(value);
          } else {
            this.resetFormData();
          }
        },
        immediate: true,
      },
    },
    methods: {
      showModal() {
        $(`#${this.modalId}`).modal('show');
      },
      hideModal() {
        $(`#${this.modalId}`).modal('hide');
      },
      openImageInNewTab(url) {
        window.open(url, '_blank');
      },
      async fetchVerificationDetail(verifyUserId) {
        try {
          const response = await Api.get(`/api/users/verifies/${this.userId}/info/${verifyUserId}`);
          this.formData = response.data;
        } catch (error) {
          console.error('Error fetching verification detail:', error);
          Notify.error(null, 'Có lỗi xảy ra khi lấy chi tiết xác minh người dùng.');
        }
      },
      async handleSubmit() {
        try {
          const requestData = {
            ...this.formData
          };
          delete requestData.submitted_information;
          if (this.isEditMode) {
            await Api.put(`/api/users/verifies/${this.userId}/edit/${this.verifyUserId}`, requestData);
            Notify.success('Cập nhật thông tin xác minh thành công.');
            this.$emit('verification-updated');
          } else {
            const response = await Api.post(`/api/users/verifies/${this.userId}/create`, requestData);
            Notify.success('Thêm mới xác minh thành công.');
            this.$emit('verification-added',response.data);
          }
          this.hideModal();
        } catch (error) {
          console.error('Error submitting verification:', error);
          Notify.error(null, 'Có lỗi xảy ra khi gửi thông tin xác minh.');
        }
      },
      resetFormData() {
        this.formData = {
          subject: '',
          update_at: '',
          requested: '',
          status: 'pending',
          fail_reason: '',
          allow_appeal: false,
          submitted_information: [],
          enable_payment_request: false,
          payment_request_cryptocurrency: null,
          payment_request_amount: 0,
       
          payment_request_counted: false,
          
          payment_request_receiver_wallet_address: '',
          payment_request_transaction_network: '',
        };
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