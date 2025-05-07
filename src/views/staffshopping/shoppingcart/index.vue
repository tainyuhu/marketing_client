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
        <!-- 加載狀態 -->
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="6" animated />
        </div>
        <cart-confirmation
          v-else
          :cart-items="cartItems"
          :is-mobile="isMobile"
          :updating-items="updatingItems"
          :removing-items="removingItems"
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
          :cart-items="this.cartItems"
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
          :loading="processingAction"
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
import { debounce } from "@/utils/debounce"; // 引入共用防抖函數
import { Message } from "element-ui"; // 直接引入 Message

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
      cartSummary: {
        subtotal: 0,
        itemDiscounts: 0,
        orderDiscounts: 0,
        finalAmount: 0,
        totalQuantity: 0,
        totalGifts: 0,
        freeShipping: false,
        appliedRules: []
      },
      shippingAddress: {
        name: "",
        phone: "",
        address: "",
        postalCode: "",
        notes: ""
      },
      paymentMethod: "bankTransfer", // 默認為轉帳
      loading: true,
      processingAction: false,
      orderSuccessDialogVisible: false,
      orderNumber: "",
      windowWidth: window.innerWidth,
      showBackToTop: false,
      stepInfo: [
        { title: "確認商品", icon: "el-icon-shopping-cart-full" },
        { title: "填寫資料", icon: "el-icon-edit-outline" },
        { title: "付款方式", icon: "el-icon-bank-card" },
        { title: "完成訂單", icon: "el-icon-check" }
      ],
      // 存儲操作狀態，用於界面顯示
      updatingItems: {},
      removingItems: {},
      updateTimers: {} // 存儲更新定時器ID
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
      return (
        this.cartSummary.finalAmount ||
        this.cartItems.reduce((total, item) => {
          return total + item.price * item.quantity;
        }, 0)
      );
    },

    // 計算總數量
    totalQuantity() {
      return (
        this.cartSummary.totalQuantity ||
        this.cartItems.reduce((total, item) => {
          return total + item.quantity;
        }, 0)
      );
    },

    // 判斷下一步按鈕是否禁用
    isNextButtonDisabled() {
      if (this.processingAction) return true;

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
    // 創建防抖後的函數
    this.debouncedUpdateQuantity = debounce(this.performQuantityUpdate, 150);
    this.debouncedRemoveItem = debounce(this.performRemoveItem, 150);
    this.debouncedSubmitOrder = debounce(this.performSubmitOrder, 150, true); // 立即執行，但防止短時間內多次觸發

    this.fetchCartItems();
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("scroll", this.handleScroll);
  },

  beforeDestroy() {
    // 清理防抖定時器
    this.debouncedUpdateQuantity.cancel &&
      this.debouncedUpdateQuantity.cancel();
    this.debouncedRemoveItem.cancel && this.debouncedRemoveItem.cancel();
    this.debouncedSubmitOrder.cancel && this.debouncedSubmitOrder.cancel();

    // 清理其他事件監聽器
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("scroll", this.handleScroll);

    // 清理更新定時器
    Object.values(this.updateTimers).forEach(timerId => {
      if (timerId) clearTimeout(timerId);
    });
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

        if (!response) {
          throw new Error("獲取購物車失敗: 沒有從伺服器獲得響應");
        }

        this.cartItems = response.items || [];
        this.cartSummary = response.summary || {
          subtotal: 0,
          finalAmount: 0,
          totalQuantity: 0
        };

        // 初始化每個商品的 _lastQuantity 屬性
        this.cartItems.forEach(item => {
          item._lastQuantity = item.quantity;
        });
      } catch (error) {
        console.error("獲取購物車失敗:", error);
        Message({
          message: "獲取購物車失敗，請稍後再試",
          type: "error"
        });
      } finally {
        this.loading = false;
      }
    },

    // 更新購物車商品數量 - 防抖處理
    updateCartItemQuantity(item) {
      this.$set(this.updatingItems, item.product, true);

      // 添加一個短暫的定時器，確保視覺反饋至少持續100ms
      const timerId = setTimeout(() => {
        if (!this.updatingItems[item.product]) return;
        this.$set(this.updatingItems, item.product, false);
      }, 100);

      // 保存定時器ID以便在需要時清除
      this.$set(this.updateTimers, item.product, timerId);

      // 調用防抖函數
      this.debouncedUpdateQuantity(item);
    },

    // 實際執行更新的函數
    async performQuantityUpdate(item) {
      // 保存原數量，以便在請求失敗時還原
      const originalQuantity = item.quantity;
      const originalTotal = this.cartSummary.finalAmount;
      const originalSubtotal = this.cartSummary.subtotal;

      // 先在前端更新計算購物車總金額（臨時計算）
      const priceDifference =
        item.price * (item.quantity - (item._lastQuantity || 0));
      this.cartSummary.subtotal = parseFloat(
        (this.cartSummary.subtotal + priceDifference).toFixed(2)
      );
      this.cartSummary.finalAmount = parseFloat(
        (this.cartSummary.finalAmount + priceDifference).toFixed(2)
      );

      // 記錄這個商品的最後數量，用於下次計算差異
      item._lastQuantity = item.quantity;

      try {
        // 向後端發送更新請求
        const response = await Services.updateCartItem({
          productId: item.product,
          quantity: item.quantity,
          activityId: item.activity
        });

        console.log("更新購物車返回結果:", response); // 輸出響應查看結構

        // 如果服務器返回了更新後的購物車信息，使用服務器的數據
        if (response && response.summary) {
          this.cartSummary = response.summary;

          // 如果服務器返回了商品信息，更新本地商品信息
          if (response.items) {
            // 尋找目前操作的商品
            const updatedItem = response.items.find(
              i => i.product === item.product
            );
            if (updatedItem) {
              // 只更新需要更新的屬性，避免整個物件替換導致界面跳動
              Object.keys(updatedItem).forEach(key => {
                if (key !== "_lastQuantity") {
                  // 保留我們的臨時屬性
                  this.$set(item, key, updatedItem[key]);
                }
              });
            }
          }
        }

        // 使用導入的 Message 而不是 this.$message
        Message({
          message: "數量已更新",
          type: "success",
          duration: 1500,
          offset: this.isMobile ? 20 : 40
        });
      } catch (error) {
        console.error("更新數量失敗:", error);

        // 使用導入的 Message
        Message({
          message: "更新數量失敗，請稍後再試",
          type: "error",
          duration: 1500
        });

        // 恢復原數量和價格
        item.quantity = originalQuantity;
        this.cartSummary.subtotal = originalSubtotal;
        this.cartSummary.finalAmount = originalTotal;
        item._lastQuantity = originalQuantity;
      } finally {
        // 清除更新狀態
        this.$set(this.updatingItems, item.product, false);

        // 清除定時器
        if (this.updateTimers[item.product]) {
          clearTimeout(this.updateTimers[item.product]);
          this.$delete(this.updateTimers, item.product);
        }
      }
    },

    // 移除商品 - 使用防抖
    removeCartItem(item) {
      // 設置刪除狀態
      this.$set(this.removingItems, item.id, true);

      // 調用防抖函數
      this.debouncedRemoveItem(item);
    },

    // 實際執行刪除的函數
    async performRemoveItem(item) {
      // 先從本地購物車移除，不等待API響應
      const index = this.cartItems.findIndex(
        cartItem => cartItem.id === item.id
      );
      const removedItem = index !== -1 ? this.cartItems[index] : null;

      // 保存原數據以便恢復
      const originalItems = [...this.cartItems];
      const originalSummary = { ...this.cartSummary };

      if (index !== -1) {
        // 從本地列表中移除
        this.cartItems.splice(index, 1);

        // 更新本地購物車總計
        if (removedItem) {
          const itemTotal = removedItem.price * removedItem.quantity;
          this.cartSummary.subtotal = parseFloat(
            (this.cartSummary.subtotal - itemTotal).toFixed(2)
          );
          this.cartSummary.finalAmount = parseFloat(
            (this.cartSummary.finalAmount - itemTotal).toFixed(2)
          );
          this.cartSummary.totalQuantity -= removedItem.quantity;

          // 如果有贈品，更新贈品數量
          if (removedItem.gifts && removedItem.gifts.length > 0) {
            const giftQuantity = removedItem.gift_quantity || 0;
            this.cartSummary.totalGifts = Math.max(
              0,
              this.cartSummary.totalGifts - giftQuantity
            );
          }
        }
      }

      try {
        // 向後端發送刪除請求
        const response = await Services.removeCartItem(item.id);

        console.log("移除商品返回結果:", response); // 輸出響應查看結構

        // 如果服務器返回了更新後的購物車信息，使用服務器的數據
        if (response && response.summary) {
          this.cartSummary = response.summary;

          // 如果服務器也返回了最新商品列表，使用服務器的列表
          if (response.items) {
            this.cartItems = response.items;
          }
        }

        // 使用導入的 Message
        Message({
          message: "商品已移除",
          type: "success",
          duration: 1500,
          offset: this.isMobile ? 20 : 40
        });
      } catch (error) {
        console.error("移除商品失敗:", error);

        Message({
          message: "移除商品失敗，請稍後再試",
          type: "error",
          duration: 1500
        });

        // 恢復原數據
        this.cartItems = originalItems;
        this.cartSummary = originalSummary;
      } finally {
        // 清除刪除狀態
        this.$set(this.removingItems, item.id, false);
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

    // 提交訂單 - 使用防抖
    submitOrder() {
      if (this.processingAction) return;
      this.processingAction = true;
      this.debouncedSubmitOrder();
    },

    // 實際執行提交訂單的函數
    async performSubmitOrder() {
      try {
        // 構建訂單數據，包含購物車商品
        const orderData = {
          // 將購物車商品轉換為後端期望的格式
          cart_items: this.cartItems.map(item => ({
            product: item.product,
            activity: item.activity || null,
            quantity: item.quantity,
            price: item.price,
            original_price: item.original_price || item.price,
            name: item.name || item.product_name,
            gifts: item.gifts || []
          })),
          shipping_info: {
            name: this.shippingAddress.name,
            phone: this.shippingAddress.phone,
            address: this.shippingAddress.address,
            notes: this.shippingAddress.notes || "",
            postalCode: this.shippingAddress.postalCode || ""
          },
          payment_method: this.paymentMethod, // 注意這裡應使用 snake_case
          order_notes: ""
        };

        console.log("發送訂單數據:", orderData); // 調試用

        // 調用購物車結帳 API
        const response = await Services.createOrder(orderData);

        console.log("訂單創建完整響應:", response); // 增加完整響應調試日誌

        // 根據實際的API響應結構來獲取訂單編號
        let orderNumber = null;

        // response 已經被 extractData 處理，所以是 response.data
        if (
          response &&
          response.data &&
          response.data.order &&
          response.data.order.order_number
        ) {
          orderNumber = response.data.order.order_number;
        }
        // 如果上面的路徑不對，試試直接訪問
        else if (response && response.order && response.order.order_number) {
          orderNumber = response.order.order_number;
        }

        if (orderNumber) {
          this.orderNumber = orderNumber;
        } else {
          // 如果沒有收到訂單編號，視為提交失敗
          console.error("無法從響應中提取訂單編號，完整響應:", response);
          throw new Error("服務器未返回訂單編號，請聯繫客服確認訂單狀態");
        }

        // 訂單創建成功後，清空購物車數據
        this.cartItems = [];
        this.cartSummary = {
          subtotal: 0,
          itemDiscounts: 0,
          orderDiscounts: 0,
          finalAmount: 0,
          totalQuantity: 0,
          totalGifts: 0
        };

        // 顯示成功對話框
        this.orderSuccessDialogVisible = true;

        // 記錄成功信息
        console.log("訂單創建成功:", response);

        // 顯示成功消息
        Message({
          message: "訂單提交成功！訂單編號: " + this.orderNumber,
          type: "success",
          duration: 3000
        });
      } catch (error) {
        console.error("訂單提交失敗:", error);

        // 顯示詳細錯誤信息
        let errorMessage = "訂單提交失敗，請稍後再試";

        // 如果有API返回的詳細錯誤信息，優先使用
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          errorMessage = error.response.data.message;
        }

        Message({
          message: errorMessage,
          type: "error",
          duration: 5000
        });
      } finally {
        this.processingAction = false;
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

.loading-container {
  padding: 20px;
  flex-grow: 1;
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

/* 添加購物車相關的樣式 */
.subtle-updating {
  /* 僅添加細微的邊框變化或顏色變化 */
  border-color: #d9ecff !important;
}

/* 添加過渡動畫 */
.step-container {
  transition: opacity 0.3s ease;
}

/* 骨架屏樣式 */
.el-skeleton {
  padding: 16px;
}

/* 當數據正在加載時的過渡效果 */
.loading-container {
  transition: opacity 0.3s ease;
}

/* 添加按鈕樣式覆蓋 */
.el-button.action-button {
  font-weight: 500;
  letter-spacing: 0.5px;

  &[type="primary"] {
    background-color: $primary-color;
    border-color: $primary-color;

    &:hover,
    &:focus {
      background-color: lighten($primary-color, 10%);
      border-color: lighten($primary-color, 10%);
    }

    &:active {
      background-color: darken($primary-color, 10%);
      border-color: darken($primary-color, 10%);
    }

    &.is-disabled,
    &.is-disabled:hover,
    &.is-disabled:focus,
    &.is-disabled:active {
      background-color: #a0cfff;
      border-color: #a0cfff;
    }
  }
}

/* 添加購物車項目的轉場動畫 */
.cart-item {
  transition: all 0.3s ease-out;

  &:hover {
    background-color: #f9f9f9;
  }
}

/* 防止按鈕在Loading狀態被連續點擊 */
.el-button.is-loading {
  pointer-events: none;
}

/* 優化移動端的操作反饋 */
@media (max-width: 768px) {
  .el-button,
  .el-input-number,
  .el-tag {
    transform: scale(1);
    transition: transform 0.1s ease;

    &:active {
      transform: scale(0.96);
    }
  }

  .delete-btn {
    width: 28px;
    height: 28px;
    padding: 0;

    i {
      font-size: 12px;
    }
  }
}
</style>
