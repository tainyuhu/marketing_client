<template>
  <div class="checkout-container">
    <!-- 頁面標題 -->
    <div class="page-header">
      <div class="title-container">
        <i class="el-icon-shopping-bag-1 title-icon"></i>
        <h1 class="page-title">訂單結算</h1>
      </div>
    </div>

    <!-- 步驟指示器 - 統一使用自定義指示器 -->
    <div class="custom-checkout-steps">
      <div class="step-progress-bar">
        <div class="progress-line">
          <div
            class="progress-indicator"
            :style="{ width: progressPercent }"
          ></div>
        </div>
        <div class="step-indicators">
          <div
            v-for="(step, index) in stepInfo"
            :key="index"
            class="step-indicator"
            :class="{
              active: currentStep >= index,
              current: currentStep === index
            }"
          >
            <div class="step-icon">
              <i :class="step.icon"></i>
            </div>
            <div class="step-title">{{ step.title }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主內容區域 - 根據當前步驟顯示不同組件 -->
    <div class="checkout-content">
      <!-- 步驟1: 確認商品信息 -->
      <div v-show="currentStep === 0" class="step-container">
        <cart-confirmation
          :cart-items="cartItems"
          :is-mobile="isMobile"
          @update-quantity="updateCartItemQuantity"
          @remove-item="removeCartItem"
        />
      </div>

      <!-- 步驟2: 填寫收貨地址 -->
      <div v-show="currentStep === 1" class="step-container">
        <shipping-address
          :address="shippingAddress"
          :is-mobile="isMobile"
          @update-address="updateShippingAddress"
        />
      </div>

      <!-- 步驟3: 選擇付款方式 -->
      <div v-show="currentStep === 2" class="step-container">
        <payment-method
          :selected-method="paymentMethod"
          :is-mobile="isMobile"
          @update-payment="updatePaymentMethod"
        />
      </div>

      <!-- 步驟4: 訂單確認與摘要 -->
      <div v-show="currentStep === 3" class="step-container">
        <order-summary
          :cart-items="cartItems"
          :address="shippingAddress"
          :payment-method="paymentMethod"
          :total-amount="totalAmount"
          :is-mobile="isMobile"
        />
      </div>
    </div>

    <!-- 底部操作區 -->
    <div class="checkout-footer" :class="{ 'mobile-footer': isMobile }">
      <div class="footer-info">
        <div class="total-amount">
          <span>訂單總額:</span>
          <span class="amount">NT${{ formatPrice(totalAmount) }}</span>
        </div>
        <div class="total-items">
          <span>商品數量:</span>
          <span>{{ totalQuantity }} 件</span>
        </div>
      </div>

      <div class="footer-actions">
        <!-- 上一步按鈕 -->
        <el-button
          v-if="currentStep > 0"
          @click="prevStep"
          :size="isMobile ? 'large' : 'medium'"
          class="action-button"
        >
          上一步
        </el-button>

        <!-- 下一步或提交訂單按鈕 -->
        <el-button
          type="primary"
          @click="nextStep"
          :loading="submitting"
          :disabled="isNextButtonDisabled"
          :size="isMobile ? 'large' : 'medium'"
          class="action-button"
        >
          {{ currentStep === 3 ? "提交訂單" : "下一步" }}
        </el-button>
      </div>
    </div>

    <!-- 返回頂部按鈕 -->
    <div v-if="showBackToTop" class="back-to-top" @click="scrollToTop">
      <i class="el-icon-top"></i>
    </div>

    <!-- 訂單提交成功對話框組件 -->
    <order-success-dialog
      :visible="orderSuccessDialogVisible"
      :order-number="orderNumber"
      :is-mobile="isMobile"
      @close="closeSuccessDialog"
      @view-order="viewOrderDetails"
      @go-home="goToHome"
    />
  </div>
</template>

<script>
// 導入子組件
import CartConfirmation from "./components/CartConfirmation.vue";
import ShippingAddress from "./components/ShippingAddress.vue";
import PaymentMethod from "./components/PaymentMethod.vue";
import OrderSummary from "./components/OrderSummary.vue";
import OrderSuccessDialog from "./components/OrderSuccessDialog.vue";
import Services from "../services/Services.js";

export default {
  name: "CheckoutPage",

  components: {
    CartConfirmation,
    ShippingAddress,
    PaymentMethod,
    OrderSummary,
    OrderSuccessDialog
  },

  data() {
    return {
      currentStep: 0,
      cartItems: [],
      shippingAddress: {
        name: "",
        phone: "",
        address: "",
        postalCode: "",
        notes: ""
      },
      paymentMethod: "bankTransfer", // 默認為轉帳
      loading: true,
      submitting: false,
      orderSuccessDialogVisible: false,
      orderNumber: "",
      windowWidth: window.innerWidth,
      showBackToTop: false,
      stepInfo: [
        { title: "確認商品", icon: "el-icon-shopping-cart-full" },
        { title: "填寫資料", icon: "el-icon-edit-outline" },
        { title: "付款方式", icon: "el-icon-bank-card" },
        { title: "完成訂單", icon: "el-icon-check" }
      ]
    };
  },

  computed: {
    // 判斷是否為移動設備
    isMobile() {
      return this.windowWidth < 768;
    },

    // 計算進度百分比
    progressPercent() {
      return `${(this.currentStep / (this.stepInfo.length - 1)) * 100}%`;
    },

    // 計算總金額
    totalAmount() {
      return this.cartItems.reduce((total, item) => {
        return total + item.price * item.quantity;
      }, 0);
    },

    // 計算總數量
    totalQuantity() {
      return this.cartItems.reduce((total, item) => {
        return total + item.quantity;
      }, 0);
    },

    // 判斷下一步按鈕是否禁用
    isNextButtonDisabled() {
      if (this.submitting) return true;

      // 第一步：購物車為空時禁用
      if (this.currentStep === 0 && this.cartItems.length === 0) {
        return true;
      }

      // 第二步：地址信息不完整時禁用
      if (this.currentStep === 1) {
        const { name, phone, address } = this.shippingAddress;
        return !name || !phone || !address;
      }

      return false;
    }
  },

  created() {
    this.fetchCartItems();
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("scroll", this.handleScroll);
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("scroll", this.handleScroll);
  },

  methods: {
    // 處理窗口大小變化
    handleResize() {
      this.windowWidth = window.innerWidth;
    },

    // 處理滾動事件
    handleScroll() {
      this.showBackToTop = window.scrollY > 300;
    },

    // 滾動到頂部
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    },

    // 從購物車獲取商品
    async fetchCartItems() {
      this.loading = true;

      try {
        const response = await Services.getCartItems();
        this.cartItems = response.data;
      } catch (error) {
        console.error("Failed to fetch cart items", error);
        this.$message.error("獲取購物車失敗，請稍後再試");
        // 載入測試數據
        this.cartItems = this.generateMockCartItems();
      } finally {
        this.loading = false;
      }
    },

    // 更新購物車商品數量
    async updateCartItemQuantity(item) {
      try {
        await Services.updateCartItem({
          cartItemId: item.id,
          quantity: item.quantity
        });
        this.$message({
          message: "數量已更新",
          type: "success",
          duration: 1500,
          offset: this.isMobile ? 20 : 40 // 移動設備上更靠上顯示消息
        });
      } catch (error) {
        console.error("Failed to update quantity", error);
        this.$message.error("更新數量失敗，請稍後再試");
        // 重新獲取數據
        this.fetchCartItems();
      }
    },

    // 移除購物車商品
    async removeCartItem(item) {
      try {
        await Services.removeCartItem(item.id);

        // 從本地購物車移除
        const index = this.cartItems.findIndex(
          cartItem => cartItem.id === item.id
        );
        if (index !== -1) {
          this.cartItems.splice(index, 1);
        }

        this.$message({
          message: "商品已移除",
          type: "success",
          duration: 1500,
          offset: this.isMobile ? 20 : 40
        });
      } catch (error) {
        console.error("Failed to remove item", error);
        this.$message.error("移除商品失敗，請稍後再試");
      }
    },

    // 更新收貨地址
    updateShippingAddress(address) {
      this.shippingAddress = { ...address };
    },

    // 更新支付方式
    updatePaymentMethod(method) {
      this.paymentMethod = method;
    },

    // 進入下一步
    nextStep() {
      if (this.currentStep === 3) {
        // 最後一步，提交訂單
        this.submitOrder();
      } else {
        // 進入下一步
        this.currentStep += 1;

        // 移動端自動滾動到頂部，更好的引導用戶
        if (this.isMobile) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    },

    // 返回上一步
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep -= 1;

        // 移動端自動滾動到頂部
        if (this.isMobile) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    },

    // 跳轉到指定步驟
    goToStep(stepIndex) {
      // 只允許跳轉到已完成的步驟或下一個待完成步驟
      if (stepIndex <= this.currentStep || stepIndex === this.currentStep + 1) {
        this.currentStep = stepIndex;
        if (this.isMobile) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    },

    // 提交訂單
    async submitOrder() {
      this.submitting = true;

      try {
        // 實際項目中這裡應該發送真實API請求
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 生成訂單編號
        this.orderNumber =
          "ORD" +
          Date.now()
            .toString()
            .slice(-8);

        // 顯示成功對話框
        this.orderSuccessDialogVisible = true;
      } catch (error) {
        console.error("Failed to submit order", error);
        this.$message.error("訂單提交失敗，請稍後再試");
      } finally {
        this.submitting = false;
      }
    },

    // 關閉成功對話框
    closeSuccessDialog() {
      this.orderSuccessDialogVisible = false;
      this.goToHome();
    },

    // 查看訂單詳情
    viewOrderDetails() {
      this.orderSuccessDialogVisible = false;
      // 跳轉到訂單詳情頁，實際項目中替換為真實路由
      this.$router.push(`/my-orders/${this.orderNumber}`);
    },

    // 返回首頁
    goToHome() {
      this.orderSuccessDialogVisible = false;
      this.$router.push("/staffshopping");
    },

    // 格式化價格
    formatPrice(price) {
      return price.toFixed(2);
    },

    // 生成模擬購物車數據（開發/測試使用）
    generateMockCartItems() {
      const items = [];
      const itemCount = Math.floor(Math.random() * 3) + 2; // 隨機2-4個商品

      for (let i = 0; i < itemCount; i++) {
        const price = Math.floor(Math.random() * 1000) + 100;
        const quantity = Math.floor(Math.random() * 3) + 1;
        const activityIndex = Math.floor(Math.random() * 10) + 1;

        items.push({
          id: `cart-item-${i + 1}`,
          productId: `product-${activityIndex}-${i + 1}`,
          activityId: `activity-${activityIndex}`,
          activityName: `員工優惠活動 ${activityIndex}`,
          name: `商品 ${i + 1}`,
          price: price,
          quantity: quantity,
          maxQuantity: 10,
          imageUrl: `https://via.placeholder.com/120x120?text=Product+${i + 1}`
        });
      }

      return items;
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
$font-size-xs: 12px;
$font-size-s: 14px;
$font-size-base: 16px;
$font-size-lg: 18px;
$font-size-xl: 20px;
$font-size-xxl: 24px;

// 移動裝置間距
$mobile-spacing: 12px;
$mobile-padding: 16px;

.checkout-container {
  width: 100%;
  margin: 0 auto;
  padding: 16px;
  position: relative;
  background-color: #f7f8fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;

  .title-container {
    display: flex;
    align-items: center;
  }

  .title-icon {
    font-size: 28px;
    color: $primary-color;
    margin-right: 12px;
  }

  .page-title {
    font-size: $font-size-xxl;
    color: #303133;
    margin: 0;
    font-weight: 600;
  }
}

.checkout-steps {
  margin-bottom: 24px;
  background-color: #fff;
  padding: 20px 16px;
  border-radius: $border-radius;
  box-shadow: $box-shadow;
}

.checkout-content {
  background-color: #fff;
  border-radius: $border-radius;
  box-shadow: $box-shadow;
  overflow: hidden;
  margin-bottom: 24px;
}

.step-container {
  padding: 20px;
}

.checkout-footer {
  background-color: #fff;
  border-radius: $border-radius;
  box-shadow: $box-shadow;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: $transition;

  &.mobile-footer {
    position: sticky;
    bottom: 0;
    z-index: 10;
    margin-top: 16px;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  }
}

.footer-info {
  .total-amount {
    font-size: $font-size-base;
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    .amount {
      font-size: $font-size-lg;
      color: $danger-color;
      font-weight: 600;
      margin-left: 8px;
    }
  }

  .total-items {
    font-size: $font-size-s;
    color: #606266;
  }
}

.footer-actions {
  display: flex;
  gap: 16px;
}

.action-button {
  min-width: 100px;
}

.custom-checkout-steps {
  margin-bottom: 24px;
  background-color: #fff;
  padding: 20px 16px;
  border-radius: $border-radius;
  box-shadow: $box-shadow;

  .step-progress-bar {
    position: relative;
    padding: 0 10px;
  }

  .progress-line {
    height: 4px;
    background-color: #ebeef5;
    border-radius: 2px;
    margin: 20px 0;
    position: relative;

    .progress-indicator {
      position: absolute;
      height: 100%;
      background-color: $primary-color;
      border-radius: 2px;
      transition: width 0.3s ease;
    }
  }

  .step-indicators {
    display: flex;
    justify-content: space-between;
    position: relative;
    margin-top: -36px;

    .step-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 25%;
      position: relative;

      .step-icon {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: #ebeef5;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #909399;
        margin-bottom: 8px;
        transition: all 0.3s ease;
        border: 2px solid #fff;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

        i {
          font-size: 18px;
        }
      }

      .step-title {
        font-size: $font-size-s;
        color: #909399;
        text-align: center;
        transition: all 0.3s ease;
        font-weight: 500;
        max-width: 80px;
        margin: 0 auto;
      }

      &.active {
        .step-icon {
          background-color: $primary-color;
          color: white;
        }

        .step-title {
          color: #606266;
        }
      }

      &.current {
        .step-icon {
          transform: scale(1.1);
          box-shadow: 0 3px 8px rgba(24, 144, 255, 0.3);
        }

        .step-title {
          color: $primary-color;
          font-weight: bold;
        }
      }
    }
  }
}

.back-to-top {
  position: fixed;
  right: 20px;
  bottom: 80px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(24, 144, 255, 0.7);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: $transition;
  z-index: 100;

  &:hover {
    background-color: $primary-color;
  }

  i {
    font-size: 20px;
  }
}

/* 響應式調整 */
@media (max-width: 768px) {
  .checkout-container {
    padding: $mobile-padding $mobile-padding 80px $mobile-padding; // 底部增加空間，防止固定底部按鈕遮擋內容
  }

  .page-header {
    margin-bottom: $mobile-spacing;

    .title-icon {
      font-size: $font-size-xl;
    }

    .page-title {
      font-size: $font-size-xl;
    }
  }

  .custom-checkout-steps {
    padding: $mobile-spacing;
    margin-bottom: $mobile-spacing;

    .step-indicators {
      .step-indicator {
        .step-icon {
          width: 32px;
          height: 32px;

          i {
            font-size: 16px;
          }
        }

        .step-title {
          font-size: $font-size-xs;
        }
      }
    }
  }

  .step-container {
    padding: $mobile-spacing;
  }

  .checkout-footer {
    flex-direction: column;
    gap: $mobile-spacing;
    padding: $mobile-spacing;
  }

  .footer-info {
    width: 100%;
  }

  .footer-actions {
    width: 100%;
    justify-content: space-between;
  }

  .action-button {
    min-width: 0;
    flex: 1;
    height: 44px; // 增大按鈕高度，更容易點擊
  }
}

@media (max-width: 480px) {
  .checkout-container {
    padding: 10px 10px 70px 10px;
  }

  .page-header .page-title {
    font-size: $font-size-lg;
  }

  .custom-checkout-steps {
    padding: 12px 8px;

    .step-indicators {
      .step-indicator {
        .step-icon {
          width: 28px;
          height: 28px;

          i {
            font-size: 14px;
          }
        }

        .step-title {
          font-size: 10px;
          max-width: 60px;
        }
      }
    }
  }

  .step-container {
    padding: 12px 10px;
  }

  .checkout-footer {
    padding: 12px 10px;
  }

  .footer-info {
    .total-amount {
      font-size: $font-size-s;

      .amount {
        font-size: $font-size-base;
      }
    }

    .total-items {
      font-size: $font-size-xs;
    }
  }

  .footer-actions {
    flex-direction: row; // 保持水平排列，但減少間距
    gap: 8px;

    .el-button {
      padding: 8px 15px;
      font-size: $font-size-s;
    }
  }

  .back-to-top {
    right: 12px;
    bottom: 70px;
    width: 36px;
    height: 36px;
  }
}
</style>
