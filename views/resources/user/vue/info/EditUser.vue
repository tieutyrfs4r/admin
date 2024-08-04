<template>
  <div class="modal fade" :id="modalId" tabindex="-1">
    <div class="modal-dialog modal-lg modal-simple">
      <div class="modal-content p-3 p-md-5">
        <div class="modal-body">
          <button type="button" class="btn-close" @click="hide()"></button>
          <div class="text-center mb-4">
            <h3>Chỉnh sửa thông tin người dùng</h3>
          </div>
          <form @submit.prevent="updateUser" class="row g-3">
            <div class="col-12 col-md-6">
              <label class="form-label" :for="getInputId('fullName')">Họ và tên*</label>
              <input type="text" :id="getInputId('fullName')" v-model="editedUser.full_name" class="form-control" placeholder="Nguyễn Văn A" />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label" :for="getInputId('email')">Email*</label>
              <input type="email" :id="getInputId('email')" v-model="editedUser.email" class="form-control" placeholder="example@domain.com" />
            </div>
            <div class="col-12 col-md-12">
              <label class="form-label" :for="getInputId('withdrawEnabled')">Đã xác nhận email</label>
              <div class="form-check form-switch mb-2">
                <input class="form-check-input" :id="getInputId('email_verified')" v-model="editedUser.email_verified" type="checkbox" />
                <label class="form-check-label" :for="getInputId('email_verified')">{{ editedUser.email_verified ? 'Đã xác nhận' : 'Chưa xác nhận' }}</label>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label" :for="getInputId('phone')">Số điện thoại*</label>
              <div class="input-group input-group-merge">
                <span class="input-group-text">+84</span>
                <input type="text" :id="getInputId('phone')" v-model="editedUser.phone_number" class="form-control phone-number-mask" placeholder="123 456 7890" />
              </div>
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label" :for="getInputId('address')">Địa chỉ*</label>
              <input type="text" :id="getInputId('address')" v-model="editedUser.address" class="form-control" placeholder="Địa chỉ" />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label" :for="getInputId('ward')">Phường/Xã*</label>
              <input type="text" :id="getInputId('ward')" v-model="editedUser.ward" class="form-control" placeholder="Phường/Xã" />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label" :for="getInputId('district')">Quận/Huyện*</label>
              <input type="text" :id="getInputId('district')" v-model="editedUser.district" class="form-control" placeholder="Quận/Huyện" />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label" :for="getInputId('province')">Tỉnh/Thành phố*</label>
              <input type="text" :id="getInputId('province')" v-model="editedUser.province" class="form-control" placeholder="Tỉnh/Thành phố" />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label" :for="getInputId('status')">Trạng thái*</label>
              <select :id="getInputId('status')" v-model="editedUser.status" class="form-select">
                <option value="pending">Đợi xác minh</option>
                <option value="active">Hoạt động</option>
                <option value="locked">Bị khóa</option>
              </select>
            </div>
            <div class="col-12" v-if="editedUser.status === 'locked'">
              <label class="form-label" :for="getInputId('show_lock_message')">Bật/Tắt thông báo khóa của người dùng ở trang chính</label>
              <div class="form-check form-switch mb-2">
                <input class="form-check-input" :id="getInputId('show_lock_message')" v-model="editedUser.show_lock_message" type="checkbox" />
                <label class="form-check-label" :for="getInputId('show_lock_message')">{{ editedUser.show_lock_message ? 'Bật' : 'Tắt' }}</label>
              </div>
            </div>
            <div class="col-12" v-if="editedUser.status === 'locked' && !editedUser.show_lock_message">
              <label for="lockMessageTime" class="form-label">Thời gian chờ để ẩn thông báo khi thực hiện giao dịch:</label>
              <input class="form-control" id="lockMessageTime" v-model="editedUser.lock_message_limit_time"/>
            </div>
            <div class="col-12" v-if="editedUser.status === 'locked'">
              <label class="form-label" :for="getInputId('lockMessage')">Tin nhắn khóa*</label>
              <textarea :id="getInputId('lockMessage')" v-model="editedUser.lock_message" class="form-control" rows="3" placeholder="Nhập tin nhắn khóa"></textarea>
            </div>
          
            <div class="col-12">
              <label class="form-label" :for="getInputId('level')">Cấp độ</label>
              <select :id="getInputId('level')" v-model="editedUser.level" class="form-select">
                <option v-for="level in levels" :key="level.id" :value="level.id">{{ level.level_name }}</option>
              </select>
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label" :for="getInputId('referralCode')">Mã liên kết*</label>
              <input type="text" :id="getInputId('referralCode')" v-model="editedUser.referral_code" class="form-control" placeholder="Nhập mã giới thiệu" />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label" :for="getInputId('inviteCode')">Mã giới thiệu người dùng*</label>
              <input type="text" :id="getInputId('inviteCode')" v-model="editedUser.invite_code" class="form-control" placeholder="Nhập mã giới thiệu người dùng" />
            </div>
            <div class="col-12 col-md-12">
              <label class="form-label" :for="getInputId('withdrawEnabled')">Bật tính năng cho phép rút tiền</label>
              <div class="form-check form-switch mb-2">
                <input class="form-check-input" :id="getInputId('withdrawEnabled')" v-model="editedUser.withdraw_enabled" type="checkbox" />
                <label class="form-check-label" :for="getInputId('withdrawEnabled')">{{ editedUser.withdraw_enabled ? 'Bật' : 'Tắt' }}</label>
              </div>
            </div>
            <div class="col-12">
              <label class="form-label" :for="getInputId('show_notify_message')">Bật tắt tính hiển thị thông báo</label>
              <div class="form-check form-switch mb-2">
                <input class="form-check-input" :id="getInputId('show_notify_message')" v-model="editedUser.show_notify_message" type="checkbox" />
                <label class="form-check-label" :for="getInputId('show_notify_message')">{{ editedUser.show_notify_message ? 'Bật' : 'Tắt' }}</label>
              </div>
            </div>
            <div class="col-12 col-md-6" v-if="editedUser.show_notify_message">
              <label class="form-label" :for="getInputId('inviteCode')">Loại thông báo*</label>
              <select v-model="editedUser.notify_type" class="form-select">
       
                <option value="success">Thành công</option>
                <option value="warning">Cảnh báo</option>
                <option value="danger">Nguy hiểm</option>
              </select>
            </div>
            <div class="col-12 col-md-6" v-if="editedUser.show_notify_message">
              <label class="form-label" :for="getInputId('notify_message')">Nội dung thông báo</label>
              <input type="text" :id="getInputId('notify_message')" v-model="editedUser.notify_message" class="form-control" placeholder="Nhập nội dung thông báo" />
            </div>
            <div class="col-12">
              <label class="form-label" :for="getInputId('exchangeEnabled')">Bật tính năng cho phép bán</label>
              <div class="form-check form-switch mb-2">
                <input class="form-check-input" :id="getInputId('exchangeEnabled')" v-model="editedUser.exchange_enabled" type="checkbox" />
                <label class="form-check-label" :for="getInputId('exchangeEnabled')">{{ editedUser.exchange_enabled ? 'Bật' : 'Tắt' }}</label>
              </div>
            </div>
            <div class="col-12 col-md-6" v-if="editedUser.exchange_enabled">
              <label class="form-label" :for="getInputId('withdrawMinCount')">Số lần bán tối đa trong ngày*</label>
              <input type="number" :id="getInputId('withdrawMinCount')" v-model="editedUser.exchange_limit_count" class="form-control" placeholder="Nhập số lần bán tối đa" />
            </div>
            <div class="col-12 col-md-6" v-if="editedUser.exchange_enabled">
              <label class="form-label" :for="getInputId('withdrawMinCount')">Số lần bán còn lại*</label>
              <input type="number" :id="getInputId('withdrawMinCount')" v-model="editedUser.exchange_remaining_count" class="form-control" placeholder="Nhập số lần bán tối đa" />
            </div>
            <div class="col-12 col-md-6" v-if="editedUser.exchange_enabled">
              <label class="form-label" :for="getInputId('withdrawMinCount')">Bán tối thiểu (Cho tất cả loại tiền)</label>
              <input type="number" :id="getInputId('withdrawMinCount')" v-model="editedUser.exchange_min" class="form-control" placeholder="Nhập số lượng bán tối thiểu" />
            </div>
            <div class="col-12 col-md-6" v-if="editedUser.exchange_enabled">
              <label class="form-label" :for="getInputId('withdrawMinCount')">Bán tối đa (Cho tất cả loại tiền)</label>
              <input type="number" :id="getInputId('withdrawMinCount')" v-model="editedUser.exchange_max" class="form-control" placeholder="Nhập số lượng bán tối đa" />
            </div>
            
            
            <div class="col-12">
              <label class="form-label" :for="getInputId('usdtVndExchangeDiffEnabled')">Bật tính năng chênh lệch tỷ giá USDC/USDT</label>
              <div class="form-check form-switch mb-2">
                <input class="form-check-input" :id="getInputId('usdtVndExchangeDiffEnabled')" v-model="editedUser.usdt_vnd_exchange_diff_enabled" type="checkbox" />
                <label class="form-check-label" :for="getInputId('usdtVndExchangeDiffEnabled')">{{ editedUser.usdt_vnd_exchange_diff_enabled ? 'Bật' : 'Tắt' }}</label>
              </div>
            </div>
            <div class="col-12" v-if="editedUser.usdt_vnd_exchange_diff_enabled">
              <label class="form-label" :for="getInputId('usdtVndExchangeDiffType')">Loại chênh lệch tỷ giá USDT/USDC*</label>
              <select :id="getInputId('usdtVndExchangeDiffType')" v-model="editedUser.usdt_vnd_exchange_diff_type" class="form-select" required>
                <option value="default">Đặt giá trị mặc định</option>
                <option value="percentage">Phần trăm</option>
                <option value="value">Giá trị</option>
              </select>
            </div>
            <div class="col-12 col-md-6" v-if="editedUser.usdt_vnd_exchange_diff_enabled">
              <label class="form-label" :for="getInputId('usdtVndExchangeDiff')">{{getTextLabelExchangeDiff(editedUser.usdt_vnd_exchange_diff_type)}}</label>
              <input type="number" step="0.00000001" :id="getInputId('usdtVndExchangeDiff')" v-model="editedUser.usdt_vnd_exchange_diff" class="form-control" placeholder="Nhập giá trị chênh lệch" required />
              <div v-if="editedUser.usdt_vnd_exchange_diff_type !== 'default'"><span class="text-info">Ví dụ 1 USDT = 1 USDC, sau khi thay đổi sẽ được: </span></div>
              <span v-if="editedUser.usdt_vnd_exchange_diff_type === 'default'" class="text-warning">1 USDT = {{ (1 / editedUser.usdt_vnd_exchange_diff) }} USDC</span>
              <div>
                <span v-if="editedUser.usdt_vnd_exchange_diff_type === 'default'" class="text-warning">1 USDC = {{ (editedUser.usdt_vnd_exchange_diff) }} USDT</span>
              </div>
              <span v-if="editedUser.usdt_vnd_exchange_diff_type === 'percentage'" class="text-warning">1 USDT = {{ (1 / ( 1 + editedUser.usdt_vnd_exchange_diff / 100)).toFixed(6) }} USDC</span>
              <div>
                <span v-if="editedUser.usdt_vnd_exchange_diff_type === 'percentage'" class="text-warning">1 USDC = {{ (1 + editedUser.usdt_vnd_exchange_diff / 100).toFixed(6) }} USDT</span>
              </div>
              <span v-if="editedUser.usdt_vnd_exchange_diff_type === 'value'" class="text-warning">1 USDT = {{ (1 / ( 1 + editedUser.usdt_vnd_exchange_diff)).toFixed(6) }} USDC</span>
              <div>
                <span v-if="editedUser.usdt_vnd_exchange_diff_type === 'value'" class="text-warning">1 USDC = {{ (1 + editedUser.usdt_vnd_exchange_diff).toFixed(6) }} USDT</span>
              </div>
            </div>
            <div v-if="editedUser.usdt_vnd_exchange_diff_type === 'default' && editedUser.usdt_vnd_exchange_diff_enabled" class="col-12 col-md-6">
              <label class="form-label" :for="getInputId('usdtVndExchangeDiffRound')">Khoảng giá chênh lệnh USDT/USDC*</label>
              <input type="number" step="0.000001" :id="getInputId('usdtVndExchangeDiffRound')" v-model="editedUser.usdt_vnd_exchange_diff_round" class="form-control" placeholder="Nhập giá trị chênh lệch" required />
              <span v-if="editedUser.usdt_vnd_exchange_diff_type === 'default'" class="text-warning">Giá USDC sẽ ngẫu nhiên trong khoản từ {{ (editedUser.usdt_vnd_exchange_diff - editedUser.usdt_vnd_exchange_diff_round).toFixed(6) }} đến {{ (editedUser.usdt_vnd_exchange_diff + editedUser.usdt_vnd_exchange_diff_round).toFixed(6) }} USDT</span>
            </div>
            <div class="col-12 text-center">
              <button type="submit" class="btn btn-primary me-1">Lưu</button>
              <!-- <button type="button" class="btn btn-danger me-1" @click="resetPassword" :disabled="isLoadingResetPassword">
                <span v-if="isLoadingResetPassword" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                {{isLoadingResetPassword ? 'Đang gửi mã' : 'Đặt lại mật khẩu'}}
              </button> -->
<!--              <button type="button" v-if="!editedUser.email_verified" class="btn btn-warning me-1" @click="sendEmailToVerify" :disabled="isLoadingSendEmail">-->
<!--                <span v-if="isLoadingSendEmail" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>-->
<!--                {{isLoadingSendEmail ? 'Đang gửi mã xác nhận tài khoản' : 'Gửi mã xác nhận tài khoản'}}-->
<!--              </button>-->
              <button type="reset" class="btn btn-warning" @click="hide()">Đóng</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Api from "../../../common/js/Api";
import Notify from "../../../common/js/Notify";

export default {
  props: {
    user: {
      type: Object,
      required: true,
    },
    levels: {
      type: Array,
      required: true,
    },
  },
  watch: {
    user: {
      handler(newValue) {
        const user = {}
        Object.assign(user, newValue)
        if(user.level){
          user.level = user.level.id
        }
        this.editedUser = user;
      },
      deep: true,
    },
  },
  data() {
    return {
      modalId: `editUser-${Math.random().toString(36).substr(2, 9)}`,
      editedUser: { ...this.user },
      isLoadingResetPassword: false,
      isLoadingSendEmail: false,
    };
  },
  methods: {
    getInputId(field) {
      return `input-${field}-${Math.random().toString(36).substr(2, 9)}`;
    },
    getTextLabelExchangeDiff(type){
      switch (type) {
        case 'default': {
          return 'Giá trị mặc định USDT/USCD*'
        }
        case 'percentage': {
          return 'Tỉ lệ chênh lệch tỷ giá USDT/USCD (%)*'
        }
        case 'value' : {
          return 'Giá trị chênh lệch tỷ giá USDT/USCD*'
        }
        default : {
          return 'Hãy chọn một loại'
        }
      }
    },
    show() {
      $(`#${this.modalId}`).modal('show');
    },
    hide() {
      $(`#${this.modalId}`).modal('hide');
    },
    async updateUser() {
      try {
        const response = await Api.put(`/api/users/edit/${this.user.id}`, this.editedUser);
        this.$emit('user-updated', response.data);
        $(`#${this.modalId}`).modal('hide');
        Notify.success()
      } catch (error) {
        console.error('Error updating user:', error);
        if(error.response && error.response.data){

          Notify.error(null,error.response.data.error);
        }
        else{
          Notify.error()
        }
      }
    },
    async resetPassword() {
      try {
        this.isLoadingResetPassword = true
        await Api.post(`/api/users/send-reset-password-code/${this.user.id}`);
        Notify.success(null,'Mã đặt lại mật khẩu đã được gửi về email người dùng')
      } catch (error) {
        console.error('Error:', error);
        if(error.response && error.response.data){

          Notify.error(null,error.response.data.error);
        }
        else{
          Notify.error()
        }
      }finally {
        this.isLoadingResetPassword = false
      }
    },
    async sendEmailToVerify() {
      try {
        this.isLoadingSendEmail = true
        const response = await Api.post(`/api/users/send-verification-email/${this.user.id}`);
        Notify.success(null,'Đường dẫn xác minh email đã được gửi về email người dùng')
        Notify.success()
      } catch (error) {
        console.error('Error:', error);
        if(error.response && error.response.data){

          Notify.error(null,error.response.data.error);
        }
        else{
          Notify.error()
        }
      }finally {
        this.isLoadingSendEmail = false
      }
    },
  },
};
</script>