<template>
  <div class="card mb-4">

    <div class="card-body">
      <div class="card-title d-flex align-items-start justify-content-between">
        <div class="flex-shrink-0">
          <h5>Các xác minh danh tính</h5>
        </div>
      </div>
      <div class="row mb-3">

        <div class="col-sm-12 col-md-auto align-items-center">
          <button class="btn btn-primary" @click="createVerifyUser" type="button">
            Thêm mới một xác minh
          </button>
        </div>
        <div class="col-sm-12 col-md-auto align-items-center">
          <div class="dropdown">
            <button class="btn buttons-collection dropdown-toggle btn-label-primary me-2" id="dropdownMenuButton2" data-bs-toggle="dropdown" aria-expanded="false">
              <span class="d-sm-inline-block">Các chức năng khác</span>
            </button>
            <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
              <li>  
                <a class="dropdown-item" href="javascript:void(0);" @click="hideVerified = !hideVerified">
                  <i class="text-success bx bx-check" v-if="hideVerified"></i> Ẩn các xác minh đã hoàn thành </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <ul class="timeline">
        <template v-for="(item, index) in verifyUserItems" :key="index" >
          <li class="timeline-item timeline-item-transparent"

              v-if="!hideVerified || (hideVerified && item && item.status !== 'success')"
          >
            <span class="timeline-point-wrapper"><span class="timeline-point timeline-point-primary"></span></span>
            <div class="timeline-event">
              <div class="timeline-header">
                <h3><b>{{item.subject}} </b></h3>
                <small class="text-muted">{{ formatDateTime(item.update_at) }}</small>
              </div>
              <p class="mb-2">
              <span class="mb-0">
                <span v-if="item.status === 'pending'" class="text-info"> (Đang đợi xác minh)</span>
                <span v-if="item.status === 'failed'" class="text-warning"> (Không thể xác minh)</span>
                <span v-if="item.status === 'success'" class="text-primary"> (Đã xác minh)</span>
                <i v-if="item.status === 'pending'" class="bx bx-alarm-exclamation text-lg-start text-info"></i>
                <i v-if="item.status === 'failed'" class="bx bxs-x-circle text-lg-start text-danger"></i>
                <i v-if="item.status === 'success'" class="bx bx-badge-check text-lg-start text-primary"></i>
              </span>
              </p>
              <p class="mb-2"><b>Nội dung yêu cầu:</b> <i>{{ item.requested }}</i></p>
              <p class="mb-2"><b>Yêu cầu thực hiện xác thực thanh toán:</b> <i>{{ item.enable_payment_request? 'Bật' : 'Tắt' }}</i></p>
              <p class="mb-2" v-if="item.enable_payment_request"><b>Loại tiền yêu cầu thanh toán:</b> <i>{{ getNameCrypto(item.payment_request_cryptocurrency)}}</i></p>
              <p class="mb-2" v-if="item.enable_payment_request"><b>Số tiền khách đã nạp:</b> <i>{{item.payment_request_amount.toLocaleString()}} {{ getNameCrypto(item.payment_request_cryptocurrency)}}</i></p>
              <p class="mb-2" v-if="item.enable_payment_request"><b>Trạng thái đã cộng tiền vào ví người dùng:</b> <i>{{ item.payment_request_counted ? 'Đã cộng' : 'Chưa cộng' }}</i></p>
              <p v-if="item.status === 'failed'" class="mb-2"><b>Lý do xác minh thất bại:</b> <i>{{ item.fail_reason }}</i></p>
              <p v-if="item.status === 'failed'" class="mb-2"><b>Được phép kháng cáo tiếp:</b> <i>{{ item.allow_appeal ? 'Có' : 'Không' }}</i></p>
              <div class="mb-2" v-if="item.submitted_information.length > 0">
                <label class="form-label">Hình ảnh khách hàng gửi để xác minh:</label>
                <div class="row">
                  <div v-for="(file, fileIndex) in item.submitted_information" :key="fileIndex" class="col-2">
                    <img style="cursor: pointer;" @click="openImageInNewTab(file.file_url)" class="img-fluid rounded my-1" height="250" width="250" :alt="file.file_name" :src="file.file_url">
                    <p>{{ file.file_name }}</p>
                  </div>
                </div>
              </div>
              <p class="mb-2 text-danger" v-else><i>Chưa nhận được thông tin từ khách hàng</i></p>
              <div class="d-flex justify-content-start">
                <template v-if="item.submitted_information.length > 0">
                  <button @click="approveAppeal(item)" v-if="item.status === 'pending'" class="btn btn-sm btn-primary me-3">Chấp nhận</button>
                  <button @click="rejectAppeal(item)" v-if="item.status === 'pending'" class="btn btn-sm btn-dark me-3">Không chấp nhận</button>
                </template>
                <button @click="editVerifyUser(item)" class="btn btn-sm btn-warning me-3">Chỉnh sửa nội dung</button>
                <button @click="deleteVerifyUser(item)" class="btn btn-sm btn-danger me-3">Xóa</button>
              </div>
            </div>
          </li>
        </template>

        <!-- <li class="timeline-end-indicator">
          <i class="bx bx-check-circle"></i>
        </li> -->
      </ul>
    </div>
    <ConfirmChangeStatusVerifyUser
        ref="confirmChangeStatusVerifyUser"
        :action="confirmAction"
        :user-id="userId"
        :verify-user-id="selectedVerifyUserId"
        @user-status-updated="onUserStatusUpdated"
    />
    <VerifyHistoriesUserDetailModel ref="verifyHistoriesUserDetailModel"  :user-id="userId" :verify-user-id="selectedVerifyUserId"
    @verification-updated="handleVerificationUpdated"
    @verification-deleted="handleVerificationdeleted"
    @verification-added="handleVerificationadded"
    :cryptocurrencies="cryptocurrencies"
    />
  </div>
</template>

<script>
import Api from "../../../common/js/Api";
import ConfirmChangeStatusVerifyUser from "./ConfirmChangeStatusVerifyUser.vue";
import VerifyHistoriesUserDetailModel from "./VerifyHistoriesUserDetailModel.vue";
import Notify from "../../../common/js/Notify";

export default {
  components: {VerifyHistoriesUserDetailModel, ConfirmChangeStatusVerifyUser},
  props: {
    userId: {
      type: String,
      required: true
    },
    cryptocurrencies: {
      type: Array,
      required: true,
      default: []
    }
  },
  data() {
    return {
      verifyUserItems: [],
      confirmAction: '',
      selectedVerifyUserId: null,
      hideVerified: false,
    };
  },
  methods: {
    async fetchVerifyUserItems() {
      try {
        const response = await Api.get(`/api/users/verifies/${this.userId}`);
        this.verifyUserItems = response.data;
      } catch (error) {
        console.error('Error fetching verify user items:', error);
      }
    },
    openImageInNewTab(url) {
      window.open(url, '_blank');
    },
    formatDateTime(dateTime) {
      if (!dateTime) return '';
      const date = new Date(dateTime);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours} Giờ ${minutes} Phút, Ngày ${day}/${month}/${year}`;
    },
    approveAppeal(item) {
      this.confirmAction = 'success';
      this.selectedVerifyUserId = item.id;
      this.$refs.confirmChangeStatusVerifyUser.showModal();
    },
    rejectAppeal(item) {
      this.confirmAction = 'failed';
      this.selectedVerifyUserId = item.id;
      this.$refs.confirmChangeStatusVerifyUser.showModal();
    },
    async onUserStatusUpdated() {
      await this.fetchVerifyUserItems();
    },
    async handleVerificationUpdated() {
      await this.fetchVerifyUserItems();
    },
    async handleVerificationdeleted() {
      await this.fetchVerifyUserItems();
    },
    async handleVerificationadded() {
      await this.fetchVerifyUserItems();
    },
    editVerifyUser(item) {
      this.selectedVerifyUserId = item.id;
      this.$refs.verifyHistoriesUserDetailModel.showModal();
    },
    createVerifyUser() {
      this.selectedVerifyUserId = null;
      this.$refs.verifyHistoriesUserDetailModel.showModal();
    },
    async deleteVerifyUser(item) {
      if(confirm(`Bạn muốn xóa: ${item.subject} chứ?`)){
        try {
          await Api.delete(`/api/users/verifies/${this.userId}/delete/${item.id}`);
          this.verifyUserItems = this.verifyUserItems.filter(it => it.id !== item.id);
          Notify.success()
        } catch (error) {
          console.error('Error fetching verify user items:', error);
          if(error.response && error.response.data){

            Notify.error(null,error.response.data.error);
          }
          else{
            Notify.error()
          }
        }
      }
    },
    getNameCrypto(cryptocurrency_id){
      const cryptocurrency = this.cryptocurrencies.find(item => {
        return item.id === cryptocurrency_id
      })
      return cryptocurrency?.cryptocurrency_name
    }
  },
  mounted() {
    this.fetchVerifyUserItems();
  }
};
</script>