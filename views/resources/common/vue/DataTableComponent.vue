<!-- DataTableComponent.vue -->
<template>
  <div>
    <div class="row mb-3">
      <slot name="other-actions"></slot>
    </div>
    <div class="table-responsive text-nowrap mb-3">
      <table class="table table-hover data-table border-bottom">
        <thead>
        <tr>
          <td v-if="selectable" class="sticky-column">
            <input class="form-check-input" type="checkbox" v-model="allChecked">
          </td>
          <th v-for="(column, index) in columns" :key="index"  @click="toggleSort(column)" :class="{ 'sortable-column': column.sortable }">
            {{ column.label }}  <i v-if="column.sortable" class="bx" :class="getSortIcon(column)"></i>
          </th>
        </tr>
        </thead>
        <tbody class="table-border-bottom-0">
        <tr v-for="(item, index) in items" :key="index">
          <td v-if="selectable" class="sticky-column">
            <input class="form-check-input" type="checkbox" v-model="item.checked">
          </td>
          <td v-for="(column, columnIndex) in columns" :key="columnIndex">
            <template v-if="column.field">
              {{ item.data[column.field] }}
            </template>
            <template v-else-if="column.slot">
              <slot :name="column.slot" :item="item"></slot>
            </template>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div class="row table-pagination">
      <div class="col-sm-12 col-md-6">
        <div class="table-info">
          Hiển thị {{ (currentPage - 1) * perPage + 1 }} đến {{ Math.min(currentPage * perPage, totalItems) }} của {{ totalItems }} mục
        </div>
      </div>
      <div class="col-sm-12 col-md-6">
        <nav aria-label="Page navigation">
          <ul class="pagination justify-content-md-end justify-content-sm-center">
            <li class="page-item prev" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="javascript:void(0);" @click="changePage(currentPage - 1)"><i class="tf-icon bx bx-chevrons-left"></i></a>
            </li>
            <li class="page-item" v-for="page in Math.ceil(totalItems / perPage)" :key="page" :class="{ active: currentPage === page }">
              <a class="page-link" href="javascript:void(0);" @click="changePage(page)">{{ page }}</a>
            </li>
            <li class="page-item next" :class="{ disabled: currentPage === Math.ceil(totalItems / perPage) }">
              <a class="page-link" href="javascript:void(0);" @click="changePage(currentPage + 1)"><i class="tf-icon bx bx-chevrons-right"></i></a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    columns: {
      type: Array,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    selectable: {
      type: Boolean,
      default: false
    },
    currentPage: {
      type: Number,
      required: true
    },
    perPage: {
      type: Number,
      required: true
    },
    totalItems: {
      type: Number,
      required: true
    }
  },
  computed: {
    allChecked: {
      get() {
        return this.items.every(item => item.checked);
      },
      set(value) {
        this.items.forEach(item => item.checked = value);
      }
    },
    countItemSelected() {
      return this.items.filter(item => item.checked).length;
    },
    totalPages() {
      return Math.ceil(this.totalItems / this.perPage);
    }
  },
  data(){
    return {
      sortColumn: null,
      sortOrder: 'asc'
    }
  },
  methods: {
    changePage(page) {
      this.$emit('update:currentPage', page);
    },
    deleteItemSelected() {
      this.$emit('delete-selected');
    },
    toggleSort(column) {
      if (column.sortable) {
        if (this.sortColumn === column) {
          this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
          this.sortColumn = column;
          this.sortOrder = 'asc';

        }
        this.$emit('sort', { column: this.sortColumn, order: this.sortOrder });
      }
    },
    getSortIcon(column) {
      if (this.sortColumn === column) {
        return this.sortOrder === 'asc' ? 'bx-sort-down' : 'bx-sort-up';
      }
      return 'bx-sort';
    }
  }
};
</script>

<style scoped>
.sticky-column {
  position: sticky;
  left: 0;
  z-index: 1;
  background-color: #fff;
}
.sortable-column {
  cursor: pointer;
}
</style>