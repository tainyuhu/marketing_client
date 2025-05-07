<template>
  <div class="products-section">
    <!-- 區塊標題和標籤頁 -->
    <div class="section-header">
      <h2>商品專區</h2>
      <el-tabs v-model="activeTab" @tab-click="handleTabChange">
        <el-tab-pane label="全部商品" name="all"></el-tab-pane>
        <el-tab-pane label="活動商品" name="promotion"></el-tab-pane>
        <el-tab-pane label="常態商品" name="regular"></el-tab-pane>
      </el-tabs>
    </div>

    <!-- 商品網格 -->
    <div class="products-grid">
      <!-- 載入中狀態 -->
      <template v-if="loadingProducts && products.length === 0">
        <div
          v-for="i in 8"
          :key="`product-skeleton-${i}`"
          class="product-skeleton"
        >
          <el-skeleton animated>
            <template #template>
              <div class="skeleton-card">
                <el-skeleton-item
                  variant="image"
                  style="height: 160px"
                ></el-skeleton-item>
                <div style="padding: 12px">
                  <el-skeleton-item
                    variant="h3"
                    style="width: 80%"
                  ></el-skeleton-item>
                  <div
                    style="display: flex; justify-content: space-between; margin-top: 12px"
                  >
                    <el-skeleton-item
                      variant="text"
                      style="width: 30%"
                    ></el-skeleton-item>
                    <el-skeleton-item
                      variant="text"
                      style="width: 30%"
                    ></el-skeleton-item>
                  </div>
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>
      </template>

      <!-- 實際商品列表 -->
      <div
        v-for="product in products"
        :key="`product-${product.id}`"
        class="product-card"
        @click="viewProductDetail(product.id)"
      >
        <!-- 商品圖片 -->
        <div class="product-image">
          <img :src="product.imageUrl" :alt="product.name" loading="lazy" />

          <!-- 活動商品標籤 -->
          <div class="product-badge" v-if="product.isPromotion">
            <el-tag type="danger" effect="dark" size="mini">活動商品</el-tag>
          </div>
        </div>

        <!-- 商品內容 -->
        <div class="product-content">
          <h3 class="product-title">{{ product.name }}</h3>
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
        </div>
      </div>

      <!-- 空數據提示 -->
      <el-empty
        v-if="products.length === 0 && !loadingProducts"
        description="暫無商品"
        :image-size="120"
      >
        <template #description>
          <p>目前沒有符合條件的商品</p>
        </template>
      </el-empty>
    </div>

    <!-- 分頁器 -->
    <div class="pagination-container" v-show="totalProducts > 0">
      <el-pagination
        background
        layout="prev, pager, next"
        :current-page.sync="currentPage"
        :page-size="pageSize"
        :total="totalProducts"
        @current-change="handlePageChange"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProductsSection",

  props: {
    // 商品列表
    products: {
      type: Array,
      default: () => []
    },

    // 商品總數 (用於分頁)
    totalProducts: {
      type: Number,
      default: 0
    },

    // 載入中狀態
    loadingProducts: {
      type: Boolean,
      default: false
    },

    // 當前頁碼
    productPage: {
      type: Number,
      default: 1
    },

    // 每頁顯示數量
    productLimit: {
      type: Number,
      default: 12
    },

    // 活動商品標籤
    productActiveTab: {
      type: String,
      default: "all"
    }
  },

  data() {
    return {
      activeTab: this.productActiveTab,
      currentPage: this.productPage
    };
  },

  computed: {
    // 每頁商品數量
    pageSize() {
      return this.productLimit;
    }
  },

  watch: {
    // 監聽父組件傳入的標籤變化
    productActiveTab(newVal) {
      this.activeTab = newVal;
    },

    // 監聽父組件傳入的頁碼變化
    productPage(newVal) {
      this.currentPage = newVal;
    }
  },

  methods: {
    // 處理標籤切換
    handleTabChange(tab) {
      this.activeTab = tab.name;
      this.$emit("tab-change", tab.name);
    },

    // 處理分頁變化
    handlePageChange(page) {
      if (this.currentPage !== page) {
        this.currentPage = page;
        this.$emit("page-change", page);
      }
    },

    // 查看商品詳情
    viewProductDetail(productId) {
      this.$emit("product-click", productId);
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
$box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
$transition: all 0.3s ease;

// 字體大小
$font-size-xs: 12px;
$font-size-s: 14px;
$font-size-base: 16px;
$font-size-lg: 18px;
$font-size-xl: 22px;

/* 商品區塊 */
.products-section {
  margin-bottom: 30px;
  background: #fff;
  border-radius: $border-radius;
  box-shadow: $box-shadow;
  padding: 20px;
}

/* 區塊標題 */
.section-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.section-header h2 {
  font-size: $font-size-xl;
  color: #303133;
  margin: 0;
  position: relative;
  padding-left: 12px;
  font-weight: 600;
}

.section-header h2:before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background-color: $primary-color;
  border-radius: 2px;
}

/* 商品網格 */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
  min-height: 180px;
}

/* 商品卡片 */
.product-card {
  border-radius: $border-radius;
  overflow: hidden;
  background: white;
  box-shadow: $box-shadow;
  transition: $transition;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

/* 商品圖片 */
.product-image {
  position: relative;
  height: 0;
  padding-bottom: 100%;
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

/* 商品標籤 */
.product-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
}

/* 商品內容 */
.product-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.product-title {
  font-size: $font-size-s;
  margin: 0 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-height: 1.3;
  height: 2.6em;
}

/* 商品價格 */
.product-price {
  margin-bottom: 10px;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 5px;
}

.current-price {
  color: $danger-color;
  font-size: $font-size-base;
  font-weight: 600;
}

.original-price {
  color: #909399;
  font-size: $font-size-xs;
  text-decoration: line-through;
}

/* 購物車按鈕 */
.cart-btn {
  margin-top: auto;
  border-radius: 18px;
}

/* 骨架屏 */
.product-skeleton {
  border-radius: $border-radius;
  overflow: hidden;
  height: 280px;
}

.skeleton-card {
  border-radius: $border-radius;
  overflow: hidden;
  height: 100%;
}

/* 分頁容器 */
.pagination-container {
  text-align: center;
  margin-top: 20px;
}

/* 響應式調整 */
@media (max-width: 992px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .products-section {
    padding: 15px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .section-header .el-tabs {
    margin-top: 10px;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .section-header h2 {
    font-size: $font-size-lg;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .product-title {
    font-size: $font-size-s;
  }

  .current-price {
    font-size: $font-size-s;
  }

  .cart-btn {
    padding: 6px 0;
    font-size: 12px;
  }
}
</style>
