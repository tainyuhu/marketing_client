<template>
  <el-dialog
    title="聯絡客服"
    :visible.sync="dialogVisible"
    :fullscreen="isMobile"
    :width="isMobile ? '100%' : '500px'"
    :close-on-click-modal="false"
    :modal="true"
    custom-class="service-dialog"
    @close="handleClose"
  >
    <div class="customer-service-dialog">
      <div class="dialog-header">
        <i class="el-icon-service header-icon"></i>
        <h2>客戶服務中心</h2>
      </div>

      <!-- 上班時間提示區塊 - 新增在頂部顯著位置 -->
      <div class="business-hours-alert">
        <i class="el-icon-time"></i>
        <div class="hours-text">
          <div class="hours-title">客服上班時間</div>
          <div class="hours-detail">週一至週五 09:00-18:00</div>
        </div>
        <div
          class="status-indicator"
          :class="{ online: isBusinessHours, offline: !isBusinessHours }"
        >
          {{ isBusinessHours ? "服務中" : "非服務時間" }}
        </div>
      </div>

      <el-collapse v-model="activeNames" accordion class="custom-collapse">
        <el-collapse-item name="1">
          <template slot="title">
            <div class="collapse-title">
              <i class="el-icon-document"></i>
              <span>訂單資訊</span>
            </div>
          </template>
          <div class="info-card order-info">
            <div class="info-item">
              <span class="label">訂單編號：</span>
              <span class="value highlight">{{
                orderInfo ? orderInfo.orderNumber : ""
              }}</span>
            </div>
            <div class="info-item">
              <span class="label">訂單日期：</span>
              <span class="value">{{
                formatDate(orderInfo ? orderInfo.orderDate : "")
              }}</span>
            </div>
            <div class="info-item">
              <span class="label">訂單金額：</span>
              <span class="value"
                >NT${{
                  orderInfo && orderInfo.totalAmount
                    ? orderInfo.totalAmount.toFixed(2)
                    : "0.00"
                }}</span
              >
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item name="2">
          <template slot="title">
            <div class="collapse-title">
              <i class="el-icon-phone-outline"></i>
              <span>聯絡方式</span>
            </div>
          </template>
          <div class="info-card contact-info">
            <div class="contact-button phone" @click="handleCall">
              <i class="el-icon-phone"></i>
              <div class="contact-details">
                <div class="contact-label">客服專線</div>
                <div class="contact-value">0800-123-456</div>
              </div>
              <i class="el-icon-arrow-right"></i>
            </div>

            <div class="contact-button email" @click="handleEmail">
              <i class="el-icon-message"></i>
              <div class="contact-details">
                <div class="contact-label">電子郵件</div>
                <div class="contact-value">service@example.com</div>
              </div>
              <i class="el-icon-arrow-right"></i>
            </div>

            <!-- 移除原本的上班時間區塊，因為已經移到頂部 -->
          </div>
        </el-collapse-item>
      </el-collapse>

      <div class="message-form-container">
        <h3 class="section-title">
          <i class="el-icon-edit-outline"></i>
          <span>線上留言</span>
        </h3>
        <el-form
          ref="messageForm"
          :model="messageForm"
          :rules="rules"
          label-position="top"
          class="mobile-form"
        >
          <el-form-item label="問題類型" prop="type">
            <el-select
              v-model="messageForm.type"
              placeholder="請選擇問題類型"
              style="width: 100%;"
            >
              <el-option label="訂單問題" value="order"></el-option>
              <el-option label="配送問題" value="delivery"></el-option>
              <el-option label="退換貨" value="return"></el-option>
              <el-option label="其他" value="other"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="留言內容" prop="content">
            <el-input
              v-model="messageForm.content"
              type="textarea"
              :rows="4"
              placeholder="請輸入您的問題或留言"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div class="fixed-footer" slot="footer">
      <el-button @click="handleClose" plain>取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="isSubmitting"
        >送出留言</el-button
      >
    </div>
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
      default: () => ({})
    }
  },

  data() {
    return {
      messageForm: {
        type: "",
        content: ""
      },
      rules: {
        type: [
          { required: true, message: "請選擇問題類型", trigger: "change" }
        ],
        content: [
          { required: true, message: "請輸入留言內容", trigger: "blur" }
        ]
      },
      activeNames: ["1", "2"],
      isSubmitting: false,
      isMobile: window.innerWidth < 768
    };
  },

  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit("update:visible", val);
      }
    },

    // 判斷當前是否在上班時間內
    isBusinessHours() {
      const now = new Date();
      const day = now.getDay(); // 0是星期日，1-5是星期一至五，6是星期六
      const hour = now.getHours();

      // 判斷是否是週一至週五（1-5）且在9:00-18:00之間
      return day >= 1 && day <= 5 && hour >= 9 && hour < 18;
    }
  },

  mounted() {
    window.addEventListener("resize", this.checkScreenSize);
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.checkScreenSize);
  },

  methods: {
    checkScreenSize() {
      this.isMobile = window.innerWidth < 768;
    },

    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
    },

    handleCall() {
      if (this.isMobile) {
        window.location.href = "tel:0800123456";
      } else {
        this.$message.info("客服專線：0800-123-456");
      }
    },

    handleEmail() {
      window.location.href = "mailto:service@example.com";
    },

    handleClose() {
      if (this.$refs.messageForm) {
        this.$refs.messageForm.resetFields();
      }
      this.dialogVisible = false;
      this.$emit("close");
    },

    handleSubmit() {
      this.$refs.messageForm.validate(valid => {
        if (valid) {
          this.isSubmitting = true;

          // 模擬API呼叫
          setTimeout(() => {
            this.isSubmitting = false;
            this.$message({
              type: "success",
              message: "留言已送出，我們會盡快回覆您",
              duration: 2000
            });
            this.handleClose();
          }, 800);
        }
      });
    }
  }
};
</script>

<style lang="scss">
// 全域樣式調整
.service-dialog {
  @media (max-width: 767px) {
    margin: 0 !important;
    border-radius: 0 !important;

    .el-dialog__header {
      padding: 16px !important;
      border-bottom: 1px solid #ebeef5;
    }

    .el-dialog__body {
      padding: 0 !important;
      overflow-y: auto;
      max-height: calc(100vh - 108px);
    }

    .el-dialog__footer {
      padding: 0 !important;
    }
  }
}

.customer-service-dialog {
  // 整體頁面樣式
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
  color: #333;

  // 頁面頂部標題區域
  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background-color: #f7f9fc;
    border-radius: 8px;
    margin-bottom: 16px;

    .header-icon {
      font-size: 28px;
      color: #409eff;
      margin-right: 12px;
    }

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
      color: #303133;
    }

    @media (max-width: 767px) {
      margin: 0;
      border-radius: 0;
      border-bottom: 1px solid #ebeef5;
    }
  }

  // 上班時間提示區塊 - 新增樣式
  .business-hours-alert {
    display: flex;
    align-items: center;
    margin: 0 16px 16px;
    padding: 12px 16px;
    background-color: #f0f9eb;
    border-radius: 8px;
    border-left: 4px solid #67c23a;

    i {
      font-size: 24px;
      color: #67c23a;
      margin-right: 12px;
    }

    .hours-text {
      flex: 1;

      .hours-title {
        font-size: 14px;
        font-weight: 500;
        color: #67c23a;
        margin-bottom: 3px;
      }

      .hours-detail {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
      }
    }

    .status-indicator {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;

      &.online {
        background-color: #67c23a;
        color: white;
      }

      &.offline {
        background-color: #f56c6c;
        color: white;
      }
    }

    // 非上班時間的樣式
    &.offline {
      background-color: #fef0f0;
      border-left-color: #f56c6c;

      i {
        color: #f56c6c;
      }

      .hours-title {
        color: #f56c6c;
      }
    }
  }

  // 自定義摺疊面板
  .custom-collapse {
    border: none;

    .el-collapse-item__header {
      height: auto;
      line-height: 1.5;
      padding: 14px 16px;
      background-color: #f5f7fa;
      border-radius: 8px;
      margin-bottom: 8px;
      border: none;

      &.is-active {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }
    }

    .el-collapse-item__wrap {
      border: none;
      background: transparent;
    }

    .el-collapse-item__content {
      padding: 0;
    }

    .collapse-title {
      display: flex;
      align-items: center;
      font-size: 16px;

      i {
        margin-right: 10px;
        color: #409eff;
        font-size: 18px;
      }
    }
  }

  // 資訊卡片樣式
  .info-card {
    background-color: #fff;
    border-radius: 0 0 8px 8px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  // 訂單資訊區塊
  .order-info {
    .info-item {
      display: flex;
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        color: #909399;
        width: 80px;
        flex-shrink: 0;
      }

      .value {
        color: #303133;
        flex: 1;

        &.highlight {
          color: #409eff;
          font-weight: 500;
        }
      }
    }
  }

  // 聯絡方式區塊
  .contact-info {
    .contact-button {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background-color: #f7f9fc;
      border-radius: 8px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.3s;

      &:active {
        background-color: #e6f1fc;
      }

      i:first-child {
        font-size: 22px;
        color: #409eff;
        margin-right: 12px;
      }

      .contact-details {
        flex: 1;
      }

      .contact-label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 2px;
      }

      .contact-value {
        font-size: 16px;
        color: #303133;
        font-weight: 500;
      }

      .el-icon-arrow-right {
        color: #c0c4cc;
      }
    }
  }

  // 留言表單區塊
  .message-form-container {
    padding: 0 16px 16px;

    .section-title {
      display: flex;
      align-items: center;
      font-size: 16px;
      margin-bottom: 16px;
      color: #303133;

      i {
        font-size: 18px;
        color: #409eff;
        margin-right: 10px;
      }
    }

    .mobile-form {
      .el-form-item__label {
        padding-bottom: 6px;
        line-height: 1.5;
        font-size: 14px;
      }

      .el-form-item {
        margin-bottom: 16px;
      }

      .el-select .el-input__inner,
      .el-textarea__inner {
        border-radius: 8px;
        padding: 12px;
        font-size: 16px;
      }

      .el-textarea__inner {
        min-height: 120px;
      }
    }
  }

  // 固定底部按鈕區域
  .fixed-footer {
    position: sticky;
    bottom: 0;
    display: flex;
    justify-content: space-between;
    padding: 12px 16px;
    background-color: #fff;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);

    @media (max-width: 767px) {
      .el-button {
        height: 44px;
        flex: 1;
        font-size: 16px;
        border-radius: 8px;

        &:first-child {
          margin-right: 12px;
        }
      }
    }
  }
}
</style>
