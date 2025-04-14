<template>
  <div class="order-summary">
    <h2 class="section-title">訂單確認</h2>

    <el-alert
      title="請確認以下訂單信息無誤，提交後將無法修改訂單內容"
      type="info"
      :closable="false"
      show-icon
      style="margin-bottom: 20px"
    >
    </el-alert>

    <!-- 訂單摘要 -->
    <div class="summary-section">
      <div class="section-header">
        <h3>商品信息</h3>
      </div>

      <div class="section-content">
        <div class="product-list">
          <div v-for="item in cartItems" :key="item.id" class="product-item">
            <div class="product-image">
              <img :src="item.imageUrl" :alt="item.name" />
            </div>
            <div class="product-info">
              <div class="product-name">{{ item.name }}</div>
              <div class="product-meta">{{ item.activityName }}</div>
            </div>
            <div class="product-price">
              NT${{ formatPrice(item.price) }} x {{ item.quantity }}
            </div>
            <div class="product-total">
              NT${{ formatPrice(item.price * item.quantity) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 收貨地址 -->
    <div class="summary-section">
      <div class="section-header">
        <h3>收貨信息</h3>
      </div>

      <div class="section-content">
        <div class="address-info">
          <div class="info-row">
            <div class="info-label">收件人</div>
            <div class="info-value">{{ address.name }}</div>
          </div>
          <div class="info-row">
            <div class="info-label">聯絡電話</div>
            <div class="info-value">{{ address.phone }}</div>
          </div>
          <div class="info-row">
            <div class="info-label">收貨地址</div>
            <div class="info-value">{{ address.address }}</div>
          </div>
          <div class="info-row" v-if="address.postalCode">
            <div class="info-label">郵政編碼</div>
            <div class="info-value">{{ address.postalCode }}</div>
          </div>
          <div class="info-row" v-if="address.notes">
            <div class="info-label">配送備註</div>
            <div class="info-value">{{ address.notes }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 付款方式 -->
    <div class="summary-section">
      <div class="section-header">
        <h3>付款方式</h3>
      </div>

      <div class="section-content">
        <div class="payment-info">
          <div class="info-row">
            <div class="info-label">付款方式</div>
            <div class="info-value">銀行轉帳</div>
          </div>
          <div class="payment-tips">
            <i class="el-icon-info"></i>
            <span
              >訂單提交後，請根據提供的銀行賬戶信息進行轉帳，並在備註中填寫訂單編號。</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 金額明細 -->
    <div class="summary-section">
      <div class="section-header">
        <h3>金額明細</h3>
      </div>

      <div class="section-content">
        <div class="amount-info">
          <div class="amount-row">
            <div class="amount-label">商品總額</div>
            <div class="amount-value">NT${{ formatPrice(totalAmount) }}</div>
          </div>
          <div class="amount-row">
            <div class="amount-label">運費</div>
            <div class="amount-value">¥0.00</div>
          </div>
          <div class="amount-divider"></div>
          <div class="amount-row total">
            <div class="amount-label">應付款</div>
            <div class="amount-value">NT${{ formatPrice(totalAmount) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 提交前確認 -->
    <div class="confirm-container">
      <el-checkbox v-model="agreedToTerms"
        >我已閱讀並同意《購物協議》和《隱私政策》</el-checkbox
      >
    </div>
  </div>
</template>

<script>
export default {
  name: "OrderSummary",

  props: {
    cartItems: {
      type: Array,
      required: true
    },
    address: {
      type: Object,
      required: true
    },
    paymentMethod: {
      type: String,
      default: "bankTransfer"
    },
    totalAmount: {
      type: Number,
      required: true
    }
  },

  data() {
    return {
      agreedToTerms: false
    };
  },

  watch: {
    agreedToTerms(newVal) {
      this.$emit("update-agreement", newVal);
    }
  },

  methods: {
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
$font-size-s: 14px;
$font-size-base: 18px;
$font-size-lg: 20px;

.order-summary {
  width: 100%;
}

.section-title {
  font-size: $font-size-lg;
  color: #303133;
  margin: 0 0 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.summary-section {
  margin-bottom: 24px;
  border: 1px solid #ebeef5;
  border-radius: $border-radius;
  overflow: hidden;
}

.section-header {
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;

  h3 {
    margin: 0;
    font-size: $font-size-base;
    color: #303133;
    font-weight: 500;
  }
}

.section-content {
  padding: 16px;
  background-color: white;
}

// 商品列表樣式
.product-list {
  max-height: 300px;
  overflow-y: auto;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.product-image {
  width: 60px;
  height: 60px;
  overflow: hidden;
  border-radius: 4px;
  margin-right: 12px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.product-info {
  flex: 1;
  min-width: 0;
  margin-right: 16px;
}

.product-name {
  font-size: $font-size-base;
  color: #303133;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-meta {
  font-size: $font-size-s;
  color: #909399;
}

.product-price {
  width: 100px;
  text-align: center;
  color: #606266;
  font-size: $font-size-s;
}

.product-total {
  width: 100px;
  text-align: right;
  color: $danger-color;
  font-weight: 500;
}

// 地址信息樣式
.address-info,
.payment-info {
  .info-row {
    display: flex;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .info-label {
    width: 100px;
    color: #606266;
  }

  .info-value {
    flex: 1;
    color: #303133;
  }
}

.payment-tips {
  margin-top: 12px;
  background-color: #f8f8f8;
  padding: 12px;
  border-radius: 4px;
  display: flex;
  align-items: flex-start;

  i {
    color: $warning-color;
    margin-right: 8px;
    margin-top: 3px;
  }

  span {
    flex: 1;
    font-size: $font-size-s;
    line-height: 1.6;
    color: #606266;
  }
}

// 金額信息樣式
.amount-info {
  .amount-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    &.total {
      font-weight: 500;
      font-size: $font-size-base;

      .amount-value {
        color: $danger-color;
        font-size: $font-size-lg;
      }
    }
  }

  .amount-divider {
    height: 1px;
    background-color: #f0f0f0;
    margin: 12px 0;
  }
}

// 確認區域
.confirm-container {
  margin-top: 30px;
  text-align: center;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .product-item {
    flex-wrap: wrap;
  }

  .product-image {
    width: 50px;
    height: 50px;
  }

  .product-info {
    width: calc(100% - 62px);
    margin-right: 0;
  }

  .product-price,
  .product-total {
    margin-top: 8px;
    width: 50%;
    text-align: left;
  }

  .product-total {
    text-align: right;
  }

  .address-info,
  .payment-info {
    .info-row {
      flex-direction: column;
    }

    .info-label {
      width: 100%;
      margin-bottom: 4px;
      font-weight: 500;
    }
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: $font-size-base;
  }

  .section-header h3 {
    font-size: $font-size-s;
  }

  .section-content {
    padding: 12px;
  }

  .product-name {
    font-size: $font-size-s;
  }

  .amount-info .amount-row.total .amount-value {
    font-size: $font-size-base;
  }
}
</style>
