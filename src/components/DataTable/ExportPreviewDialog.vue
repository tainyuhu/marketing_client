<!-- components/DataTable/ExportPreviewDialog.vue -->
<template>
  <el-dialog
    title="匯出資料預覽"
    :visible.sync="dialogVisible"
    width="800px"
    :append-to-body="true"
    :modal-append-to-body="false"
    :modal="false"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    :before-close="handleClose"
    custom-class="list-dialog"
  >
    <div class="export-preview-container">
      <div class="preview-info">
        <div class="info-row">
          <span class="label">主項目：</span>
          <span class="value">共 {{ selectedRows.length }} 筆</span>
        </div>
        <div class="info-row" v-if="hasChildItems">
          <span class="label">子項目：</span>
          <span class="value">共 {{ totalSubItems }} 筆</span>
        </div>
        <div class="info-row" v-if="showBatchTab">
          <span class="label">出貨單總量：</span>
          <span class="value">共 {{ batchQuantityData.length }} 筆</span>
        </div>
        <div class="info-row">
          <span class="label">匯出欄位：</span>
          <span class="value"
            >共
            {{
              exportableColumns.length +
                (hasChildItems ? exportableSubColumns.length : 0) +
                (showBatchTab ? exportableBatchColumns.length : 0)
            }}
            列</span
          >
          <el-button
            type="text"
            size="small"
            class="field-config-btn"
            @click="showColumnSelection = !showColumnSelection"
          >
            {{ showColumnSelection ? "收起" : "設定匯出欄位" }}
            <i
              :class="
                showColumnSelection ? 'el-icon-arrow-up' : 'el-icon-arrow-down'
              "
            ></i>
          </el-button>
        </div>
      </div>

      <!-- 主項目與子項目欄位配置 -->
      <div v-if="showColumnSelection" class="tabs-container">
        <el-tabs v-model="activeTab" type="card">
          <el-tab-pane label="主項目欄位" name="main">
            <div class="column-selection">
              <div class="selection-header">
                <el-checkbox
                  v-model="selectAllColumns"
                  :indeterminate="isIndeterminate"
                  @change="handleCheckAllColumnsChange"
                >
                  全選
                </el-checkbox>
              </div>
              <div class="column-list">
                <div
                  v-for="column in exportableColumns"
                  :key="column.prop"
                  class="column-item"
                >
                  <el-checkbox v-model="selectedColumns" :label="column.prop">
                    {{ column.label }}
                  </el-checkbox>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane v-if="hasChildItems" label="子項目欄位" name="sub">
            <div class="column-selection">
              <div class="selection-header">
                <el-checkbox
                  v-model="selectAllSubColumns"
                  :indeterminate="isSubIndeterminate"
                  @change="handleCheckAllSubColumnsChange"
                >
                  全選
                </el-checkbox>
              </div>
              <div class="column-list">
                <div
                  v-for="column in exportableSubColumns"
                  :key="column.prop"
                  class="column-item"
                >
                  <el-checkbox
                    v-model="selectedSubColumns"
                    :label="column.prop"
                  >
                    {{ column.label }}
                  </el-checkbox>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 新增批次數量欄位配置 -->
          <el-tab-pane v-if="showBatchTab" label="出貨單總量欄位" name="batch">
            <div class="column-selection">
              <div class="selection-header">
                <el-checkbox
                  v-model="selectAllBatchColumns"
                  :indeterminate="isBatchIndeterminate"
                  @change="handleCheckAllBatchColumnsChange"
                >
                  全選
                </el-checkbox>
              </div>
              <div class="column-list">
                <div
                  v-for="column in exportableBatchColumns"
                  :key="column.prop"
                  class="column-item"
                >
                  <el-checkbox
                    v-model="selectedBatchColumns"
                    :label="column.prop"
                  >
                    {{ column.label }}
                  </el-checkbox>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 資料預覽區塊 -->
      <div class="preview-tabs">
        <el-tabs type="border-card">
          <el-tab-pane label="主項目預覽">
            <div class="preview-table-wrapper">
              <el-table
                :data="previewData"
                border
                size="small"
                height="250"
                class="preview-table"
              >
                <el-table-column
                  v-for="column in displayColumns"
                  :key="column.prop"
                  :prop="column.prop"
                  :label="column.label"
                  :min-width="column.minWidth || 120"
                  :align="column.align || 'left'"
                  :show-overflow-tooltip="true"
                >
                  <template slot-scope="scope">
                    {{ formatValue(scope.row, column) }}
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <el-tab-pane
            v-if="hasChildItems && previewSubData.length > 0"
            label="子項目預覽"
          >
            <div class="preview-table-wrapper">
              <el-table
                :data="previewSubData"
                border
                size="small"
                height="250"
                class="preview-table"
              >
                <el-table-column
                  v-for="column in displaySubColumns"
                  :key="column.prop"
                  :prop="column.prop"
                  :label="column.label"
                  :min-width="column.minWidth || 120"
                  :align="column.align || 'left'"
                  :show-overflow-tooltip="true"
                >
                  <template slot-scope="scope">
                    {{ formatValue(scope.row, column) }}
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <!-- 新增批次數量 Tab -->
          <el-tab-pane v-if="showBatchTab" label="出貨單總量">
            <div class="preview-table-wrapper">
              <el-table
                :data="batchQuantityData"
                border
                size="small"
                height="250"
                class="preview-table"
              >
                <el-table-column
                  v-for="column in displayBatchColumns"
                  :key="column.prop"
                  :prop="column.prop"
                  :label="column.label"
                  :min-width="column.minWidth || 120"
                  :align="column.align || 'center'"
                  :show-overflow-tooltip="true"
                ></el-table-column>
              </el-table>

              <div class="batch-summary" v-if="totalQuantity > 0">
                <span class="summary-label">總數量：</span>
                <span class="summary-value">{{ totalQuantity }} 件</span>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 匯出選項 -->
      <div class="export-options">
        <div class="options-title">匯出選項</div>
        <div class="format-options">
          <div class="option-item">
            <div class="option-label">檔案名稱：</div>
            <el-input
              v-model="exportFilename"
              size="small"
              placeholder="請輸入檔案名稱"
              :maxlength="50"
              class="filename-input"
            >
              <template slot="append"
                >.{{ selectedFormat }}</template
              >
            </el-input>
          </div>
          <div class="option-item">
            <div class="option-label">檔案格式：</div>
            <el-radio-group v-model="selectedFormat" size="small">
              <el-radio-button label="xlsx">Excel(XLSX)</el-radio-button>
              <el-radio-button label="csv">CSV</el-radio-button>
            </el-radio-group>
          </div>
          <div class="option-item" v-if="hasChildItems || showBatchTab">
            <div class="option-label">表單配置：</div>
            <el-radio-group v-model="sheetConfig" size="small">
              <el-radio-button label="separate">分開表單</el-radio-button>
              <el-radio-button label="combined">合併表單</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="exportLoading"
          @click="handleExport"
        >
          開始匯出
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { formatDate } from "@/utils/dataTable.js";

export default {
  name: "ExportPreviewDialog",

  props: {
    // 對話框可見性
    visible: {
      type: Boolean,
      default: false
    },
    // 選中的行資料
    selectedRows: {
      type: Array,
      default: () => []
    },
    // 主項目列配置
    columns: {
      type: Array,
      default: () => []
    },
    // 子項目列配置
    subColumns: {
      type: Array,
      default: () => []
    },
    // 子項目資料取得方法
    getSubItems: {
      type: Function,
      default: row => row.items || []
    },
    // 格式化列值的方法
    formatColumnValue: {
      type: Function,
      default: (row, column) => row[column.prop]
    },
    // 預設檔案名稱
    filename: {
      type: String,
      default: "data-export"
    },
    // 最大預覽行數
    maxPreviewRows: {
      type: Number,
      default: 5
    },
    // 判斷是否有子項目
    hasChildItems: {
      type: Boolean,
      default: false
    },
    batchQuantityData: {
      type: Array,
      default: () => []
    },
    totalQuantity: {
      type: Number,
      default: 0
    },
    fromBatchUpdate: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      dialogVisible: this.visible,
      showColumnSelection: false,
      activeTab: "main",
      selectedColumns: [],
      selectedSubColumns: [],
      selectAllColumns: true,
      selectAllSubColumns: true,
      isIndeterminate: false,
      isSubIndeterminate: false,
      exportFilename: "",
      selectedFormat: "xlsx",
      exportLoading: false,
      sheetConfig: "separate", // 預設分開表單
      selectedBatchColumns: [],
      selectAllBatchColumns: true,
      isBatchIndeterminate: false
    };
  },

  computed: {
    // 可匯出的主項目列
    exportableColumns() {
      return this.columns.filter(col => !col.noExport);
    },

    // 可匯出的子項目列
    exportableSubColumns() {
      return this.subColumns.filter(col => !col.noExport);
    },

    // 當前顯示的主項目列
    displayColumns() {
      return this.exportableColumns.filter(col =>
        this.selectedColumns.includes(col.prop)
      );
    },

    // 當前顯示的子項目列
    displaySubColumns() {
      return this.exportableSubColumns.filter(col =>
        this.selectedSubColumns.includes(col.prop)
      );
    },

    // 主項目預覽資料
    previewData() {
      return this.selectedRows.slice(0, this.maxPreviewRows);
    },

    // 子項目預覽資料
    previewSubData() {
      if (!this.hasChildItems) return [];

      const subItems = [];
      let count = 0;

      // 收集子項目直到達到最大預覽行數
      for (const row of this.selectedRows) {
        const items = this.getSubItems(row);
        if (items && items.length) {
          // 添加每個子項目的父項目參考
          const itemsWithParent = items.map(item => ({
            ...item,
            _parentId: row.id || row[this.rowKey],
            _parentTitle: row.title || row.name || row.code || row.id
          }));

          subItems.push(...itemsWithParent);
          count += items.length;

          if (count >= this.maxPreviewRows) break;
        }
      }

      return subItems.slice(0, this.maxPreviewRows);
    },

    // 子項目總數
    totalSubItems() {
      if (!this.hasChildItems) return 0;

      let count = 0;
      for (const row of this.selectedRows) {
        const items = this.getSubItems(row);
        if (items && items.length) {
          count += items.length;
        }
      }

      return count;
    },
    exportableBatchColumns() {
      return [
        { prop: "batchNumber", label: "批號" },
        { prop: "quantity", label: "數量" },
        { prop: "productCode", label: "產品代碼" },
        { prop: "productName", label: "產品名稱" }
      ].filter(col =>
        this.batchQuantityData.some(row => row[col.prop] !== undefined)
      );
    },
    // 當前顯示的批次數量列
    displayBatchColumns() {
      return this.exportableBatchColumns.filter(col =>
        this.selectedBatchColumns.includes(col.prop)
      );
    },

    // 是否顯示批次數量 Tab
    showBatchTab() {
      return this.fromBatchUpdate && this.batchQuantityData.length > 0;
    }
  },

  watch: {
    visible(val) {
      this.dialogVisible = val;
      if (val) {
        this.initializeDialog();
      }
    },
    dialogVisible(val) {
      this.$emit("update:visible", val);
    },
    selectedColumns(val) {
      const checkedCount = val.length;
      const totalCount = this.exportableColumns.length;

      this.selectAllColumns = checkedCount === totalCount;
      this.isIndeterminate = checkedCount > 0 && checkedCount < totalCount;
    },
    selectedSubColumns(val) {
      const checkedCount = val.length;
      const totalCount = this.exportableSubColumns.length;

      this.selectAllSubColumns = checkedCount === totalCount;
      this.isSubIndeterminate = checkedCount > 0 && checkedCount < totalCount;
    },
    selectedBatchColumns(val) {
      const checkedCount = val.length;
      const totalCount = this.exportableBatchColumns.length;

      this.selectAllBatchColumns = checkedCount === totalCount;
      this.isBatchIndeterminate = checkedCount > 0 && checkedCount < totalCount;
    },

    // 初始化時設置批次數量列
    batchQuantityData: {
      handler(newVal) {
        if (newVal && newVal.length && this.exportableBatchColumns.length) {
          this.selectedBatchColumns = this.exportableBatchColumns.map(
            col => col.prop
          );
        }
      },
      immediate: true
    }
  },

  methods: {
    // 處理全選批次數量列變化
    handleCheckAllBatchColumnsChange(val) {
      this.selectedBatchColumns = val
        ? this.exportableBatchColumns.map(col => col.prop)
        : [];
    },
    // 初始化對話框
    initializeDialog() {
      // 設定預設選中所有主項目列
      this.selectedColumns = this.exportableColumns.map(col => col.prop);
      this.selectAllColumns = true;
      this.isIndeterminate = false;

      // 設定預設選中所有子項目列
      this.selectedSubColumns = this.exportableSubColumns.map(col => col.prop);
      this.selectAllSubColumns = true;
      this.isSubIndeterminate = false;

      // 設定預設選中所有批次數量列
      this.selectedBatchColumns = this.exportableBatchColumns.map(
        col => col.prop
      );
      this.selectAllBatchColumns = true;
      this.isBatchIndeterminate = false;

      // 設定預設檔案名稱
      const timestamp = formatDate(new Date(), "YYYYMMDD_HHmmss");
      this.exportFilename = `${this.filename}_${timestamp}`;

      // 設定預設匯出範圍
      this.exportRange = this.hasChildItems ? "mainWithChild" : "main";
    },

    // 格式化值
    formatValue(row, column) {
      return this.formatColumnValue(row, column);
    },

    // 處理全選主項目列變化
    handleCheckAllColumnsChange(val) {
      this.selectedColumns = val
        ? this.exportableColumns.map(col => col.prop)
        : [];
    },

    // 處理全選子項目列變化
    handleCheckAllSubColumnsChange(val) {
      this.selectedSubColumns = val
        ? this.exportableSubColumns.map(col => col.prop)
        : [];
    },

    // 獲取所有子項目
    getAllSubItems() {
      if (!this.hasChildItems) return [];

      const allSubItems = [];

      for (const row of this.selectedRows) {
        const items = this.getSubItems(row);
        if (items && items.length) {
          // 添加每個子項目的父項目參考
          const itemsWithParent = items.map(item => ({
            ...item,
            _parentId: row.id || row[this.rowKey],
            _parentTitle: row.title || row.name || row.code || row.id
          }));

          allSubItems.push(...itemsWithParent);
        }
      }

      return allSubItems;
    },

    // 處理匯出
    handleExport() {
      if (this.selectedColumns.length === 0) {
        this.$message.warning("請至少選擇一個主項目匯出欄位");
        return;
      }

      if (this.hasChildItems && this.selectedSubColumns.length === 0) {
        this.$message.warning("請至少選擇一個子項目匯出欄位");
        return;
      }

      if (!this.exportFilename) {
        this.$message.warning("請輸入匯出檔案名稱");
        return;
      }

      this.exportLoading = true;

      // 準備匯出資料
      const exportData = {
        format: this.selectedFormat,
        filename: this.exportFilename,
        sheetConfig: this.sheetConfig,
        mainColumns: this.displayColumns,
        subColumns: this.displaySubColumns,
        selectedRows: this.selectedRows,
        subItems: this.hasChildItems ? this.getAllSubItems() : [],
        batchColumns: this.displayBatchColumns,
        batchQuantityData: this.batchQuantityData,
        totalQuantity: this.totalQuantity,
        hasBatchData: this.showBatchTab
      };

      // 延遲模擬匯出過程
      setTimeout(() => {
        this.$emit("export", exportData);
        this.exportLoading = false;
        this.dialogVisible = false;
      }, 800);
    },

    // 處理關閉
    handleClose() {
      if (this.exportLoading) {
        return;
      }
      this.dialogVisible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.export-preview-container {
  .preview-info {
    background-color: #f5f7fa;
    border-radius: 4px;
    padding: 12px 16px;
    margin-bottom: 16px;

    .info-row {
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        width: 80px;
        color: #606266;
        font-weight: 500;
      }

      .value {
        color: #303133;
        font-weight: 600;
      }

      .field-config-btn {
        margin-left: 16px;
        font-size: 14px;

        i {
          margin-left: 4px;
        }
      }
    }
  }

  .tabs-container {
    margin-bottom: 16px;
  }

  .preview-tabs {
    margin-bottom: 20px;
  }

  .column-selection {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    margin-bottom: 16px;

    .selection-header {
      padding: 10px 16px;
      background-color: #f5f7fa;
      border-bottom: 1px solid #dcdfe6;
      font-weight: 500;
    }

    .column-list {
      display: flex;
      flex-wrap: wrap;
      padding: 16px;
      gap: 16px;
      max-height: 160px;
      overflow-y: auto;

      .column-item {
        width: calc(33.33% - 16px);
      }
    }
  }

  .preview-table-wrapper {
    margin-bottom: 24px;

    .preview-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 12px 0;
      color: #303133;
    }

    .preview-table {
      border-radius: 4px;
      overflow: hidden;
    }
  }

  .export-options {
    margin-bottom: 24px;

    .options-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #303133;
    }

    .format-options {
      .option-item {
        display: flex;
        align-items: center;
        margin-bottom: 16px;

        .option-label {
          width: 80px;
          color: #606266;
          font-weight: 500;
        }

        .filename-input {
          width: 300px;
        }
      }
    }
  }

  .dialog-footer {
    text-align: right;
  }
}

.batch-summary {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 8px 10px;
  background-color: #f5f7fa;
  border: 1px solid #ebeef5;
  border-top: none;
  font-size: 14px;
}

.summary-label {
  color: #606266;
  font-weight: 500;
  margin-right: 5px;
}

.summary-value {
  color: #409eff;
  font-weight: 600;
}

::v-deep .list-dialog {
  .el-dialog__header {
    background: linear-gradient(135deg, #1989fa, #5cadff);
    padding: 15px 20px;
    border-radius: 4px 4px 0 0;
    margin-right: 0;

    .el-dialog__title {
      color: #ffffff;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 1px;
    }

    .el-dialog__headerbtn {
      top: 15px;

      .el-dialog__close {
        color: #ffffff;
        font-weight: 600;

        &:hover {
          color: #f2f6fc;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .column-selection {
    .column-list {
      .column-item {
        width: calc(50% - 16px);
      }
    }
  }

  .export-options {
    .format-options {
      .option-item {
        flex-direction: column;
        align-items: flex-start;

        .option-label {
          margin-bottom: 8px;
        }

        .filename-input {
          width: 100%;
        }
      }
    }
  }
}
</style>
