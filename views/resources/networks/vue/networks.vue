<template>
  <div class="container-xxl flex-grow-1 container-p-y">
    <div class="row">
      <div class="col-12 col-lg-12 order-2 order-md-3 order-lg-2 mb-4">
        <div class="card">
          <div class="card-header flex-column flex-md-row">
            <div class="head-label text-center">
              <h5 class="card-title mb-0">Danh sách các mạng lưới</h5>
            </div>
            <div class="dt-action-buttons text-end pt-3 pt-md-0">
              <div class="dt-buttons btn-group flex-wrap">
                <div class="col-sm-12 col-lg-auto col-md-auto d-flex align-items-center justify-content-end order-2 order-md-3">
                  <div class="dataTables_filter">
                    <button @click="showActionNetwork()" type="button" class="btn btn-primary">Thêm một mạng lưới mới</button>
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
                        <input type="search" class="form-control" placeholder="Tìm kiếm: Nhập tên mạng lưới" v-model="searchKeyword" @input="searchNetworks">
                      </label>
                    </div>
                  </div>
                </div>
              </template>
              <template v-slot:actions="{ item }">
                <div class="demo-inline-spacing">
                  <button @click="showActionNetwork(true, item)" type="button" class="btn btn-outline-success">
                    <i class="bx bx-pencil me-1"></i> Chỉnh sửa
                  </button>
                  <button @click="showNetwork(item)" type="button" class="btn btn-outline-danger">
                    <i class="bx bx-trash me-1"></i> Xóa
                  </button>
                </div>
              </template>
            </DataTableComponent>
          </div>
        </div>
      </div>
      <div class="modal fade" id="confirm-model" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div class="modal-body">
                <div class="d-flex align-items-center">
                  <i class="bx bx-x-circle text-danger" style="font-size: 5rem;"></i>
                  <span class="m-2">Bạn có muốn xóa mạng lưới này không?</span>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                Đóng
              </button>
              <button type="button" class="btn btn-danger" @click="confirmAction">
                Xóa mạng lưới
              </button>
            </div>
          </div>
        </div>
      </div>
      <AddNetwork
          ref="AddNetwork"
          :is-edit="isEditNetworkType"
          :networkInit="itemSelected"
          @add-network="addNetworkAction"
      />
    </div>
  </div>
</template>
<script>
import Notify from '../../common/js/Notify.js';
import AddNetwork from "./add-network.vue";
import Api from "../../common/js/Api.js";
import DataTableComponent from "../../common/vue/DataTableComponent.vue";
export default {
  components: {DataTableComponent, AddNetwork},
  computed: {
    countItemSelected(){
      return this.items.filter(item => item.checked).length;
    }
  },
  data() {
    return {
      columns: [
      { slot: 'actions', label: 'Thao tác' },
        { field: 'name', label: 'Tên mạng lưới' },
        { field: 'short_name', label: 'Tên viết tắt' },
       
      ],
      items: [],
      currentPage: 1,
      perPage: 10,
      totalItems: 0,
      searchKeyword: '',
      isEditNetworkType: false,
      itemSelected: null,
      perPageOptions: [7, 10, 25, 50, 75, 100],
      selectedPerPage: 10,
    };
  },
  methods: {
    showNetwork(item) {
      this.itemSelected = item.data;
      $('#confirm-model').modal('show');
    },
    showActionNetwork(isEditNetworkType = false, item = null) {
      this.isEditNetworkType = isEditNetworkType;
      if (item) {
        this.itemSelected = item.data;
      } else {
        this.itemSelected = null;
      }
      this.$refs.AddNetwork.show();
    },
    confirmAction() {
      Api.delete(`/api/networks/${this.itemSelected.id}`).then(response => {
        Notify.success();
        $('#confirm-model').modal('hide');
        this.items = this.items.filter(item => item.data.id !== this.itemSelected.id);
        this.itemSelected = null;
      }).catch(error => {
        if (error.response && error.response.data) {
          Notify.error(null, error.response.data.error);
        } else {
          Notify.error();
        }
      });
    },
    async changePerPage() {
      this.perPage = this.selectedPerPage;
      this.currentPage = 1;
      await this.fetchNetworks();
    },
    async fetchNetworks() {
      try {
        const response = await Api.get('/api/networks', {
          params: {
            page: this.currentPage,
            limit: this.perPage,
            keyword: this.searchKeyword,
          },
        });
        this.items = response.data.networks.map(item => ({
          data: item,
          checked: false,
        }));
        this.totalItems = response.data.totalItems;
      } catch (error) {
        console.error('Error fetching networks:', error);
      }
    },
    async searchNetworks() {
      this.currentPage = 1;
      await this.fetchNetworks();
    },
    async changePage(page) {
      this.currentPage = page;
      await this.fetchNetworks();
    },
    addNetworkAction(data) {
      this.items.push({
        selected: false,
        data: data
      });
    },
    deleteItemSelected() {
      if (confirm(`Bạn đồng ý xóa ${this.countItemSelected} mạng lưới chứ?`)) {
        const ids = this.items.filter(item => (item.checked)).map(item => item.data.id);
        Api.post("/api/networks/delete-many", {
          data: {
            ids
          }
        }).then(response => {
          Notify.success();
          $('#confirm-model').modal('hide');
          this.items = this.items.filter(item => !item.checked);
        }).catch(error => {
          if (error.response && error.response.data) {
            Notify.error(null, error.response.data.error);
          } else {
            Notify.error();
          }
        });
      }
    }
  },
  mounted() {
    this.fetchNetworks();
  },
};
</script>