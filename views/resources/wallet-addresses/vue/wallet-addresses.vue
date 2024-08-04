<template>
  <div class="container-xxl flex-grow-1 container-p-y">
    <div class="row">
      <div class="col-12 col-lg-12 order-2 order-md-3 order-lg-2 mb-4">
        <div class="card">
          <div class="card-header flex-column flex-md-row">
            <div class="head-label text-center">
              <h5 class="card-title mb-0">Danh sách địa chỉ ví</h5>
            </div>
            <div class="dt-action-buttons text-end pt-3 pt-md-0">
              <div class="dt-buttons btn-group flex-wrap">
                <div class="col-sm-12 col-lg-auto col-md-auto d-flex align-items-center justify-content-end order-2 order-md-3">
                  <div class="dataTables_filter">
                    <button @click="showAddWalletAddress()" type="button" class="btn btn-primary">Thêm địa chỉ ví mới</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="card-body">
            <DataTableComponent
                :columns="columns"
                :items="items"
                :selectable="true"
                :current-page.sync="currentPage"
                :per-page="perPage"
                :total-items="totalItems"
                @delete-selected="deleteItemSelected"
            >
              <template v-slot:other-actions>
                <div class="row mb-3">
                  <div class="col-sm-12 col-md-auto align-items-center">
                    <div class="dropdown">
                      <button class="btn buttons-collection dropdown-toggle btn-label-primary me-2" :disabled="countItemSelected === 0" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                       <span>
                         <i class="bx bx-down-arrow me-sm-1"></i>
                         <span class="d-sm-inline-block">Các chức năng (Đã chọn {{countItemSelected}} mục)</span>
                       </span>
                      </button>
                      <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                        <li><a class="dropdown-item" href="javascript:void(0);" @click="deleteItemSelected"><i class="bx bx-trash"></i> Xóa các mục đã chọn</a></li>
                      </ul>
                    </div>
                  </div>
                  <div class="col-sm-12 col-lg-auto col-md-auto align-items-center">
                    <label class="d-flex align-items-center">
                      <select class="form-select" v-model="selectedPerPage" @change="changePerPage">
                        <option v-for="option in perPageOptions" :value="option" :key="option">{{ option }}</option>
                      </select>
                    </label>
                  </div>
                  <div class="col-sm-12 col-md-auto align-items-center order-3">
                    <div class="dataTables_filter">
                      <label class="d-flex align-items-center">
                        <input type="search" class="form-control" placeholder="Tìm kiếm: Nhập tên cấp độ" v-model="searchKeyword" @input="searchWalletsAddress">
                      </label>
                    </div>
                  </div>
                </div>
              </template>
              <template v-slot:cryptocurrency_info="{ item }">
                <div class="d-flex justify-content-left align-items-center">
                  <div class="avatar-wrapper">
                    <div class="avatar avatar-sm me-3">
                      <img :src="item.data.cryptocurrency.img_url" alt="John Doe" class="rounded-circle">
                    </div>
                  </div>
                  <div class="d-flex flex-column">
                    <span class="fw-medium">{{item.data.cryptocurrency.cryptocurrency_name}}</span>
                  </div>
                </div>
              </template>
              <template v-slot:network_info="{ item }">
                <div class="d-flex flex-column">
                  <span class="fw-medium">{{item.data?.network?.name}}</span>
                  <small class="text-muted">{{item.data?.network?.short_name}}</small>
                </div>
              </template>
              <template v-slot:use_enabled="{ item }">
                <span class="badge bg-success" v-if="item.data.use_enabled">Sử dụng</span>
                <span class="badge bg-danger" v-else>Không sử dụng</span>
              </template>
              <template v-slot:actions="{ item }">
                <div class="demo-inline-spacing">
                  <button @click="showEditWalletAddress(item)" type="button" class="btn btn-outline-success">
                    <i class="bx bx-pencil me-1"></i> Chỉnh sửa
                  </button>
                  <button @click="showDeleteWalletAddress(item)" type="button" class="btn btn-outline-danger">
                    <i class="bx bx-trash me-1"></i> Xóa
                  </button>
                </div>
              </template>
            </DataTableComponent>
          </div>
        </div>
      </div>
      <AddWalletAddress
          ref="AddWalletAddress"
          :is-edit="isEditWalletAddress"
          :wallet-address-init="walletAddressSelected"
          @add-wallet-address="addWalletAddressAction"
          @update-wallet-address="updateWalletAddressAction"
          :cryptocurrencies="cryptocurrencies"
          :networks="networks"
      />
    </div>
  </div>
</template>
<script>
import DataTableComponent from "../../common/vue/DataTableComponent.vue";
import AddWalletAddress from "./add-wallet-address.vue";
import Api from "../../common/js/Api";
import Notify from '../../common/js/Notify.js';

export default {
  components: {
    DataTableComponent,
    AddWalletAddress
  },
  computed: {
    countItemSelected() {
      return this.items.filter(item => item.checked).length;
    }
  },
  data() {
    return {
      columns: [
      { slot: 'actions', label: 'Thao tác' },
        { slot: 'cryptocurrency_info', label: 'Đồng tiền mã hóa' },
        { slot: 'network_info', label: 'Mạng lưới' },
        { slot: 'use_enabled', label: 'Trạng thái' },
        { field: 'address', label: 'Địa chỉ ví' },
        { field: 'description', label: 'Mô tả' },
       
      ],
      items: [],
      cryptocurrencies: [],
      networks: [],
      currentPage: 1,
      perPage: 10,
      totalItems: 0,
      searchKeyword: '',
      perPageOptions: [7, 10, 25, 50, 75, 100],
      selectedPerPage: 10,
      isEditWalletAddress: false,
      walletAddressSelected: null
    };
  },
  methods: {
    showAddWalletAddress() {
      this.isEditWalletAddress = false;
      this.walletAddressSelected = null;
      this.$refs.AddWalletAddress.show();
    },
    showEditWalletAddress(item) {
      this.isEditWalletAddress = true;
      this.walletAddressSelected = item.data;
      this.$refs.AddWalletAddress.show();
    },
    showDeleteWalletAddress(item) {
      if (confirm('Bạn có chắc muốn xóa địa chỉ ví này?')) {
        Api.delete(`/api/wallet-addresses/delete/${item.data.id}`)
            .then(() => {
              Notify.success('Xóa địa chỉ ví thành công');
              this.fetchWalletAddresses();
            })
            .catch(error => {
              Notify.error('Xóa địa chỉ ví thất bại', error.response.data.error);
            });
      }
    },
    addWalletAddressAction(data) {
      this.items.unshift({
        selected: false,
        data: data
      });
    },
    updateWalletAddressAction(data) {
      const index = this.items.findIndex(item => item.data.id === data.id);
      if (index !== -1) {
        this.items.splice(index, 1, {
          selected: false,
          data: data
        });
      }
    },
    deleteItemSelected() {
      if (confirm(`Bạn đồng ý xóa ${this.countItemSelected} địa chỉ ví chứ?`)) {
        const ids = this.items.filter(item => item.checked).map(item => item.data.id);
        Api.delete("/api/wallet-addresses/delete-many", {
          data: {
            ids
          }
        })
            .then(() => {
              Notify.success('Xóa các địa chỉ ví thành công');
              this.fetchWalletAddresses();
            })
            .catch(error => {
              Notify.error('Xóa các địa chỉ ví thất bại', error.response.data.error);
            });
      }
    },
    async changePerPage() {
      this.perPage = this.selectedPerPage;
      this.currentPage = 1;
      await this.fetchWalletAddresses();
    },
    async searchWalletsAddress() {
      this.currentPage = 1;
      await this.fetchWalletAddresses();
    },
    fetchCryptocurrencies() {
      Api.get('/api/cryptocurrencies', {params: {limit: 1000}})
          .then(response => {
            this.cryptocurrencies = response.data.docs;
          })
          .catch(error => {
            console.error('Error fetching cryptocurrencies:', error);
          });
    },
    fetchNetworks() {
      Api.get('/api/networks', {params: {limit: 1000}})
          .then(response => {
            this.networks = response.data.networks;
          })
          .catch(error => {
            console.error('Error fetching networks:', error);
          });
    },
    fetchWalletAddresses() {
      Api.get('/api/wallet-addresses', {
        params: {
          page: this.currentPage,
          limit: this.perPage,
          keyword: this.searchKeyword
        }
      })
          .then(response => {
            this.items = response.data.docs.map(item => ({
              data: item,
              checked: false
            }));
            this.totalItems = response.data.totalDocs;
          })
          .catch(error => {
            console.error('Error fetching wallet addresses:', error);
          });
    }
  },
  mounted() {
    this.fetchWalletAddresses();
    this.fetchCryptocurrencies();
    this.fetchNetworks();
  }
};
</script>