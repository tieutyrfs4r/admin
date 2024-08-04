<template>
  <div class="modal fade" :id="modalId" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ getModalTitle }}</h5>
          <button type="button" class="btn-close" @click="hideModal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>{{ getModalMessage }}</p>
          <div class="mb-3" v-if="action === 'failed'">
            <label for="fail-reason">Lý do thất bại:</label>
            <textarea id="fail-reason" v-model="failReason" class="form-control" required></textarea>
          </div>
          <div class="mb-3" v-if="action === 'failed'">
            <label for="allow-appeal">Cho phép kháng cáo:</label>
            <select id="allow-appeal" v-model="allowAppeal" class="form-select">
              <option value="true">Có</option>
              <option value="false">Không</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="hideModal">Hủy</button>
          <button type="button" class="btn" :class="getModalButtonClass" @click="confirmAction" :disabled="action === 'failed' && !failReason">{{ getModalButtonText }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Api from '../../../common/js/Api';
import Notify from '../../../common/js/Notify';

export default {
  props: {
    userId: {
      type: String,
      required: true,
    },
    verifyUserId: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      modalId: `confirm-modal-${Math.random().toString(36).substr(2, 9)}`,
      failReason: '',
      allowAppeal: 'false',
    };
  },
  computed: {
    getModalTitle() {
      switch (this.action) {
        case 'success':
          return 'Xác nhận thành công';
        case 'failed':
          return 'Xác nhận thất bại';
        default:
          return '';
      }
    },
    getModalMessage() {
      switch (this.action) {
        case 'success':
          return 'Bạn có chắc chắn muốn xác nhận thành công người dùng này?';
        case 'failed':
          return 'Bạn có chắc chắn muốn xác nhận thất bại người dùng này?';
        default:
          return '';
      }
    },
    getModalButtonClass() {
      switch (this.action) {
        case 'success':
          return 'btn-success';
        case 'failed':
          return 'btn-danger';
        default:
          return '';
      }
    },
    getModalButtonText() {
      switch (this.action) {
        case 'success':
          return 'Xác nhận thành công';
        case 'failed':
          return 'Xác nhận thất bại';
        default:
          return '';
      }
    },
  },
  methods: {
    showModal() {
      $(`#${this.modalId}`).modal('show');
    },
    hideModal() {
      $(`#${this.modalId}`).modal('hide');
    },
    async confirmAction() {
      try {
        const data = {
          status: this.action === 'success' ? 'success' : 'failed',
        };
        if (this.action === 'failed') {
          data.fail_reason = this.failReason;
          data.allow_appeal = this.allowAppeal === 'true';
        }
        await Api.put(`/api/users/verifies/${this.userId}/edit/${this.verifyUserId}`, data);
        this.$emit('user-status-updated');
        Notify.success();
        this.hideModal();
      } catch (error) {
        console.error('Error updating user status:', error);
        if(error.response && error.response.data){

          Notify.error(null,error.response.data.error);
        }
        else{
          Notify.error()
        }
      }
    },
  },
};
</script>