<template>
  <div class="container-xxl flex-grow-1 container-p-y">
    <div class="row">
      <div class="col-12 col-lg-12 order-2 order-md-3 order-lg-2 mb-4">
        <div class="card">
          <div class="card-header flex-column flex-md-row">
            <div class="head-label text-center">
              <h5 class="card-title mb-0">Danh sách đồng tiền mã hóa</h5>
            </div>
            <div class="dt-action-buttons text-end pt-3 pt-md-0">
              <div class="dt-buttons btn-group flex-wrap">

                <div class="col-sm-12 col-lg-auto col-md-auto d-flex align-items-center justify-content-end order-2 order-md-3">
                  <div class="dataTables_filter">
                    <button @click="showActionCryptocurrency()" type="button" class="btn btn-primary">Thêm một đồng tiền mới</button>
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
                @update:currentPage="setCurrentPage"
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
                        <input type="search" class="form-control" placeholder="Tìm kiếm: Nhập tên đồng tiền" v-model="searchKeyword" @input="searchCryptocurrencies">
                      </label>
                    </div>
                  </div>
                </div>
              </template>
              <template v-slot:img_url_info="{ item }">
                <div class="avatar avatar-lg">
                  <img :src="item.data.img_url" :alt="item.data.cryptocurrency_name" class="rounded-circle">
                </div>
              </template>
              <template v-slot:default_use_enabled="{ item }">
                <span class="badge" :class="item.data.default_use_enabled?'bg-label-success':'bg-label-danger'">{{item.data.default_use_enabled ? 'Kích hoạt' :'Hủy kích hoạt'}}</span>
              </template>
              <template v-slot:default_withdraw_enabled="{ item }">
                <span class="badge" :class="item.data.default_withdraw_enabled?'bg-label-success':'bg-label-danger'">{{item.data.default_withdraw_enabled ? 'Kích hoạt' :'Hủy kích hoạt'}}</span>
              </template>
              <template v-slot:default_exchange_enabled="{ item }">
                <span class="badge" :class="item.data.default_exchange_enabled?'bg-label-success':'bg-label-danger'">{{item.data.default_exchange_enabled ? 'Kích hoạt' :'Hủy kích hoạt'}}</span>
              </template>
              <template v-slot:default_deposit_enabled="{ item }">
                <span class="badge" :class="item.data.default_deposit_enabled?'bg-label-success':'bg-label-danger'">{{item.data.default_deposit_enabled ? 'Kích hoạt' :'Hủy kích hoạt'}}</span>
              </template>
              <template v-slot:usdt_price_diff_type="{ item }">
                {{getTextLabelExchangeDiff(item.data.usdt_price_diff_type)}}
              </template>
              <template v-slot:actions="{ item }">
                <div class="demo-inline">
                  <button @click="showActionCryptocurrency(true, item)" type="button" class="btn btn-outline-success me-1">
                    Chỉnh sửa
                  </button>
                  <button @click="showCryptocurrency(item)" type="button" class="btn btn-outline-danger">
                   Xóa
                  </button>
                </div>
              </template>
            </DataTableComponent>
<!--            <div class="row mb-3">-->
<!--              <div class="col-sm-12 col-md-auto align-items-center">-->
<!--                <div class="dropdown">-->
<!--                  <button class="btn buttons-collection dropdown-toggle btn-label-primary me-2" :disabled="countItemSelected === 0" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">-->
<!--           <span>-->
<!--             <i class="bx bx-down-arrow me-sm-1"></i>-->
<!--             <span class="d-sm-inline-block">Các chức năng (Đã chọn {{countItemSelected}} mục)</span>-->
<!--           </span>-->
<!--                  </button>-->
<!--                  <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">-->
<!--                    <li><a class="dropdown-item" href="javascript:void(0);" @click="deleteItemSelected"><i class="bx bx-trash"></i> Xóa các mục đã chọn</a></li>-->
<!--                  </ul>-->
<!--                </div>-->
<!--              </div>-->
<!--              <div class="col-sm-12 col-lg-auto col-md-auto align-items-center">-->
<!--                <label class="d-flex align-items-center">-->
<!--                  <select class="form-select" v-model="selectedPerPage" @change="changePerPage">-->
<!--                    <option v-for="option in perPageOptions" :value="option" :key="option">{{ option }}</option>-->
<!--                  </select>-->
<!--                </label>-->
<!--              </div>-->
<!--              <div class="col-sm-12 col-md-auto align-items-center order-3">-->
<!--                <div class="dataTables_filter">-->
<!--                  <label class="d-flex align-items-center">-->
<!--                    <input type="search" class="form-control" placeholder="Tìm kiếm: Nhập tên đồng tiền" v-model="searchKeyword" @input="searchCryptocurrencies">-->
<!--                  </label>-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->
<!--            <div class="table-responsive text-nowrap mb-3">-->
<!--              <table class="table table-hover data-table border-bottom">-->
<!--                <thead>-->
<!--                <tr>-->
<!--                  <td>-->
<!--                    <input class="form-check-input" type="checkbox" v-model="allChecked">-->
<!--                  </td>-->
<!--                  <th>Tên đồng tiền</th>-->
<!--                  <th class="sorting sorting_desc">API URL</th>-->
<!--                  <th class="sorting sorting_asc"> Tỉ giá chung / USD</th>-->
<!--                  <th class="sorting sorting_asc"> Tỉ giá chung / VND</th>-->
<!--                  <th class="sorting">Hình ảnh</th>-->
<!--                  <th>Thao tác</th>-->
<!--                </tr>-->
<!--                </thead>-->
<!--                <tbody class="table-border-bottom-0">-->
<!--                <tr v-for="(item, index) in items" :key="index">-->
<!--                  <td><input class="form-check-input" type="checkbox" v-model="item.checked"></td>-->
<!--                  <td>-->
<!--                    <span class="mb-2 fw-bolder text-primary">{{ item.data.cryptocurrency_name }}</span>-->
<!--                  </td>-->
<!--                  <td>-->
<!--                    <a class="mb-2 fw-light" :href="item.data.api_url">{{ item.data.api_url }}</a>-->
<!--                  </td>-->
<!--                  <td>-->
<!--                    <span class="mb-2 fw-light">{{ item.data.usdt_exchange_rate.toLocaleString('en-US', {maximumFractionDigits: 8}) }}</span>-->
<!--                  </td>-->
<!--                  <td>-->
<!--                    <span class="mb-2 fw-light">{{ item.data.vnd_exchange_rate.toLocaleString('en-US', {maximumFractionDigits: 8}) }}</span>-->
<!--                  </td>-->
<!--                  <td>-->
<!--                    <div class="d-flex justify-content-left align-items-center">-->
<!--                      <div class="avatar-wrapper">-->
<!--                        <div class="avatar avatar-sm me-3">-->
<!--                          <img :src="item.data.img_url" alt="Avatar" class="rounded-circle">-->
<!--                        </div>-->
<!--                      </div>-->
<!--                    </div>-->
<!--                  </td>-->
<!--                  <td>-->
<!--                    <div class="demo-inline-spacing">-->
<!--                      <button @click="showActionCryptocurrency(true, item)" type="button" class="btn btn-outline-success"><i class="bx bx-pencil me-1"></i> Chỉnh sửa</button>-->
<!--                      <button @click="showCryptocurrency(item)" type="button" class="btn btn-outline-danger"><i class="bx bx-trash me-1"></i> Xóa</button>-->
<!--                    </div>-->
<!--                  </td>-->
<!--                </tr>-->
<!--                </tbody>-->
<!--              </table>-->
<!--            </div>-->
<!--            <div class="row table-pagination">-->
<!--              <div class="col-sm-12 col-md-6">-->
<!--                <div class="table-info">-->
<!--                  Hiển thị {{ (currentPage - 1) * perPage + 1 }} đến {{ Math.min(currentPage * perPage, totalItems) }} của {{ totalItems }} mục-->
<!--                </div>-->
<!--              </div>-->
<!--              <div class="col-sm-12 col-md-6">-->
<!--                <nav aria-label="Page navigation">-->
<!--                  <ul class="pagination justify-content-md-end justify-content-sm-center">-->
<!--                    <li class="page-item prev" :class="{ disabled: currentPage === 1 }">-->
<!--                      <a class="page-link" href="javascript:void(0);" @click="changePage(currentPage - 1)"><i class="tf-icon bx bx-chevrons-left"></i></a>-->
<!--                    </li>-->
<!--                    <li class="page-item" v-for="page in Math.ceil(totalItems / perPage)" :key="page" :class="{ active: currentPage === page }">-->
<!--                      <a class="page-link" href="javascript:void(0);" @click="changePage(page)">{{ page }}</a>-->
<!--                    </li>-->
<!--                    <li class="page-item next" :class="{ disabled: currentPage === Math.ceil(totalItems / perPage) }">-->
<!--                      <a class="page-link" href="javascript:void(0);" @click="changePage(currentPage + 1)"><i class="tf-icon bx bx-chevrons-right"></i></a>-->
<!--                    </li>-->
<!--                  </ul>-->
<!--                </nav>-->
<!--              </div>-->
<!--            </div>-->
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
                  <span class="m-2">Bạn có muốn xóa đồng tiền này không?</span>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                Đóng
              </button>
              <button type="button" class="btn btn-danger" @click="confirmAction">
                Xóa đồng tiền
              </button>
            </div>
          </div>
        </div>
      </div>
      <AddCryptocurrency
          ref="AddCryptocurrency"
          :is-edit="isEditCryptocurrencyType"
          :cryptocurrencyInit="itemSelected"
          @add-cryptocurrency="addCryptocurrencyAction"
          @update-cryptocurrency="updateCryptocurrencyAction"
      />
    </div>
  </div>
</template>
<script>
import Notify from '../../common/js/Notify.js';
import AddCryptocurrency from "./add-cryptocurrency.vue";
import Api from "../../common/js/Api";
import addCryptocurrency from "./add-cryptocurrency.vue";
import DataTableComponent from "../../common/vue/DataTableComponent.vue";

export default {
  components: {DataTableComponent, AddCryptocurrency},
  computed: {
    addCryptocurrency() {
      return addCryptocurrency
    },
    allChecked: {
      get() {
        return this.items.every(item => item.checked);
      },
      set(value) {
        this.items.forEach(item => item.checked = value);
      }
    },
    countItemSelected(){
      return this.items.filter(item => item.checked).length;
    }
  },
  data() {
    return {
      columns: [
      { slot: 'actions', label: 'Thao tác' },
        { field: 'cryptocurrency_name', label: 'Tên đồng tiền' },
        { field: 'cryptocurrency_current_price', label: 'Giá hiện tại/USDT' },
        { field: 'cryptocurrency_change_price', label: 'Giá sau khi thay đổi/USDT' },
        { slot: 'default_use_enabled', label: 'Ví mặc định người dùng' },
        { slot: 'default_deposit_enabled', label: 'Mặc định được nạp' },
        { slot: 'default_exchange_enabled', label: 'Mặc định được chuyển đổi' },
        { slot: 'default_withdraw_enabled', label: 'Mặc định được rút' },
        { slot: 'img_url_info', label: 'Image URL' },
        { slot: 'usdt_price_diff_type', label: 'Loại chênh lệch' },
        { field: 'usdt_price_diff', label: 'Tỉ giá chênh lệch' },
      
      ],
      items: [
      ],
      currentPage: 1,
      perPage: 10,
      totalItems: 0,
      searchKeyword: '',
      isEditCryptocurrencyType: false,
      itemSelected: null,
      perPageOptions: [7, 10, 25, 50, 75, 100],
      selectedPerPage: 10,
      autoRefreshInterval: null,
    };
  },
  methods: {
    showCryptocurrency(item) {
      this.itemSelected = item.data
      $('#confirm-model').modal('show');
    },
    getTextLabelExchangeDiff(type){
      switch (type) {
        case 'default': {
          return 'Giá cố định'
        }
        case 'percentage': {
          return 'Phần trăm'
        }
        case 'value' : {
          return 'Giá trị'
        }
        default : {
          return 'Giá mặc định'
        }
      }
    },
    showActionCryptocurrency(isEditCryptocurrencyType = false,item = null){
      this.isEditCryptocurrencyType = isEditCryptocurrencyType
      if(item){
        this.itemSelected = item.data
      }else{
        this.itemSelected = null
      }

      this.$refs.AddCryptocurrency.show()
    },
    confirmAction() {
      Api.delete(`/api/cryptocurrencies/delete/${this.itemSelected.id}`).then(response => {
        Notify.success()
        $('#confirm-model').modal('hide');
        this.items = this.items.filter(item => item.data.id !== this.itemSelected.id)
        this.itemSelected = null;
      }).catch(error => {
        if(error.response && error.response.data){

          Notify.error(null,error.response.data.error);
        }
        else{
          Notify.error()
        }
      })


    },

    showAddTransaction(){
      this.$refs['add-transaction'].show()
    },
    async changePerPage() {
      this.perPage = this.selectedPerPage;
      this.currentPage = 1;
      await this.fetchCryptocurrencies();
    },
    async fetchCryptocurrencies() {
      try {
        const response = await Api.get('/api/cryptocurrencies', {
          params: {
            page: this.currentPage,
            limit: this.perPage,
            keyword: this.searchKeyword,
            getPrice: 1
          },
        });
        this.items = response.data.docs.map(item => ({
          data: item,
          checked: false,
        }));
        this.totalItems = response.data.totalDocs;
      } catch (error) {
        console.error('Error fetching cryptocurrencies:', error);
      }
    },
    async searchCryptocurrencies() {
      this.currentPage = 1;
      await this.fetchCryptocurrencies();
    },
    async changePage(page) {
      this.currentPage = page;
      await this.fetchCryptocurrencies();
    },
    addCryptocurrencyAction(data){

      this.items.push({
        selected: false,
        data: data
      });
    },
    updateCryptocurrencyAction(data){

      this.items = this.items.map(item => {
        if(item.data.id === data.id){
          item.data = data

        }
        return item
      })
    },
    setCurrentPage(page){
      this.currentPage = page
      this.fetchCryptocurrencies()
    },
    deleteItemSelected(){
      if(confirm(`Bạn đồng ý xóa ${this.countItemSelected} đồng tiền mã hóa chứ?`)){
        const ids = this.items.filter(item => (item.checked)).map(item => item.data.id);
        Api.post("/api/cryptocurrencies/delete-many",{
          ids
        }).then(response => {
          Notify.success()
          $('#confirm-model').modal('hide');
          this.items = this.items.filter(item => !item.checked)
          this.allChecked = false
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
  },
  mounted() {
    this.fetchCryptocurrencies();
    this.autoRefreshInterval = setInterval(() => {
      this.fetchCryptocurrencies();
    }, 10000);
  },
  beforeDestroy() {
    // Hủy bỏ interval khi component bị hủy
    clearInterval(this.autoRefreshInterval);
  },
};
</script>
