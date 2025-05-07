<template>
  <div class="shopping-cart-drawer">
    <el-drawer
      :visible="localVisible"
      direction="rtl"
      :size="drawerSize"
      :show-close="true"
      :before-close="handleClose"
      @close="onDrawerClose"
    >
      <div slot="title" class="drawer-title">
        <i class="el-icon-shopping-cart-2"></i>
        <span>購物車</span>
        <span class="cart-count" v-if="cartSummary.totalQuantity">
          ({{ cartSummary.totalQuantity }})
        </span>
      </div>

      <div class="drawer-content">
        <!-- 加載狀態 -->
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="6" animated />
        </div>

        <!-- 購物車列表 -->
        <div v-else-if="cartItems.length > 0" class="cart-content">
          <!-- 購物車列表 -->
          <div class="cart-list">
            <div v-for="item in cartItems" :key="item.id" class="cart-item">
              <div class="item-main">
                <div class="item-image">
                  <img :src="item.imageUrl" :alt="item.name" />
                </div>
                <div class="item-info">
                  <div class="item-top">
                    <div class="item-name">{{ item.name }}</div>
                    <el-button
                      type="danger"
                      icon="el-icon-delete"
                      circle
                      size="mini"
                      class="delete-btn"
                      @click="removeItem(item)"
                      :loading="removingItems[item.id]"
                      :disabled="removingItems[item.id]"
                    ></el-button>
                  </div>
                  <div class="item-price">NT${{ formatPrice(item.price) }}</div>
                  <div class="item-actions-row">
                    <div class="item-quantity">
                      <el-input-number
                        v-model="item.quantity"
                        :min="1"
                        :max="item.maxQuantity || 99"
                        size="mini"
                        @change="updateQuantity(item)"
                        :class="{
                          'subtle-updating': updatingItems[item.product]
                        }"
                      ></el-input-number>
                    </div>
                    <div class="item-total">
                      NT${{ formatPrice(item.price * item.quantity) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 贈品部分 -->
              <div
                v-if="item.gifts && item.gifts.length > 0"
                class="item-gifts"
              >
                <div class="gifts-header">
                  <el-tag size="mini" type="success">贈品</el-tag>
                  <span v-if="item.promotion_label" class="promotion-label">{{
                    item.promotion_label
                  }}</span>
                </div>
                <div class="gifts-list">
                  <div
                    v-for="(gift, giftIndex) in item.gifts"
                    :key="giftIndex"
                    class="gift-item"
                  >
                    <div class="gift-image">
                      <img :src="gift.imageUrl" :alt="gift.name" />
                    </div>
                    <div class="gift-info">
                      <div class="gift-name">{{ gift.name }}</div>
                      <div class="gift-quantity">
                        x {{ item.gift_quantity || 0 }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 購物車底部 - 可收合設計 -->
          <div class="cart-footer">
            <!-- 簡易訂單摘要 - 始終顯示 -->
            <div class="cart-footer-preview" @click="toggleOrderSummary">
              <div class="preview-total">
                <span
                  >合計: NT${{
                    formatPrice(cartSummary.finalAmount || 0)
                  }}</span
                >
                <span class="preview-quantity"
                  >({{ cartSummary.totalQuantity }}件商品)</span
                >
              </div>
              <div class="preview-toggle">
                <i
                  :class="
                    showOrderSummary ? 'el-icon-arrow-down' : 'el-icon-arrow-up'
                  "
                ></i>
                {{ showOrderSummary ? "收起明細" : "查看明細" }}
              </div>
            </div>

            <!-- 詳細訂單摘要 - 可收合 -->
            <div
              class="order-summary-detail"
              :class="{ collapsed: !showOrderSummary }"
            >
              <!-- 套用優惠規則 -->
              <div
                v-if="
                  cartSummary.appliedRules &&
                    cartSummary.appliedRules.length > 0
                "
                class="applied-rules"
              >
                <div class="rules-title">已套用優惠</div>
                <ul class="rules-list">
                  <li
                    v-for="(rule, idx) in cartSummary.appliedRules"
                    :key="idx"
                    class="rule-item"
                  >
                    <el-tag type="success" size="mini">{{ rule.name }}</el-tag>
                  </li>
                </ul>
              </div>

              <div class="cart-summary">
                <div class="summary-item">
                  <span>商品總額:</span>
                  <span class="summary-value"
                    >NT${{ formatPrice(cartSummary.subtotal) }}</span
                  >
                </div>
                <div class="summary-item">
                  <span>商品數量:</span>
                  <span class="summary-value"
                    >{{ cartSummary.totalQuantity }} 件</span
                  >
                </div>
                <!-- 贈品總數 -->
                <div v-if="cartSummary.totalGifts > 0" class="summary-item">
                  <span>贈品數量:</span>
                  <span class="summary-value gift-value">
                    {{ cartSummary.totalGifts }} 件
                  </span>
                </div>
                <div
                  v-if="cartSummary.orderDiscounts > 0"
                  class="summary-item discount"
                >
                  <span>滿額折扣:</span>
                  <span class="summary-value discount-value">
                    NT${{ formatPrice(cartSummary.orderDiscounts) }}
                  </span>
                </div>
                <div class="summary-item final">
                  <span>應付金額:</span>
                  <span class="summary-value final-value">
                    NT${{ formatPrice(cartSummary.finalAmount || 0) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 購物車操作按鈕 -->
            <div class="cart-actions">
              <el-button
                size="small"
                @click="clearCart"
                :loading="processingAction"
                :disabled="processingAction"
                >清空購物車</el-button
              >
              <el-button
                size="small"
                type="primary"
                @click="checkout"
                :loading="processingAction"
                :disabled="processingAction"
                >去結算</el-button
              >
            </div>
          </div>
        </div>

        <!-- 空購物車提示 -->
        <div v-else class="empty-cart">
          <el-empty description="購物車空空如也">
            <template #description>
              <p>您的購物車還沒有商品</p>
            </template>
            <el-button type="primary" size="small" @click="close"
              >繼續購物</el-button
            >
          </el-empty>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import Services from "../..//services/Services.js";
import { debounce } from "@/utils/debounce"; // 引入共用防抖函數

export default {
  name: "ShoppingCartDrawer",

  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
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
      localVisible: this.visible,
      loading: true,
      showOrderSummary: false, // 預設收起詳細訂單摘要
      // 存儲操作狀態，用於界面顯示
      updatingItems: {},
      removingItems: {},
      processingAction: false // 通用處理狀態（用於清空購物車、結算等操作）
    };
  },

  created() {
    // 創建防抖後的函數
    this.debouncedUpdateQuantity = debounce(this.performQuantityUpdate, 150);
    this.debouncedRemoveItem = debounce(this.performRemoveItem, 150);
    this.debouncedClearCart = debounce(this.performClearCart, 150);
    this.debouncedCheckout = debounce(this.performCheckout, 150, true); // 立即執行，但防止短時間內多次觸發
    this.debouncedClose = debounce(this.performClose, 150, true); // 立即執行，但防止短時間內多次觸發
  },

  beforeDestroy() {
    // 清理防抖定時器
    this.debouncedUpdateQuantity.cancel &&
      this.debouncedUpdateQuantity.cancel();
    this.debouncedRemoveItem.cancel && this.debouncedRemoveItem.cancel();
    this.debouncedClearCart.cancel && this.debouncedClearCart.cancel();
    this.debouncedCheckout.cancel && this.debouncedCheckout.cancel();
    this.debouncedClose.cancel && this.debouncedClose.cancel();
  },

  computed: {
    // 根據屏幕寬度決定抽屜大小
    drawerSize() {
      return window.innerWidth <= 768 ? "90%" : "400px";
    }
  },

  watch: {
    visible(newVal) {
      this.localVisible = newVal;
      if (newVal) {
        this.fetchCartItems();
      }
    }
  },

  methods: {
    onDrawerClose() {
      this.$emit("update:visible", false);
      this.$emit("update:count", this.cartSummary.totalQuantity);
    },
    // 切換訂單摘要顯示狀態
    toggleOrderSummary() {
      this.showOrderSummary = !this.showOrderSummary;
    },

    // 獲取購物車商品
    async fetchCartItems() {
      this.loading = true;

      try {
        const response = await Services.getCartItems();

        this.cartItems = response.items;
        // 初始化每個商品的 _lastQuantity 屬性
        this.cartItems.forEach(item => {
          item._lastQuantity = item.quantity;
        });
        this.cartSummary = response.summary;
      } catch (error) {
        console.error("Failed to fetch cart items", error);
        this.$message.error("獲取購物車失敗，請稍後再試");
      } finally {
        this.loading = false;
      }
    },

    // 更新商品數量 - 防抖處理
    updateQuantity(item) {
      this.$set(this.updatingItems, item.product, true);

      // 添加一個短暫的定時器，確保視覺反饋至少持續300ms
      // 這樣即使是快速的更新也能給用戶一些反饋
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
      // 假設更新已成功，避免等待API響應
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
        console.log(item.product, item.quantity);
        // 向後端發送更新請求
        const response = await Services.updateCartItem({
          productId: item.product,
          quantity: item.quantity,
          activityId: item.activity
        });

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

        this.$message.success("數量已更新");
        this.$emit("update:count", this.cartSummary.totalQuantity);
      } catch (error) {
        console.error("Failed to update quantity", error);
        this.$message.error("更新數量失敗，請稍後再試");

        // 恢復原數量和價格
        item.quantity = originalQuantity;
        this.cartSummary.subtotal = originalSubtotal;
        this.cartSummary.finalAmount = originalTotal;
        item._lastQuantity = originalQuantity;
      } finally {
      }
    },

    // 移除商品 - 使用防抖
    removeItem(item) {
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

        // 如果服務器返回了更新後的購物車信息，使用服務器的數據
        if (response && response.summary) {
          this.cartSummary = response.summary;

          // 如果服務器也返回了最新商品列表，使用服務器的列表
          if (response.items) {
            this.cartItems = response.items;
          }
        }

        this.$message.success("商品已移除");
        this.$emit("update:count", this.cartSummary.totalQuantity);
      } catch (error) {
        console.error("Failed to remove item", error);
        this.$message.error("移除商品失敗，請稍後再試");

        // 恢復原數據
        this.cartItems = originalItems;
        this.cartSummary = originalSummary;
      } finally {
        // 清除刪除狀態
        this.$set(this.removingItems, item.id, false);
      }
    },

    // 清空購物車 - 使用防抖
    clearCart() {
      // 避免重複觸發確認框
      if (this.processingAction) return;

      this.$msgbox({
        title: "提示",
        message: "確定要清空購物車嗎?",
        showCancelButton: true,
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning",
        appendToBody: true,
        lockScroll: true
      })
        .then(action => {
          if (action === "confirm") {
            this.processingAction = true;
            this.debouncedClearCart();
          }
        })
        .catch(() => {
          this.processingAction = false;
        });
    },

    // 實際執行清空的函數
    async performClearCart() {
      try {
        await Services.clearCart();
        this.cartItems = [];
        this.cartSummary = {
          subtotal: 0,
          itemDiscounts: 0,
          orderDiscounts: 0,
          finalAmount: 0,
          totalQuantity: 0,
          totalGifts: 0,
          freeShipping: false,
          appliedRules: []
        };
        this.$message.success("購物車已清空");
        this.$emit("update:count", 0);
      } catch (error) {
        console.error("Failed to clear cart", error);
        this.$message.error("清空購物車失敗，請稍後再試");
      } finally {
        // 清除處理狀態
        this.processingAction = false;
      }
    },

    // 結算 - 使用防抖
    checkout() {
      if (this.processingAction) return;
      this.processingAction = true;
      this.debouncedCheckout();
    },

    // 實際執行結算的函數
    performCheckout() {
      this.performClose();
      this.$router.push("/staffshopping/checkout");
      this.processingAction = false;
    },

    // 關閉抽屜 - 使用防抖
    close() {
      this.debouncedClose();
    },

    // 實際執行關閉的函數
    performClose() {
      this.localVisible = false; // 修改本地值
      this.$emit("update:visible", false);
      this.$emit("update:count", this.cartSummary.totalQuantity);
    },

    // 處理關閉事件
    handleClose(done) {
      this.debouncedClose();
      done();
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

.drawer-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: $font-size-lg;
  font-weight: 600;

  i {
    color: $primary-color;
  }

  .cart-count {
    font-size: $font-size-s;
    color: #606266;
    font-weight: normal;
  }
}

.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 10px;
}

.loading-container {
  padding: 20px;
  flex-grow: 1;
}

.cart-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.cart-list {
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px 0;
  padding-bottom: 140px; // 預留底部空間
}

.cart-item {
  padding: 12px 10px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;

  &:last-child {
    border-bottom: none;
  }
}

.item-main {
  display: flex;
  margin-bottom: 10px;
}

.item-image {
  width: 70px;
  height: 70px;
  min-width: 70px;
  overflow: hidden;
  border-radius: 4px;
  margin-right: 12px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.item-info {
  flex: 1;
  overflow: hidden;
}

.item-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
}

.item-name {
  font-size: $font-size-base;
  color: #303133;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.delete-btn {
  padding: 4px;
  margin-left: 8px;
}

.item-price {
  font-size: $font-size-base;
  color: $danger-color;
  margin-bottom: 4px;
  font-weight: 500;
}

.item-actions-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-quantity {
  flex: 1;
  position: relative;

  .updating-tag {
    position: absolute;
    right: -65px;
    top: 0;
    font-size: 10px;
    padding: 0 4px;
    line-height: 16px;
    height: 18px;
  }
}

.item-total {
  font-size: $font-size-base;
  font-weight: 600;
  color: $danger-color;
  margin: 0 10px;
  white-space: nowrap;
}

/* 贈品樣式 */
.item-gifts {
  padding: 8px;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin-top: 6px;
}

.subtle-updating {
  /* 僅添加細微的邊框變化或顏色變化 */
  border-color: #d9ecff !important;
}

.gifts-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.promotion-label {
  font-size: $font-size-xs;
  color: $warning-color;
  font-weight: 500;
}

.gifts-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.gift-item {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  padding: 4px;
  border-radius: 4px;
  width: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.gift-image {
  width: 30px;
  height: 30px;
  min-width: 30px;
  overflow: hidden;
  border-radius: 2px;
  margin-right: 6px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.gift-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gift-name {
  font-size: 12px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 120px;
}

.gift-quantity {
  font-size: 12px;
  color: $success-color;
  font-weight: 500;
}

/* 購物車底部 - 固定在抽屜底部內 */
.cart-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

/* 簡易訂單摘要 - 可點擊展開/收起 */
.cart-footer-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  cursor: pointer;
  transition: $transition;

  &:hover {
    background-color: #f9f9f9;
  }

  .preview-total {
    font-weight: 600;
    font-size: $font-size-base;

    .preview-quantity {
      font-size: $font-size-s;
      color: #909399;
      font-weight: normal;
      margin-left: 4px;
    }
  }

  .preview-toggle {
    color: $primary-color;
    font-size: $font-size-s;
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

/* 詳細訂單摘要 - 可收合 */
.order-summary-detail {
  padding: 0 16px;
  max-height: 300px;
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;

  &.collapsed {
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
    overflow: hidden;
  }
}

.applied-rules {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #f0f0f0;

  .rules-title {
    font-weight: 500;
    margin-bottom: 6px;
    font-size: 14px;
    color: #606266;
  }

  .rules-list {
    padding: 0;
    margin: 0;
    list-style: none;

    .rule-item {
      display: block;
      line-height: 1.6;
      padding-left: 12px;
      position: relative;
      margin-bottom: 4px;

      &::before {
        content: "•";
        position: absolute;
        left: 0;
        color: #409eff;
      }
    }
  }
}

.cart-summary {
  margin-bottom: 12px;

  .summary-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;

    &.final {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #f0f0f0;
      font-size: $font-size-base;
    }

    .summary-value {
      font-weight: 600;

      &.gift-value {
        color: $success-color;
      }

      &.discount-value {
        color: $danger-color;
      }

      &.final-value {
        color: $danger-color;
        font-size: $font-size-lg;
      }
    }
  }
}

.cart-actions {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;

  .el-button {
    flex: 1;
    margin-left: 10px;

    &:first-child {
      margin-left: 0;
    }
  }
}

.empty-cart {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 30px;
}

/* 響應式調整 */
@media (max-width: 480px) {
  .item-image {
    width: 60px;
    height: 60px;
    min-width: 60px;
  }

  .item-name {
    font-size: $font-size-s;
  }

  .item-price {
    font-size: $font-size-s;
  }

  .item-activity {
    font-size: $font-size-xs;
  }

  .gift-name {
    max-width: 100px;
  }

  .cart-list {
    padding-bottom: 130px;
  }

  .cart-footer-preview {
    padding: 10px 12px;
  }

  .cart-actions {
    padding: 10px 12px;
  }
}

/* 提供更多空間給行動裝置 */
@media (max-width: 360px) {
  .item-image {
    width: 50px;
    height: 50px;
    min-width: 50px;
  }

  .item-actions-row {
    flex-wrap: wrap;
  }

  .item-quantity {
    margin-bottom: 8px;
  }

  .gift-name {
    max-width: 80px;
  }
}
</style>
