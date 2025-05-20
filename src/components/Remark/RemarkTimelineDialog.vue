<!-- components/Remark/RemarkTimelineDialog.vue -->
<template>
  <el-dialog
    title="備註歷史"
    :visible.sync="dialogVisible"
    custom-class="remark-timeline-dialog"
    width="500px"
    :append-to-body="true"
    :modal-append-to-body="false"
    :modal="false"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    :show-close="true"
    @closed="handleClose"
  >
    <!-- 訂單資訊卡片 -->
    <div class="order-info-card">
      <div class="order-number">{{ orderInfo.orderNumber }}</div>
      <div class="customer-info">
        <i class="el-icon-user"></i>
        <span>{{ orderInfo.customerName }}</span>
      </div>
      <div class="phone-info" @click="callCustomer">
        <i class="el-icon-phone"></i>
        <span>{{
          formatPhone(orderInfo.contactPhone, orderInfo.extension)
        }}</span>
      </div>
    </div>

    <!-- 篩選選項 -->
    <div class="filter-chips" v-if="showFilterOptions">
      <div
        class="filter-chip"
        :class="{ active: currentFilter === 'all' }"
        @click="handleFilterChange('all')"
      >
        <span>所有備註</span>
      </div>
      <div
        class="filter-chip"
        :class="{ active: currentFilter === 'important' }"
        @click="handleFilterChange('important')"
      >
        <i class="el-icon-star-on"></i>
        <span>重要備註</span>
      </div>
      <div
        class="filter-chip"
        :class="{ active: currentFilter === 'pinned' }"
        @click="handleFilterChange('pinned')"
      >
        <i class="el-icon-top"></i>
        <span>固定備註</span>
      </div>
    </div>

    <!-- 新增備註懸浮按鈕 -->
    <div class="fab-button" v-if="!showAddRemark" @click="showAddRemark = true">
      <i class="el-icon-plus"></i>
    </div>
    <!-- 備註時間線 -->
    <remark-list
      v-if="!showAddRemark"
      :remarks="filteredRemarks"
      :loading="loading"
      :has-more="hasMoreRemarks"
      :can-manage="canManage"
      @load-more="loadMoreRemarks"
      @update-remark="updateRemark"
      @delete-remark="confirmDeleteRemark"
      @view-image="openImagePreview"
    ></remark-list>

    <!-- 新增備註表單 -->
    <el-dialog
      title="新增備註"
      :visible.sync="showAddRemark"
      custom-class="add-remark-dialog"
      width="500px"
      :append-to-body="true"
      :modal-append-to-body="false"
      :modal="false"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      :show-close="true"
      @closed="cancelAddRemark"
    >
      <add-remark-form
        :submitting="submitting"
        @cancel="cancelAddRemark"
        @submit="submitRemark"
        @preview-image="handleFilePreview"
      ></add-remark-form>
    </el-dialog>

    <!-- 圖片查看器 -->
    <image-viewer
      v-if="previewVisible"
      :src="previewImage"
      :image-list="previewImageList"
      :initial-index="currentImageIndex"
      @close="previewVisible = false"
    ></image-viewer>

    <!-- 確認刪除對話框 -->
    <el-dialog
      title="確認刪除"
      :visible.sync="deleteConfirmVisible"
      width="80%"
      append-to-body
      center
      class="delete-confirm-dialog"
    >
      <div class="delete-confirm-content">
        <i class="el-icon-warning warning-icon"></i>
        <p>確定要刪除此備註嗎？此操作無法撤銷。</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteConfirmVisible = false" round>取消</el-button>
        <el-button
          type="danger"
          @click="confirmDeleteRemark"
          :loading="submitting"
          round
        >
          確定刪除
        </el-button>
      </span>
    </el-dialog>
  </el-dialog>
</template>

<script>
// 導入子組件
import RemarkList from "./RemarkList.vue";
import AddRemarkForm from "./AddRemarkForm.vue";
import ImageViewer from "./ImageViewer.vue";

// 導入工具函數
import { formatPhone } from "@/utils/dataTable";

export default {
  name: "RemarkTimelineDialog",

  components: {
    RemarkList,
    AddRemarkForm,
    ImageViewer
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },

    // 完整備註列表
    remarks: {
      type: Array,
      default: () => []
    },

    orderId: {
      type: [Number, String],
      default: null
    },

    orderInfo: {
      type: Object,
      default: () => ({
        orderNumber: "",
        customerName: "",
        contactPhone: "",
        extension: ""
      })
    },

    // 是否顯示加載更多按鈕
    hasMore: {
      type: Boolean,
      default: false
    },

    // 是否處於加載狀態
    isLoading: {
      type: Boolean,
      default: false
    },

    // 是否可以管理備註（刪除、固定等）
    canManage: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      dialogVisible: false,
      showAddRemark: false,
      loading: false,
      submitting: false,
      currentFilter: "all",
      hasMoreRemarks: false,
      showFilterOptions: true,

      // 圖片預覽相關
      previewVisible: false,
      previewImage: "",
      previewImageList: [],
      currentImageIndex: 0,

      // 刪除確認對話框
      deleteConfirmVisible: false,
      remarkToDelete: null
    };
  },

  computed: {
    // 根據篩選條件過濾備註
    filteredRemarks() {
      if (this.currentFilter === "all") {
        return this.remarks;
      } else if (this.currentFilter === "important") {
        return this.remarks.filter(remark => remark.is_important);
      } else if (this.currentFilter === "pinned") {
        return this.remarks.filter(remark => remark.is_pinned);
      }

      return this.remarks;
    }
  },

  watch: {
    remarks(newVal) {
      // 當備註列表更新時重置篩選條件
      this.currentFilter = "all";
    },

    visible(val) {
      this.dialogVisible = val;
      if (val) {
        this.hasMoreRemarks = this.hasMore;
        this.loading = this.isLoading;
      }
    },

    isLoading(val) {
      this.loading = val;
    },

    hasMore(val) {
      this.hasMoreRemarks = val;
    },

    remarks() {
      // 當備註列表更新時重置篩選條件
      this.currentFilter = "all";
    }
  },

  methods: {
    formatPhone,

    // 處理篩選變更
    handleFilterChange(filter) {
      this.currentFilter = filter;
    },

    // 加載更多備註
    loadMoreRemarks() {
      this.$emit("load-more");
    },

    // 打開圖片預覽
    openImagePreview({ src, imageList, index }) {
      this.previewImage = src;
      this.previewImageList = imageList;
      this.currentImageIndex = index !== undefined ? index : 0;
      this.previewVisible = true;
    },

    // 撥打電話
    callCustomer() {
      if (this.orderInfo.contactPhone) {
        window.location.href = `tel:${this.orderInfo.contactPhone}`;
      }
    },

    // 更新備註
    updateRemark(remark) {
      this.$emit("update-remark", remark);
    },

    // 顯示刪除確認對話框
    showDeleteConfirm(remark) {
      this.remarkToDelete = remark;
      this.deleteConfirmVisible = true;
    },

    // 確認刪除備註
    confirmDeleteRemark() {
      if (!this.remarkToDelete) return;

      this.submitting = true;
      this.$emit("delete-remark", this.remarkToDelete);

      // 關閉確認對話框
      this.deleteConfirmVisible = false;
      this.remarkToDelete = null;

      // 由於刪除是非同步操作，submitting 狀態會在外部完成後更新
      setTimeout(() => {
        if (this.submitting) this.submitting = false;
      }, 3000);
    },

    // 處理文件預覽
    handleFilePreview(file) {
      this.previewImage = file.url || URL.createObjectURL(file.raw);
      this.previewVisible = true;
    },

    // 取消添加備註
    cancelAddRemark() {
      this.showAddRemark = false;
    },

    // 提交新備註
    submitRemark(remarkData) {
      this.submitting = true;

      // 準備要提交的數據
      const fullRemarkData = {
        ...remarkData,
        orderId: this.orderId
      };

      // 將添加備註的事件發送給父組件處理
      this.$emit("add-remark", fullRemarkData);

      // 等待提交完成
      setTimeout(() => {
        if (this.submitting) this.submitting = false;
        this.showAddRemark = false;
      }, 3000);
    },

    // 關閉對話框
    handleClose() {
      this.showAddRemark = false;
      this.currentFilter = "all";
      this.showFilterOptions = false;
      this.$emit("update:visible", false);
    }
  }
};
</script>

<style lang="scss" scoped>
::v-deep .add-remark-dialog {
  margin: 0 !important;

  .el-dialog {
    border-radius: 12px;
    overflow: hidden;
  }

  .el-dialog__header {
    background: #f8f8f8;
  }

  .el-dialog__body {
    padding: 0;
  }
}
.remark-timeline-dialog {
  margin: 0 !important;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  ::v-deep .el-dialog__header {
    display: none;
  }

  ::v-deep .el-dialog__body {
    padding: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    max-height: 100vh;
  }

  .mobile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background-color: #ffffff;
    position: sticky;
    top: 0;
    z-index: 10;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);

    .back-button {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      cursor: pointer;
      color: #333;
    }

    .dialog-title {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }

    .action-menu {
      width: 32px;
      display: flex;
      justify-content: flex-end;
      font-size: 20px;
      color: #606266;
    }
  }

  .order-info-card {
    margin: 0 16px 16px;
    padding: 16px;
    background: #f8f8f8;
    border-radius: 12px;

    .order-number {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #333;
    }

    .customer-info,
    .phone-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
      color: #606266;

      i {
        font-size: 16px;
      }
    }

    .phone-info {
      color: #1890ff;
      cursor: pointer;
    }
  }

  .filter-chips {
    display: flex;
    gap: 10px;
    padding: 0 16px 16px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      display: none;
    }

    .filter-chip {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border-radius: 16px;
      background: #f5f5f5;
      color: #606266;
      font-size: 14px;
      white-space: nowrap;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.3s;

      &.active {
        background: #e6f7ff;
        color: #1890ff;
        border-color: #91d5ff;
      }

      i {
        font-size: 14px;
      }
    }
  }

  .fab-button {
    position: fixed;
    right: 16px;
    bottom: 16px;
    width: 56px;
    height: 56px;
    border-radius: 28px;
    background: #1890ff;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
    z-index: 100;
    cursor: pointer;
    transition: transform 0.3s;

    i {
      font-size: 24px;
    }

    &:active {
      transform: scale(0.95);
    }
  }

  .delete-confirm-dialog {
    ::v-deep .el-dialog {
      border-radius: 16px;
      overflow: hidden;
    }

    ::v-deep .el-dialog__header {
      padding: 16px 16px 0;
    }

    ::v-deep .el-dialog__body {
      padding: 16px;
    }

    ::v-deep .el-dialog__footer {
      padding: 0 16px 16px;
    }

    .delete-confirm-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 16px 0;

      .warning-icon {
        font-size: 48px;
        color: #ff4d4f;
        margin-bottom: 16px;
      }

      p {
        margin: 0;
        font-size: 16px;
        color: #303133;
      }
    }
  }
}
</style>
