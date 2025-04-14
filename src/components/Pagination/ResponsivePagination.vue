<template>
  <div class="responsive-pagination" :class="{ 'is-mobile': isMobile }">
    <div class="pagination-summary" v-if="showTotal && totalCount > 0">
      <span>共 {{ totalCount }} 筆資料</span>
    </div>

    <!-- 手機版分頁：簡化版面 -->
    <div v-if="isMobile" class="mobile-pagination">
      <div class="pagination-navigation">
        <el-button
          type="text"
          :disabled="currentPage <= 1"
          @click="handlePrev"
          class="page-button"
          :class="{ 'button-disabled': currentPage <= 1 }"
        >
          <i class="el-icon-arrow-left"></i> 上一頁
        </el-button>

        <div class="page-info">
          <span>{{ currentPage }} / {{ totalPages }}</span>
        </div>

        <el-button
          type="text"
          :disabled="currentPage >= totalPages"
          @click="handleNext"
          class="page-button"
          :class="{ 'button-disabled': currentPage >= totalPages }"
        >
          下一頁 <i class="el-icon-arrow-right"></i>
        </el-button>
      </div>

      <!-- 手機版頁面大小選擇 -->
      <div v-if="showSizeChanger" class="mobile-page-size">
        <el-select
          v-model="internalPageSize"
          @change="handleSizeChange"
          size="small"
          :placeholder="`${internalPageSize}筆/頁`"
        >
          <el-option
            v-for="item in pageSizes"
            :key="item"
            :label="`${item}筆/頁`"
            :value="item"
          >
          </el-option>
        </el-select>
      </div>
    </div>

    <!-- 桌面版分頁：完整功能 -->
    <el-pagination
      v-else
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="pageSizes"
      :page-size="internalPageSize"
      :layout="layout"
      :total="totalCount"
      :background="background"
      :hide-on-single-page="hideOnSinglePage"
    >
    </el-pagination>
  </div>
</template>

<script>
export default {
  name: "ResponsivePagination",

  props: {
    currentPage: {
      type: Number,
      required: true
    },
    pageSize: {
      type: Number,
      default: 10
    },
    totalCount: {
      type: Number,
      required: true
    },
    pageSizes: {
      type: Array,
      default: () => [5, 10, 20, 50]
    },
    layout: {
      type: String,
      default: "total, sizes, prev, pager, next, jumper"
    },
    background: {
      type: Boolean,
      default: true
    },
    hideOnSinglePage: {
      type: Boolean,
      default: true
    },
    showSizeChanger: {
      type: Boolean,
      default: true
    },
    showTotal: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      internalPageSize: this.pageSize,
      isMobile: false
    };
  },

  computed: {
    totalPages() {
      return Math.ceil(this.totalCount / this.internalPageSize) || 1;
    }
  },

  watch: {
    pageSize(newVal) {
      this.internalPageSize = newVal;
    }
  },

  mounted() {
    this.checkDeviceWidth();
    window.addEventListener("resize", this.checkDeviceWidth);
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.checkDeviceWidth);
  },

  methods: {
    checkDeviceWidth() {
      this.isMobile = window.innerWidth <= 768;
    },

    handleSizeChange(val) {
      this.internalPageSize = val;
      this.$emit("size-change", val);
    },

    handleCurrentChange(val) {
      this.$emit("current-change", val);
    },

    handlePrev() {
      if (this.currentPage > 1) {
        this.$emit("current-change", this.currentPage - 1);
      }
    },

    handleNext() {
      if (this.currentPage < this.totalPages) {
        this.$emit("current-change", this.currentPage + 1);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
$primary-color: #1890ff;
$disable-color: #c0c4cc;
$border-radius: 4px;

.responsive-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
  flex-wrap: wrap;

  .pagination-summary {
    margin-right: 16px;
    color: #606266;

    @media (max-width: 768px) {
      width: 100%;
      text-align: center;
      margin-right: 0;
      margin-bottom: 12px;
    }
  }

  &.is-mobile {
    flex-direction: column;
    align-items: stretch;

    .mobile-pagination {
      display: flex;
      flex-direction: column;

      .pagination-navigation {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .page-button {
          padding: 8px 12px;
          border-radius: $border-radius;
          font-size: 14px;
          color: $primary-color;

          &.button-disabled {
            color: $disable-color;
            cursor: not-allowed;
          }

          i {
            font-size: 12px;
          }
        }

        .page-info {
          background-color: #f5f7fa;
          padding: 4px 12px;
          border-radius: $border-radius;
          font-size: 14px;
          color: #606266;
        }
      }

      .mobile-page-size {
        display: flex;
        justify-content: center;
        margin-top: 8px;

        .el-select {
          width: 120px;
        }
      }
    }
  }
}

// 深度選擇器，修改 Element UI 分頁器樣式
.responsive-pagination ::v-deep {
  .el-pagination {
    white-space: normal;
    text-align: center;

    .el-pagination__sizes {
      margin: 0 10px;
    }

    .el-pagination__jump {
      margin-left: 10px;
    }

    @media (max-width: 576px) {
      .el-pagination__sizes {
        margin: 0 5px;
      }

      .el-pagination__jump {
        margin-left: 5px;
      }

      .btn-prev,
      .btn-next {
        padding: 0 6px;
      }

      .el-pager li {
        min-width: 28px;
      }
    }
  }
}
</style>
