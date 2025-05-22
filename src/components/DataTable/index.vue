// components/DataTable/index.vue
<template>
  <div class="data-table-wrapper">
    <!-- 工具欄 -->
    <div class="table-toolbar" v-if="showToolbar">
      <div class="toolbar-settings">
        <slot name="toolbar"></slot>

        <div class="toolbar-right">
          <!-- 批量更新狀態按鈕 -->
          <el-button
            v-if="showBatchUpdateButton"
            type="primary"
            plain
            size="small"
            :disabled="!selectedRows.length"
            @click="handleBatchUpdate"
          >
            <i class="el-icon-edit"></i>
            批量更新狀態 ({{ selectedRows.length }}項)
          </el-button>

          <!-- 匯出按鈕 -->
          <el-button
            type="warning"
            plain
            size="small"
            :disabled="!selectedRows.length"
            @click="handleExportPreview"
          >
            <i class="el-icon-document"></i>
            匯出選中項 ({{ selectedRows.length }}項)
          </el-button>

          <!-- 全選/取消全選按鈕 -->
          <el-button-group>
            <el-button
              type="success"
              plain
              size="small"
              @click="handleSelectAll(true)"
              :disabled="!data.length"
            >
              <i class="el-icon-check"></i>
              全選
            </el-button>
            <el-button
              type="success"
              plain
              size="small"
              @click="handleSelectAll(false)"
              :disabled="!selectedRows.length"
            >
              <i class="el-icon-close"></i>
              取消全選
            </el-button>
          </el-button-group>
        </div>
      </div>
    </div>

    <!-- 表格主體 -->
    <div
      ref="tableWrapper"
      class="table-wrapper"
      :style="{ height: realHeight + 'px' }"
    >
      <el-table
        ref="table"
        v-loading="loading"
        :data="paginatedData"
        :height="realHeight"
        :max-height="maxHeight"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        @expand-change="handleExpandChange"
        class="main-table"
        v-bind="$attrs"
        :key="tableKey"
        :row-style="getRowStyle"
        :row-key="rowKey"
        border
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      >
        <!-- 展開列 -->
        <el-table-column v-if="showSubTable" type="expand">
          <template slot-scope="scope">
            <sub-table
              :data="scope.row.details || []"
              :columns="subTableColumns"
              :row-key="subRowKey"
              :parent-row="scope.row"
              :action-width="actionWidth"
              @row-click="handleSubRowClick"
            >
              <template
                v-if="$scopedSlots['sub-actions']"
                slot="sub-actions"
                slot-scope="slotProps"
              >
                <slot
                  name="sub-actions"
                  :row="slotProps.row"
                  :index="slotProps.index"
                  :parent-row="slotProps.parentRow"
                ></slot>
              </template>
            </sub-table>
          </template>
        </el-table-column>

        <!-- 選擇列 -->
        <el-table-column
          v-if="showSelectionColumn"
          type="selection"
          width="48"
          fixed="left"
          :selectable="checkSelectable"
          :reserve-selection="true"
          sortable="false"
        />

        <!-- 序號列 -->
        <el-table-column
          v-if="showIndex"
          type="index"
          width="60"
          label="序號"
          fixed="left"
          :index="calculateIndex"
        />

        <!-- 資料列 -->
        <el-table-column
          v-for="column in columns"
          :key="column.prop"
          :prop="column.prop"
          :label="column.label"
          :width="column.width || 120"
          :min-width="column.minWidth || 80"
          :fixed="column.fixed"
          :sortable="column.sortable"
          :show-overflow-tooltip="!column.isImage"
          :resizable="true"
          :align="column.align || 'left'"
        >
          <template slot="header" slot-scope="scope">
            <div class="table-header">
              {{ scope.column.label }}
              <el-tooltip
                v-if="column.tooltip"
                :content="column.tooltip"
                placement="top"
              >
                <i class="el-icon-info"></i>
              </el-tooltip>
            </div>
          </template>

          <template slot-scope="scope">
            <!-- 狀態列特殊處理 -->
            <template v-if="column.type === 'status'">
              <el-tag
                :type="getStatusTagType(scope.row[column.prop])"
                effect="light"
                size="medium"
              >
                {{ formatStatusValue(scope.row[column.prop]) }}
              </el-tag>
            </template>
            <!-- 圖片列的特殊處理 -->
            <template v-else-if="column.isImage">
              <el-image
                :src="scope.row[column.prop]"
                :preview-src-list="[scope.row[column.prop]]"
                fit="cover"
                :style="{
                  width: column.imageWidth || defaultImageConfig.width,
                  height: column.imageHeight || defaultImageConfig.height,
                  borderRadius: column.imageRadius || defaultImageConfig.radius
                }"
                @error="handleImageError"
              >
                <div slot="error" class="image-slot">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </el-image>
            </template>
            <!-- 自訂插槽 -->
            <slot
              v-else-if="$scopedSlots[`column-${column.prop}`]"
              :name="`column-${column.prop}`"
              :row="scope.row"
              :index="scope.$index"
            ></slot>
            <!-- 預設顯示 -->
            <template v-else>
              {{ formatColumnValue(scope.row, column) }}
            </template>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column
          v-if="showActionColumn"
          :fixed="actionFixed"
          :width="actionWidth"
          :label="actionLabel"
          align="center"
        >
          <template slot-scope="scope">
            <slot name="action" :row="scope.row" :index="scope.$index"></slot>
          </template>
        </el-table-column>

        <!-- 空資料 -->
        <template slot="empty">
          <slot name="empty">
            <el-empty :description="emptyText" :image-size="100"></el-empty>
          </slot>
        </template>
      </el-table>
    </div>

    <!-- 分頁 -->
    <div class="pagination-wrapper" v-if="showPagination">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="pageSizes"
        :page-size="pageSize"
        :layout="paginationLayout"
        :total="totalCount"
        class="modern-pagination"
      >
      </el-pagination>
    </div>

    <!-- 批量更新狀態對話框 -->
    <batch-update-dialog
      :visible.sync="batchUpdateDialogVisible"
      :selected-rows="selectedRows"
      :status-options="statusOptions"
      :status-field="statusField"
      :title-field="titleField"
      @update="handleUpdateStatus"
      @display-message="handleDialogMessage"
      @show-export-dialog="showExportAfterUpdate"
    ></batch-update-dialog>

    <!-- 匯出預覽對話框 -->
    <export-preview-dialog
      :visible.sync="exportPreviewDialogVisible"
      :selected-rows="selectedRows"
      :columns="columns"
      :sub-columns="subTableColumns"
      :get-sub-items="getSubItemsForExport"
      :has-child-items="!!subTableColumns.length"
      :format-column-value="formatColumnValue"
      :filename="filename"
      :batch-quantity-data="exportBatchQuantityData"
      :total-quantity="exportTotalQuantity"
      :from-batch-update="!!exportBatchQuantityData.length"
      @export="handleExportData"
    ></export-preview-dialog>
  </div>
</template>

<script>
import { debounce } from "lodash";
import SubTable from "./SubTable.vue";
import BatchUpdateDialog from "./BatchUpdateDialog.vue";
import ExportPreviewDialog from "./ExportPreviewDialog.vue";
import { deepClone, formatDate, generateId } from "@/utils/dataTable.js";
import { exportToFile } from "@/utils/exportService.js";
import { Message } from "element-ui";

export default {
  name: "DataTable",

  components: {
    SubTable,
    BatchUpdateDialog,
    ExportPreviewDialog
  },

  props: {
    // 表格數據
    data: {
      type: Array,
      required: true
    },
    // 列配置
    columns: {
      type: Array,
      required: true
    },
    // 子表格列配置
    subTableColumns: {
      type: Array,
      default: () => []
    },
    // 行數據的唯一標識字段
    rowKey: {
      type: String,
      default: "id"
    },
    // 子表格行數據的唯一標識字段
    subRowKey: {
      type: String,
      default: "id"
    },
    // 表格高度
    height: [String, Number],
    maxHeight: [String, Number],
    // 是否顯示工具欄
    showToolbar: {
      type: Boolean,
      default: true
    },
    // 是否顯示序號
    showIndex: {
      type: Boolean,
      default: false
    },
    // 是否可選擇
    showSelectionColumn: {
      type: Boolean,
      default: true
    },
    // 是否顯示邊框
    border: {
      type: Boolean,
      default: true
    },
    // 加載狀態
    loading: {
      type: Boolean,
      default: false
    },
    // 分頁相關
    showPagination: {
      type: Boolean,
      default: true
    },
    pageSizes: {
      type: Array,
      default: () => [10, 20, 50, 100]
    },
    // 是否顯示操作欄
    showActionColumn: {
      type: Boolean,
      default: false
    },
    // 操作列配置
    actionFixed: {
      type: String,
      default: "right"
    },
    actionWidth: {
      type: [String, Number],
      default: 150
    },
    actionLabel: {
      type: String,
      default: "操作"
    },
    // 文件名
    filename: {
      type: String,
      default: "table-data"
    },
    // 空數據文本
    emptyText: {
      type: String,
      default: "暫無數據"
    },
    // 選擇限制函數
    checkSelectable: {
      type: Function,
      default: () => true
    },
    // 狀態選項配置 - 符合 SalesManagement 的需求
    statusOptions: {
      type: Array,
      default: () => [
        { label: "未處理", value: "unprocessed", type: "warning" },
        { label: "已處理", value: "processed", type: "success" },
        { label: "處理取消", value: "cancelled", type: "danger" }
      ]
    },
    // 狀態字段名稱
    statusField: {
      type: String,
      default: "fulfillment_status"
    },
    // 標題字段名稱
    titleField: {
      type: String,
      default: "order_number"
    },
    //是否顯示子表格
    showSubTable: {
      type: Boolean,
      default: true
    },
    // 是否顯示批量更新按鈕
    showBatchUpdateButton: {
      type: Boolean,
      default: true
    },
    // 預設圖片配置
    defaultImageConfig: {
      type: Object,
      default: () => ({
        width: "50px",
        height: "50px",
        radius: "4px"
      })
    }
  },

  data() {
    return {
      // 分頁相關
      currentPage: 1,
      pageSize: 10,
      // 排序相關
      sortBy: "",
      sortOrder: "",
      // 選擇相關
      selectedRows: [],
      selectedRowKeys: new Set(),
      // 新增用於匯出的批次數量數據
      exportBatchQuantityData: [],
      exportTotalQuantity: 0,
      // 表格key，用於強制刷新
      tableKey: 0,
      // 響應式分頁佈局
      paginationLayout: "total, sizes, prev, pager, next, jumper",
      // 對話框顯示控制
      batchUpdateDialogVisible: false,
      exportPreviewDialogVisible: false,
      // 性能優化相關
      processedDataCache: null,
      lastProcessingKey: null,
      debouncedResize: null,
      // 展開行相關
      expandedRows: new Set(),
      // 客戶端高度
      clientHeight: 400
    };
  },

  computed: {
    // 實際表格高度
    realHeight() {
      if (typeof this.height === "number") {
        return this.height;
      }
      return this.clientHeight || 400;
    },

    // 處理後的數據（帶緩存）
    processedData() {
      const processingKey = `${this.sortBy}-${this.sortOrder}-${JSON.stringify(
        this.data
      )}`;

      if (this.processedDataCache && this.lastProcessingKey === processingKey) {
        return this.processedDataCache;
      }

      let result = deepClone(this.data);

      // 排序處理
      if (this.sortBy && this.sortOrder) {
        result = this.sortData(result);
      }

      this.processedDataCache = result;
      this.lastProcessingKey = processingKey;
      return result;
    },

    // 分頁後的數據
    paginatedData() {
      if (!this.showPagination) {
        return this.processedData;
      }

      const start = (this.currentPage - 1) * this.pageSize;
      return this.processedData.slice(start, start + this.pageSize);
    },

    // 總數據量
    totalCount() {
      return this.data.length;
    },

    // 是否有未選中的行
    hasUnselectedRows() {
      return this.selectedRows.length < this.processedData.length;
    }
  },

  watch: {
    data: {
      handler(newVal) {
        this.processedDataCache = null;
        this.lastProcessingKey = null;
        this.handleDataChange(newVal);
      }
    }
  },

  created() {
    this.initialize();
  },

  mounted() {
    this.$nextTick(() => {
      this.updateTableHeight();
    });
  },

  beforeDestroy() {
    this.cleanup();
  },

  methods: {
    // 初始化方法
    initialize() {
      this.setupEventHandlers();
    },

    // 設置事件處理器
    setupEventHandlers() {
      this.debouncedResize = debounce(this.handleResize, 200);
      window.addEventListener("resize", this.debouncedResize);
    },

    // 清理方法
    cleanup() {
      window.removeEventListener("resize", this.debouncedResize);
    },

    // 更新表格高度
    updateTableHeight() {
      if (this.$refs.tableWrapper) {
        this.clientHeight = this.$refs.tableWrapper.clientHeight;
        this.$nextTick(() => {
          if (this.$refs.table) {
            this.$refs.table.doLayout();
          }
        });
      }
    },

    // 處理窗口大小改變
    handleResize() {
      this.updateTableHeight();
    },

    // 獲取行樣式
    getRowStyle(row) {
      // 可以基於行數據設置樣式
      return {};
    },

    // 計算實際索引
    calculateIndex(index) {
      return (this.currentPage - 1) * this.pageSize + index + 1;
    },

    handleDialogMessage(msgData) {
      // 根據您項目中的消息提示方式處理
      Message({
        type: msgData.type,
        message: msgData.message
      });
    },

    // 優化的數據排序
    sortData(data) {
      const field = this.sortBy;
      const order = this.sortOrder;

      return data.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];

        // 處理空值
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return order === "ascending" ? -1 : 1;
        if (bVal == null) return order === "ascending" ? 1 : -1;

        // 數字比較
        if (typeof aVal === "number" && typeof bVal === "number") {
          return order === "ascending" ? aVal - bVal : bVal - aVal;
        }

        // 日期比較
        if (aVal instanceof Date && bVal instanceof Date) {
          return order === "ascending" ? aVal - bVal : bVal - aVal;
        }

        // 字符串比較
        const aStr = String(aVal);
        const bStr = String(bVal);
        return order === "ascending"
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    },

    // 處理數據變化
    handleDataChange(newData) {
      this.updateSelection(newData);
    },

    // 更新選中狀態
    updateSelection(newData) {
      if (!this.showSelectionColumn) return;

      const newSelectedRows = [];
      const newSelectedRowKeys = new Set();

      newData.forEach(row => {
        const key = this.getRowKey(row);
        if (this.selectedRowKeys.has(key)) {
          newSelectedRows.push(row);
          newSelectedRowKeys.add(key);
        }
      });

      this.selectedRows = newSelectedRows;
      this.selectedRowKeys = newSelectedRowKeys;
    },

    // 獲取行的唯一鍵
    getRowKey(row) {
      return row[this.rowKey] || generateId();
    },

    // 格式化列值
    formatColumnValue(row, column) {
      const value = row[column.prop];

      if (column.isImage) {
        return value;
      }

      if (column.formatter) {
        return column.formatter(value, row);
      }

      if (column.type === "date" && value) {
        return formatDate(value, column.format);
      }

      if (column.type === "status") {
        return this.formatStatusValue(value);
      }

      return value;
    },

    // 格式化狀態值 - 符合 SalesManagement 的需求
    formatStatusValue(value) {
      const option = this.statusOptions.find(opt => opt.value === value);
      return option ? option.label : value;
    },

    // 獲取狀態標籤類型 - 符合 SalesManagement 的需求
    getStatusTagType(value) {
      const option = this.statusOptions.find(opt => opt.value === value);
      return option ? option.type : "info";
    },

    // 處理展開行變化
    handleExpandChange(row, expandedRows) {
      this.$emit("expand-change", row, expandedRows);
    },

    // 處理子表格行點擊
    handleSubRowClick(row, parentRow) {
      this.$emit("sub-row-click", row, parentRow);
    },

    // 處理批量更新
    handleBatchUpdate() {
      if (!this.selectedRows.length) {
        Message.warning("請至少選擇一條數據");
        return;
      }
      this.batchUpdateDialogVisible = true;
    },

    // 處理更新後匯出
    showExportAfterUpdate(updateResult) {
      console.log("資料", updateResult);
      // 關閉批量更新對話框
      this.batchUpdateDialogVisible = false;

      // 構建更新後的數據
      const processedRows = updateResult.rows;

      this.selectedRows = processedRows;

      // 顯示匯出預覽對話框
      this.exportPreviewDialogVisible = true;
      this.exportBatchQuantityData = updateResult.batchQuantityData || [];
      this.exportTotalQuantity = updateResult.totalQuantity || 0;

      // 提示用戶
      Message.success(
        `已成功更新${processedRows.length}條數據的狀態，請配置匯出選項`
      );

      // 觸發事件通知父組件
      this.$emit("batch-update", updateResult);
    },

    // handleUpdateStatus - 修改以符合 SalesManagement 的需求
    handleUpdateStatus(updateResult) {
      // 實際應用中這裡應該調用API更新狀態
      updateResult.rows.forEach(row => {
        // 找到原始數據並更新
        const index = this.data.findIndex(
          item => item[this.rowKey] === row[this.rowKey]
        );
        if (index !== -1) {
          // 使用配置的狀態字段
          this.data[index][this.statusField] = updateResult.status;
          if (updateResult.comment) {
            this.data[index].comment = updateResult.comment;
          }
        }
      });

      // 清除表格選擇狀態
      if (this.$refs.table) {
        this.$refs.table.clearSelection();
      }

      // 重要：強制刷新表格
      this.refreshTable();

      // 如果不需要匯出，就直接關閉對話框並提示
      if (!updateResult.exportAfterUpdate) {
        Message.success(`已成功更新${updateResult.rows.length}條數據的狀態`);
        this.$emit("batch-update", updateResult);
        this.batchUpdateDialogVisible = false;
      }
      // 如果需要匯出，會通過 @show-export-dialog 事件觸發 showExportAfterUpdate 方法
    },

    // 處理匯出預覽
    handleExportPreview() {
      if (!this.selectedRows.length) {
        Message.warning("請至少選擇一條數據");
        return;
      }
      this.exportPreviewDialogVisible = true;
    },

    // 獲取子項目用於匯出
    getSubItemsForExport(row) {
      return row.details || [];
    },

    // 處理匯出數據
    handleExportData(exportData) {
      try {
        const result = exportToFile(exportData);
        if (result) {
          Message.success(
            `成功匯出 ${exportData.selectedRows.length} 筆主項目資料${
              exportData.subItems.length
                ? ` 和 ${exportData.subItems.length} 筆子項目資料`
                : ""
            }`
          );
        } else {
          Message.error("匯出失敗");
        }
      } catch (error) {
        console.error("匯出錯誤:", error);
        Message.error(`匯出失敗: ${error.message}`);
      } finally {
        this.exportPreviewDialogVisible = false;
        this.exportBatchQuantityData = [];
        this.exportTotalQuantity = 0;
      }
    },

    // 全選/取消全選
    handleSelectAll(isSelect) {
      if (this.$refs.table) {
        if (isSelect) {
          // 全選所有數據
          this.processedData.forEach(row => {
            if (this.checkSelectable(row)) {
              this.$refs.table.toggleRowSelection(row, true);
            }
          });

          // 更新選中狀態
          this.selectedRows = this.processedData.filter(row =>
            this.checkSelectable(row)
          );
          this.selectedRowKeys = new Set(
            this.selectedRows.map(row => this.getRowKey(row))
          );
        } else {
          // 取消全選
          this.$refs.table.clearSelection();
          this.selectedRows = [];
          this.selectedRowKeys.clear();
        }

        // 觸發選擇變更事件
        this.$emit("selection-change", this.selectedRows);
      }
    },

    // 事件處理方法
    handleSelectionChange(rows) {
      this.selectedRows = rows;
      this.selectedRowKeys = new Set(rows.map(row => this.getRowKey(row)));
      this.$emit("selection-change", rows);
    },

    handleSortChange({ prop, order }) {
      this.sortBy = prop;
      this.sortOrder = order;
      this.processedDataCache = null;
      this.$emit("sort-change", { prop, order });
    },

    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.$emit("size-change", val);
    },

    handleCurrentChange(val) {
      this.currentPage = val;
      this.$emit("current-change", val);
    },

    // 錯誤處理方法
    handleImageError(error) {
      console.warn("圖片加載錯誤:", error);
      this.$emit("image-error", { error });
    },

    // 強制刷新表格
    refreshTable() {
      this.tableKey += 1;
      this.$nextTick(() => {
        this.updateTableHeight();
      });
    }
  }
};
</script>
<style lang="scss">
// 變數定義
// 顏色
$primary-color: #1890ff;
$success-color: #52c41a;
$warning-color: #faad14;
$danger-color: #ff4d4f;

// 圓角與陰影
$border-radius: 8px;
$box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
$transition: all 0.3s ease;

// 字體大小
$font-size-xs: 14px; // 最小字體
$font-size-sm: 16px; // 小字體
$font-size-base: 18px; // 基礎字體
$font-size-lg: 20px; // 大字體
$font-size-xl: 22px; // 特大字體
$font-size-xxl: 24px; // 標題字體
$font-size-xxxl: 28px; // 大標題字體

// 字體粗細
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;

// 行高
$line-height-tight: 1.2;
$line-height-base: 1.5;
$line-height-relaxed: 1.6;
$line-height-loose: 1.8;

// 字體族
$font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
  "Helvetica Neue", Arial, "Noto Sans", sans-serif;
$font-family-heading: $font-family-base;

/* 全局樣式修正 */
.el-table .selection-column .caret-wrapper {
  display: none !important;
}

.data-table-wrapper {
  width: 100%;
  position: relative;
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: $font-family-base;
  font-size: $font-size-base;
  line-height: $line-height-base;

  // 工具欄樣式
  .table-toolbar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 8px;

    .toolbar-settings {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      width: 100%;

      .toolbar-right {
        display: flex;
        gap: 8px;
        align-items: center;
      }
    }
  }

  // 表格容器
  .table-wrapper {
    position: relative;
    flex: 1;
    min-height: 400px;
    overflow: auto;
    border: 1px solid #ebeef5;
    border-radius: $border-radius;
    box-shadow: $box-shadow;
  }

  .el-button {
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
    margin-left: 0;
  }
}

/* 表格樣式 */
.el-table {
  font-size: $font-size-xs !important;

  th {
    font-size: $font-size-xs !important;
    font-weight: $font-weight-semibold;
    background-color: #fafafa;
    padding: 16px 12px;
  }

  td {
    font-size: $font-size-xs !important;
    padding: 16px 12px;
  }

  .el-table__header-wrapper {
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .cell {
    font-size: $font-size-xs !important;
  }

  // 展開行樣式
  .el-table__expanded-cell {
    padding: 0 !important;
    background-color: #fafcff !important;
  }

  // 圖片單元格樣式
  .el-image {
    display: inline-block;
    vertical-align: middle;

    .image-slot {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      background: #f5f7fa;
      color: #909399;
      font-size: $font-size-base;
    }
  }
}

// 分頁樣式
.pagination-wrapper {
  margin-top: 20px;

  .el-pagination {
    font-size: $font-size-base;

    .el-pagination__total,
    .el-pagination__jump {
      font-size: $font-size-base;
    }

    button {
      font-size: $font-size-base;
    }
  }
}

.data-table-wrapper .table-wrapper::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.data-table-wrapper .table-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.data-table-wrapper .table-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.data-table-wrapper .table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Firefox 卷軸樣式 */
.data-table-wrapper .table-wrapper {
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
}

/* 確保表格水平卷軸顯示在底部固定位置 */
.data-table-wrapper .el-table__body-wrapper {
  overflow-x: auto !important;
  -webkit-overflow-scrolling: touch; /* 為 iOS 設備提供平滑滾動 */
}

// 響應式樣式
@media screen and (max-width: 768px) {
  .data-table-wrapper {
    padding: 16px;

    .table-toolbar {
      .el-button {
        font-size: $font-size-base;
      }
    }
  }
}
</style>
