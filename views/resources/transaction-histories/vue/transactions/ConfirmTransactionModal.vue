<template>
  <div class="modal fade" :id="modalId" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="btn-close" @click="hideModal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="d-flex align-items-center">
            <i class="bx" :class="getIconClass" style="font-size: 5rem;"></i>
            <span class="m-2">{{ getConfirmMessage }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" @click="hideModal">Đóng</button>
          <button type="button" class="btn" :class="getButtonClass" @click="confirmAction">
            {{ getButtonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    transactionId: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      validator: (value) => ['confirm', 'cancel', 'delete'].includes(value),
    },
  },
  data() {
    return {
      modalId: `confirm-modal-${Math.random().toString(36).substr(2, 9)}`,
    };
  },
  computed: {
    getIconClass() {
      if (this.action === 'confirm') {
        return 'bx-check-circle text-success';
      } else {
        return 'bx-x-circle text-danger';
      }
    },
    getConfirmMessage() {
      if (this.action === 'confirm') {
        return 'Bạn có muốn xác nhận giao dịch này không?';
      } else if (this.action === 'cancel') {
        return 'Bạn có muốn hủy giao dịch này không?';
      } else {
        return 'Bạn có muốn xóa giao dịch này không?';
      }
    },
    getButtonClass() {
      if (this.action === 'confirm') {
        return 'btn-success';
      } else {
        return 'btn-danger';
      }
    },
    getButtonText() {
      if (this.action === 'confirm') {
        return 'Xác nhận';
      } else if (this.action === 'cancel') {
        return 'Hủy giao dịch';
      } else {
        return 'Xóa giao dịch';
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
    confirmAction() {
      this.$emit('confirm', this.transactionId);
      this.hideModal();
    },
  },
};
</script>