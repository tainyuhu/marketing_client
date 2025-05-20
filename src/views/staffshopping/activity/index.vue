<template>
  <div class="activity-detail-container">
    <!-- 返回按鈕 -->
    <div class="back-btn">
      <el-button icon="el-icon-arrow-left" @click="goBack">返回列表</el-button>
    </div>

    <!-- 主內容區 -->
    <div v-if="loading">
      <el-skeleton :rows="6" animated />
    </div>

    <div v-else-if="activity" class="activity-content">
      <!-- 活動頭部信息 -->
      <div class="activity-header">
        <h1 class="activity-title">{{ activity.name }}</h1>

        <div class="activity-status">
          <el-tag v-if="activity.remainingDays <= 3" type="danger" size="small">
            剩餘 {{ activity.remainingDays }} 天
          </el-tag>
        </div>
      </div>

      <!-- 活動圖片 -->
      <div class="activity-image">
        <img :src="activity.imageUrl" :alt="activity.name" />
      </div>

      <!-- 活動進度 -->
      <div class="activity-progress">
        <div class="progress-header">
          <span>活動進度: {{ activity.progress }}%</span>
          <span
            >{{ formatDate(activity.startDate) }} ~
            {{ formatDate(activity.endDate) }}</span
          >
        </div>
        <el-progress
          :percentage="activity.progress"
          :color="getProgressColor(activity.progress)"
          :stroke-width="8"
        />
      </div>

      <!-- 活動詳情和規則直接顯示 -->
      <div class="activity-info-section">
        <div class="info-section">
          <h2 class="section-title">活動詳情</h2>
          <div v-html="activity.detailHtml" class="details-content"></div>
        </div>

        <div class="info-section">
          <h2 class="section-title">活動規則</h2>
          <div v-html="activity.rulesHtml" class="rules-content"></div>
        </div>
      </div>

      <!-- 商品列表標題 -->
      <h2 class="section-title products-title">活動商品</h2>

      <!-- 商品列表 -->
      <div class="product-list">
        <div
          v-for="product in products"
          :key="product.id"
          class="product-card"
          @click="goToProductDetail(product.product)"
        >
          <div class="product-image">
            <img :src="product.image_url" :alt="product.name" loading="lazy" />
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <div class="product-price">
              <span class="current-price"
                >NT${{ formatPrice(product.price) }}</span
              >
              <span
                class="original-price"
                v-if="product.originalPrice > product.price"
              >
                NT${{ formatPrice(product.originalPrice) }}
              </span>
            </div>

            <!-- 數量選擇器 - 點擊時阻止冒泡以避免導航到產品詳情頁 -->
            <div class="quantity-control" @click.stop>
              <div class="quantity-label">數量：</div>
              <el-input-number
                v-model="productQuantities[product.id]"
                :min="0"
                :max="product.stock"
                :disabled="product.stock <= 0"
                size="mini"
                @change="
                  val => validateQuantity(product.id, val, product.stock)
                "
              ></el-input-number>
            </div>

            <el-button
              type="primary"
              size="small"
              class="order-btn"
              @click.stop="addToCart(product)"
              :disabled="
                product.stock <= 0 || productQuantities[product.id] <= 0
              "
            >
              <span v-if="product.stock <= 0">已售罄</span>
              <span v-else-if="productQuantities[product.id] <= 0"
                >請選擇數量</span
              >
              <span v-else>加入購物車</span>
            </el-button>
          </div>
        </div>

        <div v-if="products.length === 0" class="empty-tip">
          <el-empty description="暫無商品" />
        </div>
      </div>

      <!-- 加載更多 -->
      <div class="load-more" v-if="hasMoreProducts">
        <el-button
          type="primary"
          plain
          @click="loadMoreProducts"
          :loading="loadingProducts"
        >
          查看更多商品
        </el-button>
      </div>
    </div>

    <!-- 錯誤信息 -->
    <div v-else-if="error" class="error-message">
      <el-result icon="error" title="加載失敗" :sub-title="error.message">
        <template #extra>
          <el-button type="primary" @click="fetchActivityDetail"
            >重試</el-button
          >
          <el-button @click="goBack">返回列表</el-button>
        </template>
      </el-result>
    </div>

    <!-- 購物車浮窗 -->
    <div class="cart-float" v-if="cartCount > 0" @click="openCart">
      <el-badge :value="cartCount" class="cart-badge">
        <i class="el-icon-shopping-cart-2"></i>
      </el-badge>
      <span>購物車</span>
    </div>

    <!-- 購物車抽屜組件 -->
    <shopping-cart-drawer
      :visible.sync="cartVisible"
      @update:count="updateCartCount"
    />
  </div>
</template>

<script>
import Services from "../services/Services.js";
import { formatDate, getProgressColor } from "@/utils/format";
import ShoppingCartDrawer from "./components/ShoppingCartDrawer.vue";

export default {
  name: "ActivityDetail",

  components: {
    ShoppingCartDrawer
  },

  data() {
    return {
      activityId: null,
      activity: null,
      loading: true,
      error: null,
      products: [],
      hasMoreProducts: false,
      loadingProducts: false,
      productPage: 1,
      productLimit: 8,
      cartCount: 0,
      cartVisible: false,
      productQuantities: {} // 用於存儲每個產品的數量
    };
  },

  created() {
    this.activityId = this.$route.params.id;
    this.fetchActivityDetail();
    this.getCartCount();
  },

  methods: {
    // 獲取活動詳情
    async fetchActivityDetail() {
      this.loading = true;
      this.error = null;

      try {
        const response = await Services.getActivityDetailWithPromotion(
          this.activityId
        );
        this.activity = response.data;
        this.loadProducts(); // 活動資料載入完成後開始載入商品
      } catch (error) {
        this.error = error;
        console.error("Failed to fetch activity detail", error);
      } finally {
        this.loading = false;
      }
    },

    // 載入商品 - 使用分頁API
    async loadProducts() {
      if (this.loadingProducts) return;

      this.loadingProducts = true;
      try {
        const response = await Services.getActivityProducts({
          activityId: this.activityId,
          page: this.productPage,
          limit: this.productLimit
        });

        // 確保欄位映射正確
        const newProducts = response.data.map(p => ({
          id: p.id || p.product, // 根據API返回格式可能需要調整
          name: p.product_name,
          price: parseFloat(p.price || 0),
          originalPrice: parseFloat(p.original_price || 0),
          image_url: p.main_image_url,
          stock: p.stock,
          product: p.product
        }));

        // 添加到現有產品列表
        this.products = [...this.products, ...newProducts];

        // 為新載入的產品設置默認數量為0
        newProducts.forEach(product => {
          if (!this.productQuantities[product.id]) {
            this.$set(this.productQuantities, product.id, 0);
          }
        });

        this.hasMoreProducts = response.hasMore;
        this.productPage += 1;
      } catch (error) {
        this.$message.error("獲取商品列表失敗");
        console.error("Failed to fetch products", error);
      } finally {
        this.loadingProducts = false;
      }
    },

    // 載入更多商品
    loadMoreProducts() {
      this.loadProducts();
    },

    // 驗證數量不超過庫存
    validateQuantity(productId, value, maxStock) {
      if (value > maxStock) {
        this.$set(this.productQuantities, productId, maxStock);
        this.$message.warning(`此商品庫存僅剩 ${maxStock} 件`);
      }
    },

    // 添加到購物車
    async addToCart(product) {
      const quantity = this.productQuantities[product.id];

      // 檢查數量
      if (!quantity || quantity <= 0) {
        this.$message.warning("請選擇購買數量");
        return;
      }

      // 檢查庫存
      if (quantity > product.stock) {
        this.$message.warning(`庫存不足，僅剩 ${product.stock} 件`);
        this.$set(this.productQuantities, product.id, product.stock);
        return;
      }

      try {
        const params = {
          productId: product.product,
          quantity: quantity,
          activityId: this.activityId
        };
        await Services.addToCart(params);
        this.$message.success(`已加入購物車 (${quantity} 件)`);
        this.cartCount += quantity;

        // 加入購物車後重置數量為0
        this.$set(this.productQuantities, product.id, 0);
      } catch (error) {
        this.$message.error("添加失敗，請稍後再試");
        console.error("Failed to add to cart", error);
      }
    },

    // 獲取購物車數量
    async getCartCount() {
      try {
        const response = await Services.getCartCount();
        this.cartCount = response.data.count;
      } catch (error) {
        console.error("Failed to get cart count", error);
      }
    },

    // 打開購物車抽屜
    openCart() {
      this.cartVisible = true;
    },

    // 更新購物車數量
    updateCartCount(count) {
      this.cartCount = count;
    },

    // 返回列表
    goBack() {
      this.$router.push("/staffshopping");
    },

    // 前往產品詳情頁
    goToProductDetail(productId) {
      this.$router.push(`/staffshopping/product/${productId}`);
    },

    // 格式化價格
    formatPrice(price) {
      const value = parseFloat(price);
      return isNaN(value) ? "0.00" : value.toFixed(2);
    },

    // 使用工具函數
    formatDate,
    getProgressColor
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
$font-size-xl: 24px;

.activity-detail-container {
  width: 100%;
  margin: 0 auto;
  padding: 16px;
  position: relative;
  background-color: #f7f8fa;
  min-height: 100vh;
}

.back-btn {
  margin-bottom: 16px;
}

/* 活動內容卡片樣式 */
.activity-content {
  background-color: #fff;
  border-radius: $border-radius;
  box-shadow: $box-shadow;
  overflow: hidden;
  margin-bottom: 24px;
  width: 100%;
}

/* 活動標題區域 */
.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(
    to right,
    lighten($primary-color, 25%),
    lighten($primary-color, 35%)
  );
}

.activity-title {
  font-size: $font-size-lg;
  margin: 0;
  color: darken($primary-color, 15%);
  font-weight: 600;
}

/* 活動圖片 */
.activity-image {
  width: 100%;
  overflow: hidden;
}

.activity-image img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

/* 活動進度 */
.activity-progress {
  padding: 16px 20px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #606266;
  font-size: $font-size-s;
}

/* 活動詳情和規則區域 */
.activity-info-section {
  padding: 0 20px;
}

.section-title {
  font-size: $font-size-base;
  color: #303133;
  margin: 20px 0 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
  position: relative;
  font-weight: 600;
}

.section-title::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 40px;
  height: 2px;
  background-color: $primary-color;
}

.products-title {
  padding: 0 20px;
  margin-top: 30px;
}

.info-section {
  margin-bottom: 20px;
}

.details-content,
.rules-content {
  line-height: 1.6;
  color: #303133;
  font-size: $font-size-s;
}

/* 商品列表 */
.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  padding: 0 20px 20px;
  width: 100%;
}

.product-card {
  border-radius: $border-radius;
  overflow: hidden;
  box-shadow: $box-shadow;
  transition: $transition;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.03);
  cursor: pointer; /* 添加指針游標來提示可點擊 */
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.product-image {
  height: 0;
  padding-bottom: 100%;
  position: relative;
  overflow: hidden;
}

.product-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-info {
  padding: 12px;
}

.product-name {
  font-size: $font-size-s;
  margin: 0 0 10px;
  height: 40px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #303133;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.current-price {
  color: $danger-color;
  font-size: $font-size-base;
  font-weight: 500;
}

.original-price {
  color: #909399;
  font-size: $font-size-s;
  text-decoration: line-through;
}

/* 數量控制區 */
.quantity-control {
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  .quantity-label {
    font-size: $font-size-s;
    color: #606266;
    margin-right: 8px;
  }

  ::v-deep .el-input-number {
    width: 100%;
    line-height: 1;

    .el-input__inner {
      padding-left: 5px;
      padding-right: 5px;
      text-align: center;
    }

    .el-input-number__decrease,
    .el-input-number__increase {
      width: 24px;
      height: 24px;
      line-height: 22px;
    }
  }
}

.order-btn {
  width: 100%;
  border-radius: 20px;
}

.load-more {
  text-align: center;
  margin: 20px 0 30px;
}

.empty-tip {
  grid-column: 1 / -1;
  padding: 40px 0;
}

/* 購物車浮窗 */
.cart-float {
  position: fixed;
  right: 20px;
  bottom: 20px;
  background: $primary-color;
  color: white;
  padding: 10px 18px;
  border-radius: 24px;
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  z-index: 99;
  transition: $transition;
}

.cart-float:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.4);
}

.cart-float i {
  font-size: 20px;
}

/* 錯誤信息 */
.error-message {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-radius: $border-radius;
  box-shadow: $box-shadow;
  padding: 20px;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .activity-detail-container {
    padding: 12px;
  }

  .section-title {
    font-size: $font-size-base;
    padding-bottom: 8px;
  }

  .activity-info-section {
    padding: 0 16px;
  }

  .product-list {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
    padding: 0 16px 16px;
  }

  .products-title {
    padding: 0 16px;
  }

  /* 數量控制區調整 */
  .quantity-control {
    flex-wrap: wrap;

    .quantity-label {
      width: 100%;
      margin-bottom: 4px;
    }

    ::v-deep .el-input-number {
      width: 100%;
    }
  }
}

@media (max-width: 480px) {
  .activity-detail-container {
    padding: 10px;
  }

  .activity-header {
    padding: 12px 16px;
  }

  .activity-title {
    font-size: $font-size-base;
  }

  .section-title {
    font-size: $font-size-s;
    margin: 16px 0 12px;
  }

  .progress-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .product-list {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding: 0 12px 12px;
  }

  .product-name {
    font-size: $font-size-s;
    height: 36px;
    margin-bottom: 6px;
  }

  .product-info {
    padding: 8px;
  }

  .current-price {
    font-size: $font-size-s;
  }

  .original-price {
    font-size: 12px;
  }

  .products-title {
    padding: 0 12px;
    margin-top: 20px;
  }

  .order-btn {
    padding: 6px 0;
    font-size: 12px;
  }

  .activity-progress {
    padding: 12px 16px;
  }

  .activity-info-section {
    padding: 0 12px;
  }
}
</style>
