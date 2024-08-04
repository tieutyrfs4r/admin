<template>
  <div class="container-xxl flex-grow-1 container-p-y">
    <div class="row">
      <div class="col-12 col-lg-12 order-2 order-md-3 order-lg-2 mb-4">
        <div class="card">
          <div class="card-header flex-column flex-md-row">
            <div class="head-label text-center">
              <h5 class="card-title mb-0">Danh sách người dùng</h5>
            </div>
            <div class="dt-action-buttons text-end pt-3 pt-md-0">
              <div class="dt-buttons btn-group flex-wrap">
                <div class="col-sm-12 col-lg-auto col-md-auto d-flex align-items-center justify-content-end order-2 order-md-3">
                <div class="dataTables_filter">
                  <button @click="showActionUser()" type="button" class="btn btn-primary">Thêm người dùng mới</button>
                </div>
              </div>
              </div>
            </div>
          </div>
          <div class="card-body">
            <DataTableComponent :columns="columns" :items="items" :selectable="true" :current-page.sync="currentPage" :per-page="perPage" :total-items="totalItems" @delete-selected="deleteItemSelected">
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
                        <li>
                          <a class="dropdown-item" href="javascript:void(0);" @click="deleteItemSelected">
                            <i class="bx bx-trash"></i> Xóa người dùng đã chọn </a>
                        </li>
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
                        <input type="search" class="form-control" placeholder="Tìm kiếm: Nhập tên người dùng" v-model="searchKeyword" @input="searchUsers">
                      </label>
                    </div>
                  </div>
                </div>
              </template>
              <template v-slot:actions="{ item }">
                <div class="demo-inline-spacing dropdown">
                  <a :href="`/users/${item.data.id}`" target="_blank" type="button" class="btn btn-outline-success">
                    <i class="bx bx-show-alt me-1"></i> Chi tiết người dùng </a>
                  <button @click="showUser(item)" type="button" class="btn btn-outline-danger">
                    <i class="bx bx-trash me-1"></i> Xóa </button>
                  <div class="btn-group">
                    <button type="button" class="btn btn-outline-dark dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">Các chức năng khác</button>
                    <ul class="dropdown-menu">
                      <li><a class="dropdown-item" @click="showActionUser(true, item)" href="javascript:void(0);"><i class="bx bx-pencil"></i> Chỉnh sửa nhanh thông tin người dùng</a></li>
                      <li><a class="dropdown-item" @click="showActionEditWalletUser(item)" href="javascript:void(0);"><i class="bx bx-wallet"></i> Cập nhật lại ví người dùng</a></li>
                    </ul>
                  </div>
                </div>
              </template>
              <template v-slot:user_info="{ item }">
                <div class="d-flex justify-content-left align-items-center">
                  <div class="avatar-wrapper">
                    <div class="avatar avatar-sm me-3">
                      <img :src="item.data.avatar" :alt="item.data.full_name" class="rounded-circle">
                    </div>
                  </div>
                  <div class="d-flex flex-column">
                    <a :href="`/users/${item.data.id}`" target="_blank" class="text-body text-truncate">
                      <span class="fw-medium">{{item.data.full_name}}</span>
                    </a>
                    <small class="text-muted">{{item.data.email}}</small>
                  </div>
                </div>
              </template>
              <template v-slot:address_info="{ item }">
                <div class="d-flex justify-content-left align-items-center">
                  <div class="d-flex flex-column">
                    <span class="text-body text-truncate">
                      <span class="fw-medium">{{item.data.address}}</span>
                    </span>
                    <span class="text-muted">{{item.data.ward}} {{item.data.district}}, {{item.data.province}}</span>
                  </div>
                </div>
              </template>
              <template v-slot:status_info="{ item }">
                <span class="badge" :class="getUserStatusClass(item.data.status)">{{getUserStatusText(item.data.status)}}</span>
              </template>
            </DataTableComponent>
          </div>
        </div>
      </div>
      <div class="modal fade" id="confirm-model" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="modal-body">
                <div class="d-flex align-items-center">
                  <i class="bx bx-x-circle text-danger" style="font-size: 5rem;"></i>
                  <span class="m-2">Bạn có muốn xóa người dùng này không?</span>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal"> Đóng </button>
              <button type="button" class="btn btn-danger" @click="confirmAction"> Xóa người dùng </button>
            </div>
          </div>
        </div>
      </div>
      <AddUser ref="AddUser" :is-edit="isEditUserType" :userInit="itemSelected" @add-user="addUserAction" />
      <EditWalletsUser ref="EditWalletUser" :userId="itemSelected?.id"
                       @update-wallet="onUpdateWallet"
      />
    </div>
  </div>
</template>
<script>
import Notify from '../../common/js/Notify.js';
import AddUser from "./add-user.vue";
import Api from "../../common/js/Api";
import addUser from "./add-user.vue";
import DataTableComponent from "../../common/vue/DataTableComponent.vue";
import EditWalletsUser from "./edit-wallets-user.vue";
import EditWalletUser from "./edit-wallet-user.vue";
export default {
  components: {
    EditWalletUser,
    EditWalletsUser,
    DataTableComponent,
    AddUser
  },
  computed: {
    addUser() {
      return addUser
    },
    countItemSelected() {
      return this.items.filter(item => item.checked).length;
    }
  },
  data() {
    return {
      columns: [{
        slot: 'actions',
        label: 'Thao tác'
      },{
        slot: 'user_info',
        label: 'Họ tên'
      },{
        slot: 'status_info',
        label: 'Trạng thái'
      },
        {
        slot: 'address_info',
        label: 'Địa chỉ'
      },
        {
        field: 'phone_number',
        label: 'Số điện thoại'
      }
        ],
      items: [],
      currentPage: 1,
      perPage: 10,
      totalItems: 0,
      searchKeyword: '',
      isEditUserType: false,
      itemSelected: null,
      perPageOptions: [7, 10, 25, 50, 75, 100],
      selectedPerPage: 10,
    };
  },
  methods: {
    showUser(item) {
      this.itemSelected = item.data
      $('#confirm-model').modal('show');
    },
    showActionUser(isEditUserType = false, item = null) {
      this.isEditUserType = isEditUserType
      if (item) {
        this.itemSelected = item.data
      } else {
        this.itemSelected = null
      }
      this.$refs.AddUser.show()
    },
    showActionEditWalletUser(item) {
      this.itemSelected = item.data
      this.$refs.EditWalletUser.show()
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
    confirmAction() {
      Api.delete(`/api/users/delete/${this.itemSelected.id}`).then(response => {
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
    onUpdateWallet(updatedWallet) {
      this.items.forEach(item => {
        if(item.data.id === this.itemSelected.id) {
          const index = item.data.wallets.findIndex(wallet => wallet.id === updatedWallet.id);
          if (index !== -1) {
            Object.assign(item.data.wallets[index],updatedWallet)
          }
        }
      })
    },
    async changePerPage() {
      this.perPage = this.selectedPerPage;
      this.currentPage = 1;
      await this.fetchUsers();
    },
    async fetchUsers() {
      try {
        const response = await Api.get('/api/users', {
          params: {
            page: this.currentPage,
            limit: this.perPage,
            keyword: this.searchKeyword,
          },
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
    async searchUsers() {
      this.currentPage = 1;
      await this.fetchUsers();
    },
    async changePage(page) {
      this.currentPage = page;
      await this.fetchUsers();
    },
    addUserAction(data) {
      this.items.push({
        selected: false,
        data: data
      });
    },
    deleteItemSelected() {
      if (confirm(`Bạn đồng ý xóa ${this.countItemSelected} người dùng chứ?`)) {
        const ids = this.items.filter(item => (item.checked)).map(item => item.data.id);
        Api.post("/api/users/delete-many", {
          ids
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
  },
  mounted() {
    this.fetchUsers();
  },
};
</script>