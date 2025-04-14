<template>
  <div class="payment-method">
    <h2 class="section-title">選擇付款方式</h2>

    <div class="payment-options">
      <!-- 銀行轉帳選項 -->
      <div class="payment-option selected">
        <div class="option-header">
          <el-radio v-model="paymentSelected" label="bankTransfer" disabled
            >銀行轉帳</el-radio
          >
          <div class="option-tag">推薦</div>
        </div>

        <div class="option-content">
          <div class="bank-info">
            <h3>請轉帳至以下銀行帳戶</h3>

            <div class="info-row">
              <div class="info-label">銀行名稱</div>
              <div class="info-value">範例銀行</div>
            </div>

            <div class="info-row">
              <div class="info-label">帳戶名稱</div>
              <div class="info-value">員工購物平台股份有限公司</div>
            </div>

            <div class="info-row">
              <div class="info-label">帳號</div>
              <div class="info-value account-number">
                <span>1234-5678-9012-3456</span>
                <el-button
                  type="text"
                  class="copy-btn"
                  @click="copyToClipboard('1234-5678-9012-3456')"
                >
                  <i class="el-icon-copy-document"></i> 複製
                </el-button>
              </div>
            </div>

            <div class="payment-note">
              <i class="el-icon-info"></i>
              <span
                >備註：請在轉帳時備註您的訂單編號。訂單提交後會顯示訂單編號。</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 轉帳確認提醒 -->
    <div class="transfer-reminder">
      <el-alert
        title="轉帳完成後請務必聯絡客服確認"
        type="warning"
        description="為了確保您的訂單能夠及時處理，請您在完成轉帳後，通過電話或LINE與我們的客服聯絡，並提供您的訂單編號與轉帳資訊。"
        show-icon
        :closable="false"
      >
      </el-alert>

      <div class="contact-info">
        <div class="contact-item">
          <i class="el-icon-phone"></i>
          <span>客服電話：(02) 1234-5678</span>
        </div>
        <div class="contact-item">
          <i class="el-icon-chat-line-round"></i>
          <span>LINE ID：@staffshop</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PaymentMethod",

  props: {
    selectedMethod: {
      type: String,
      default: "bankTransfer"
    }
  },

  data() {
    return {
      paymentSelected: this.selectedMethod
    };
  },

  watch: {
    // 監聽選擇的支付方式變化
    paymentSelected(newVal) {
      this.$emit("update-payment", newVal);
    },

    // 監聽父組件傳入的支付方式變化
    selectedMethod(newVal) {
      this.paymentSelected = newVal;
    }
  },

  methods: {
    // 複製文本到剪貼板
    copyToClipboard(text) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          this.$message({
            message: "已複製到剪貼板",
            type: "success",
            duration: 1500
          });
        })
        .catch(() => {
          this.$message({
            message: "複製失敗，請手動複製",
            type: "error"
          });
        });
    }
  }
};
</script>

<style lang="scss" scoped>
// 變量定義
$primary-color: #1890ff;
$success-color: #52c41a;
$warning-color: #faad14;
$danger-color: #ff4d4f;
$border-radius: 8px;
$box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
$transition: all 0.3s ease;

// 字體大小
$font-size-s: 14px;
$font-size-base: 18px;
$font-size-lg: 20px;

.payment-method {
  width: 100%;
}

.section-title {
  font-size: $font-size-lg;
  color: #303133;
  margin: 0 0 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.payment-options {
  margin-bottom: 24px;
}

.payment-option {
  margin-bottom: 16px;
  border: 1px solid #dcdfe6;
  border-radius: $border-radius;
  transition: $transition;
  overflow: hidden;

  &.selected {
    border-color: $primary-color;
    box-shadow: 0 0 0 2px rgba($primary-color, 0.1);
  }

  &.disabled {
    opacity: 0.7;

    .option-header {
      background-color: #f5f7fa;
    }
  }
}

.option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f8f8;
}

.option-tag {
  font-size: $font-size-s;
  padding: 2px 6px;
  background-color: $primary-color;
  color: white;
  border-radius: 4px;

  &.inactive {
    background-color: #909399;
  }
}

.option-content {
  padding: 16px;
  background-color: white;
}

.bank-info {
  h3 {
    font-size: $font-size-base;
    color: #303133;
    margin: 0 0 16px;
    font-weight: 500;
  }
}

.info-row {
  display: flex;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 20px;
  }
}

.info-label {
  width: 100px;
  font-weight: 500;
  color: #606266;
}

.info-value {
  flex: 1;

  &.account-number {
    display: flex;
    align-items: center;

    .copy-btn {
      margin-left: 8px;
      padding: 0;
    }
  }
}

.payment-note {
  background-color: #f8f8f8;
  padding: 12px;
  border-radius: 4px;
  display: flex;
  align-items: flex-start;

  i {
    color: $warning-color;
    margin-right: 8px;
    margin-top: 2px;
  }

  span {
    font-size: $font-size-s;
    line-height: 1.6;
    color: #606266;
  }
}

.transfer-reminder {
  margin-top: 24px;
}

.contact-info {
  margin-top: 16px;
  padding: 0 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;

  i {
    color: $primary-color;
    margin-right: 8px;
  }
}

/* 響應式調整 */
@media (max-width: 768px) {
  .info-row {
    flex-direction: column;
  }

  .info-label {
    width: 100%;
    margin-bottom: 4px;
  }

  .info-value.account-number {
    flex-direction: column;
    align-items: flex-start;

    .copy-btn {
      margin-left: 0;
      margin-top: 4px;
    }
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: $font-size-base;
  }

  .option-header {
    padding: 10px 12px;
  }

  .option-content {
    padding: 12px;
  }
}
</style>
