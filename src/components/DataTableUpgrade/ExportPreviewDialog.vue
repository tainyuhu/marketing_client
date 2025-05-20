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
        <div class="info-row">
          <span class="label">匯出欄位：</span>
          <span class="value"
            >共
            {{
              exportableColumns.length +
                (hasChildItems ? exportableSubColumns.length : 0)
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
                <el-switch
                  v-model="hideRemarkColumns"
                  active-text="隱藏備註欄位"
                  inactive-text="顯示所有欄位"
                  @change="handleHideRemarkColumnsChange"
                ></el-switch>
              </div>
              <div class="column-list">
                <div
                  v-for="column in visibleExportableColumns"
                  :key="column.prop"
                  class="column-item"
                >
                  <el-checkbox v-model="selectedColumns" :label="column.prop">
                    {{ column.label }}
                    <el-tooltip
                      v-if="column.isRemark"
                      content="備註欄位"
                      placement="top"
                    >
                      <i class="el-icon-info remark-icon"></i>
                    </el-tooltip>
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
                <el-switch
                  v-model="hideSubRemarkColumns"
                  active-text="隱藏備註欄位"
                  inactive-text="顯示所有欄位"
                  @change="handleHideSubRemarkColumnsChange"
                ></el-switch>
              </div>
              <div class="column-list">
                <div
                  v-for="column in visibleExportableSubColumns"
                  :key="column.prop"
                  class="column-item"
                >
                  <el-checkbox
                    v-model="selectedSubColumns"
                    :label="column.prop"
                  >
                    {{ column.label }}
                    <el-tooltip
                      v-if="column.isRemark"
                      content="備註欄位"
                      placement="top"
                    >
                      <i class="el-icon-info remark-icon"></i>
                    </el-tooltip>
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
                <template slot="empty">
                  <el-empty
                    description="暫無預覽數據"
                    :image-size="80"
                  ></el-empty>
                </template>
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
                <template slot="empty">
                  <el-empty
                    description="暫無預覽數據"
                    :image-size="80"
                  ></el-empty>
                </template>
              </el-table>
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
          <div class="option-item" v-if="hasChildItems">
            <div class="option-label">表單配置：</div>
            <el-radio-group v-model="sheetConfig" size="small">
              <el-radio-button label="separate">分開表單</el-radio-button>
              <el-radio-button label="combined">合併表單</el-radio-button>
            </el-radio-group>
          </div>
          <div class="option-item">
            <div class="option-label">備註處理：</div>
            <el-checkbox v-model="exportRemarks" border size="small"
              >包含備註欄位</el-checkbox
            >
            <el-tooltip content="關閉此選項將排除所有備註欄位" placement="top">
              <i class="el-icon-question remark-help-icon"></i>
            </el-tooltip>
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
      exportRemarks: false, // 預設不包含備註欄位
      hideRemarkColumns: true, // 預設隱藏備註欄位
      hideSubRemarkColumns: true, // 預設隱藏子表格備註欄位
      remarkKeywords: ["remark", "comment", "note", "備註", "說明", "註解"] // 用於識別備註欄位的關鍵字
    };
  },

  computed: {
    // 檢測欄位是否為備註欄位
    isRemarkColumn() {
      return column => {
        // 如果已明確標記為備註欄位
        if (column.isRemark) return true;

        // 檢查欄位名稱是否包含備註關鍵字
        const lowerProp = column.prop.toLowerCase();
        const lowerLabel = (column.label || "").toLowerCase();

        return this.remarkKeywords.some(
          keyword => lowerProp.includes(keyword) || lowerLabel.includes(keyword)
        );
      };
    },

    // 可匯出的主項目列(添加備註標記)
    exportableColumns() {
      return this.columns
        .filter(col => !col.noExport)
        .map(col => ({
          ...col,
          isRemark: this.isRemarkColumn(col) || false
        }));
    },

    // 可匯出的子項目列(添加備註標記)
    exportableSubColumns() {
      return this.subColumns
        .filter(col => !col.noExport)
        .map(col => ({
          ...col,
          isRemark: this.isRemarkColumn(col) || false
        }));
    },

    // 可見的可匯出主項目列(根據是否隱藏備註欄位)
    visibleExportableColumns() {
      return this.hideRemarkColumns
        ? this.exportableColumns.filter(col => !col.isRemark)
        : this.exportableColumns;
    },

    // 可見的可匯出子項目列(根據是否隱藏備註欄位)
    visibleExportableSubColumns() {
      return this.hideSubRemarkColumns
        ? this.exportableSubColumns.filter(col => !col.isRemark)
        : this.exportableSubColumns;
    },

    // 當前顯示的主項目列(根據是否匯出備註)
    displayColumns() {
      let columns = this.exportableColumns.filter(col =>
        this.selectedColumns.includes(col.prop)
      );

      // 如果不匯出備註，過濾備註欄位
      if (!this.exportRemarks) {
        columns = columns.filter(col => !col.isRemark);
      }

      return columns;
    },

    // 當前顯示的子項目列(根據是否匯出備註)
    displaySubColumns() {
      let columns = this.exportableSubColumns.filter(col =>
        this.selectedSubColumns.includes(col.prop)
      );

      // 如果不匯出備註，過濾備註欄位
      if (!this.exportRemarks) {
        columns = columns.filter(col => !col.isRemark);
      }

      return columns;
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
      const totalCount = this.visibleExportableColumns.length;

      this.selectAllColumns = checkedCount === totalCount;
      this.isIndeterminate = checkedCount > 0 && checkedCount < totalCount;
    },
    selectedSubColumns(val) {
      const checkedCount = val.length;
      const totalCount = this.visibleExportableSubColumns.length;

      this.selectAllSubColumns = checkedCount === totalCount;
      this.isSubIndeterminate = checkedCount > 0 && checkedCount < totalCount;
    },
    // 監聽匯出備註欄位開關
    exportRemarks(val) {
      this.refreshPreview();
    }
  },

  methods: {
    // 初始化對話框
    initializeDialog() {
      // 設定預設不選中備註欄位
      this.identifyRemarkColumns();

      // 設定預設選中除備註外的所有主項目列
      this.selectedColumns = this.visibleExportableColumns.map(col => col.prop);
      this.updateSelectAllStatus();

      // 設定預設選中除備註外的所有子項目列
      this.selectedSubColumns = this.visibleExportableSubColumns.map(
        col => col.prop
      );
      this.updateSubSelectAllStatus();

      // 設定預設檔案名稱
      const timestamp = formatDate(new Date(), "YYYYMMDD_HHmmss");
      this.exportFilename = `${this.filename}_${timestamp}`;

      // 設定預設匯出範圍
      this.exportRange = this.hasChildItems ? "mainWithChild" : "main";
    },

    // 識別備註欄位
    identifyRemarkColumns() {
      // 這個方法在初始化時被調用，確保所有列都被正確識別為備註或非備註
      // 實際邏輯已在 computed 屬性中實現
    },

    // 刷新預覽
    refreshPreview() {
      // 強制刷新表格預覽
      this.$nextTick(() => {
        if (this.$refs.previewTable) {
          this.$refs.previewTable.doLayout();
        }
        if (this.$refs.previewSubTable) {
          this.$refs.previewSubTable.doLayout();
        }
      });
    },

    // 格式化值
    formatValue(row, column) {
      return this.formatColumnValue(row, column);
    },

    // 處理全選主項目列變化
    handleCheckAllColumnsChange(val) {
      this.selectedColumns = val
        ? this.visibleExportableColumns.map(col => col.prop)
        : [];
    },

    // 更新主表全選狀態
    updateSelectAllStatus() {
      const checkedCount = this.selectedColumns.length;
      const totalCount = this.visibleExportableColumns.length;

      this.selectAllColumns = checkedCount === totalCount;
      this.isIndeterminate = checkedCount > 0 && checkedCount < totalCount;
    },

    // 更新子表全選狀態
    updateSubSelectAllStatus() {
      const checkedCount = this.selectedSubColumns.length;
      const totalCount = this.visibleExportableSubColumns.length;

      this.selectAllSubColumns = checkedCount === totalCount;
      this.isSubIndeterminate = checkedCount > 0 && checkedCount < totalCount;
    },

    // 處理隱藏主表備註欄位變化
    handleHideRemarkColumnsChange(val) {
      // 重新選取列
      if (val) {
        // 隱藏備註欄位時，從選中列中移除備註欄位
        this.selectedColumns = this.selectedColumns.filter(prop => {
          const column = this.exportableColumns.find(col => col.prop === prop);
          return column && !column.isRemark;
        });
      } else {
        // 顯示備註欄位時，如果是全選狀態，添加所有備註欄位
        if (this.selectAllColumns) {
          const remarkProps = this.exportableColumns
            .filter(col => col.isRemark)
            .map(col => col.prop);
          this.selectedColumns = [...this.selectedColumns, ...remarkProps];
        }
      }

      this.updateSelectAllStatus();
      this.refreshPreview();
    },

    // 處理隱藏子表備註欄位變化
    handleHideSubRemarkColumnsChange(val) {
      // 重新選取列
      if (val) {
        // 隱藏備註欄位時，從選中列中移除備註欄位
        this.selectedSubColumns = this.selectedSubColumns.filter(prop => {
          const column = this.exportableSubColumns.find(
            col => col.prop === prop
          );
          return column && !column.isRemark;
        });
      } else {
        // 顯示備註欄位時，如果是全選狀態，添加所有備註欄位
        if (this.selectAllSubColumns) {
          const remarkProps = this.exportableSubColumns
            .filter(col => col.isRemark)
            .map(col => col.prop);
          this.selectedSubColumns = [
            ...this.selectedSubColumns,
            ...remarkProps
          ];
        }
      }

      this.updateSubSelectAllStatus();
      this.refreshPreview();
    },

    // 處理全選子項目列變化
    handleCheckAllSubColumnsChange(val) {
      this.selectedSubColumns = val
        ? this.visibleExportableSubColumns.map(col => col.prop)
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
      const effectiveColumns = this.exportRemarks
        ? this.selectedColumns
        : this.selectedColumns.filter(prop => {
            const col = this.exportableColumns.find(c => c.prop === prop);
            return col && !col.isRemark;
          });

      const effectiveSubColumns = this.exportRemarks
        ? this.selectedSubColumns
        : this.selectedSubColumns.filter(prop => {
            const col = this.exportableSubColumns.find(c => c.prop === prop);
            return col && !col.isRemark;
          });

      if (effectiveColumns.length === 0) {
        this.$message.warning("請至少選擇一個主項目匯出欄位");
        return;
      }

      if (this.hasChildItems && effectiveSubColumns.length === 0) {
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
        includeRemarks: this.exportRemarks
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
