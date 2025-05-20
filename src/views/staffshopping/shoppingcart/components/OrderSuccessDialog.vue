<template>
  <el-dialog
    :visible.sync="visible"
    width="30%"
    :modal-append-to-body="false"
    :modal="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :before-close="closeDialog"
    center
    custom-class="success-dialog"
  >
    <div class="success-content">
      <div class="success-icon-wrapper">
        <i class="el-icon-success success-icon"></i>
        <div class="circle-animation"></div>
      </div>
      <div class="success-text">
        <p class="main-message">訂單已成功提交！</p>
        <p class="order-number">
          訂單編號: <span>{{ orderNumber }}</span>
        </p>
        <p class="payment-reminder">請盡快完成轉帳</p>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="viewOrderDetails" class="action-button"
        >查看訂單</el-button
      >
      <el-button type="primary" @click="goToHome" class="action-button"
        >返回首頁</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: "OrderSuccessDialog",
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    orderNumber: {
      type: String,
      required: true
    }
  },
  methods: {
    closeDialog() {
      this.$emit("close");
    },
    viewOrderDetails() {
      this.$emit("view-order");
    },
    goToHome() {
      this.$emit("go-home");
    }
  }
};
</script>

<style lang="scss" scoped>
.success-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.success-content {
  text-align: center;
  padding: 30px 0 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.success-icon-wrapper {
  position: relative;
  margin-bottom: 25px;
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.success-icon {
  font-size: 60px;
  color: #52c41a;
  z-index: 2;
  animation: scaleIn 0.5s ease-out;
}

.circle-animation {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(82, 196, 26, 0.1);
  animation: pulse 2s infinite ease-in-out;
}

.success-text {
  animation: fadeIn 0.8s ease-out;
}

.main-message {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #303133;
}

.order-number {
  margin: 8px 0;
  font-size: 16px;
  color: #606266;

  span {
    font-weight: 600;
    color: #1890ff;
  }
}

.payment-reminder {
  margin-top: 12px;
  font-size: 16px;
  color: #e6a23c;
  font-weight: 500;
}

.dialog-footer {
  padding-top: 20px;
  margin-top: 15px;
  border-top: 1px solid #ebeef5;
}

.action-button {
  padding: 12px 20px;
  margin: 0 10px;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.4);
  }

  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 15px rgba(82, 196, 26, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(82, 196, 26, 0);
  }
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
  }
  60% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
