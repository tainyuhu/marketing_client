<template>
  <el-dialog
    title="聯絡客服"
    :visible.sync="dialogVisible"
    :fullscreen="isMobile"
    :width="isMobile ? '100%' : '500px'"
    :close-on-click-modal="false"
    :append-to-body="true"
    :modal-append-to-body="false"
    :modal="false"
    :lock-scroll="true"
    :destroy-on-close="true"
    custom-class="service-dialog"
    @close="handleClose"
    @open="handleOpen"
  >
    <div class="customer-service-dialog">
      <div class="dialog-header">
        <i class="el-icon-service header-icon"></i>
        <h2>客戶服務中心</h2>
      </div>

      <!-- 上班時間提示區塊 - 根據API獲取的服務時間 -->
      <div class="business-hours-alert" :class="{ offline: !isBusinessHours }">
        <i class="el-icon-time"></i>
        <div class="hours-text">
          <div class="hours-title">客服上班時間</div>
          <div class="hours-detail">
            週{{ formatBusinessDays(serviceConfig.business_days) }}
            {{ formatTime(serviceConfig.business_hours_start) }}-{{
              formatTime(serviceConfig.business_hours_end)
            }}
          </div>
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
                <div class="contact-value">
                  {{ serviceConfig.customer_service_phone }}
                </div>
              </div>
              <i class="el-icon-arrow-right"></i>
            </div>

            <div class="contact-button email" @click="handleEmail">
              <i class="el-icon-message"></i>
              <div class="contact-details">
                <div class="contact-label">電子郵件</div>
                <div class="contact-value">
                  {{ serviceConfig.customer_service_email }}
                </div>
              </div>
              <i class="el-icon-arrow-right"></i>
            </div>
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
          <el-form-item label="問題類型" prop="request_type">
            <el-select
              v-model="messageForm.request_type"
              placeholder="請選擇問題類型"
              style="width: 100%;"
            >
              <el-option
                v-for="option in requestTypeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              >
              </el-option>
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
        >送出</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
import Services from "../../services/Services.js";

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
        request_type: "",
        content: "",
        order: null
      },
      rules: {
        request_type: [
          { required: true, message: "請選擇問題類型", trigger: "change" }
        ],
        content: [
          { required: true, message: "請輸入留言內容", trigger: "blur" }
        ]
      },
      activeNames: ["1", "2"],
      isSubmitting: false,
      isMobile: window.innerWidth < 768,
      serviceConfig: {
        business_hours_start: "08:00",
        business_hours_end: "17:00",
        business_days: "1,2,3,4,5",
        customer_service_phone: "",
        customer_service_email: "",
        auto_reply_enabled: true,
        auto_reply_message: "感謝您的留言",
        notification_email: ""
      },
      isBusinessHours: false,
      requestTypeOptions: [
        { value: "order", label: "訂單問題" },
        { value: "delivery", label: "配送問題" },
        { value: "return", label: "退換貨" },
        { value: "product", label: "產品諮詢" },
        { value: "other", label: "其他" }
      ],
      customOverlay: null
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
    }
  },

  mounted() {
    window.addEventListener("resize", this.checkScreenSize);
    this.fetchServiceConfig();
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.checkScreenSize);
    this.removeCustomOverlay();
  },

  watch: {
    visible(val) {
      if (val) {
        // 當對話框打開時
        this.createCustomOverlay();
        document.body.style.overflow = "hidden";
      } else {
        // 當對話框關閉時
        this.removeCustomOverlay();
        document.body.style.overflow = "";
      }
    },
    orderInfo: {
      handler(newVal) {
        if (newVal && newVal.id) {
          this.messageForm.order = newVal.id;
        }
      },
      immediate: true
    }
  },

  methods: {
    // 創建自定義半透明背景
    createCustomOverlay() {
      // 移除舊的覆蓋層
      this.removeCustomOverlay();

      // 創建新的覆蓋層
      this.customOverlay = document.createElement("div");
      this.customOverlay.className = "custom-modal-overlay";
      document.body.appendChild(this.customOverlay);

      // 確保新覆蓋層在對話框下方
      setTimeout(() => {
        const dialogs = document.querySelectorAll(".el-dialog__wrapper");
        if (dialogs.length > 0) {
          const lastDialog = dialogs[dialogs.length - 1];
          const zIndex = getComputedStyle(lastDialog).zIndex;
          this.customOverlay.style.zIndex = zIndex - 1;
        }
      }, 10);
    },

    // 移除自定義覆蓋層
    removeCustomOverlay() {
      if (this.customOverlay && this.customOverlay.parentNode) {
        this.customOverlay.parentNode.removeChild(this.customOverlay);
        this.customOverlay = null;
      }

      // 移除所有v-modal覆蓋層
      const modals = document.querySelectorAll(".v-modal");
      modals.forEach(modal => {
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal);
        }
      });
    },

    // 對話框打開時事件處理
    handleOpen() {
      this.$nextTick(() => {
        // 確保對話框在最前層
        const dialogWrapper = document.querySelector(".service-dialog")
          .parentNode;
        if (dialogWrapper) {
          dialogWrapper.style.zIndex = "2010";
        }

        // 移除所有v-modal元素
        const modals = document.querySelectorAll(".v-modal");
        modals.forEach(modal => {
          if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
          }
        });
      });
    },

    async fetchServiceConfig() {
      try {
        // 使用API獲取客服設定
        const result = await Services.getCustomerServiceConfig();

        if (result && result.config) {
          this.serviceConfig = result.config;
          this.isBusinessHours = result.is_business_hours;
        }
      } catch (error) {
        console.error("獲取客服設定失敗:", error);
        // 保留默認設定
      }
    },

    formatBusinessDays(businessDays) {
      if (!businessDays) return "一至五";

      const dayMap = {
        "0": "日",
        "1": "一",
        "2": "二",
        "3": "三",
        "4": "四",
        "5": "五",
        "6": "六"
      };

      const days = businessDays.split(",");
      if (
        days.length === 5 &&
        days.includes("1") &&
        days.includes("2") &&
        days.includes("3") &&
        days.includes("4") &&
        days.includes("5")
      ) {
        return "一至五";
      }

      return days.map(d => dayMap[d]).join("、");
    },

    formatTime(timeString) {
      if (!timeString) return "";
      // 如果時間格式包含秒，只顯示到分鐘
      if (timeString.length > 5) {
        return timeString.substring(0, 5);
      }
      return timeString;
    },

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
      const phoneNumber = this.serviceConfig.customer_service_phone.replace(
        /[\s-]/g,
        ""
      );
      if (this.isMobile) {
        window.location.href = `tel:${phoneNumber}`;
      } else {
        this.$message.info(
          `客服專線：${this.serviceConfig.customer_service_phone}`
        );
      }
    },

    handleEmail() {
      window.location.href = `mailto:${
        this.serviceConfig.customer_service_email
      }`;
    },

    handleClose() {
      if (this.$refs.messageForm) {
        this.$refs.messageForm.resetFields();
      }
      this.dialogVisible = false;
      this.$emit("close");
    },

    // 獲取請求類型標籤
    getRequestTypeLabel(value) {
      const option = this.requestTypeOptions.find(opt => opt.value === value);
      return option ? option.label : "未知類型";
    },

    async handleSubmit() {
      this.$refs.messageForm.validate(async valid => {
        if (valid) {
          this.isSubmitting = true;

          try {
            // 使用API服務創建客服請求
            const data = {
              request_type: this.messageForm.request_type,
              content: this.messageForm.content
            };

            // 如果有關聯訂單，添加訂單ID
            if (this.orderInfo && this.orderInfo.id) {
              data.order = this.orderInfo.id;
            }

            // 呼叫API創建客服請求
            const response = await Services.createServiceRequest(data);

            // 先關閉客服對話框，這樣成功對話框才不會被擋住
            this.dialogVisible = false;

            // 延遲一小段時間確保主對話框已關閉
            setTimeout(() => {
              // 準備顯示成功對話框的數據
              const orderNumber =
                this.orderInfo && this.orderInfo.orderNumber
                  ? this.orderInfo.orderNumber
                  : "無";
              const requestType = this.getRequestTypeLabel(
                this.messageForm.request_type
              );
              const messageContent = this.messageForm.content;

              // 創建成功對話框內容
              const confirmHtml =
                '<div style="text-align: center;">' +
                '<i class="el-icon-success" style="font-size: 48px; color: #67C23A; margin-bottom: 15px;"></i>' +
                '<h3 style="margin-bottom: 10px;">留言已送出成功</h3>' +
                '<p style="color: #909399;">訂單編號: ' +
                orderNumber +
                "</p>" +
                '<p style="color: #909399;">問題類型: ' +
                requestType +
                "</p>" +
                '<p style="color: #909399; margin-bottom: 15px;">留言內容: ' +
                messageContent +
                "</p>" +
                '<div style="font-weight: bold; color: #303133;">我們會盡快與您聯絡</div>' +
                "</div>";

              // 顯示成功對話框
              this.$confirm(confirmHtml, "留言送出成功", {
                dangerouslyUseHTMLString: true,
                confirmButtonText: "確定",
                showCancelButton: false,
                type: "success",
                center: true,
                customClass: "success-dialog" // 新增自定義類名以便設置樣式
              });
            }, 300); // 給主對話框關閉的時間

            // 重置表單（不需要等待確認框關閉）
            if (this.$refs.messageForm) {
              this.$refs.messageForm.resetFields();
            }

            // 通知父組件對話框已關閉
            this.$emit("close");
          } catch (error) {
            console.error("送出留言失敗:", error);
            this.$message.error("留言送出失敗，請稍後再試");
            this.isSubmitting = false;
          }
        }
      });
    }
  }
};
</script>

<style lang="scss">
// 自定義模態背景覆蓋層
.custom-modal-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
}

// 確保對話框在所有元素之上
.service-dialog {
  z-index: 2010 !important;
}

// 移除默認的覆蓋層
.v-modal {
  display: none !important;
}

// 全域樣式調整
.el-dialog__wrapper.service-dialog {
  z-index: 2010 !important;

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

// 成功確認框樣式
.success-dialog {
  z-index: 3000 !important; // 確保在最上層

  .el-message-box {
    max-width: 400px;
    border-radius: 8px;
  }

  .el-message-box__status {
    font-size: 32px !important;
  }

  .el-message-box__title {
    font-weight: bold;
    font-size: 18px;
  }

  .el-message-box__content {
    padding: 20px;
  }

  .el-message-box__btns {
    .el-button {
      min-width: 120px;
      border-radius: 8px;
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
