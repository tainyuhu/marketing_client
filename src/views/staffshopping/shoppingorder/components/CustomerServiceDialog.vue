<template>
  <el-dialog
    title="聯絡客服"
    :visible.sync="dialogVisible"
    width="90%"
    :fullscreen="isMobile"
    custom-class="customer-service-dialog"
    @close="handleClose"
  >
    <div class="customer-service-content">
      <div class="service-header">
        <div class="service-icon">
          <i class="el-icon-service"></i>
        </div>
        <h3 class="service-title">如何協助您?</h3>
        <p class="service-subtitle">我們的客服團隊將竭誠為您服務</p>
      </div>

      <div class="order-info" v-if="orderInfo">
        <h4>訂單資訊</h4>
        <div class="info-item">
          <span class="label">訂單編號：</span>
          <span class="value">{{ orderInfo.orderNumber }}</span>
          <el-button
            type="text"
            size="mini"
            class="copy-btn"
            @click="copyToClipboard(orderInfo.orderNumber)"
          >
            <i class="el-icon-document-copy"></i>
          </el-button>
        </div>
        <div class="info-item">
          <span class="label">訂購日期：</span>
          <span class="value">{{ formatDate(orderInfo.orderDate) }}</span>
        </div>
        <div class="info-item">
          <span class="label">訂購金額：</span>
          <span class="value price"
            >NT${{ orderInfo.totalAmount.toFixed(2) }}</span
          >
        </div>
      </div>

      <div class="contact-methods">
        <div class="method-card phone-method">
          <div class="method-icon">
            <i class="el-icon-phone"></i>
          </div>
          <div class="method-info">
            <h4>電話聯絡</h4>
            <p>客服電話：(02) 1234-5678</p>
            <p class="time-info">服務時間：週一至週五 9:00-18:00</p>
          </div>
          <div class="method-action">
            <el-button
              type="primary"
              round
              @click="callPhoneNumber('0212345678')"
            >
              立即撥打
            </el-button>
          </div>
        </div>

        <div class="method-card email-method">
          <div class="method-icon">
            <i class="el-icon-message"></i>
          </div>
          <div class="method-info">
            <h4>電子郵件</h4>
            <p>客服信箱：service@example.com</p>
            <p class="time-info">一般回覆時間：1-2個工作日</p>
          </div>
          <div class="method-action">
            <el-button
              type="primary"
              round
              @click="sendEmail('service@example.com')"
            >
              寄送郵件
            </el-button>
          </div>
        </div>

        <div class="method-card line-method">
          <div class="method-icon">
            <i class="el-icon-chat-line-round"></i>
          </div>
          <div class="method-info">
            <h4>LINE 客服</h4>
            <p>LINE ID：@staffshop</p>
            <p class="time-info">服務時間：週一至週日 9:00-21:00</p>
          </div>
          <div class="method-action">
            <el-button type="success" round @click="openLineChat">
              加入好友
            </el-button>
          </div>
        </div>
      </div>

      <div class="service-note">
        <p>
          <i class="el-icon-info"></i>
          聯絡客服時請提供您的訂單編號，以便我們能更快速地處理您的問題。
        </p>
      </div>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">關閉</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: "CustomerServiceDialog",

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    orderInfo: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      dialogVisible: this.visible,
      isMobile: window.innerWidth <= 768
    };
  },

  watch: {
    visible(val) {
      this.dialogVisible = val;
    },
    dialogVisible(val) {
      this.$emit("update:visible", val);
    }
  },

  mounted() {
    window.addEventListener("resize", this.checkScreenSize);
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.checkScreenSize);
  },

  methods: {
    handleClose() {
      this.$emit("close");
    },

    checkScreenSize() {
      this.isMobile = window.innerWidth <= 768;
    },

    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
    },

    copyToClipboard(text) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          this.$message({
            message: "已複製到剪貼簿",
            type: "success",
            duration: 1500
          });
        })
        .catch(err => {
          this.$message.error("複製失敗");
          console.error("複製失敗:", err);
        });
    },

    callPhoneNumber(phoneNumber) {
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.location.href = `tel:${phoneNumber}`;
      } else {
        this.copyToClipboard(phoneNumber);
        this.$message({
          message: "電話號碼已複製到剪貼簿",
          type: "success"
        });
      }
    },

    sendEmail(email) {
      window.location.href = `mailto:${email}?subject=訂單查詢：${
        this.orderInfo ? this.orderInfo.orderNumber : ""
      }`;
    },

    openLineChat() {
      // 在新視窗中打開LINE的添加好友頁面
      // 這裡使用假設的LINE ID URL，實際應根據您的LINE官方帳號調整
      window.open("https://line.me/R/ti/p/@staffshop", "_blank");
    }
  }
};
</script>

<style lang="scss" scoped>
$primary-color: #1890ff;
$success-color: #52c41a;
$warning-color: #faad14;
$danger-color: #ff4d4f;
$border-radius: 8px;
$box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

.customer-service-dialog {
  &::v-deep .el-dialog__header {
    padding: 15px 20px;
    text-align: center;
    border-bottom: 1px solid #f0f0f0;

    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
    }
  }

  &::v-deep .el-dialog__body {
    padding: 20px;
  }
}

.customer-service-content {
  .service-header {
    text-align: center;
    margin-bottom: 24px;

    .service-icon {
      width: 64px;
      height: 64px;
      background-color: #ecf5ff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;

      i {
        font-size: 32px;
        color: $primary-color;
      }
    }

    .service-title {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 8px;
      color: #303133;
    }

    .service-subtitle {
      font-size: 14px;
      color: #909399;
      margin: 0;
    }
  }

  .order-info {
    background-color: #f5f7fa;
    border-radius: $border-radius;
    padding: 16px;
    margin-bottom: 24px;

    h4 {
      margin: 0 0 12px;
      font-size: 16px;
      color: #303133;
    }

    .info-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        width: 80px;
        color: #909399;
        flex-shrink: 0;
      }

      .value {
        flex: 1;

        &.price {
          color: $danger-color;
          font-weight: 600;
        }
      }

      .copy-btn {
        padding: 0;
        margin-left: 8px;
      }
    }
  }

  .contact-methods {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    margin-bottom: 24px;

    .method-card {
      border: 1px solid #ebeef5;
      border-radius: $border-radius;
      padding: 16px;
      transition: all 0.3s;
      display: flex;
      flex-direction: column;

      &:hover {
        box-shadow: $box-shadow;
        transform: translateY(-2px);
      }

      .method-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;

        i {
          font-size: 24px;
        }
      }

      .method-info {
        flex: 1;

        h4 {
          font-size: 16px;
          margin: 0 0 8px;
        }

        p {
          margin: 0 0 4px;
          color: #606266;
        }

        .time-info {
          font-size: 12px;
          color: #909399;
        }
      }

      .method-action {
        margin-top: 16px;
        text-align: right;
      }
    }

    .phone-method .method-icon {
      background-color: #ecf5ff;

      i {
        color: $primary-color;
      }
    }

    .email-method .method-icon {
      background-color: #f0f9eb;

      i {
        color: $success-color;
      }
    }

    .line-method .method-icon {
      background-color: #e8f8f4;

      i {
        color: #08c060; // LINE 綠色
      }
    }
  }

  .service-note {
    background-color: #fdf6ec;
    border-radius: $border-radius;
    padding: 12px 16px;

    p {
      margin: 0;
      display: flex;
      align-items: center;
      color: #e6a23c;
      font-size: 14px;

      i {
        margin-right: 8px;
      }
    }
  }
}

@media (max-width: 768px) {
  .customer-service-content {
    .contact-methods {
      grid-template-columns: 1fr;

      .method-card {
        flex-direction: row;
        align-items: center;
        padding: 12px;

        .method-icon {
          margin-bottom: 0;
          margin-right: 12px;
          width: 40px;
          height: 40px;

          i {
            font-size: 20px;
          }
        }

        .method-info {
          text-align: left;
          padding-right: 12px;

          h4 {
            font-size: 15px;
          }

          p {
            font-size: 13px;
          }
        }

        .method-action {
          margin-top: 0;
          margin-left: auto;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .customer-service-content {
    .order-info .info-item {
      flex-direction: column;
      align-items: flex-start;

      .label {
        width: 100%;
        margin-bottom: 4px;
      }

      .copy-btn {
        margin-left: 0;
        margin-top: 4px;
      }
    }

    .contact-methods .method-card {
      flex-direction: column;

      .method-icon {
        margin-right: 0;
        margin-bottom: 12px;
      }

      .method-info {
        width: 100%;
        text-align: center;
        margin-bottom: 12px;
      }

      .method-action {
        width: 100%;
        text-align: center;
      }
    }
  }
}
</style>
