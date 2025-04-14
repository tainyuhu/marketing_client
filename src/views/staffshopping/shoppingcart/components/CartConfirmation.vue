<template>
  <div class="cart-confirmation">
    <h2 class="section-title">確認商品信息</h2>

    <!-- 購物車列表容器（帶卷軸） -->
    <div class="cart-container">
      <!-- 購物車內容 -->
      <div v-if="cartItems.length > 0" class="cart-list">
        <!-- 桌面版表頭 -->
        <div class="cart-header desktop-only">
          <div class="header-item header-product">商品</div>
          <div class="header-item header-price">單價</div>
          <div class="header-item header-quantity">數量</div>
          <div class="header-item header-total">小計</div>
          <div class="header-item header-action">操作</div>
        </div>

        <!-- 商品卡片列表 -->
        <div class="item-cards">
          <div v-for="item in cartItems" :key="item.id" class="cart-item-card">
            <!-- 桌面版佈局 -->
            <div class="desktop-layout">
              <div class="item-product">
                <div class="item-image">
                  <img :src="item.imageUrl" :alt="item.name" />
                </div>
                <div class="item-info">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-activity">{{ item.activityName }}</div>
                </div>
              </div>

              <div class="item-price">NT${{ formatPrice(item.price) }}</div>

              <div class="item-quantity">
                <el-input-number
                  v-model="item.quantity"
                  :min="1"
                  :max="item.maxQuantity"
                  size="small"
                  @change="updateQuantity(item)"
                ></el-input-number>
              </div>

              <div class="item-total">
                NT${{ formatPrice(item.price * item.quantity) }}
              </div>

              <div class="item-action">
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  circle
                  size="small"
                  @click="removeItem(item)"
                ></el-button>
              </div>
            </div>

            <!-- 手機版佈局 -->
            <div class="mobile-layout">
              <div class="mobile-row">
                <div class="item-image">
                  <img :src="item.imageUrl" :alt="item.name" />
                </div>
                <div class="mobile-info">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-activity">{{ item.activityName }}</div>
                  <div class="item-price mobile-price">
                    單價: NT${{ formatPrice(item.price) }}
                  </div>
                </div>
              </div>

              <div class="mobile-actions">
                <div class="quantity-control">
                  <span class="control-label">數量:</span>
                  <el-input-number
                    v-model="item.quantity"
                    :min="1"
                    :max="item.maxQuantity"
                    size="mini"
                    @change="updateQuantity(item)"
                  ></el-input-number>
                </div>
                <div class="remove-btn">
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    size="mini"
                    @click="removeItem(item)"
                    >移除</el-button
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空購物車提示 -->
      <div v-else class="empty-cart">
        <el-empty description="購物車空空如也">
          <template #description>
            <p>您的購物車還沒有商品</p>
          </template>
          <el-button type="primary" @click="goToShopping">去選購</el-button>
        </el-empty>
      </div>
    </div>

    <!-- 訂單統計卡片 -->
    <div class="order-summary-card">
      <div class="summary-title">訂單摘要</div>
      <div class="summary-row">
        <span>商品總數:</span>
        <span>{{ totalItems }} 件</span>
      </div>
      <div class="summary-row">
        <span>商品總額:</span>
        <span class="price">NT${{ formatPrice(totalAmount) }}</span>
      </div>
      <div class="summary-row total-row">
        <span>應付總額:</span>
        <span class="total-price">NT${{ formatPrice(totalAmount) }}</span>
      </div>
    </div>

    <!-- 備註信息卡片 -->
    <div class="order-notes-card">
      <div class="notes-title">訂單備註</div>
      <el-input
        type="textarea"
        :rows="3"
        placeholder="有什麼需要告訴我們的嗎？"
        v-model="orderNotes"
      ></el-input>
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
    isDesktop: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      orderNotes: ""
    };
  },

  computed: {
    // 計算商品總數
    totalItems() {
      return this.cartItems.reduce((total, item) => total + item.quantity, 0);
    },

    // 計算總金額
    totalAmount() {
      return this.cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    }
  },

  methods: {
    // 更新商品數量
    updateQuantity(item) {
      this.$emit("update-quantity", item);
    },

    // 移除商品
    removeItem(item) {
      this.$confirm("確定要從購物車中移除該商品嗎?", "提示", {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$emit("remove-item", item);
        })
        .catch(() => {
          // 取消操作
        });
    },

    // 格式化價格
    formatPrice(price) {
      return price.toFixed(2);
    },

    // 去購物
    goToShopping() {
      this.$router.push("/staffshopping");
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
$card-border-radius: 12px;
$box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
$card-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
$transition: all 0.3s ease;

// 字體大小
$font-size-xs: 12px;
$font-size-s: 14px;
$font-size-base: 16px;
$font-size-lg: 18px;
$font-size-xl: 20px;

// 間距
$spacing-xs: 4px;
$spacing-s: 8px;
$spacing-m: 16px;
$spacing-l: 24px;
$spacing-xl: 32px;

.cart-confirmation {
  width: 100%;
}

.section-title {
  font-size: $font-size-xl;
  color: #303133;
  margin: 0 0 $spacing-l;
  padding-bottom: $spacing-m;
  border-bottom: 1px solid #f0f0f0;
}

// 購物車容器（有限高度加卷軸）
.cart-container {
  margin-bottom: $spacing-l;
  background-color: #fff;
  border-radius: $card-border-radius;
  box-shadow: $card-shadow;
  overflow: hidden;
}

.cart-list {
  width: 100%;
  max-height: 480px;
  overflow-y: auto;
  padding: $spacing-m;
}

.cart-header {
  display: flex;
  align-items: center;
  background-color: #f5f7fa;
  padding: $spacing-m;
  font-weight: 500;
  color: #606266;
  border-radius: $border-radius $border-radius 0 0;
  margin-bottom: $spacing-m;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-item {
  text-align: center;
}

.header-product {
  flex: 3;
  text-align: left;
}

.header-price,
.header-quantity,
.header-total,
.header-action {
  flex: 1;
}

// 商品卡片列表
.item-cards {
  display: flex;
  flex-direction: column;
  gap: $spacing-m;
}

.cart-item-card {
  background-color: #fff;
  border-radius: $border-radius;
  border: 1px solid #ebeef5;
  overflow: hidden;
  transition: $transition;

  &:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
}

// 桌面版商品佈局
.desktop-layout {
  display: flex;
  align-items: center;
  padding: $spacing-m;
}

.item-product {
  flex: 3;
  display: flex;
  align-items: center;
}

.item-image {
  width: 80px;
  height: 80px;
  overflow: hidden;
  border-radius: 4px;
  margin-right: $spacing-m;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.item-info {
  overflow: hidden;
  flex-grow: 1;
}

.item-name {
  font-size: $font-size-base;
  color: #303133;
  margin-bottom: $spacing-s;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

.item-activity {
  font-size: $font-size-s;
  color: $primary-color;
  background-color: rgba(24, 144, 255, 0.1);
  padding: 2px 6px;
  border-radius: 2px;
  display: inline-block;
}

.item-price,
.item-quantity,
.item-total,
.item-action {
  flex: 1;
  text-align: center;
}

.item-price,
.item-total {
  font-size: $font-size-base;
  font-weight: 500;
}

.item-price {
  color: #303133; // 黑色單價
}

.item-total {
  color: $danger-color; // 紅色小計
}

// 手機版商品佈局
.mobile-layout {
  display: none;
  padding: $spacing-m;
}

.mobile-row {
  display: flex;
  margin-bottom: $spacing-m;
}

.mobile-info {
  flex-grow: 1;
  margin-left: $spacing-m;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.mobile-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: $spacing-m;
  border-top: 1px dashed #ebeef5;
}

.quantity-control {
  display: flex;
  align-items: center;

  .control-label {
    margin-right: $spacing-s;
    color: #606266;
  }
}

.price-total {
  font-weight: 500;

  .total-label {
    color: #606266;
    margin-right: $spacing-s;
  }

  .total-value {
    color: $danger-color;
    font-size: $font-size-lg;
  }
}

// 空購物車提示
.empty-cart {
  padding: $spacing-xl 0;
  text-align: center;
}

// 訂單摘要卡片
.order-summary-card {
  background-color: #fff;
  border-radius: $card-border-radius;
  padding: $spacing-l;
  margin-bottom: $spacing-l;
  box-shadow: $card-shadow;
}

.summary-title {
  font-size: $font-size-lg;
  font-weight: 500;
  margin-bottom: $spacing-l;
  color: #303133;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: $spacing-m;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: $spacing-m;
  font-size: $font-size-base;

  .price {
    color: $danger-color;
  }
}

.total-row {
  margin-top: $spacing-m;
  padding-top: $spacing-m;
  border-top: 1px dashed #ebeef5;
  font-weight: 500;

  .total-price {
    color: $danger-color;
    font-size: $font-size-xl;
  }
}

// 備註信息卡片
.order-notes-card {
  background-color: #fff;
  border-radius: $card-border-radius;
  padding: $spacing-l;
  margin-bottom: $spacing-l;
  box-shadow: $card-shadow;
}

.notes-title {
  font-size: $font-size-lg;
  font-weight: 500;
  margin-bottom: $spacing-l;
  color: #303133;
}

// 只在桌面顯示的元素
.desktop-only {
  display: flex;
}

.mobile-price {
  color: #303133; // 確保手機版單價也是黑色
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }

  .desktop-layout {
    display: none;
  }

  .mobile-layout {
    display: block;
  }

  .section-title {
    font-size: $font-size-lg;
    margin-bottom: $spacing-m;
  }

  .cart-list {
    padding: $spacing-s;
    max-height: 420px;
  }

  .item-cards {
    gap: $spacing-s;
  }

  .cart-item-card {
    margin-bottom: 0;
  }

  .mobile-row {
    display: flex;
    align-items: center;
  }

  .item-image {
    width: 80px;
    height: 80px;
    margin-right: $spacing-m;
    flex-shrink: 0;
  }

  .mobile-info {
    flex: 1;
  }

  .mobile-actions {
    flex-wrap: wrap;
    justify-content: space-between;
    gap: $spacing-m;
    margin-top: $spacing-m;
    padding-left: 80px + $spacing-m; // 與圖片對齊
  }

  .quantity-control {
    flex: 1;
  }

  .remove-btn {
    margin-top: 0;
    text-align: right;
  }

  .order-summary-card,
  .order-notes-card {
    padding: $spacing-m;
  }

  .summary-title,
  .notes-title {
    font-size: $font-size-base;
    padding-bottom: $spacing-s;
    margin-bottom: $spacing-m;
  }

  .summary-row {
    font-size: $font-size-s;
  }

  .total-row .total-price {
    font-size: $font-size-lg;
  }
}

@media (max-width: 480px) {
  .mobile-row {
    display: flex;
    flex-direction: row; // 保持水平佈局
    align-items: center;
  }

  .item-image {
    width: 70px;
    height: 70px;
    margin-right: $spacing-m;
    margin-bottom: 0;
  }

  .mobile-info {
    margin-left: 0;
    flex: 1;
  }

  .mobile-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-s;
    padding-left: 70px + $spacing-m; // 與圖片對齊
  }

  .quantity-control,
  .remove-btn {
    width: auto;
    margin-top: 0;
  }

  .price-total {
    display: none; /* 在極小屏幕上也隱藏小計 */
  }

  .remove-btn {
    margin-top: $spacing-m;
  }

  .cart-list {
    max-height: 380px;
  }
}
</style>
