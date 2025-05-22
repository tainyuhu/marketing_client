<template>
  <div>
    <el-dialog
      title="批量更新狀態"
      :visible.sync="dialogVisible"
      width="650px"
      :append-to-body="true"
      :modal-append-to-body="false"
      :modal="false"
      :close-on-press-escape="false"
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
              <template #content>
                <div class="status-tooltip">
                  <div class="status-item">
                    <el-tag type="warning">未處理</el-tag>
                  </div>
                  <div class="status-item">
                    <el-tag type="success">已處理</el-tag>
                  </div>
                  <div class="status-item">
                    <el-tag type="danger">處理取消</el-tag>
                  </div>
                </div>
              </template>
              <i class="el-icon-info status-icon"></i>
            </el-tooltip>
          </div>

          <!-- 批次與數量資訊顯示區域 -->
          <div
            class="batch-quantity-info"
            v-if="activeRows.length > 0 && batchView"
          >
            <el-table
              :data="batchQuantityData"
              size="mini"
              border
              class="batch-table"
              row-key="batchNumber"
            >
              <el-table-column
                prop="batchNumber"
                label="批號"
              ></el-table-column>
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

          <!-- 訂單預覽區域 - 增強版 -->
          <div
            class="order-numbers-container"
            v-if="activeRows.length > 0 && !batchView"
          >
            <div class="order-numbers-grid">
              <div
                v-for="(row, index) in activeRows"
                :key="index"
                class="order-card"
              >
                <div class="order-info">
                  <div class="order-number-container">
                    <el-tag
                      size="small"
                      :type="getStatusType(row[statusField])"
                    >
                      {{ getItemTitle(row) }}
                    </el-tag>

                    <!-- 訂單詳細資料提示 -->
                    <el-tooltip placement="top" :open-delay="300">
                      <div slot="content" class="order-detail-tooltip">
                        <div class="tooltip-header">訂單詳細資料</div>
                        <div class="tooltip-item">
                          <span class="label">訂單號:</span>
                          <span class="value">{{ getItemTitle(row) }}</span>
                        </div>
                        <div class="tooltip-item" v-if="row.receiver_name">
                          <span class="label">收件人:</span>
                          <span class="value">{{ row.receiver_name }}</span>
                        </div>
                        <div class="tooltip-item" v-if="row.create_time">
                          <span class="label">下單日期:</span>
                          <span class="value">{{
                            formatDate(row.create_time)
                          }}</span>
                        </div>
                        <div class="tooltip-item" v-if="row.receiver_address">
                          <span class="label">收件地址:</span>
                          <span class="value">{{ row.receiver_address }}</span>
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

          <el-form-item label="更新狀態" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio-button
                v-for="option in statusOptions"
                :key="option.value"
                :label="option.value"
              >
                <i :class="getStatusIcon(option.value)"></i>
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

          <!-- 新增：匯出選項 -->
          <el-form-item label="處理後">
            <el-checkbox v-model="form.exportAfterUpdate">
              匯出處理結果
            </el-checkbox>
          </el-form-item>
        </el-form>

        <div class="dialog-footer">
          <div class="operation-notice">
            <i class="el-icon-warning-outline"></i>
            <span>此操作將批量更新所選項目的狀態，請確認</span>
          </div>
          <div class="buttons">
            <el-button @click="toggleView" type="text">
              {{ batchView ? "切換到完整訂單預覽" : "切換到批號數量預覽" }}
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
                :disabled="!isStatusConsistent || activeRows.length === 0"
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
import SalesServices from "@/views/wms/sales/services/SalesServices";

export default {
  name: "BatchUpdateDialog",

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
    // 狀態選項 - 符合 SalesManagement 的需求
    statusOptions: {
      type: Array,
      default: () => [
        { label: "未處理", value: "unprocessed", type: "warning" },
        { label: "已處理", value: "processed", type: "success" },
        { label: "處理取消", value: "cancelled", type: "danger" }
      ]
    },
    // 獲取項目標題的字段名稱
    titleField: {
      type: String,
      default: "order_number"
    },
    // 狀態字段名稱
    statusField: {
      type: String,
      default: "fulfillment_status"
    },
    // 行唯一標識符
    rowKey: {
      type: String,
      default: "id"
    }
  },

  data() {
    return {
      dialogVisible: this.visible,
      form: {
        status: "",
        comment: "",
        exportAfterUpdate: false // 新增：是否在更新後匯出
      },
      rules: {
        status: [
          { required: true, message: "請選擇更新狀態", trigger: "change" }
        ]
      },
      submitLoading: false,
      batchView: true, // 預設顯示批號數量視圖
      activeRows: [], // 當前活動行
      inactiveRows: [] // 已移除行
    };
  },

  computed: {
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
        this.currentStatus === null
      ) {
        return false;
      }

      // 情況1：處理取消 -> 未處理，必須填寫備註
      // 情況2：已處理 -> 未處理，必須填寫備註
      if (
        (this.currentStatus === "cancelled" ||
          this.currentStatus === "processed") &&
        this.form.status === "unprocessed"
      ) {
        return true;
      }

      // 情況3：已處理 -> 處理取消，必須填寫備註
      if (
        this.currentStatus === "processed" &&
        this.form.status === "cancelled"
      ) {
        return true;
      }

      // 情況4：處理取消 -> 已處理，必須填寫備註
      if (
        this.currentStatus === "cancelled" &&
        this.form.status === "processed"
      ) {
        return true;
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
      if (!this.batchQuantityData.length) return 0;

      return this.batchQuantityData.reduce((total, item) => {
        return total + (Number(item.quantity) || 0);
      }, 0);
    },

    // 處理批次與數量數據 - 適配 SalesManagement 的 details 結構
    batchQuantityData() {
      if (!this.activeRows.length) return [];

      // 收集並整合批號和數量信息
      const batchMap = new Map();

      this.activeRows.forEach(row => {
        // 處理主訂單行
        if (row.details && row.details.length) {
          row.details.forEach(detail => {
            this.processBatchItem(detail, batchMap);
          });
        } else {
          // 直接處理明細行（在某些情況下可能需要）
          this.processBatchItem(row, batchMap);
        }
      });

      // 轉換為數組並按批號排序
      return Array.from(batchMap.values()).sort((a, b) => {
        return a.batchNumber.localeCompare(b.batchNumber);
      });
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
    }
  },

  methods: {
    formatDate,

    // 格式化貨幣 - 符合 SalesManagement 的需求
    formatCurrency(value) {
      if (!value) return "NT$ 0";
      return `NT$ ${parseFloat(value).toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })}`;
    },

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
        const restoredCount = this.inactiveRows.length;
        // 將所有已移除項目還原到活動行
        this.activeRows = [...this.activeRows, ...this.inactiveRows];
        this.inactiveRows = [];

        this.$emit("display-message", {
          type: "success",
          message: `已還原 ${restoredCount} 個移除的項目`
        });
      }
    },

    // 處理批次信息條目 - 適配 SalesManagement 的數據結構
    processBatchItem(item, batchMap) {
      const batchNumber = item.batch_number || "未指定批號";
      const quantity = item.quantity || 0;
      const productCode = item.item_code || "";
      const productName = item.product_name || "";

      if (batchMap.has(batchNumber)) {
        // 合併相同批號的數量
        const existing = batchMap.get(batchNumber);
        existing.quantity += quantity;
      } else {
        // 新增批號條目
        batchMap.set(batchNumber, {
          batchNumber,
          quantity,
          productCode,
          productName
        });
      }
    },

    // 重置表單
    resetForm() {
      this.form = {
        status:
          this.currentStatus !== null
            ? this.currentStatus
            : this.statusOptions.length > 0
            ? this.statusOptions[0].value
            : "",
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

    // 獲取狀態圖標 - 適配 SalesManagement 的狀態
    getStatusIcon(value) {
      const iconMap = {
        unprocessed: "el-icon-time",
        processed: "el-icon-circle-check",
        cancelled: "el-icon-circle-close"
      };
      return iconMap[value] || "el-icon-question";
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

    // 處理提交
    async handleSubmit() {
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

      this.$refs.updateForm.validate(async valid => {
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

        try {
          // 構建請求參數
          const payload = {
            order_ids: this.activeRows.map(row => row.id),
            status: this.form.status,
            comment: this.form.comment
          };

          // 調用 API 服務進行批量更新
          const result = await SalesServices.batchUpdateFulfillmentStatus(
            payload
          );

          if (result.success) {
            // 更新本地數據狀態
            const processedRows = this.activeRows.map(row => {
              return {
                ...row,
                originalStatus: row[this.statusField], // 保存原始狀態
                [this.statusField]: this.form.status, // 更新後的狀態
                statusUpdateTime: new Date(),
                statusUpdateComment: this.form.comment
              };
            });

            // 更新完成結果
            const updateResult = {
              status: this.form.status,
              comment: this.form.comment,
              rows: processedRows,
              batchQuantityData: this.batchQuantityData,
              totalQuantity: this.totalQuantity,
              removedRows: this.inactiveRows
            };

            console.log(updateResult);

            // 發出更新事件
            this.$emit("update", updateResult);

            // 如果選擇了匯出，觸發匯出功能
            if (this.form.exportAfterUpdate) {
              this.$emit("show-export-dialog", updateResult);
            }

            this.dialogVisible = false;
          } else {
            // 顯示錯誤訊息
            this.$emit("display-message", {
              type: "error",
              message: result.message || "批量更新狀態失敗"
            });
          }
        } catch (error) {
          // 顯示錯誤訊息
          this.$emit("display-message", {
            type: "error",
            message: "批量更新狀態時發生錯誤: " + (error.message || "未知錯誤")
          });
          console.error("批量更新狀態錯誤:", error);
        } finally {
          this.submitLoading = false;
        }
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
    .order-numbers-container {
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

      .order-numbers-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 10px;
        max-height: 220px;
        overflow-y: auto;
        padding: 4px;

        .order-card {
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

          .order-info {
            display: flex;
            flex-direction: column;
            gap: 5px;
            width: calc(100% - 24px);

            .order-number-container {
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

    .order-detail-tooltip {
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
          min-width: 45px;
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
.order-numbers-grid::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.batch-quantity-info::-webkit-scrollbar-track,
.order-numbers-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.batch-quantity-info::-webkit-scrollbar-thumb,
.order-numbers-grid::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.batch-quantity-info::-webkit-scrollbar-thumb:hover,
.order-numbers-grid::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
