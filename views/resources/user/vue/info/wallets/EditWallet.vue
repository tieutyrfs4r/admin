<template>
  <div class="modal fade" :id="modalId" tabindex="-1">
    <div class="modal-dialog modal-lg modal-simple">
      <div class="modal-content p-3 p-md-5">
        <div class="modal-body">
          <button type="button" class="btn-close" @click="hide()"></button>
          <div class="text-center mb-4">
            <h3>{{ isEdit ? 'Chỉnh sửa ví người dùng' : 'Thêm ví người dùng' }}</h3>
          </div>
          <form @submit.prevent="saveWallet" class="row g-3">
            <div class="col-12 col-md-6">
              <label class="form-label" :for="getInputId('cryptocurrency')">Loại tiền điện tử*</label>
              <select :id="getInputId('cryptocurrency')" v-model="wallet.cryptocurrency" class="form-select" :disabled="isEdit">
                <option v-for="crypto in cryptocurrenciesFilter" :key="crypto.id" :value="crypto.id">{{ crypto.cryptocurrency_name }}</option>
              </select>
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label" :for="getInputId('balance')">Số dư*</label>
              <input type="number"  :id="getInputId('balance')" step="0.00000001" v-model="wallet.balance_amount" class="form-control" placeholder="Nhập số dư" />
            </div>
            <div class="col-12 col-md-6" v-if="walletInit?.cryptocurrency.default_withdraw_enabled">
              <label class="form-label" :for="getInputId('total_withdraw')">Tổng rút*</label>
              <input type="number"  :id="getInputId('total_withdraw')" step="0.01" v-model="wallet.total_withdraw" class="form-control" placeholder="Nhập tổng nạp" />
            </div>
            <div class="col-12 col-md-6" v-if="walletInit?.cryptocurrency.default_deposit_enabled">
              <label class="form-label" :for="getInputId('total_deposit')">Tổng nạp*</label>
              <input type="number"  :id="getInputId('total_deposit')" step="0.01" v-model="wallet.total_deposit" class="form-control" placeholder="Nhập tổng rút" />
            </div>
            <div class="col-12 col-md-6" v-if="walletInit?.cryptocurrency.default_withdraw_enabled">
              <label class="form-label" :for="getInputId('total_number_withdraw')">Tổng số lần rút*</label>
              <input type="number"  :id="getInputId('total_number_withdraw')" step="1" v-model="wallet.total_number_withdraw" class="form-control" placeholder="Nhập tổng lần nạp" />
            </div>
            <div class="col-12 col-md-6"  v-if="walletInit?.cryptocurrency.default_deposit_enabled">
              <label class="form-label" :for="getInputId('total_number_deposit')">Tổng  số lần nạp*</label>
              <input type="number"  :id="getInputId('total_number_deposit')" step="1" v-model="wallet.total_number_deposit" class="form-control" placeholder="Nhập tổng lần rút" />
            </div>
            <div class="col-12 row">
              <div class="col-6">
                <div class="row">
                  <div class="col-12">
                    <label class="form-label" :for="getInputId('withdrawEnabled')">Bật tắt rút tiền</label>
                    <div class="form-check form-switch mb-2">
                      <input class="form-check-input" :id="getInputId('withdrawEnabled')" v-model="wallet.withdraw_enabled" type="checkbox" />
                      <label class="form-check-label" :for="getInputId('withdrawEnabled')">{{ wallet.withdraw_enabled ? 'Bật' : 'Tắt' }}</label>
                    </div>
                  </div>
                  <div class="col-12" v-if="wallet.withdraw_enabled">
                    <label class="form-label" :for="getInputId('withdrawMin')">Rút tối thiểu*</label>
                    <input type="number" :id="getInputId('withdrawMin')" step="0.000000001" v-model="wallet.withdraw_min_amount" class="form-control" placeholder="Nhập hạn mức rút tiền tối thiểu" />
                  </div>

                </div>
              </div>
              <div class="col-6">
                <div class="row">
                  <div class="col-12">
                    <label class="form-label" :for="getInputId('exchangeEnabled')">Bật tắt bán</label>
                    <div class="form-check form-switch mb-2">
                      <input class="form-check-input" :id="getInputId('exchangeEnabled')" v-model="wallet.exchange_enabled" type="checkbox" />
                      <label class="form-check-label" :for="getInputId('exchangeEnabled')">{{ wallet.exchange_enabled ? 'Bật' : 'Tắt' }}</label>
                    </div>
                  </div>
                  <div class="col-12" v-if="wallet.exchange_enabled">
                    <label class="form-label" :for="getInputId('exchangeMin')">Bán tối thiểu*</label>
                    <input type="number" :id="getInputId('exchangeMin')" step="0.00000001" v-model="wallet.exchange_min_amount" class="form-control" placeholder="Nhập hạn mức chuyển đổi tối thiểu" />
                  </div>
                  <div class="col-12" v-if="wallet.exchange_enabled">
                    <label class="form-label" :for="getInputId('exchangeMax')">Bán tối đa*</label>
                    <input type="number" :id="getInputId('exchangeMax')" step="0.00000001" v-model="wallet.exchange_max_amount" class="form-control" placeholder="Nhập hạn mức chuyển đổi tối đa" />
                  </div>
                </div>
              </div>
            </div>
            <div class="row" v-if="walletInit?.cryptocurrency.default_deposit_enabled">
                  <div class="col-12">
                    <label class="form-label" :for="getInputId('deposit_default_address_enabled')">Bật tắt sử dụng ví nạp mặc định</label>
                    <div class="form-check form-switch mb-2">
                      <input class="form-check-input" :id="getInputId('deposit_default_address_enabled')" v-model="wallet.deposit_default_address_enabled" type="checkbox" />
                      <label class="form-check-label" :for="getInputId('deposit_default_address_enabled')">{{ wallet.deposit_default_address_enabled ? 'Bật' : 'Tắt' }}</label>
                    </div>
                  </div>
                  <div class="col-12" v-if="wallet.deposit_default_address_enabled">
                    <label class="form-label" :for="getInputId('wallet_addresses')">Chọn một địa chỉ ví*</label>
                    <select class="form-select" v-model="selectedWalletAddress" required>
                      <option v-for="wallet_address in wallet_addresses_filter" :key="wallet_address.id" :value="wallet_address.id">{{ wallet_address.description }}</option>
                      <option value="0">Điền địa chỉ ví mới</option>
                    </select>
                  </div>
                  <div class="col-12" v-if="wallet.deposit_default_address_enabled">
                    <label class="form-label" :for="getInputId('deposit_network')">Chọn mạng lưới*</label>
                    <select class="form-select" v-model="wallet.deposit_network" required>
                      <option value="">Chọn mạng lưới</option>
                      <option v-for="network in networks" :key="network.id" :value="network.id">{{ network.name }}</option>
                    </select>
                  </div>
                  <div class="col-12" v-if="wallet.deposit_default_address_enabled">
                    <label class="form-label" :for="getInputId('deposit_address')">Nhập địa chỉ ví*</label>
                    <input type="text" :id="getInputId('deposit_address')" v-model="wallet.deposit_address" class="form-control" placeholder="Nhập địa chỉ ví" />
                  </div>
              </div>
            <!-- <div class="col-12">
              <label class="form-label">Tạm giữ tiền</label>
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label" :for="getInputId('withheldAmount')">Số tiền tạm giữ</label>
              <input type="number" :id="getInputId('withheldAmount')" v-model="wallet.temporarily_withheld.amount" class="form-control" placeholder="Nhập số tiền tạm giữ" />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label" :for="getInputId('withheldReason')">Lý do tạm giữ</label>
              <input type="text" :id="getInputId('withheldReason')" v-model="wallet.temporarily_withheld.reason" class="form-control" placeholder="Nhập lý do tạm giữ" />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label" :for="getInputId('startDateWithheld')">Ngày bắt đầu tạm giữ</label>
              <input type="date" :id="getInputId('startDateWithheld')" v-model="wallet.temporarily_withheld.start_date_withheld" class="form-control" />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label" :for="getInputId('endDateWithheld')">Ngày kết thúc tạm giữ</label>
              <input type="date" :id="getInputId('endDateWithheld')" v-model="wallet.temporarily_withheld.end_date_withheld" class="form-control" />
            </div> -->
            <div class="col-12 text-center">
              <button type="submit" class="btn btn-primary me-sm-3 me-1">Lưu</button>
              <button type="reset" class="btn btn-label-secondary" @click="hide()">Hủy</button>
              <button v-if="isEdit" type="button" class="btn btn-danger ms-sm-3 ms-1" @click="deleteWallet">Xóa</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Api from "../../../../common/js/Api";
import Notify from "../../../../common/js/Notify";
export default {
  props: {
    walletInit: {
      type: Object,
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
    wallets: {
      type: Array,
      required: true,
      default: []
    },
    networks: {
      type: Array,
      required: true,
      default: []
    },
    wallet_addresses: {
      type: Array,
      required: true,
      default: []
    }
  },
  computed: {
    cryptocurrenciesFilter() {
      if(!this.isEdit){
        return this.cryptocurrencies.filter(cryptocurrency => {
          return !this.wallets.find(wallet => {
            return wallet.cryptocurrency.id === cryptocurrency.id
          })
        })
      }
      return this.cryptocurrencies

    },
    wallet_addresses_filter(){
      return this.wallet_addresses.filter(item => {
        return item.cryptocurrency.id
      })
    }
  },
  watch: {
    walletInit: {
      handler(value){
        if(value){
          const wallet = {}
          Object.assign(wallet,value)
          wallet.cryptocurrency = wallet.cryptocurrency.id
          this.wallet = wallet
          this.isEdit = true
        }else{
          this.wallet = {
            cryptocurrency: '',
            balance_amount: 0,
            withdraw_enabled: false,
            withdraw_min_amount: 1,
            temporarily_withheld: {
              amount: null,
              reason: '',
              start_date_withheld: '',
              end_date_withheld: '',
            },
          }
          this.isEdit = false
        }

      },
      deep: true
    },
    selectedWalletAddress: {
      handler(value){
        if(value === 0){
          this.wallet.deposit_network = ''
          this.wallet.deposit_address = ''
        }else{
          this.wallet.deposit_network = ''
          this.wallet.deposit_address = ''
          const selectedAddress = this.wallet_addresses.find(item => {
            return item.id === value
          })
          if(selectedAddress){
            this.wallet.deposit_address = selectedAddress.address
            this.wallet.deposit_network = selectedAddress.network.id
          }
        }
      },
      immediate: true,
      deep: true
    }
  },
  data() {
    return {
      modalId: `editWallet-${Math.random().toString(36).substr(2, 9)}`,
      isEdit: false,
      selectedWalletAddress: 0,
      wallet: {
        cryptocurrency: '',
        balance_amount: 0,
        withdraw_enabled: false,
        withdraw_min_amount: 1,
        temporarily_withheld: {
          amount: null,
          reason: '',
          start_date_withheld: '',
          end_date_withheld: '',
        },
      },
    };
  },
  methods: {
    getInputId(field) {
      return `input-${field}-${Math.random().toString(36).substr(2, 9)}`;
    },
    show() {
      $(`#${this.modalId}`).modal('show');
    },
    hide() {
      $(`#${this.modalId}`).modal('hide');
    },
    async saveWallet() {
      try {

        if (this.isEdit) {
          const response = await Api.put(`/api/users/wallets/user/${this.userId}/edit/${this.wallet.id}`, this.wallet);
          this.$emit('wallet-updated', response.data);
          Notify.success('Cập nhật ví thành công');
        } else {
          const create = {}
          Object.assign(create, this.wallet);
          if(create.temporarily_withheld && !create.temporarily_withheld.amount){
            delete create.temporarily_withheld;
          }
          if(!create.withdraw_enabled){
            delete create.withdraw_min_amount;
          }
          const response = await Api.post(`/api/users/wallets/user/${this.userId}/create`, create);
          this.$emit('wallet-added', response.data);
          Notify.success('Thêm ví thành công');
        }
        this.hide();
      } catch (error) {
        console.error('Error saving wallet:', error);
        if (error.response && error.response.data) {
          Notify.error(null, error.response.data.error);
        } else {
          Notify.error();
        }
      }
    },
    async deleteWallet() {
      if (confirm('Bạn có chắc chắn muốn xóa ví này?')) {
        try {
          await Api.delete(`/api/users/wallets/user/${this.userId}/delete/${this.wallet.id}`);
          this.$emit('wallet-deleted', this.wallet.id);
          Notify.success('Xóa ví thành công');
          this.hide();
        } catch (error) {
          console.error('Error deleting wallet:', error);
          if (error.response && error.response.data) {
            Notify.error(null, error.response.data.error);
          } else {
            Notify.error();
          }
        }
      }
    },
  },
};
</script>