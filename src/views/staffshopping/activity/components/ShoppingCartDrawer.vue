<template>
  <div class="shopping-cart-drawer">
    <el-drawer
      :visible.sync="visible"
      direction="rtl"
      :size="drawerSize"
      :show-close="true"
      :before-close="handleClose"
    >
      <div slot="title" class="drawer-title">
        <i class="el-icon-shopping-cart-2"></i>
        <span>購物車</span>
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
              <div class="item-image">
                <img :src="item.imageUrl" :alt="item.name" />
              </div>
              <div class="item-info">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-price">NT${{ formatPrice(item.price) }}</div>
                <div class="item-activity">{{ item.activityName }}</div>
              </div>
              <div class="item-actions-row">
                <div class="item-quantity">
                  <el-input-number
                    v-model="item.quantity"
                    :min="1"
                    :max="item.maxQuantity"
                    size="mini"
                    @change="updateQuantity(item)"
                  ></el-input-number>
                </div>
                <div class="item-total">
                  NT${{ formatPrice(item.price * item.quantity) }}
                </div>
                <div class="item-actions">
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    circle
                    size="mini"
                    @click="removeItem(item)"
                  ></el-button>
                </div>
              </div>

              <!-- 贈品部分 -->
              <div
                v-if="item.gifts && item.gifts.length > 0"
                class="item-gifts"
              >
                <div class="gifts-title">
                  <el-tag size="mini" type="success">贈品</el-tag>
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
                        x {{ calculateGiftQuantity(item, gift) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 促銷信息 -->
              <div v-if="item.promotion" class="item-promotion">
                <el-tag size="mini" type="warning">{{
                  item.promotion.text
                }}</el-tag>
              </div>
            </div>
          </div>

          <!-- 購物車底部 -->
          <div class="cart-footer">
            <div class="cart-summary">
              <div class="summary-item">
                <span>商品總額:</span>
                <span class="summary-value"
                  >NT${{ formatPrice(totalAmount) }}</span
                >
              </div>
              <div class="summary-item">
                <span>商品數量:</span>
                <span class="summary-value">{{ totalQuantity }} 件</span>
              </div>
              <!-- 贈品總數 -->
              <div v-if="totalGifts > 0" class="summary-item">
                <span>贈品數量:</span>
                <span class="summary-value gift-value"
                  >{{ totalGifts }} 件</span
                >
              </div>
            </div>
            <div class="cart-actions">
              <el-button size="small" @click="clearCart">清空購物車</el-button>
              <el-button size="small" type="primary" @click="checkout"
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
      loading: true
    };
  },

  computed: {
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

    // 計算贈品總數
    totalGifts() {
      return this.cartItems.reduce((total, item) => {
        if (item.gifts && item.gifts.length > 0) {
          return (
            total +
            item.gifts.reduce((giftTotal, gift) => {
              return giftTotal + this.calculateGiftQuantity(item, gift);
            }, 0)
          );
        }
        return total;
      }, 0);
    },

    // 根據屏幕寬度決定抽屜大小
    drawerSize() {
      return window.innerWidth <= 768 ? "80%" : "400px";
    }
  },

  watch: {
    visible(newVal) {
      if (newVal) {
        this.fetchCartItems();
      }
    }
  },

  methods: {
    // 獲取購物車商品
    async fetchCartItems() {
      this.loading = true;

      try {
        // 實際項目中替換為真實請求
        const response = await Services.getCartItems();
        this.cartItems = response.data;
        this.cartItems = this.generateMockCartItems();
      } catch (error) {
        console.error("Failed to fetch cart items", error);
        this.$message.error("獲取購物車失敗，請稍後再試");
        // 模擬數據，方便開發測試
        this.cartItems = this.generateMockCartItems();
      } finally {
        this.loading = false;
      }
    },

    // 更新商品數量
    async updateQuantity(item) {
      try {
        await Services.updateCartItem({
          cartItemId: item.id,
          quantity: item.quantity
        });
        this.$message.success("數量已更新");
        this.$emit("update:count", this.totalQuantity);
      } catch (error) {
        console.error("Failed to update quantity", error);
        this.$message.error("更新數量失敗，請稍後再試");
        // 恢復原數量
        this.fetchCartItems();
      }
    },

    // 移除商品
    async removeItem(item) {
      try {
        await Services.removeCartItem(item.id);

        // 從本地購物車移除
        const index = this.cartItems.findIndex(
          cartItem => cartItem.id === item.id
        );
        if (index !== -1) {
          this.cartItems.splice(index, 1);
        }

        this.$message.success("商品已移除");
        this.$emit("update:count", this.totalQuantity);
      } catch (error) {
        console.error("Failed to remove item", error);
        this.$message.error("移除商品失敗，請稍後再試");
      }
    },

    // 清空購物車
    async clearCart() {
      this.$confirm("確定要清空購物車嗎?", "提示", {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          try {
            await Services.clearCart();
            this.cartItems = [];
            this.$message.success("購物車已清空");
            this.$emit("update:count", 0);
          } catch (error) {
            console.error("Failed to clear cart", error);
            this.$message.error("清空購物車失敗，請稍後再試");
          }
        })
        .catch(() => {
          // 用戶取消清空操作
        });
    },

    // 結算
    checkout() {
      this.close();
      this.$router.push("/staffshopping/cart");
    },

    // 關閉抽屜
    close() {
      this.$emit("update:visible", false);
    },

    // 處理關閉事件
    handleClose(done) {
      done();
      this.$emit("update:visible", false);
    },

    // 格式化價格
    formatPrice(price) {
      return price.toFixed(2);
    },

    // 計算贈品數量（根據購買數量計算應贈送的贈品數量）
    calculateGiftQuantity(item, gift) {
      // 如果有指定比例，按比例計算；否則默認每個主商品對應一個贈品
      if (gift.ratio) {
        return Math.floor(item.quantity * gift.ratio);
      } else if (gift.threshold) {
        // 如果有門檻，例如買3送1
        return Math.floor(item.quantity / gift.threshold);
      }
      return item.quantity; // 默認1:1贈送
    },

    // 生成模擬購物車數據（開發/測試使用）
    generateMockCartItems() {
      const items = [];
      const itemCount = Math.floor(Math.random() * 3) + 2; // 隨機2-4個商品

      // 贈品示例圖片
      const giftImages = [
        require("@/assets/pic/pic3.jpg"),
        require("@/assets/pic/pic3.jpg"),
        require("@/assets/pic/pic3.jpg")
      ];

      for (let i = 0; i < itemCount; i++) {
        const price = Math.floor(Math.random() * 1000) + 100;
        const quantity = Math.floor(Math.random() * 3) + 2; // 至少2件，確保能觸發贈品
        const activityIndex = Math.floor(Math.random() * 10) + 1;

        // 確保至少有一個商品有贈品
        const hasGifts = i === 0 ? true : Math.random() > 0.3;
        let gifts = [];
        let promotion = null;

        if (hasGifts) {
          // 生成1到2個贈品
          const giftCount = Math.floor(Math.random() * 2) + 1;
          for (let j = 0; j < giftCount; j++) {
            // 確保第一個商品展示兩種贈品規則
            const giftType =
              i === 0 && j === 0
                ? "比例贈送"
                : i === 0 && j === 1
                ? "門檻贈送"
                : Math.random() > 0.5
                ? "比例贈送"
                : "門檻贈送";

            const gift = {
              name: `贈品 ${String.fromCharCode(65 + j)}`, // A, B, C...
              imageUrl: giftImages[j % giftImages.length]
            };

            if (giftType === "比例贈送") {
              gift.ratio = 0.5; // 買2送1
              promotion = { text: "買2送1" };
            } else {
              gift.threshold = 3; // 買3送1
              promotion = { text: "買3送1" };
            }

            gifts.push(gift);
          }
        }

        items.push({
          id: `cart-item-${i + 1}`,
          productId: `product-${activityIndex}-${i + 1}`,
          activityId: `activity-${activityIndex}`,
          activityName: `員工優惠活動 ${activityIndex}`,
          name: `${["精選", "優質", "特惠", "限量"][i % 4]}商品 ${i + 1}`,
          price: price,
          quantity: quantity,
          maxQuantity: 10,
          imageUrl: require("@/assets/pic/pic3.jpg"),
          gifts: gifts,
          promotion: promotion
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
}

.cart-item {
  padding: 12px 10px;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.item-image {
  width: 70px;
  height: 70px;
  overflow: hidden;
  border-radius: 4px;
  float: left;
  margin-right: 12px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.item-info {
  overflow: hidden;
  margin-bottom: 10px;
}

.item-name {
  font-size: $font-size-base;
  color: #303133;
  margin-bottom: 6px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-price {
  font-size: $font-size-base;
  color: $danger-color;
  margin-bottom: 4px;
  font-weight: 500;
}

.item-activity {
  font-size: $font-size-s;
  color: #909399;
}

.item-actions-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  clear: both;
  margin-top: 8px;
}

.item-quantity {
  flex: 1;
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
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed #f0f0f0;
  clear: both;
}

.gifts-title {
  margin-bottom: 8px;
}

.gifts-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.gift-item {
  display: flex;
  align-items: center;
  background-color: #f9f9f9;
  padding: 4px;
  border-radius: 4px;
  width: 100%;
}

.gift-image {
  width: 30px;
  height: 30px;
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

/* 促銷信息 */
.item-promotion {
  clear: both;
  margin-top: 6px;
  padding-top: 6px;
}

.summary-item .gift-value {
  color: $success-color;
}

.cart-footer {
  background-color: #fafafa;
  padding: 16px 10px;
  border-top: 1px solid #f0f0f0;
  margin-top: auto;
}

.cart-summary {
  margin-bottom: 12px;

  .summary-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;

    &:last-child {
      margin-bottom: 0;
    }

    .summary-value {
      font-size: $font-size-base;
      font-weight: 600;
      color: $danger-color;
    }
  }
}

.cart-actions {
  display: flex;
  justify-content: space-between;

  .el-button {
    flex: 1;
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
  }

  .item-name {
    font-size: $font-size-s;
  }

  .item-price {
    font-size: $font-size-s;
  }

  .item-activity {
    font-size: 12px;
  }

  .cart-footer {
    padding: 12px 10px;
  }

  .gift-name {
    max-width: 90px;
  }
}
</style>
