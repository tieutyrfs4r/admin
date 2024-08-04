<template>
  <div class="offcanvas offcanvas-end" tabindex="-1" :id="componentId" aria-modal="true" role="dialog">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title">Thêm một cấp độ mới</h5>
      <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body mx-0 flex-grow-0">
      <form class="ecommerce-customer-add pt-0 fv-plugins-bootstrap5 fv-plugins-framework" :id="formId" @submit.prevent="submitForm">
        <div class="ecommerce-level-add-basic mb-3">
          <div class="mb-3 fv-plugins-icon-container">
            <label class="form-label" :for="getRandomId('name')">Tên cấp độ*</label>
            <input type="text" class="form-control" :id="getRandomId('name')" placeholder="Cấp độ 1" v-model="level.level_name" required>
          </div>
          <div class="mb-3 fv-plugins-icon-container">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" :id="getRandomId('referral-enabled')" v-model="level.referral_enabled">
              <label class="form-check-label" :for="getRandomId('referral-enabled')">Được phép giới thiệu</label>
            </div>
          </div>
          <div class="mb-3 fv-plugins-icon-container">
            <label class="form-label" :for="getRandomId('stars')">Số sao</label>
            <input type="number" :id="getRandomId('stars')" class="form-control" placeholder="0" v-model.number="level.stars" min="0" max="10">
            <div class="mt-2">
              <i class='bx bxs-star text-warning' v-for="star in yellowStars" :key="'yellow-' + star"></i>
              <i class='bx bx-star' v-for="star in whiteStars" :key="'white-' + star"></i>
            </div>
          </div>
         
          <div class="mb-3 fv-plugins-icon-container" v-for="(priority, index) in level.priorities" :key="index">
            <label class="form-label" :for="getRandomId('priority-' + index)">Ưu đãi {{ index + 1 }}</label>
            <div class="input-group">
              <input type="text" :id="getRandomId('priority-' + index)" class="form-control" placeholder="Mô tả ưu đãi" v-model="priority.description">
              <button class="btn btn-outline-danger" type="button" @click="removeField(index)">Xóa</button>
            </div>
          </div>
          <div class="mb-3">
            <button type="button" class="btn btn-outline-primary" @click="addField">Thêm ưu đãi</button>
          </div>
        </div>
        <div class="pt-3">
          <button type="submit" class="btn btn-primary me-sm-3 me-1 data-submit">
            {{ isEdit ? 'Lưu' : 'Tạo mới' }}
          </button>
          <button type="reset" class="btn bg-label-danger" @click="resetForm"> Nhập lại </button>
        </div>
      </form>
    </div>
  </div>
</template>
<script>
import Notify from "../../common/js/Notify";
import Api from "../../common/js/Api";
export default {
  props: {
    levelInit: {
      type: Object,
      default: () => ({
        level_name: '',
        cryptocurrency: '',
        stars: 0,
        referral_enabled: false,
        min_score: null,
        priorities: [{
          description: ''
        }]
      })
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    yellowStars() {
      return Math.min(this.level.stars, 10);
    },
    whiteStars() {
      return 10 - this.yellowStars;
    },
  },
  data() {
    return {
      componentId: '',
      formId: '',
      level: {
        level_name: '',
        cryptocurrency: '',
        stars: 0,
        referral_enabled: false,
        min_score: null,
        priorities: [{
          description: ''
        }]
      },
    };
  },
  watch: {
    levelInit: {
      handler(value) {
        if(value){
          this.level = value;
        }else{
          this.resetForm()
        }

      },
      deep: true,
    }
  },
  methods: {
    show() {
      const componentId = this.componentId;
      this.$nextTick(() => {
        $(`#${componentId}`).offcanvas('show');
      });

    },
    submitForm() {
      if (this.isEdit) {
        const updateLevel = {
          level_name: this.level.level_name,
          stars: this.level.stars,
          referral_enabled: this.level.referral_enabled,
          priorities: this.level.priorities
        };
        Api.put(`/api/levels/${this.level.id}`, updateLevel).then(response => {
          this.$emit('update-level', this.level);
          this.resetForm();
          $(`#${this.componentId}`).offcanvas('hide');
          Notify.success();
        }).catch(error => {
          if(error.response && error.response.data){

            Notify.error(null,error.response.data.error);
          }
          else{
            Notify.error()
          }
        });
      } else {
        const newLevel = {
          level_name: this.level.level_name,
          stars: this.level.stars,
          referral_enabled: this.level.referral_enabled,
          priorities: this.level.priorities
        };
        Api.post('/api/levels', newLevel).then(response => {
          this.$emit('add-level', response.data.level);
          this.resetForm();
          $(`#${this.componentId}`).offcanvas('hide');
          Notify.success();
        }).catch(error => {
          if(error.response && error.response.data){

            Notify.error(null,error.response.data.error);
          }
          else{
            Notify.error()
          }
        });
      }
    },
    resetForm() {
      if (this.isEdit) {
        this.level = {
          ...this.levelInit
        };
      } else {
        this.level = {
          level_name: '',
          stars: 0,
          priorities: [{
            description: ''
          }]
        };
      }
    },
    addField() {
      this.level.priorities.push({
        description: ''
      });
    },
    removeField(index) {
      this.level.priorities.splice(index, 1);
    },
    getRandomId(fieldName) {
      return `ecommerce-level-add-${fieldName}-${Math.random().toString(36).substring(7)}`;
    }
  },
  created() {
    this.componentId = 'toast-' + Math.random().toString(36).substring(7);
    this.formId = 'eCommerceLevelAddForm-' + Math.random().toString(36).substring(7);
  }
};
</script>