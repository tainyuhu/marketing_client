<template>
  <div class="cart-confirmation">
    <h2 class="section-title">確認購物車商品</h2>

    <div v-if="cartItems.length === 0" class="empty-cart">
      <el-empty description="購物車空空如也">
        <template #description>
          <p>您的購物車還沒有商品</p>
        </template>
        <el-button
          type="primary"
          size="small"
          @click="$router.push('/staffshopping')"
          >繼續購物</el-button
        >
      </el-empty>
    </div>

    <div v-else class="cart-content">
      <!-- 購物車列表 - 添加固定高度和卷軸 -->
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
          <div v-if="item.gifts && item.gifts.length > 0" class="item-gifts">
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

      <!-- 訂單摘要部分 -->
      <div class="cart-summary">
        <div class="summary-item">
          <span>商品總額:</span>
          <span class="summary-value">NT${{ formatPrice(subtotal) }}</span>
        </div>
        <div class="summary-item">
          <span>商品數量:</span>
          <span class="summary-value">{{ totalQuantity }} 件</span>
        </div>
        <!-- 贈品總數 -->
        <div v-if="totalGifts > 0" class="summary-item">
          <span>贈品數量:</span>
          <span class="summary-value gift-value"> {{ totalGifts }} 件 </span>
        </div>
        <div v-if="orderDiscounts > 0" class="summary-item discount">
          <span>滿額折扣:</span>
          <span class="summary-value discount-value">
            NT${{ formatPrice(orderDiscounts) }}
          </span>
        </div>
        <div class="summary-item final">
          <span>應付金額:</span>
          <span class="summary-value final-value">
            NT${{ formatPrice(finalAmount) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CartConfirmation",

  props: {
    cartItems: {
      type: Array,
      required: true
    },
    isMobile: {
      type: Boolean,
      default: false
    },
    updatingItems: {
      type: Object,
      default: () => ({})
    },
    removingItems: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    subtotal() {
      return this.cartItems.reduce((total, item) => {
        return total + item.price * item.quantity;
      }, 0);
    },

    totalQuantity() {
      return this.cartItems.reduce((total, item) => {
        return total + item.quantity;
      }, 0);
    },

    totalGifts() {
      return this.cartItems.reduce((total, item) => {
        if (item.gifts && item.gifts.length > 0) {
          return total + (item.gift_quantity || 0);
        }
        return total;
      }, 0);
    },

    orderDiscounts() {
      // 這裡可以根據業務邏輯計算折扣
      // 示例: 滿1000減100
      return this.subtotal >= 1000 ? 100 : 0;
    },

    finalAmount() {
      return this.subtotal - this.orderDiscounts;
    }
  },

  methods: {
    updateQuantity(item) {
      this.$emit("update-quantity", item);
    },

    removeItem(item) {
      this.$emit("remove-item", item);
    },

    formatPrice(price) {
      return price.toFixed(2);
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

// 字體大小
$font-size-xs: 12px;
$font-size-s: 14px;
$font-size-base: 16px;
$font-size-lg: 18px;

.cart-confirmation {
  width: 100%;
}

.section-title {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: $font-size-lg;
  color: #303133;
}

.empty-cart {
  padding: 30px 0;
  text-align: center;
}

/* 添加購物車內容容器 */
.cart-content {
  display: flex;
  flex-direction: column;
}

/* 修改購物車列表為固定高度並添加卷軸 */
.cart-list {
  max-height: 400px; /* 設定固定高度 */
  overflow-y: auto; /* 允許垂直卷軸 */
  margin-bottom: 20px;
  border: 1px solid #ebeef5;
  border-radius: $border-radius;
  background-color: #fff;

  /* 美化卷軸樣式 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #c0c4cc;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background-color: #f4f4f5;
  }
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

.cart-summary {
  background-color: #f9f9f9;
  padding: 16px;
  border-radius: $border-radius;
  margin-top: 0; /* 调整顶部间距 */
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

  .summary-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;

    &.final {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #ebeef5;
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

/* 響應式調整 */
@media (max-width: 768px) {
  .cart-list {
    max-height: 350px; /* 移動端略微縮小高度 */
  }
}

@media (max-width: 480px) {
  .cart-list {
    max-height: 300px; /* 小螢幕更小的高度 */
  }

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

  .gift-name {
    max-width: 100px;
  }
}

/* 提供更多空間給行動裝置 */
@media (max-width: 360px) {
  .cart-list {
    max-height: 250px; /* 最小螢幕高度更小 */
  }

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
