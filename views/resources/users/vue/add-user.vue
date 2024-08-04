<template>
  <div class="offcanvas offcanvas-end" tabindex="-1" :id="componentId" aria-modal="true" role="dialog">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title">{{ isEdit ? 'Chỉnh sửa người dùng' : 'Thêm một người dùng mới' }}</h5>
      <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body mx-0 flex-grow-0">
      <form class="ecommerce-customer-add pt-0 fv-plugins-bootstrap5 fv-plugins-framework" :id="formId" @submit.prevent="submitForm">
        <div class="ecommerce-user-add-basic mb-3">
          <div class="mb-3 fv-plugins-icon-container">
            <label class="form-label" :for="getRandomId('full-name')">Họ tên*</label>
            <input type="text" class="form-control" :id="getRandomId('full-name')" placeholder="Nhập họ tên" v-model="user.full_name" required>
          </div>
          <div class="mb-3 fv-plugins-icon-container">
            <label class="form-label" :for="getRandomId('email')">Email*</label>
            <input type="email" class="form-control" :id="getRandomId('email')" placeholder="Nhập email" v-model="user.email" required>
          </div>
          <div class="mb-3 fv-plugins-icon-container" v-if="!isEdit">
            <label class="form-label" :for="getRandomId('password')">Mật khẩu*</label>
            <div class="input-group input-group-merge">
              <input :type="showPassword ? 'text' : 'password'" :id="getRandomId('password')"   aria-describedby="password" class="form-control" placeholder="Nhập mật khẩu" v-model="user.password" required>
              <span class="input-group-text cursor-pointer" @click="showPassword = !showPassword"><i :class="showPassword ? 'bx bx-show' : 'bx bx-hide'"></i></span>
            </div>
          </div>
          <div class="mb-3 fv-plugins-icon-container">
            <label class="form-label" :for="getRandomId('avatar')">Avatar</label>
            <input type="file" :id="getRandomId('avatar')" class="form-control" @change="handleAvatarUpload">
            <img v-if="previewAvatar" :src="previewAvatar" class="mt-3" style="max-width: 200px;" alt="">
          </div>
          <div class="mb-3 fv-plugins-icon-container">
            <label class="form-label" :for="getRandomId('address')">Địa chỉ*</label>
            <input type="text" :id="getRandomId('address')" class="form-control" placeholder="Nhập địa chỉ" v-model="user.address" required>
          </div>
          <div class="mb-3 fv-plugins-icon-container">
            <label class="form-label" :for="getRandomId('ward')">Phường/Xã*</label>
            <input type="text" :id="getRandomId('ward')" class="form-control" placeholder="Nhập phường/xã" v-model="user.ward" required>
          </div>
          <div class="mb-3 fv-plugins-icon-container">
            <label class="form-label" :for="getRandomId('district')">Quận/Huyện*</label>
            <input type="text" :id="getRandomId('district')" class="form-control" placeholder="Nhập quận/huyện" v-model="user.district" required>
          </div>
          <div class="mb-3 fv-plugins-icon-container">
            <label class="form-label" :for="getRandomId('province')">Tỉnh/Thành phố*</label>
            <input type="text" :id="getRandomId('province')" class="form-control" placeholder="Nhập tỉnh/thành phố" v-model="user.province" required>
          </div>

          <div class="mb-3 fv-plugins-icon-container">
            <label class="form-label" :for="getRandomId('phone-number')">Số điện thoại*</label>
            <input type="text" :id="getRandomId('phone-number')" class="form-control" placeholder="Nhập số điện thoại" v-model="user.phone_number" required>
          </div>
          <div class="mb-3 fv-plugins-icon-container">
            <label class="form-label" :for="getRandomId('referral-code')">Mã giới thiệu*</label>
            <input type="text" :id="getRandomId('referral-code')" class="form-control" placeholder="Nhập mã giới thiệu" v-model="user.referral_code" required>
          </div>
          <div class="mb-3 fv-plugins-icon-container">
            <label class="form-label" :for="getRandomId('invite-code')">Mã mời</label>
            <input type="text" :id="getRandomId('invite-code')" class="form-control" placeholder="Nhập mã mời" v-model="user.invite_code">
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
    userInit: {
      type: Object,
      default: () => ({
        full_name: '',
        email: '',
        password: '',
        avatar: '',
        address: '',
        ward: '',
        district: '',
        province: '',
        level: '',
        phone_number: '',
        referral_code: '',
        invite_code: ''
      })
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    previewAvatar() {
      if (typeof this.user.avatar === 'string' && this.user.avatar.startsWith('http')) {
        return this.user.avatar;
      } else if (this.user.avatar instanceof File) {
        return URL.createObjectURL(this.user.avatar);
      } else {
        return null;
      }
    },
    starLevelSelected(){
      if(this.user.level){
        const level = this.levels.find(item => (item.id === this.user.level))
        if(level){
          return level.stars
        }
      }
      return 0
    },
  },
  data() {
    return {
      componentId: '',
      formId: '',
      user: {
        full_name: '',
        email: '',
        password: '',
        avatar: '',
        address: '',
        ward: '',
        district: '',
        province: '',
        status: 'active',
        level: '',
        phone_number: '',
        referral_code: '',
        invite_code: ''
      },
      levels: [],
      showPassword: false
    };
  },
  watch: {
    userInit: {
      handler(value) {
        if(value){
          const user = JSON.parse(JSON.stringify(value));
          if(user.level){
            user.level = user.level.id;
          }
          this.user = user;
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
      this.fetchLevels();
    },
    fetchLevels() {
      Api.get('/api/levels',{
        params: {
          limit: 100,
        }
      }).then(response => {
        this.levels = response.data.docs;
      }).catch(error => {
        console.error('Error fetching levels:', error);
      });
    },
    submitForm() {
      console.log(this.user)
      if (this.isEdit) {
        const updateUser = {
          full_name: this.user.full_name,
          email: this.user.email,
          avatar: this.user.avatar,
          address: this.user.address,
          ward: this.user.ward,
          district: this.user.district,
          province: this.user.province,
          status: this.user.status,
          level: this.user.level,
          phone_number: this.user.phone_number,
          referral_code: this.user.referral_code,
          invite_code: this.user.invite_code
        };
        Api.put(`/api/users/edit/${this.user.id}`, updateUser).then(response => {
          this.$emit('update-user', this.user);
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
        const newUser = {
          full_name: this.user.full_name,
          email: this.user.email,
          password: this.user.password,
          avatar: this.user.avatar,
          address: this.user.address,
          ward: this.user.ward,
          district: this.user.district,
          province: this.user.province,
          status: this.user.status,
          level: this.user.level,
          phone_number: this.user.phone_number,
          referral_code: this.user.referral_code,
          invite_code: this.user.invite_code
        };
        console.log(newUser)
        Api.post('/api/users/create', newUser).then(response => {
          this.$emit('add-user', response.data.user);
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
        this.user = {
          ...this.userInit
        };
      } else {
        this.user = {
          full_name: '',
          email: '',
          password: '',
          avatar: '',
          address: '',
          ward: '',
          district: '',
          province: '',
          status: 'active',
          level: '',
          phone_number: '',
          referral_code: '',
          invite_code: ''
        };
      }
    },
    handleAvatarUpload(event) {
      const file = event.target.files[0];
      this.user.avatar = file;
    },
    getRandomId(fieldName) {
      return `ecommerce-user-add-${fieldName}-${Math.random().toString(36).substring(7)}`;
    }
  },
  created() {
    this.componentId = 'toast-' + Math.random().toString(36).substring(7);
    this.formId = 'eCommerceUserAddForm-' + Math.random().toString(36).substring(7);
  }
};
</script>