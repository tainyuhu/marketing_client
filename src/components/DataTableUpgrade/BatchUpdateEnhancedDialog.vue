<template>
  <div>
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="650px"
      :close-on-click-modal="false"
      :before-close="handleClose"
      custom-class="list-dialog"
    >
      <div class="batch-update-dialog">
        <div class="selected-info">
          <div class="info-row">
            <span class="label">已選項目：</span>
            <span class="value">{{ activeRows.length }}項</span>
            <span v-if="removedCount > 0" class="removed-info">
              (已移除 {{ removedCount }} 項)
            </span>

            <!-- 狀態提示 -->
            <el-tooltip
              placement="top"
              effect="light"
              v-if="activeRows.length > 0 && !batchView"
            >
              <div slot="content" class="status-tooltip">
                <div
                  v-for="option in statusOptions"
                  :key="option.value"
                  class="status-item"
                >
                  <el-tag :type="option.type">
                    {{ option.label }}
                  </el-tag>
                </div>
              </div>
              <i class="el-icon-info status-icon"></i>
            </el-tooltip>
          </div>

          <!-- 售後案件數量資訊顯示區域 -->
          <div
            class="batch-quantity-info"
            v-if="activeRows.length > 0 && batchView"
          >
            <el-table
              :data="caseQuantityData"
              size="mini"
              border
              class="batch-table"
              row-key="caseId"
            >
              <el-table-column prop="caseId" label="售後單號"></el-table-column>
              <el-table-column
                prop="quantity"
                label="數量"
                width="80"
                align="right"
              ></el-table-column>
            </el-table>

            <div class="batch-summary">
              <span class="summary-label">總數量：</span>
              <span class="summary-value">{{ totalQuantity }} 件</span>
            </div>
          </div>

          <!-- 售後單號預覽區域 - 增強版 -->
          <div
            class="case-numbers-container"
            v-if="activeRows.length > 0 && !batchView"
          >
            <div class="case-numbers-grid">
              <div
                v-for="(row, index) in activeRows"
                :key="index"
                class="case-card"
              >
                <div class="case-info">
                  <div class="case-number-container">
                    <el-tag
                      size="small"
                      :type="getStatusType(row[statusField])"
                    >
                      {{ getItemTitle(row) }}
                    </el-tag>

                    <!-- 售後案件詳細資料提示 -->
                    <el-tooltip placement="top" :open-delay="300">
                      <div slot="content" class="case-detail-tooltip">
                        <div class="tooltip-header">售後案件詳細資料</div>
                        <div class="tooltip-item">
                          <span class="label">單號:</span>
                          <span class="value">{{ getItemTitle(row) }}</span>
                        </div>
                        <div class="tooltip-item" v-if="row.customerName">
                          <span class="label">客戶:</span>
                          <span class="value">{{ row.customerName }}</span>
                        </div>
                        <div
                          class="tooltip-item"
                          v-if="
                            updateType === 'status' && row.status !== undefined
                          "
                        >
                          <span class="label">處理狀態:</span>
                          <span class="value">{{
                            getStatusLabelByType(row.status, "status")
                          }}</span>
                        </div>
                        <div
                          class="tooltip-item"
                          v-if="
                            updateType === 'processor' &&
                              row.processor !== undefined
                          "
                        >
                          <span class="label">處理人員:</span>
                          <span class="value">{{
                            getStatusLabelByType(row.processor, "processor")
                          }}</span>
                        </div>
                        <div class="tooltip-item" v-if="row.applyDate">
                          <span class="label">申請日期:</span>
                          <span class="value">{{
                            formatDate(row.applyDate)
                          }}</span>
                        </div>
                      </div>
                      <i class="el-icon-warning-outline detail-icon"></i>
                    </el-tooltip>
                  </div>
                </div>
                <el-button
                  type="text"
                  class="remove-btn"
                  @click="handleRemoveRow(index)"
                  title="移除此項目"
                >
                  <i class="el-icon-close"></i>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 狀態不一致的警告提示 -->
          <div v-if="!isStatusConsistent" class="status-warning">
            <i class="el-icon-warning"></i>
            <span>所選項目狀態不一致，請選擇相同狀態的項目進行批量更新</span>

            <!-- 顯示不同狀態的詳情 -->
            <div class="status-details">
              <div
                v-for="(count, status) in statusCounts"
                :key="status"
                class="status-detail-item"
              >
                <el-tag size="small" :type="getStatusType(status)">
                  {{ getStatusLabel(status) }}
                </el-tag>
                <span>{{ count }}項</span>
              </div>
            </div>
          </div>
        </div>

        <el-form
          ref="updateForm"
          :model="form"
          :rules="rules"
          label-width="80px"
        >
          <el-form-item
            label="原始狀態"
            v-if="isStatusConsistent && activeRows.length > 0"
          >
            <el-tag :type="getStatusType(currentStatus)">{{
              getStatusLabel(currentStatus)
            }}</el-tag>
          </el-form-item>

          <el-form-item
            :label="updateType === 'status' ? '案件狀態' : '處理人員'"
            prop="status"
          >
            <el-radio-group v-model="form.status">
              <el-radio-button
                v-for="option in statusOptions"
                :key="option.value"
                :label="option.value"
                :disabled="option.value === currentStatus"
              >
                <i :class="option.icon"></i>
                {{ option.label }}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item
            label="處理備註"
            prop="comment"
            :rules="[
              {
                required: isCommentRequired,
                message: '當前狀態變更必須填寫備註',
                trigger: 'blur'
              }
            ]"
          >
            <el-input
              v-model="form.comment"
              type="textarea"
              :rows="3"
              :placeholder="commentPlaceholder"
              maxlength="200"
              show-word-limit
            ></el-input>
          </el-form-item>

          <!-- 新增顯示狀態聯動提示 -->
          <el-form-item
            v-if="showStatusLinkageInfo"
            class="status-linkage-info"
          >
            <div class="linkage-info-content">
              <i class="el-icon-info"></i>
              <span>{{ statusLinkageMessage }}</span>
            </div>
          </el-form-item>

          <!-- 匯出選項 -->
          <el-form-item label="處理後">
            <el-checkbox v-model="form.exportAfterUpdate">
              匯出處理結果
            </el-checkbox>
          </el-form-item>
        </el-form>

        <div class="dialog-footer">
          <div class="operation-notice">
            <i class="el-icon-warning-outline"></i>
            <span
              >此操作將批量更新所選項目的{{
                updateType === "status" ? "案件狀態" : "處理人員"
              }}，請確認</span
            >
          </div>
          <div class="buttons">
            <el-button @click="toggleView" type="text">
              {{ batchView ? "切換到完整單號預覽" : "切換到數量預覽" }}
            </el-button>
            <div class="action-buttons">
              <el-button
                v-if="removedCount > 0"
                @click="handleRestoreAll"
                type="info"
                plain
                size="small"
              >
                還原已移除項目
              </el-button>
              <el-button @click="handleClose">取 消</el-button>
              <el-button
                type="primary"
                :loading="submitLoading"
                @click="handleSubmit"
                :disabled="
                  !isStatusConsistent ||
                    activeRows.length === 0 ||
                    currentStatus === form.status
                "
                >確 認</el-button
              >
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { formatDate } from "@/utils/date";
import { formatCurrency } from "@/utils/dataTable";

export default {
  name: "BatchUpdateEnhancedDialog",

  props: {
    // 對話框可見性
    visible: {
      type: Boolean,
      default: false
    },
    // 選中的行數據
    selectedRows: {
      type: Array,
      default: () => []
    },
    // 狀態選項
    statusOptions: {
      type: Array,
      default: () => [
        {
          value: "待處理",
          label: "待處理",
          type: "warning",
          icon: "el-icon-time"
        },
        {
          value: "處理中",
          label: "處理中",
          type: "primary",
          icon: "el-icon-loading"
        },
        {
          value: "已完成",
          label: "已完成",
          type: "success",
          icon: "el-icon-circle-check"
        },
        {
          value: "已取消",
          label: "已取消",
          type: "danger",
          icon: "el-icon-circle-close"
        }
      ]
    },
    // 獲取項目標題的方法
    titleField: {
      type: String,
      default: "caseId" // 售後單號
    },
    // 狀態字段名稱
    statusField: {
      type: String,
      default: "status"
    },
    // 行唯一標識符
    rowKey: {
      type: String,
      default: "id"
    },
    // 更新類型：'status' 表示案件狀態，'processor' 表示處理人員
    updateType: {
      type: String,
      default: "status"
    }
  },

  data() {
    return {
      dialogVisible: this.visible,
      form: {
        status: null,
        comment: "",
        exportAfterUpdate: false // 是否在更新後匯出
      },
      rules: {
        status: [
          { required: true, message: "請選擇更新狀態", trigger: "change" }
        ]
      },
      submitLoading: false,
      batchView: true, // 預設顯示數量視圖
      activeRows: [], // 當前活動行
      inactiveRows: [], // 已移除行
      // 聯動訊息
      statusLinkageMessages: {
        status: {
          已完成: "案件將被標記為已完成，這表示所有處理流程已結束",
          已取消: "案件將被標記為已取消，注意這會影響相關的統計數據"
        },
        processor: {
          客服A: "指派案件給客服A將自動發送通知郵件",
          客服B: "指派案件給客服B將自動發送通知郵件",
          客服C: "指派案件給客服C將自動發送通知郵件",
          管理員: "指派案件給管理員將記錄於系統日誌中"
        }
      }
    };
  },

  computed: {
    // 對話框標題
    dialogTitle() {
      return this.updateType === "status"
        ? "批量更新售後案件狀態"
        : "批量更新處理人員";
    },

    // 已移除的項目數量
    removedCount() {
      return this.inactiveRows.length;
    },

    // 判斷所選項目狀態是否一致
    isStatusConsistent() {
      if (this.activeRows.length <= 1) return true;

      const firstStatus = this.activeRows[0][this.statusField];
      return this.activeRows.every(
        row => row[this.statusField] === firstStatus
      );
    },

    // 獲取選中項目的當前狀態
    currentStatus() {
      if (this.activeRows.length > 0) {
        return this.activeRows[0][this.statusField];
      }
      return null;
    },

    // 統計各狀態的數量
    statusCounts() {
      const counts = {};
      this.activeRows.forEach(row => {
        const status = row[this.statusField];
        counts[status] = (counts[status] || 0) + 1;
      });
      return counts;
    },

    // 判斷當前狀態變更是否需要填寫備註
    isCommentRequired() {
      if (
        !this.isStatusConsistent ||
        !this.form.status ||
        this.currentStatus === null ||
        this.form.status === this.currentStatus
      ) {
        return false;
      }

      // 特定狀態變更需要備註
      if (this.updateType === "status") {
        // 案件狀態變更備註規則
        if (this.form.status === "已取消" || this.form.status === "不受理") {
          return true;
        }
      }

      return false;
    },

    // 備註欄位的提示文字
    commentPlaceholder() {
      if (this.isCommentRequired) {
        return "此狀態變更必須填寫備註（必填）";
      }
      return "請輸入處理備註（可選）";
    },

    // 計算總數量
    totalQuantity() {
      if (!this.caseQuantityData.length) return 0;

      return this.caseQuantityData.reduce((total, item) => {
        return total + (Number(item.quantity) || 0);
      }, 0);
    },

    // 處理售後案件與數量數據
    caseQuantityData() {
      if (!this.activeRows.length) return [];

      // 收集並整合售後案件和數量信息
      const caseMap = new Map();

      this.activeRows.forEach(row => {
        // 處理主案件行
        if (row.problemDetails && row.problemDetails.length) {
          let totalQuantity = 0;
          row.problemDetails.forEach(detail => {
            totalQuantity += detail.problemQuantity || 0;
          });

          this.processCaseItem(row, totalQuantity, caseMap);
        } else {
          // 直接處理明細行
          this.processCaseItem(row, 1, caseMap);
        }
      });

      // 轉換為數組並按售後單號排序
      return Array.from(caseMap.values()).sort((a, b) => {
        return a.caseId.localeCompare(b.caseId);
      });
    },

    // 顯示狀態聯動提示
    showStatusLinkageInfo() {
      if (!this.form.status || this.form.status === this.currentStatus) {
        return false;
      }

      // 檢查是否有相應的聯動消息
      return !!this.statusLinkageMessage;
    },

    // 狀態聯動消息
    statusLinkageMessage() {
      if (!this.form.status) return "";

      return (
        this.statusLinkageMessages[this.updateType][this.form.status] || ""
      );
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
      if (!val) {
        // 關閉對話框時重置狀態
        this.inactiveRows = [];
      }
    },
    // 監聽選中項目變化
    selectedRows: {
      handler(newRows) {
        if (this.dialogVisible) {
          // 只有在對話框打開時才重新初始化數據
          this.initializeDialog();
        }
      },
      immediate: true
    },
    // 監聽狀態字段變化
    statusField: {
      handler() {
        this.resetForm();
      }
    }
  },

  methods: {
    formatCurrency,
    formatDate,
    // 初始化對話框
    initializeDialog() {
      this.activeRows = [...this.selectedRows];
      this.inactiveRows = [];
      this.resetForm();
    },

    // 切換視圖模式
    toggleView() {
      this.batchView = !this.batchView;
    },

    // 移除單個行
    handleRemoveRow(index) {
      if (index >= 0 && index < this.activeRows.length) {
        // 從活動行中移除
        const removedRow = this.activeRows.splice(index, 1)[0];

        // 添加到已移除行列表
        this.inactiveRows.push(removedRow);

        // 如果狀態不一致，移除後可能變成一致，需要更新表單
        this.$nextTick(() => {
          if (this.isStatusConsistent && this.activeRows.length > 0) {
            this.form.status = this.currentStatus;
          }
        });

        // 如果移除所有項目，顯示警告
        if (this.activeRows.length === 0) {
          this.$emit("display-message", {
            type: "warning",
            message: "已移除所有選中項目，請至少保留一項或取消操作"
          });
        }
      }
    },

    // 還原所有移除的項目
    handleRestoreAll() {
      if (this.inactiveRows.length > 0) {
        // 將所有已移除項目還原到活動行
        this.activeRows = [...this.activeRows, ...this.inactiveRows];
        this.inactiveRows = [];

        this.$emit("display-message", {
          type: "success",
          message: `已還原 ${this.removedCount} 個移除的項目`
        });
      }
    },

    // 處理售後案件信息條目
    processCaseItem(item, quantity, caseMap) {
      const caseId = item[this.titleField] || "未指定售後單號";

      if (caseMap.has(caseId)) {
        // 合併相同售後單號的數量
        const existing = caseMap.get(caseId);
        existing.quantity += quantity;
      } else {
        // 新增售後案件條目
        caseMap.set(caseId, {
          caseId,
          quantity,
          applyDate: item.applyDate || "",
          customerName: item.customerName || ""
        });
      }
    },

    // 重置表單
    resetForm() {
      this.form = {
        status: this.currentStatus,
        comment: "",
        exportAfterUpdate: false // 重置匯出選項
      };
      if (this.$refs.updateForm) {
        this.$refs.updateForm.clearValidate();
      }
    },

    // 獲取項目標題
    getItemTitle(row) {
      const title = row[this.titleField];
      return title || `ID:${row.id || "未知"}`;
    },

    // 獲取狀態圖標
    getStatusIcon(value) {
      const option = this.statusOptions.find(opt => opt.value === value);
      return option ? option.icon : "el-icon-question";
    },

    // 獲取狀態標籤類型
    getStatusType(value) {
      const option = this.statusOptions.find(opt => opt.value === value);
      return option ? option.type : "info";
    },

    // 獲取狀態標籤文字
    getStatusLabel(value) {
      const option = this.statusOptions.find(opt => opt.value === value);
      return option ? option.label : value;
    },

    // 根據類型獲取狀態標籤 (用於顯示關聯狀態)
    getStatusLabelByType(value, type) {
      if (type === "status") {
        // 查找父組件傳遞的案件狀態選項
        return this.findStatusLabelByType(value, "status");
      } else if (type === "processor") {
        // 查找處理人員選項
        return value || "未分配";
      }
      return value;
    },

    // 輔助方法：根據字段類型查找狀態標籤
    findStatusLabelByType(value, fieldType) {
      // 這裡需要父組件傳遞相應的狀態選項，如果沒有，使用當前的狀態選項
      if (fieldType === this.statusField) {
        return this.getStatusLabel(value);
      }

      // 如果找不到相應的標籤，返回原始值
      return value;
    },

    // 處理提交
    handleSubmit() {
      // 檢查是否有選中項目
      if (this.activeRows.length === 0) {
        this.$emit("display-message", {
          type: "error",
          message: "請至少選擇一項進行更新"
        });
        return;
      }

      // 檢查狀態一致性
      if (!this.isStatusConsistent) {
        this.$emit("display-message", {
          type: "error",
          message: "所選項目狀態不一致，無法進行批量更新"
        });
        return;
      }

      // 檢查是否選擇了與目前相同的狀態
      if (this.form.status === this.currentStatus) {
        this.$emit("display-message", {
          type: "warning",
          message: "請選擇不同於當前的狀態進行更新"
        });
        return;
      }

      this.$refs.updateForm.validate(valid => {
        if (!valid) {
          return false;
        }

        // 檢查特定狀態變更時是否填寫了備註
        if (this.isCommentRequired && !this.form.comment.trim()) {
          this.$emit("display-message", {
            type: "error",
            message: "此狀態變更必須填寫備註"
          });
          return false;
        }

        this.submitLoading = true;

        // 處理更新數據
        const processedRows = this.activeRows.map(row => {
          // 創建處理後的行數據，包含更新信息
          return {
            ...row,
            originalStatus: row[this.statusField], // 保存原始狀態
            [this.statusField]: this.form.status, // 更新後的狀態
            statusUpdateTime: new Date(),
            statusUpdateComment: this.form.comment
          };
        });

        // 模擬API調用延遲
        setTimeout(() => {
          // 更新完成結果
          const updateResult = {
            status: this.form.status,
            comment: this.form.comment,
            rows: processedRows,
            caseQuantityData: this.caseQuantityData,
            removedRows: this.inactiveRows,
            updateType: this.updateType, // 添加更新類型
            exportAfterUpdate: this.form.exportAfterUpdate // 是否要匯出
          };

          // 發出更新事件
          this.$emit("update", updateResult);

          this.submitLoading = false;

          // 如果不需要匯出，就直接關閉對話框
          if (!this.form.exportAfterUpdate) {
            this.dialogVisible = false;
          } else {
            // 如果需要匯出，觸發匯出對話框
            this.$emit("show-export-dialog", updateResult);
          }
        }, 500);
      });
    },

    // 處理關閉
    handleClose() {
      if (this.submitLoading) {
        return;
      }
      this.dialogVisible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
::v-deep .list-dialog {
  .el-dialog__header {
    background: linear-gradient(135deg, #1989fa, #5cadff) !important;
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

.status-tooltip {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.status-icon {
  font-size: 18px;
  cursor: pointer;
  color: #409eff; /* 藍色提示圖示 */
  margin-left: 10px;
}

.batch-update-dialog {
  .selected-info {
    background-color: #f8f8f8;
    border-radius: 4px;
    padding: 12px;
    margin-bottom: 20px;

    .info-row {
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      .label {
        color: #606266;
        font-weight: 500;
      }

      .value {
        color: #409eff;
        font-weight: 600;
      }

      .removed-info {
        margin-left: 8px;
        color: #f56c6c;
        font-size: 13px;
      }
    }

    .batch-quantity-info {
      margin: 10px 0;
      max-height: 250px;
      overflow-y: auto;

      .batch-table {
        width: 100%;
        margin-bottom: 10px;
        font-size: 13px;
      }
    }

    /* 單號預覽區域樣式 */
    .case-numbers-container {
      margin: 10px 0;
      position: relative;

      .status-legend {
        position: absolute;
        right: 0;
        top: -5px;
        z-index: 1;

        i {
          font-size: 16px;
          color: #909399;
          cursor: pointer;
          transition: color 0.2s;

          &:hover {
            color: #409eff;
          }
        }
      }

      .tooltip-status {
        padding: 4px;

        .status-item {
          display: flex;
          align-items: center;
          margin: 4px 0;

          .status-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 6px;

            &.success {
              background-color: #67c23a;
            }

            &.warning {
              background-color: #e6a23c;
            }

            &.danger {
              background-color: #f56c6c;
            }

            &.info {
              background-color: #909399;
            }
          }
        }
      }

      .case-numbers-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 10px;
        max-height: 220px;
        overflow-y: auto;
        padding: 4px;

        .case-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #fff;
          border-radius: 4px;
          padding: 8px 10px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          border: 1px solid #ebeef5;
          transition: all 0.3s;

          &:hover {
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);

            .remove-btn {
              opacity: 1;
            }
          }

          .case-info {
            display: flex;
            flex-direction: column;
            gap: 5px;
            width: calc(100% - 24px);

            .case-number-container {
              display: flex;
              align-items: center;

              .el-tag {
                max-width: calc(100% - 24px);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }

              .detail-icon {
                margin-left: 5px;
                font-size: 14px;
                color: #909399;
                cursor: pointer;

                &:hover {
                  color: #409eff;
                }
              }
            }
          }

          .remove-btn {
            opacity: 0.5;
            transition: all 0.3s;
            padding: 0;
            height: auto;
            line-height: 1;

            i {
              font-size: 16px;
            }
          }
        }
      }
    }

    .case-detail-tooltip {
      min-width: 200px;

      .tooltip-header {
        font-weight: bold;
        margin-bottom: 8px;
        padding-bottom: 5px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      }

      .tooltip-item {
        display: flex;
        margin: 5px 0;

        .label {
          color: rgba(255, 255, 255, 0.8);
          min-width: 50px;
          margin-right: 5px;
        }

        .value {
          font-weight: 500;
        }
      }
    }

    .status-warning {
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      color: #f56c6c;
      font-size: 14px;
      background-color: #fef0f0;
      padding: 12px;
      border-radius: 4px;

      i {
        font-size: 16px;
        margin-right: 5px;
      }

      .status-details {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px dashed rgba(0, 0, 0, 0.1);

        .status-detail-item {
          display: flex;
          align-items: center;
          gap: 5px;

          span {
            font-weight: 500;
          }
        }
      }
    }
  }

  .el-form {
    .el-radio-button {
      margin-right: 5px;
    }

    /* 狀態聯動提示樣式 */
    .status-linkage-info {
      margin-bottom: 15px;

      .linkage-info-content {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 10px 12px;
        background-color: #ecf8ff;
        border-radius: 4px;
        border-left: 4px solid #409eff;
        color: #444;
        font-size: 14px;
        line-height: 1.5;

        i {
          color: #409eff;
          font-size: 16px;
          margin-top: 2px;
        }
      }
    }
  }

  .dialog-footer {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;

    .operation-notice {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #e6a23c;
      font-size: 14px;
      background-color: #fdf6ec;
      padding: 8px 12px;
      border-radius: 4px;

      i {
        font-size: 16px;
      }
    }

    .buttons {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .action-buttons {
        display: flex;
        gap: 10px;
      }
    }
  }
}

// 預設元素樣式修改
::v-deep .el-dialog__title {
  font-size: 18px;
  font-weight: 600;
}

::v-deep .el-dialog__body {
  padding: 20px;
}

::v-deep .el-dialog__headerbtn {
  font-size: 18px;
}

::v-deep .el-tag {
  border-radius: 2px;
}

::v-deep .el-radio-button__inner {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px 15px;

  i {
    margin-right: 2px;
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

/* 自定義滾動條樣式 */
.batch-quantity-info::-webkit-scrollbar,
.case-numbers-grid::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.batch-quantity-info::-webkit-scrollbar-track,
.case-numbers-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.batch-quantity-info::-webkit-scrollbar-thumb,
.case-numbers-grid::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.batch-quantity-info::-webkit-scrollbar-thumb:hover,
.case-numbers-grid::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 響應式調整 */
@media screen and (max-width: 768px) {
  .batch-update-dialog {
    .case-numbers-container {
      .case-numbers-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      }
    }

    .dialog-footer {
      .buttons {
        flex-direction: column;
        gap: 10px;

        .el-button[type="text"] {
          margin-bottom: 5px;
        }

        .action-buttons {
          width: 100%;
          justify-content: flex-end;
        }
      }
    }
  }

  ::v-deep .el-radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .el-radio-button {
      margin-right: 0;
    }

    .el-radio-button:first-child .el-radio-button__inner {
      border-radius: 4px 0 0 4px;
    }

    .el-radio-button:last-child .el-radio-button__inner {
      border-radius: 0 4px 4px 0;
    }
  }
}
</style>
