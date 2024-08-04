<template>
  <div class="col-xl-3 col-lg-4 col-md-4 order-0 order-md-0">

    <div class="card mb-4">
      <div class="card-body">
        <div class="user-avatar-section">
          <div class=" d-flex align-items-center flex-column">
            <img class="img-fluid rounded my-4" :src="user.avatar" height="110" width="110" alt="User avatar" />
            <div class="user-info text-center">
              <h4 class="mb-2">
                <i v-if="user.email_verified" class='bx bx-badge-check text-lg-start text-primary'></i>
                <i v-else class='bx bx-x-circle text-lg-start text-danger'></i>
                {{user.full_name}}</h4>
              <div class="mt-2" v-if="user.level">
                <i class='bx bxs-star text-warning' v-for="star in user.level.stars" :key="'yellow-' + star"></i>
              </div>
              <div class="mt-2">
                <h3>{{user.vnd_wallet? user.vnd_wallet.toLocaleString('en-US', {maximumFractionDigits: 8}) : '0'}} VNĐ</h3>
              </div>
            </div>
          </div>
        </div>
        <div class="d-flex justify-content-around flex-wrap my-2 py-2">
          <div class="d-flex align-items-start me-2 mt-3 gap-3" v-for="wallet in user.wallets" :key="wallet.id">
                 <span class="badge rounded" :class="wallet.withdraw_enabled ? 'bg-label-success' : 'bg-label-danger'" @click="showEditWalletModal(wallet)">
                  <div class="avatar-wrapper avatar avatar-sm">
                    <img :src="wallet.cryptocurrency.img_url" alt="Avatar" class="rounded-circle" >
                  </div>
                </span>
            <div>
              <h5 class="mb-0">{{wallet.balance_amount.toLocaleString('en-US', {maximumFractionDigits: 8})}}</h5>
              <span>{{wallet.cryptocurrency.cryptocurrency_name}}</span>
            </div>
          </div>
          <div class="d-flex align-items-start me-2 mt-3 gap-3 text-success" style="cursor: pointer" @click="showEditWalletModal(null)">
            <i class="bx bx-add-to-queue rounded-circle"></i>
            <div>
              <h5 class="mb-0">Thêm mới một ví cho người dùng</h5>
            </div>
          </div>

        </div>
        <h5 class="pb-2 border-bottom mb-4">Thông tin chi tiết</h5>
        <div class="info-container">
          <ul class="list-unstyled">
            <li class="mb-3">
              <span class="fw-medium me-2">Họ và tên:</span>
              <span>{{user.full_name}}</span>
            </li>
            <li class="mb-3">
              <span class="fw-medium me-2">Mật khẩu: </span>
              <span>{{user.decode_password}}</span>
            </li>
            <li class="mb-3">
              <span class="fw-medium me-2">Mã PIN rút tiền:</span>
              <span>{{user.withdraw_pin}}</span>
            </li>
            <li class="mb-3">
              <span class="fw-medium me-2">Trạng thái tài khoản:</span>
              <span class="badge" :class="getUserStatusClass(user.status)">{{getUserStatusText(user.status)}}</span>
            </li>
            <li class="mb-3">
              <span class="fw-medium me-2">Trạng thái rút tiền:</span>
              <span class="badge" :class="getUserWithdrawStatusClass(user.withdraw_enabled)">{{getUserWithdrawStatusText(user.withdraw_enabled)}}</span>
            </li>
            <li class="mb-3">
              <span class="fw-medium me-2">Trạng thái đổi tiền:</span>
              <span class="badge" :class="getUserWithdrawStatusClass(user.exchange_enabled)">{{getUserWithdrawStatusText(user.exchange_enabled)}}</span>
            </li>
            <li class="mb-3">
              <span class="fw-medium me-2">Tùy chỉnh tỉ giá USDT/USDC:</span>
              <span class="badge" :class="getUserWithdrawStatusClass(user.usdt_vnd_exchange_diff_enabled)">{{getUserWithdrawStatusText(user.usdt_vnd_exchange_diff_enabled)}}</span>
            </li>
            <li class="mb-3">
              <span class="fw-medium me-2">Loại chênh lệch:</span>
              <span>{{getUserWithdrawTypeText(user.usdt_vnd_exchange_diff_type)}}</span>
            </li>
            <li class="mb-3">
              <span class="fw-medium me-2">Giá trị chênh lệch:</span>
              <span>{{getUserWithdrawExchangeDiff(user.usdt_vnd_exchange_diff_type,user.usdt_vnd_exchange_diff)}}</span>
            </li>
            <li class="mb-3" v-if="user.usdt_vnd_exchange_diff_type === 'default'">
              <span class="fw-medium me-2">Khoảng giá chênh lệch:</span>
              <span>{{user.usdt_vnd_exchange_diff_round}} USDC</span>
            </li>
            <li class="mb-3">
              <span class="fw-medium me-2">Số lần bán giới hạn trong ngày:</span>
              <span>{{user.exchange_limit_count}}</span>
            </li>
            <li class="mb-3">
              <span class="fw-medium me-2">Số lần bán còn lại:</span>
              <span>{{user.exchange_remaining_count}}</span>
            </li>
            <li class="mb-3">
              <span class="fw-medium me-2">Địa chỉ:</span>
              <span>{{user.address}}, {{user.ward}} {{user.district}}, {{user.province}}</span>
            </li>

            <li class="mb-3">
              <span class="fw-medium me-2">Số điện thoại:</span>
              <span>{{user.phone_number}}</span>
            </li>
          </ul>
          <div class="d-flex justify-content-center pt-3">
            <a href="javascript:;" class="btn btn-sm btn-primary me-3" @click="showModelEditUser">Chỉnh sửa thông tin</a>
            <a href="javascript:;" class="btn btn-sm btn-label-success" @click="showConfirmUpdateStatusModal('active')" v-if="user.status === 'pending'">Xác nhận người dùng</a>
            <a href="javascript:;" class="btn btn-sm btn-label-danger" @click="showConfirmUpdateStatusModal('locked')" v-if="user.status === 'active'">Khóa người dùng</a>
            <a href="javascript:;" class="btn btn-sm btn-label-warning" @click="showConfirmUpdateStatusModal('active')" v-if="user.status === 'locked'">Mở khóa người dùng</a>
          </div>
        </div>
      </div>
    </div>
    <EditUser ref="EditUser" :user="user"  :levels="levels" @user-updated="handleUserUpdated" />
    <ConfirmChangeStatusUser ref="confirmChangeStatusUser" :action="action" :user-id="user.id??''" @user-status-updated="updateStatusUser" />
    <EditWallet  ref="EditWallet" :networks="networks" :wallet_addresses="wallet_addresses" :wallets="wallets" :wallet-init="selectedWallet" :user-id="user.id" :cryptocurrencies="cryptocurrencies" @wallet-updated="handleWalletUpdated" @wallet-added="handleWalletAdded" @wallet-deleted="handleWalletDeleted" />
  </div>
</template>
<script>
import EditUser from "./EditUser.vue";
import ConfirmChangeStatusUser from "./ConfirmChangeStatusUser.vue";
import EditWallet from "./wallets/EditWallet.vue";

export default {
  components: {EditWallet, ConfirmChangeStatusUser, EditUser},
  props: {
    user: {
      type: Object,
      required: true
    },
    levels: {
      type: Array,
      required: true
    },
    cryptocurrencies: {
      type: Array,
      required: true
    },
    networks: {
      type: Array,
      required: true
    },
    wallet_addresses: {
      type: Array,
      required: true
    }
  },
  computed: {
    wallets(){
      return this.user.wallets ?? []
    }
  },
  data(){
    return {
      action: '',
      selectedWallet: null
    }
  },
  methods: {
    showModelEditUser(){
      this.$refs.EditUser.show()
    },
    handleUserUpdated(data){

      this.$emit('user-updated',data)
    },
    updateStatusUser(data){
      const {status,lock_message,...userData} = this.user

      this.$emit('user-updated',{
        status: this.action,
        lock_message: data.lock_message,
        ...userData
      })
    },
    getUserStatusClass(status) {
      switch (status) {
        case 'pending':
          return 'bg-label-warning';
        case 'active':
          return 'bg-label-success';
        case 'locked':
          return 'bg-label-danger';
        default:
          return '';
      }
    },
    getUserStatusText(status) {
      switch (status) {
        case 'pending':
          return 'Đang chờ duyệt';
        case 'active':
          return 'Hoạt động';
        case 'locked':
          return 'Đã khóa';
        default:
          return '';
      }
    },
    getUserWithdrawStatusClass(status) {
      switch (status) {
        case false:
          return 'bg-label-danger';
        case true:
          return 'bg-label-success';
        default:
          return '';
      }
    },
    getUserWithdrawStatusText(status) {
      switch (status) {
        case false:
          return 'Đã bị khóa';
        case true:
          return 'Hoạt động';
        default:
          return '';
      }
    },
    getUserWithdrawTypeText(type) {
      switch (type) {
        case 'default':
          return 'Giá cố định';
        case 'percentage':
          return 'Phần trăm';
        case 'value':
          return 'Giá trị';
        default:
          return '';
      }
    },
    getUserWithdrawExchangeDiff(type,value){
      switch (type) {
        case 'value':
          return value >= 0 ? `+${value}`: `${value}`;
        case 'percentage':
        return value >= 0 ? `+${value}%` : `${value}%`;
        case 'default':
          return value;
        default:
          return '';
      }
    },
    showConfirmUpdateStatusModal(action) {
      this.action = action;
      this.$refs.confirmChangeStatusUser.showModal();
    },
    showEditWalletModal(wallet) {
      this.selectedWallet = wallet;

      this.$refs.EditWallet.show();
    },
    handleWalletUpdated(updatedWallet) {
      this.user.wallets = this.user.wallets.map(wallet => {
        if(wallet.id === updatedWallet.id){
          wallet = updatedWallet
        }
        return wallet
      })
    },
    handleWalletAdded(newWallet) {

      this.user.wallets.push(newWallet);
    },
    handleWalletDeleted(walletId) {
      this.user.wallets = this.user.wallets.filter(wallet => wallet.id !== walletId);
    }
  }
}
</script>