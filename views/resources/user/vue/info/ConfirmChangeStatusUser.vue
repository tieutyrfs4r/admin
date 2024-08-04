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
          <template v-if="action === 'locked'">
            <div class="mb-3">
              <label class="form-label">Bật/Tắt thông báo khóa của người dùng ở trang chính</label>
              <div class="form-check form-switch mb-2">
                <input class="form-check-input" v-model="show_lock_message" type="checkbox" />
                <label class="form-check-label">{{ show_lock_message ? 'Bật' : 'Tắt' }}</label>
              </div>
            </div>
            <div class="mb-3" v-if="!show_lock_message">
              <label for="lockMessageTime" class="form-label">Thời gian chờ để ẩn thông báo khi thực hiện giao dịch:</label>
              <input class="form-control" id="lockMessageTime" v-model="lock_message_limit_time"/>
            </div>
            <div class="mb-3">
              <label for="lockMessage" class="form-label">Lý do khóa:</label>
              <textarea class="form-control" id="lockMessage" v-model="lock_message" rows="3"></textarea>
            </div>
          </template>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="hideModal">Hủy</button>
          <button type="button" class="btn" :class="getModalButtonClass" @click="confirmAction">{{ getModalButtonText }}</button>
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
    action: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      modalId: `confirm-modal-${Math.random().toString(36).substr(2, 9)}`,
      lock_message: '',
      show_lock_message: true,
      lock_message_limit_time: 5
    };
  },
  computed: {
    getModalTitle() {
      switch (this.action) {
        case 'active':
          return 'Xác nhận người dùng';
        case 'locked':
          return 'Khóa người dùng';
        default:
          return '';
      }
    },
    getModalMessage() {
      switch (this.action) {
        case 'active':
          return 'Bạn có chắc chắn muốn xác nhận người dùng này?';
        case 'locked':
          return 'Bạn có chắc chắn muốn khóa người dùng này?';
        default:
          return '';
      }
    },
    getModalButtonClass() {
      switch (this.action) {
        case 'active':
          return 'btn-success';
        case 'locked':
          return 'btn-danger';
        default:
          return '';
      }
    },
    getModalButtonText() {
      switch (this.action) {
        case 'active':
          return 'Xác nhận';
        case 'locked':
          return 'Khóa';
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
        const payload = { status: this.action };
        if (this.action === 'locked') {
          payload.lock_message = this.lock_message;
          payload.show_lock_message = this.show_lock_message
          payload.lock_message_limit_time = this.lock_message_limit_time
        }
        await Api.put(`/api/users/edit/${this.userId}`, payload);
        this.$emit('user-status-updated', {
          lock_message: this.lock_message
        });
        Notify.success();
        this.hideModal();
      } catch (error) {
        console.error('Error updating user status:', error);
        if (error.response && error.response.data) {
          Notify.error(null, error.response.data.error);
        } else {
          Notify.error();
        }
      }
    },
  },
};
</script>