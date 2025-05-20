<template>
  <div class="bank-code-reporter">
    <el-dialog
      title="回報末五碼"
      :visible.sync="visible"
      :width="isSmallScreen ? '95%' : '480px'"
      :top="isSmallScreen ? '10vh' : '15vh'"
      :fullscreen="isSmallScreen && isMobileDevice"
      :append-to-body="true"
      :modal-append-to-body="false"
      :modal="false"
      :close-on-click-modal="false"
      custom-class="modern-dialog"
      @closed="handleClosed"
    >
      <!-- 教學資訊區 -->
      <div class="info-card">
        <div class="info-header">
          <i class="el-icon-info info-icon"></i>
          <span>什麼是末五碼回報？</span>
        </div>
        <div class="info-body">
          <p>
            末五碼是指您銀行轉帳收據或交易紀錄中，帳號末尾的5個數字。當您完成銀行轉帳後，請回報此末五碼，以便我們確認您的付款並加快訂單處理速度。
          </p>
        </div>
      </div>

      <!-- 表單 -->
      <el-form
        ref="form"
        :model="formData"
        :rules="rules"
        :label-position="isSmallScreen ? 'top' : 'right'"
        :label-width="isSmallScreen ? 'auto' : '100px'"
        class="bank-code-form"
      >
        <el-form-item label="訂單編號" prop="orderNumber">
          <el-input
            v-model="formData.orderNumber"
            disabled
            prefix-icon="el-icon-document"
          ></el-input>
        </el-form-item>

        <el-form-item label="末五碼" prop="bankCode">
          <el-input
            v-model="formData.bankCode"
            maxlength="5"
            prefix-icon="el-icon-bank-card"
            placeholder="請輸入銀行帳號末五碼"
            @input="validateNumbersOnly"
          >
            <template slot="append">
              <span class="counter">{{ formData.bankCode.length }}/5</span>
            </template>
          </el-input>
          <div
            class="input-hint"
            v-if="formData.bankCode.length > 0 && formData.bankCode.length < 5"
          >
            還需輸入 {{ 5 - formData.bankCode.length }} 個數字
          </div>
        </el-form-item>
      </el-form>

      <!-- 底部按鈕 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false" class="cancel-button"
          >取消</el-button
        >
        <el-button
          type="primary"
          @click="submitForm"
          :loading="submitting"
          :disabled="formData.bankCode.length !== 5"
          class="submit-button"
        >
          提交回報
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Services from "../../views/staffshopping/services/Services.js";

export default {
  name: "BankCodeReporter",

  props: {
    value: {
      type: Boolean,
      default: false
    },
    orderInfo: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      submitting: false,
      formData: {
        orderNumber: "",
        bankCode: ""
      },
      rules: {
        bankCode: [
          { required: true, message: "請輸入末五碼", trigger: "blur" },
          { min: 5, max: 5, message: "末五碼必須是5個數字", trigger: "blur" },
          {
            pattern: /^\d{5}$/,
            message: "末五碼必須是5個數字",
            trigger: "blur"
          }
        ]
      },
      screenWidth: window.innerWidth
    };
  },

  computed: {
    visible: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      }
    },
    isSmallScreen() {
      return this.screenWidth < 768;
    },
    isMobileDevice() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    }
  },

  watch: {
    orderInfo: {
      handler(newVal) {
        if (newVal && newVal.orderNumber) {
          this.formData.orderNumber = newVal.orderNumber;
        }
      },
      immediate: true
    }
  },

  mounted() {
    window.addEventListener("resize", this.handleResize);
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
  },

  methods: {
    // 監聽視窗大小變化
    handleResize() {
      this.screenWidth = window.innerWidth;
    },

    // 只允許輸入數字
    validateNumbersOnly(value) {
      this.formData.bankCode = value.replace(/\D/g, "").substring(0, 5);
    },

    // 提交表單
    submitForm() {
      this.$refs.form.validate(async valid => {
        if (!valid) {
          return false;
        }

        this.submitting = true;

        try {
          // 使用 services.js 中的 reportBankCode 方法
          const response = await Services.reportBankCode(
            this.orderInfo.id,
            this.formData.bankCode
          );

          // 處理響應
          if (response && response.data.success) {
            this.$msgbox({
              message: response.message || "末五碼回報成功！",
              type: "success",
              duration: 3000,
              showClose: true
            });
            this.visible = false;
            this.$emit("success");
          } else {
            const errorMsg = response.message || "末五碼回報失敗，請稍後再試";
            this.$msgbox({
              message: errorMsg,
              type: "error",
              duration: 5000,
              showClose: true
            });
          }
        } catch (error) {
          console.error("回報末五碼失敗", error);

          // 從錯誤響應中提取信息
          let errorMsg = "末五碼回報失敗，請稍後再試";
          if (error.response && error.response.data) {
            if (error.response.data.message) {
              errorMsg = error.response.data.message;
            } else if (
              error.response.data.data &&
              error.response.data.data.message
            ) {
              errorMsg = error.response.data.data.message;
            }
          }

          this.$message({
            message: errorMsg,
            type: "error",
            duration: 5000,
            showClose: true
          });
        } finally {
          this.submitting = false;
        }
      });
    },

    // 關閉對話框時重置表單
    handleClosed() {
      this.$refs.form.resetFields();
    }
  }
};
</script>

<style lang="scss" scoped>
.bank-code-reporter {
  // 全局變數
  $primary-color: #1890ff;
  $success-color: #52c41a;
  $warning-color: #faad14;
  $error-color: #f5222d;
  $box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  $border-radius: 8px;
  $transition: all 0.3s ease;

  // 對話框現代樣式
  :deep(.modern-dialog) {
    border-radius: $border-radius;
    overflow: hidden;
    box-shadow: $box-shadow;

    .el-dialog__header {
      padding: 20px 24px;
      background-color: #fafafa;
      border-bottom: 1px solid #f0f0f0;

      .el-dialog__title {
        font-weight: 600;
        font-size: 18px;
      }
    }

    .el-dialog__body {
      padding: 24px;
    }

    .el-dialog__footer {
      padding: 16px 24px;
      border-top: 1px solid #f0f0f0;
      background-color: #fafafa;
    }
  }

  // 信息卡片
  .info-card {
    background-color: #e6f7ff;
    border-radius: $border-radius;
    padding: 16px;
    margin-bottom: 24px;
    border-left: 4px solid $primary-color;

    .info-header {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      font-weight: 600;
      color: #303133;

      .info-icon {
        color: $primary-color;
        margin-right: 10px;
        font-size: 20px;
      }
    }

    .info-body {
      color: #606266;
      font-size: 14px;
      line-height: 1.6;

      p {
        margin: 0;
      }
    }
  }

  // 表單樣式
  .bank-code-form {
    margin-bottom: 24px;

    :deep(.el-form-item) {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      .el-form-item__label {
        font-weight: 500;
        color: #454545;
      }

      .el-input {
        .el-input__inner {
          height: 42px;
          transition: $transition;

          &:focus {
            box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
          }

          &:disabled {
            background-color: #f8f8f8;
            color: #606266;
          }
        }

        .el-input-group__append {
          padding: 0 10px;
          background-color: #f5f7fa;

          .counter {
            font-size: 13px;
            color: #909399;
          }
        }
      }
    }

    .input-hint {
      margin-top: 8px;
      font-size: 13px;
      color: $warning-color;
    }
  }

  // 輸入指引
  .input-guide {
    background-color: #f9f9f9;
    border-radius: $border-radius;
    padding: 16px;
    margin-bottom: 16px;

    .guide-title {
      display: flex;
      align-items: center;
      font-weight: 500;
      font-size: 15px;
      margin-bottom: 12px;

      i {
        color: $primary-color;
        margin-right: 8px;
      }
    }

    .guide-content {
      font-size: 14px;
      color: #606266;
      line-height: 1.6;

      p {
        margin-top: 0;
        margin-bottom: 10px;
      }
    }

    .example-container {
      margin-top: 12px;

      .example-image {
        text-align: center;
        border-radius: 4px;
        overflow: hidden;

        img {
          max-width: 100%;
          height: auto;
          border: 1px solid #eee;
        }

        .image-caption {
          font-size: 12px;
          color: #909399;
          margin-top: 8px;
        }
      }
    }
  }

  // 按鈕樣式
  .dialog-footer {
    display: flex;
    justify-content: flex-end;

    .cancel-button {
      margin-right: 10px;
    }

    .submit-button {
      min-width: 100px;

      &:not(:disabled) {
        background-color: $primary-color;
        border-color: $primary-color;

        &:hover {
          background-color: darken($primary-color, 5%);
          border-color: darken($primary-color, 5%);
        }
      }

      &:disabled {
        cursor: not-allowed;
      }
    }
  }
}

/* 現代響應式調整 */
@media (max-width: 767px) {
  .bank-code-reporter {
    .info-card,
    .input-guide {
      padding: 14px;
    }

    .bank-code-form {
      :deep(.el-form-item) {
        margin-bottom: 20px;

        .el-form-item__label {
          margin-bottom: 8px;
          line-height: 1.4;
        }
      }
    }

    .dialog-footer {
      flex-direction: column;

      .el-button {
        width: 100%;
        margin-right: 0;

        &:first-child {
          margin-bottom: 10px;
        }
      }
    }
  }
}

/* Touch 裝置優化 */
@media (hover: none) and (pointer: coarse) {
  .bank-code-reporter {
    :deep(.el-dialog__wrapper) {
      overflow: auto;
      -webkit-overflow-scrolling: touch;
    }

    :deep(.el-input__inner),
    :deep(.el-button) {
      font-size: 16px; /* 避免iOS縮放 */
    }

    :deep(.el-button) {
      padding: 12px 16px;
      height: auto;
      line-height: 1.4;
    }
  }
}
</style>
