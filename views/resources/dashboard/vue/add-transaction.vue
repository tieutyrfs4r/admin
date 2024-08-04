<template>
  <div class="offcanvas offcanvas-end" tabindex="-1" :id="componentId" aria-modal="true" role="dialog">
    <div class="offcanvas-header">
      <h5 id="offcanvasEcommerceCustomerAddLabel" class="offcanvas-title">Add Customer</h5>
      <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body mx-0 flex-grow-0">
      <form class="ecommerce-customer-add pt-0 fv-plugins-bootstrap5 fv-plugins-framework" id="eCommerceCustomerAddForm" onsubmit="return false">
        <div class="ecommerce-customer-add-basic mb-3">
          <h6 class="mb-3">Basic Information</h6>
          <div class="mb-3 fv-plugins-icon-container">
            <label class="form-label" for="ecommerce-customer-add-name">Name*</label>
            <input type="text" class="form-control" id="ecommerce-customer-add-name" placeholder="John Doe" name="customerName" aria-label="John Doe">
            <div class="fv-plugins-message-container fv-plugins-message-container--enabled invalid-feedback"></div>
          </div>
          <div class="mb-3 fv-plugins-icon-container">
            <label class="form-label" for="ecommerce-customer-add-email">Email*</label>
            <input type="text" id="ecommerce-customer-add-email" class="form-control" placeholder="john.doe@example.com" aria-label="john.doe@example.com" name="customerEmail">
            <div class="fv-plugins-message-container fv-plugins-message-container--enabled invalid-feedback"></div>
          </div>
          <div>
            <label class="form-label" for="ecommerce-customer-add-contact">Mobile</label>
            <input type="text" id="ecommerce-customer-add-contact" class="form-control phone-mask" placeholder="+(123) 456-7890" aria-label="+(123) 456-7890" name="customerContact">
          </div>
        </div>
        <div class="ecommerce-customer-add-shiping mb-3 pt-3">
          <h6 class="mb-3">Shipping Information</h6>
          <div class="mb-3">
            <label class="form-label" for="ecommerce-customer-add-address">Address Line 1</label>
            <input type="text" id="ecommerce-customer-add-address" class="form-control" placeholder="45 Roker Terrace" aria-label="45 Roker Terrace" name="customerAddress1">
          </div>
          <div class="mb-3">
            <label class="form-label" for="ecommerce-customer-add-address-2">Address Line 2</label>
            <input type="text" id="ecommerce-customer-add-address-2" class="form-control" aria-label="address2" name="customerAddress2">
          </div>
          <div class="mb-3">
            <label class="form-label" for="ecommerce-customer-add-town">Town</label>
            <input type="text" id="ecommerce-customer-add-town" class="form-control" placeholder="New York" aria-label="New York" name="customerTown">
          </div>
          <div class="row mb-3">
            <div class="col-12 col-sm-6">
              <label class="form-label" for="ecommerce-customer-add-state">State / Province</label>
              <input type="text" id="ecommerce-customer-add-state" class="form-control" placeholder="Southern tip" aria-label="Southern tip" name="customerState">
            </div>
            <div class="col-12 col-sm-6">
              <label class="form-label" for="ecommerce-customer-add-post-code">Post Code</label>
              <input type="text" id="ecommerce-customer-add-post-code" class="form-control" placeholder="734990" aria-label="734990" name="pin" pattern="[0-9]{8}" maxlength="8">
            </div>
          </div>

          <div class="row mb-3">
            <label class="form-label" for="ecommerce-customer-add-country">Country</label>
            <div class="position-relative">
              <select2-component
                  :options="[{_id: 1,name:'1'},{_id: 2,name:'2'},{_id: 3,name:'3'},{_id: 4,name:'4'}].map(item =>  {return {id: item._id,value:item._id,text: `${item.name}`}})"
              />
            </div>
          </div>
        </div>
        <div class="d-sm-flex mb-3 pt-3">
          <div class="me-auto mb-2 mb-md-0">
            <h6 class="mb-0">Use as a billing address?</h6>
            <small class="text-muted">If you need more info, please check budget.</small>
          </div>
          <label class="switch m-auto pe-2">
            <input type="checkbox" class="switch-input">
            <span class="switch-toggle-slider">
            <span class="switch-on"></span>
            <span class="switch-off"></span>
          </span>
          </label>
        </div>
        <div class="pt-3">
          <button type="submit" class="btn btn-primary me-sm-3 me-1 data-submit">Add</button>
          <button type="reset" class="btn bg-label-danger" data-bs-dismiss="offcanvas">Discard</button>
        </div>
        <input type="hidden">
      </form>
    </div>
  </div>
</template>
<script>

import Select2Component from "../../common/vue/Select2Component.vue";

export default {
  components: {Select2Component},
  props: {

  },
  data() {
    return {
      componentId: '',
    };
  },
  methods: {
    show(){
      this.componentId = 'toast-' + Math.random().toString(36).substring(7);
      const componentId = this.componentId
      this.$nextTick(() => {
        $(`#${componentId}`).offcanvas('show');
      });
    }
  },
  created() {
    // $('#ecommerce-customer-add-country').select2({
    //   placeholder: "Select value",
    //   dropdownParent: $('#ecommerce-customer-add-country').parent()
    // })
    // $('#test').selectpicker();
  }
}
</script>