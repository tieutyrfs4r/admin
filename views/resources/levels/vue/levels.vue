<template>
  <div class="container-xxl flex-grow-1 container-p-y">
    <div class="row">
      <div class="col-12 col-lg-12 order-2 order-md-3 order-lg-2 mb-4">
        <div class="card">
          <div class="card-header flex-column flex-md-row">
            <div class="head-label text-center">
              <h5 class="card-title mb-0">Danh sách các cấp độ </h5>
            </div>
            <div class="dt-action-buttons text-end pt-3 pt-md-0">
              <div class="dt-buttons btn-group flex-wrap">

                <div class="col-sm-12 col-lg-auto col-md-auto d-flex align-items-center justify-content-end order-2 order-md-3">
                  <div class="dataTables_filter">
                    <button @click="showActionLevel()" type="button" class="btn btn-primary">Thêm một cấp độ mới</button>
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
                        <input type="search" class="form-control" placeholder="Tìm kiếm: Nhập tên cấp độ" v-model="searchKeyword" @input="searchLevels">
                      </label>
                    </div>
                  </div>
                </div>
              </template>
              <template v-slot:actions="{ item }">
                <div class="demo-inline-spacing">
                  <button @click="showActionLevel(true, item)" type="button" class="btn btn-outline-success">
                    <i class="bx bx-pencil me-1"></i> Chỉnh sửa
                  </button>
                  <button @click="showLevel(item)" type="button" class="btn btn-outline-danger">
                    <i class="bx bx-trash me-1"></i> Xóa
                  </button>
                </div>
              </template>
              <template v-slot:referral_enabled="{ item }">
                <p class="card-text">
                  {{ item.data.referral_enabled? 'Được phép giới thiệu' : 'Không được phép giới thiệu' }}
                </p>
              </template>
              <template v-slot:stars="{ item }">
                <div class="d-flex justify-content-left align-items-center">
                  <div class="mt-2">
                    <i class='bx bxs-star text-warning' v-for="star in item.data.stars" :key="'yellow-' + star"></i>
                  </div>
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
      <AddLevel
          ref="AddLevel"
          :is-edit="isEditLevelType"
          :levelInit="itemSelected"
          @add-level="addLevelAction"
      />
    </div>
  </div>
</template>
<script>
import Notify from '../../common/js/Notify.js';
import AddLevel from "./add-level.vue";
import Api from "../../common/js/Api";
import addLevel from "./add-level.vue";
import DataTableComponent from "../../common/vue/DataTableComponent.vue";

export default {
  components: {DataTableComponent, AddLevel},
  computed: {
    countItemSelected(){
      return this.items.filter(item => item.checked).length;
    }
  },
  data() {
    return {
      columns: [
      { slot: 'actions', label: 'Thao tác' },
        { field: 'level_name', label: 'Lên cấp độ' },
        { slot: 'stars', label: 'Sao' },
        { slot: 'referral_enabled', label: 'Được phép giới thiệu' },
        
      ],
      items: [
      ],
      currentPage: 1,
      perPage: 10,
      totalItems: 0,
      searchKeyword: '',
      isEditLevelType: false,
      itemSelected: null,
      perPageOptions: [7, 10, 25, 50, 75, 100],
      selectedPerPage: 10,
    };
  },
  methods: {
    showLevel(item) {
      this.itemSelected = item.data
      $('#confirm-model').modal('show');
    },
    showActionLevel(isEditLevelType = false,item = null){
      this.isEditLevelType = isEditLevelType
      if(item){
        this.itemSelected = item.data
      }else{
        this.itemSelected = null
      }

      this.$refs.AddLevel.show()
    },
    confirmAction() {
      Api.delete(`/api/levels/delete/${this.itemSelected.id}`).then(response => {
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
      await this.fetchLevels();
    },
    async fetchLevels() {
      try {
        const response = await Api.get('/api/levels', {
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
        console.error('Error fetching levels:', error);
      }
    },
    async searchLevels() {
      this.currentPage = 1;
      await this.fetchLevels();
    },
    async changePage(page) {
      this.currentPage = page;
      await this.fetchLevels();
    },
    addLevelAction(data){
      this.items.push({
        selected: false,
        data: data
      });
    },
    deleteItemSelected(){
      if(confirm(`Bạn đồng ý xóa ${this.countItemSelected} đồng tiền mã hóa chứ?`)){
        const ids = this.items.filter(item => (item.checked)).map(item => item.data.id);
        Api.post("/api/levels/delete-many",{
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
    }
  },
  mounted() {
  
    this.fetchLevels();
  },
};
</script>
