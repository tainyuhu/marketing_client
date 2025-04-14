<template>
  <div class="product-info">
    <!-- 活動標籤 -->
    <div class="activity-tag" v-if="product.activityName">
      <el-tag type="success" effect="dark" @click="goToActivity">
        {{ product.activityName }}
      </el-tag>
    </div>

    <!-- 產品名稱與基本資訊 -->
    <h1 class="product-name">{{ product.name }}</h1>

    <div class="product-code">
      商品編號: {{ product.code || "P" + product.id }}
    </div>

    <!-- 價格資訊 -->
    <div class="price-section">
      <div class="current-price">NT$ {{ formatPrice(product.price) }}</div>
      <div
        class="original-price"
        v-if="product.originalPrice && product.originalPrice > product.price"
      >
        NT$ {{ formatPrice(product.originalPrice) }}
      </div>
      <div
        class="discount-tag"
        v-if="product.originalPrice && product.originalPrice > product.price"
      >
        {{ calculateDiscount(product.price, product.originalPrice) }}折
      </div>
    </div>

    <!-- 庫存資訊 -->
    <div class="stock-section">
      <span class="stock-label">庫存狀態:</span>
      <span
        class="stock-value"
        :class="{
          'low-stock': product.stock > 0 && product.stock <= 10,
          'out-of-stock': product.stock <= 0
        }"
      >
        {{
          product.stock > 0
            ? product.stock <= 10
              ? `僅剩 ${product.stock} 件`
              : "現貨"
            : "已售罄"
        }}
      </span>
    </div>

    <!-- 購買數量選擇 -->
    <div class="quantity-section">
      <span class="quantity-label">購買數量:</span>
      <el-input-number
        v-model="quantity"
        :min="1"
        :max="product.stock"
        :disabled="product.stock <= 0"
        size="small"
      ></el-input-number>
    </div>

    <!-- 購買按鈕 -->
    <div class="action-buttons">
      <el-button
        type="primary"
        :disabled="product.stock <= 0"
        @click="handleAddToCart"
        class="add-to-cart-btn"
      >
        <i class="el-icon-shopping-cart-2"></i>
        加入購物車
      </el-button>

      <el-button
        type="danger"
        :disabled="product.stock <= 0"
        @click="handleBuyNow"
        class="buy-now-btn"
      >
        立即購買
      </el-button>
    </div>

    <!-- 商品運送與服務資訊 -->
    <div class="service-info">
      <div class="service-item">
        <i class="el-icon-truck"></i>
        <span>全台配送</span>
      </div>
      <div class="service-item">
        <i class="el-icon-time"></i>
        <span>營業日3天內出貨</span>
      </div>
      <div class="service-item">
        <i class="el-icon-refresh-right"></i>
        <span>7天鑑賞期</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProductInfo",

  props: {
    product: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      quantity: 1
    };
  },

  watch: {
    // 當產品變更時，重設數量
    product() {
      this.quantity = 1;
    }
  },

  methods: {
    // 處理加入購物車
    handleAddToCart() {
      this.$emit("add-to-cart", this.quantity);
    },

    // 處理立即購買
    handleBuyNow() {
      this.$emit("buy-now", this.quantity);
    },

    // 前往活動頁面
    goToActivity() {
      if (this.product.activityId) {
        this.$emit("go-to-activity", this.product.activityId);
      }
    },

    // 格式化價格
    formatPrice(price) {
      return price.toFixed(0);
    },

    // 計算折扣
    calculateDiscount(currentPrice, originalPrice) {
      if (!originalPrice || originalPrice <= currentPrice) return 10;

      const discount = (currentPrice / originalPrice) * 10;
      return discount.toFixed(1);
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
$transition: all 0.3s ease;

// 字體大小
$font-size-s: 14px;
$font-size-base: 16px;
$font-size-lg: 18px;
$font-size-xl: 24px;
$font-size-xxl: 28px;

/* 產品資訊區 */
.product-info {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .activity-tag {
    margin-bottom: 8px;
    cursor: pointer;
    display: inline-block;
  }

  .product-name {
    font-size: $font-size-xl;
    color: #303133;
    margin: 0;
    font-weight: 600;
    line-height: 1.4;
  }

  .product-code {
    color: #909399;
    font-size: $font-size-s;
  }

  /* 價格區域 */
  .price-section {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin: 8px 0;

    .current-price {
      font-size: $font-size-xxl;
      color: $danger-color;
      font-weight: 600;
    }

    .original-price {
      color: #909399;
      font-size: $font-size-base;
      text-decoration: line-through;
    }

    .discount-tag {
      padding: 2px 8px;
      background-color: $danger-color;
      color: white;
      border-radius: 4px;
      font-size: $font-size-s;
    }
  }

  /* 庫存區域 */
  .stock-section {
    display: flex;
    align-items: center;
    gap: 8px;

    .stock-label {
      color: #606266;
    }

    .stock-value {
      color: $success-color;
      font-weight: 500;

      &.low-stock {
        color: $warning-color;
      }

      &.out-of-stock {
        color: $danger-color;
      }
    }
  }

  /* 數量選擇 */
  .quantity-section {
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 8px 0;

    .quantity-label {
      color: #606266;
    }
  }

  /* 按鈕區 */
  .action-buttons {
    display: flex;
    gap: 16px;
    margin: 16px 0;

    .add-to-cart-btn,
    .buy-now-btn {
      flex: 1;
      font-size: $font-size-base;
      padding: 12px 0;
      border-radius: 4px;

      i {
        margin-right: 4px;
      }
    }
  }

  /* 服務信息 */
  .service-info {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 8px;
    padding-top: 16px;
    border-top: 1px dashed #ebeef5;

    .service-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #606266;

      i {
        color: $primary-color;
      }
    }
  }
}

/* 響應式調整 */
@media (max-width: 992px) {
  .product-info {
    .product-name {
      font-size: $font-size-lg;
    }

    .price-section .current-price {
      font-size: $font-size-xl;
    }
  }
}

@media (max-width: 768px) {
  .product-info {
    min-width: 100%;
  }
}

@media (max-width: 480px) {
  .product-info {
    .product-name {
      font-size: $font-size-base;
    }

    .price-section {
      flex-wrap: wrap;

      .current-price {
        font-size: $font-size-lg;
      }
    }

    .action-buttons {
      flex-direction: column;
      gap: 8px;
    }

    .service-info {
      flex-direction: column;
      gap: 8px;
    }
  }
}
</style>
