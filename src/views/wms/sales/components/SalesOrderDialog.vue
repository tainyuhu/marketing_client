<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="70%"
    :append-to-body="true"
    :modal-append-to-body="false"
    :modal="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleDialogClose"
    custom-class="modern-dialog"
  >
    <div v-loading="loading" class="order-dialog-content">
      <!-- 客戶資訊區域 -->
      <el-divider content-position="left">
        <i class="el-icon-user-solid"></i> 客戶資訊
      </el-divider>
      <el-form
        ref="orderForm"
        :model="form"
        :rules="rules"
        label-width="120px"
        size="medium"
      >
        <el-row :gutter="20">
          <el-col :span="12" :xs="24">
            <el-form-item label="訂單編號" prop="order_number">
              <el-input v-model="form.order_number" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" :xs="24">
            <el-form-item label="收件人" prop="receiver_name">
              <el-input v-model="form.receiver_name"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12" :xs="24">
            <el-form-item
              label="收件電話"
              prop="receiver_phone"
              class="phone-input-container"
            >
              <el-input v-model="form.receiver_phone">
                <!-- <template slot="append">
                  <el-input
                    v-model="form.extension"
                    placeholder="分機"
                    style="width: 60px"
                  ></el-input>
                </template> -->
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24" :xs="24">
            <el-form-item label="收件地址" prop="receiver_address">
              <el-input
                v-model="form.receiver_address"
                placeholder="請輸入收件地址"
                type="textarea"
                :rows="2"
                :autosize="{ minRows: 2, maxRows: 4 }"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleDialogClose" size="medium">取消</el-button>
      <el-button
        type="primary"
        @click="handleSubmit"
        :loading="submitting"
        size="medium"
      >
        <i class="el-icon-check"></i> 確認修改
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import OrderTakingService from "../../ordermanagent/services/OrderTakingServices.js";
import { MessageBox } from "element-ui";

export default {
  name: "OrderTakingDialog",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    orderData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      formChanged: false, // 追蹤表單是否有變更
      originalFormData: {}, // 保存原始表單數據用於比較
      dialogVisible: false,
      loading: false,
      submitting: false,
      form: {
        id: "",
        order_number: "",
        receiver_name: "",
        receiver_phone: "",
        receiver_address: ""
      },
      // 表單驗證規則
      rules: {
        receiver_name: [
          { required: true, message: "請輸入收件人姓名", trigger: "blur" }
        ],
        receiver_phone: [
          {
            pattern: /^\d{8,10}$/,
            message: "請輸入有效的電話號碼",
            trigger: "blur"
          }
        ],
        receiver_address: [
          { required: true, message: "請輸入收件地址", trigger: "blur" }
        ]
      }
    };
  },
  computed: {
    dialogTitle() {
      return `編輯單據 - ${this.form.order_number || ""}`;
    }
  },
  watch: {
    visible(newVal) {
      this.dialogVisible = newVal;
      if (newVal) {
        this.initFormData();
      }
    },
    orderData: {
      handler(newVal) {
        if (this.dialogVisible && newVal) {
          this.initFormData();
        }
      },
      deep: true
    },
    // 監聽表單變化
    form: {
      handler(newVal) {
        if (this.dialogVisible && this.originalFormData.id) {
          // 檢查關鍵字段是否有變化
          this.formChanged =
            this.originalFormData.receiver_name !== newVal.receiver_name ||
            this.originalFormData.receiver_phone !== newVal.receiver_phone ||
            this.originalFormData.receiver_address !== newVal.receiver_address;
        }
      },
      deep: true
    }
  },
  methods: {
    // 初始化表單數據
    initFormData() {
      this.loading = true;
      try {
        // 確保 orderData 存在且有有效數據
        if (this.orderData && typeof this.orderData === "object") {
          // 複製訂單數據到表單
          this.form = {
            id: this.orderData.id || "",
            order_number: this.orderData.order_number || "",
            receiver_name: this.orderData.receiver_name || "",
            receiver_phone: this.orderData.receiver_phone || "",
            receiver_address: this.orderData.receiver_address || ""
          };

          // 保存原始數據的副本用於比較
          this.originalFormData = { ...this.form };
        } else {
          // 如果 orderData 為空，重置表單
          this.form = {
            id: "",
            order_number: "",
            receiver_name: "",
            receiver_phone: "",
            receiver_address: ""
          };
          this.originalFormData = { ...this.form };
        }

        // 重置表單變更標記
        this.formChanged = false;
      } catch (error) {
        console.error("初始化表單數據失敗:", error);
        this.$message.error("初始化表單數據失敗");
      } finally {
        this.loading = false;
      }
    },

    // 提交表單 - 使用 MessageBox 替代 $confirm
    async handleSubmit() {
      // 表單驗證
      this.$refs.orderForm.validate(async valid => {
        if (!valid) {
          this.$message.error("請檢查表單內容，確保填寫正確");
          return;
        }

        // 檢查是否有重要資料變更
        const hasImportantChanges =
          this.originalFormData.receiver_name !== this.form.receiver_name ||
          this.originalFormData.receiver_phone !== this.form.receiver_phone ||
          this.originalFormData.receiver_address !== this.form.receiver_address;

        // 如果有重要資料變更，顯示確認對話框
        if (hasImportantChanges) {
          // 準備顯示的變更內容
          const changes = [];

          if (this.originalFormData.receiver_name !== this.form.receiver_name) {
            changes.push(
              `收件人: ${this.originalFormData.receiver_name} → ${
                this.form.receiver_name
              }`
            );
          }

          if (
            this.originalFormData.receiver_phone !== this.form.receiver_phone
          ) {
            changes.push(
              `收件電話: ${this.originalFormData.receiver_phone} → ${
                this.form.receiver_phone
              }`
            );
          }

          if (
            this.originalFormData.receiver_address !==
            this.form.receiver_address
          ) {
            changes.push(
              `收件地址: ${this.originalFormData.receiver_address} → ${
                this.form.receiver_address
              }`
            );
          }

          // 使用 MessageBox.confirm 而不是 this.$confirm
          MessageBox.confirm(
            `<p>您即將修改以下重要資料：</p><ul>${changes
              .map(c => `<li>${c}</li>`)
              .join("")}</ul><p>確定要進行這些變更嗎？</p>`,
            "確認修改",
            {
              modal: false,
              confirmButtonText: "確定修改",
              cancelButtonText: "取消",
              type: "warning",
              dangerouslyUseHTMLString: true,
              distinguishCancelAndClose: true, // 區分取消按鈕與關閉圖標
              callback: action => {
                if (action === "confirm") {
                  // 用戶確認，執行實際提交
                  this.submitChanges();
                } else {
                  // 用戶取消提交，不執行任何操作
                  this.$message.info("已取消修改");
                }
              }
            }
          );
        } else {
          // 沒有重要資料變更，直接提交
          this.submitChanges();
        }
      });
    },

    // 實際的提交邏輯
    async submitChanges() {
      this.submitting = true;
      try {
        // 準備要更新的數據（僅包含需要更新的字段）
        const patchData = {
          receiver_name: this.form.receiver_name,
          receiver_phone: this.form.receiver_phone,
          receiver_address: this.form.receiver_address
        };

        console.log("提交的數據:", patchData);

        // 使用patchOrderInfo函數進行部分更新
        const response = await OrderTakingService.patchOrderInfo(
          this.form.id,
          patchData
        );

        console.log("API回應:", response);

        if (response.success) {
          this.$message.success(response.message || "訂單更新成功");

          // 通知父組件更新成功
          this.$emit("update-success", {
            ...this.orderData, // 原始訂單數據
            receiver_name: this.form.receiver_name,
            receiver_phone: this.form.receiver_phone,
            receiver_address: this.form.receiver_address
          });

          // 關閉對話框
          this.resetAndClose();
        } else {
          this.$message.error(response.message || "更新失敗");
        }
      } catch (error) {
        console.error("更新訂單失敗:", error);
        this.$message.error("更新訂單失敗: " + (error.message || "未知錯誤"));
      } finally {
        this.submitting = false;
      }
    },

    // 關閉對話框 - 使用 MessageBox 替代 $confirm
    handleDialogClose() {
      // 如果表單已變更但未提交，顯示確認對話框
      if (this.formChanged) {
        MessageBox.confirm("您有未保存的修改，確定要離開嗎？", "提示", {
          confirmButtonText: "確定",
          cancelButtonText: "取消",
          type: "warning",
          distinguishCancelAndClose: true, // 區分取消按鈕與關閉圖標
          callback: action => {
            if (action === "confirm") {
              this.resetAndClose();
            }
            // 用戶取消關閉，不執行任何操作
          }
        });
      } else {
        this.resetAndClose();
      }
    },

    // 實際的重置和關閉邏輯
    resetAndClose() {
      // 重置表單
      if (this.$refs.orderForm) {
        this.$refs.orderForm.resetFields();
      }
      this.form = {
        id: "",
        order_number: "",
        receiver_name: "",
        receiver_phone: "",
        receiver_address: ""
      };
      this.formChanged = false;

      // 通知父組件關閉對話框
      this.$emit("update:visible", false);
    }
  }
};
</script>

<style lang="scss" scoped>
.order-dialog-content {
  padding: 0 24px;
  margin-top: 8px;

  .el-divider {
    margin: 28px 0 20px;

    ::v-deep .el-divider__text {
      font-size: 18px;
      font-weight: 600;
      color: #409eff;
      background-color: #fff;
    }
  }
}

.phone-input-container {
  ::v-deep .el-input-group__append {
    padding: 0;
  }
}

::v-deep .modern-dialog {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

  .el-dialog__header {
    background-color: #409eff;
    padding: 16px 20px;
    margin-right: 0;

    .el-dialog__title {
      color: white;
      font-weight: 600;
      font-size: 20px;
    }

    .el-dialog__headerbtn {
      top: 16px;
      right: 16px;

      .el-dialog__close {
        color: white;
        font-weight: bold;
        font-size: 20px;
      }
    }
  }

  .el-dialog__body {
    padding: 20px 0;
  }

  .el-dialog__footer {
    padding: 10px 20px 20px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .el-button {
      padding: 12px 24px;
      font-size: 16px;
      border-radius: 8px;

      &--primary {
        background-color: #409eff;
        border-color: #409eff;
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
        transition: all 0.3s ease;

        &:hover {
          background-color: #66b1ff;
          transform: translateY(-2px);
        }
      }
    }
  }
}

::v-deep .el-form {
  .el-form-item {
    margin-bottom: 22px;

    .el-form-item__label {
      font-weight: 500;
      color: #606266;
    }

    .el-input__inner,
    .el-textarea__inner {
      border-radius: 8px;
      padding: 12px;
      transition: all 0.3s ease;
      border: 1px solid #dcdfe6;

      &:focus {
        border-color: #409eff;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
      }

      &:hover {
        border-color: #c0c4cc;
      }
    }

    .el-input-group__append {
      border-top-right-radius: 8px;
      border-bottom-right-radius: 8px;
    }

    .el-date-editor {
      width: 100%;

      .el-input__inner {
        padding-left: 40px;
      }
    }

    &.is-required .el-form-item__label:before {
      color: #f56c6c;
    }
  }
}

// 響應式設計
@media screen and (max-width: 768px) {
  ::v-deep .modern-dialog {
    width: 95% !important;
    margin-top: 3vh !important;

    .el-dialog__header {
      padding: 14px 16px;

      .el-dialog__title {
        font-size: 18px;
      }
    }

    .el-dialog__footer {
      padding: 16px;
      flex-direction: column;

      .el-button {
        width: 100%;
        margin-left: 0 !important;
        padding: 12px;
      }
    }
  }

  .order-dialog-content {
    padding: 0 16px;
  }

  ::v-deep .el-form {
    .el-form-item__label {
      float: none;
      display: block;
      text-align: left;
      padding: 0 0 8px;
      line-height: 1.5;
      white-space: normal;
    }

    .el-form-item__content {
      margin-left: 0 !important;
    }
  }

  .el-row {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }

  .el-col {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
}
</style>
