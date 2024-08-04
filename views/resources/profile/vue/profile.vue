<template>
  <div class="container-xxl flex-grow-1 container-p-y">
    <div class="row">
      <div class="col-xl-12">
        <div class="card mb-4">
          <h5 class="card-header">Thông tin cá nhân</h5>
          <div class="card-body">
            <div class="mb-3 row">
              <label for="html5-email-input" class="col-md-2 col-form-label">Email</label>
              <div class="col-md-10">
                <input class="form-control" type="email" v-model="user.email" id="html5-email-input" />
              </div>
            </div>
            <div class="mb-3 row">
              <label for="html5-password-input" class="col-md-2 col-form-label">Mật khẩu</label>
              <div class="col-md-10">
                <input class="form-control" type="password" v-model="user.password" id="html5-password-input" />
              </div>
            </div>
            <div class="mb-3 row">
              <label class="col-md-2 col-form-label">Mã được mời</label>
              <div class="col-md-10">
                <input class="form-control" type="text" v-model="user.referral_code"  />
              </div>
            </div>
            <div class="mb-3 row">
              <label class="col-md-2 col-form-label">Mã mời</label>
              <div class="col-md-10">
                <input class="form-control" type="text" v-model="user.invite_code"  />
              </div>
            </div>
            <div class="mb-3 row">
              <div class="col-md-10 offset-md-2">
                <button class="btn btn-primary" @click="updateUser">Cập nhật</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Api from "../../common/js/Api";
export default {
  data() {
    return {
      user: {
        email: '',
        password: '',
        invite_code: '',
        referral_code: ''
      }
    };
  },
  methods: {
    async getUserInfo() {
      try {
        const response = await Api.get('/api/profile/admin-info');
        this.user = response.data;
      } catch (error) {
        console.error(error);
      }
    },
    async updateUser() {
      try {
        await Api.put('/api/profile/update-admin', this.user);
        alert('Cập nhật thông tin thành công');
      } catch (error) {
        console.error(error);
        alert('Có lỗi xảy ra khi cập nhật thông tin');
      }
    }
  },
  mounted() {
    this.getUserInfo();
  }
};
</script>