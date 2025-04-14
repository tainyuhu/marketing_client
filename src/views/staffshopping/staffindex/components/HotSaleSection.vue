<template>
  <div v-if="hasActivities" class="hot-products-section">
    <!-- 區塊標題和倒計時 -->
    <div class="section-header">
      <div class="star-title">
        <i class="el-icon-star-on"></i>
        <h2>今日最熱銷</h2>
      </div>
      <div class="countdown">
        倒數
        <span class="time-block">{{ countdown.hours }}</span> :
        <span class="time-block">{{ countdown.minutes }}</span> :
        <span class="time-block">{{ countdown.seconds }}</span>
      </div>
    </div>

    <!-- 活動內容載入中 -->
    <div v-if="loading" class="hot-sale-loading">
      <el-skeleton animated :rows="1" />
      <div class="hot-sale-skeleton">
        <div class="skeleton-banner">
          <el-skeleton-item variant="image" style="height: 100%; width: 100%" />
        </div>
        <div class="skeleton-products">
          <el-skeleton animated v-for="i in 4" :key="i">
            <template #template>
              <div class="product-skeleton-item">
                <el-skeleton-item variant="image" style="height: 120px" />
                <div style="padding: 10px">
                  <el-skeleton-item variant="h3" style="width: 80%" />
                  <el-skeleton-item variant="text" style="margin-top: 10px" />
                  <div
                    style="display: flex; justify-content: space-between; margin-top: 10px"
                  >
                    <el-skeleton-item variant="text" style="width: 30%" />
                    <el-skeleton-item variant="text" style="width: 20%" />
                  </div>
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>
      </div>
    </div>

    <!-- 活動內容區 -->
    <div v-else class="hot-sale-content">
      <!-- 活動選擇器 (如果有多個活動) -->
      <div v-if="hotSaleActivities.length > 1" class="activity-selector">
        <el-radio-group v-model="currentActivityIndex" size="small">
          <el-radio-button
            v-for="(activity, index) in hotSaleActivities"
            :key="activity.id"
            :label="index"
          >
            {{ activity.name }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 左右布局容器 -->
      <div class="hot-sale-layout">
        <!-- 左側活動圖片 -->
        <div class="hot-sale-banner" @click="handleActivityClick">
          <img
            :src="currentActivity.bannerUrl"
            :alt="currentActivity.name"
            class="banner-image"
          />
        </div>

        <!-- 右側商品列表 -->
        <div class="hot-sale-products">
          <!-- 商品網格 (2x2) -->
          <div class="products-grid">
            <div
              v-for="product in displayProducts"
              :key="product.id"
              class="hot-product-card"
              @click="handleProductClick(product)"
            >
              <div class="product-image">
                <img
                  :src="product.imageUrl"
                  :alt="product.name"
                  loading="lazy"
                />
              </div>
              <div class="product-info">
                <h3 class="product-title">{{ product.name }}</h3>
                <div class="price-container">
                  <div class="current-price">
                    <span class="currency">$</span>
                    <span class="amount">{{
                      formatNumberWithCommas(product.price)
                    }}</span>
                  </div>
                  <div class="original-price" v-if="product.originalPrice">
                    <span
                      >${{
                        formatNumberWithCommas(product.originalPrice)
                      }}</span
                    >
                  </div>
                </div>
              </div>
              <div class="special-tag" v-if="product.specialTag">
                {{ product.specialTag }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HotSaleSection",

  props: {
    // 熱銷活動數據 (允許多個活動)
    hotSaleActivities: {
      type: Array,
      default: () => []
    },

    // 數據載入狀態
    loading: {
      type: Boolean,
      default: false
    },

    // 倒數計時
    countdown: {
      type: Object,
      default: () => ({
        hours: "00",
        minutes: "00",
        seconds: "00"
      })
    }
  },

  data() {
    return {
      currentActivityIndex: 0,
      defaultActivity: {
        id: null,
        name: "熱銷活動",
        bannerUrl: "",
        products: []
      }
    };
  },

  computed: {
    // 是否有活動可顯示
    hasActivities() {
      return this.hotSaleActivities && this.hotSaleActivities.length > 0;
    },

    // 當前選中的活動
    currentActivity() {
      if (!this.hasActivities) return this.defaultActivity;

      return (
        this.hotSaleActivities[this.currentActivityIndex] ||
        this.defaultActivity
      );
    },

    // 隨機選取4個商品進行顯示
    displayProducts() {
      if (
        !this.currentActivity.products ||
        this.currentActivity.products.length === 0
      ) {
        return [];
      }

      // 如果商品數量小於或等於4，直接返回所有商品
      if (this.currentActivity.products.length <= 4) {
        return this.currentActivity.products;
      }

      // 隨機選擇4個商品
      return this.getRandomProducts(this.currentActivity.products, 4);
    }
  },

  watch: {
    // 監聽活動變化
    currentActivityIndex() {
      // 如果活動改變，可能需要重新選擇商品
    },

    // 監聽活動數據變化
    hotSaleActivities() {
      this.currentActivityIndex = 0;
    }
  },

  methods: {
    // 隨機選擇指定數量的商品
    getRandomProducts(products, count) {
      // 複製商品陣列以避免修改原始陣列
      const shuffled = [...products];

      // 使用 Fisher-Yates 算法隨機排序
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // 返回前count個商品
      return shuffled.slice(0, count);
    },

    // 處理點擊活動
    handleActivityClick() {
      if (this.currentActivity.id) {
        this.$emit("activity-click", this.currentActivity.id);
      }
    },

    // 處理點擊商品
    handleProductClick(product) {
      this.$emit("product-click", product.id);
    },

    // 格式化數字（添加千位分隔符）
    formatNumberWithCommas(number) {
      if (!number) return "0";
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

/* 今日最熱銷區塊 */
.hot-products-section {
  margin-bottom: 30px;
  background: #fff;
  border-radius: $border-radius;
  box-shadow: $box-shadow;
  padding: 20px;
  overflow: hidden;
}

/* 區塊標題 */
.section-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.star-title {
  display: flex;
  align-items: center;
}

.star-title i {
  color: $warning-color;
  font-size: $font-size-xl;
  margin-right: 8px;
}

.star-title h2 {
  font-size: $font-size-xl;
  color: #303133;
  margin: 0;
  position: relative;
  font-weight: 600;
}

/* 倒計時 */
.countdown {
  display: flex;
  align-items: center;
  font-size: $font-size-base;
  color: #606266;
}

.time-block {
  display: inline-block;
  background-color: #000;
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  margin: 0 2px;
  min-width: 28px;
  text-align: center;
}

/* 活動選擇器 */
.activity-selector {
  margin-bottom: 15px;
  text-align: center;
}

/* 熱銷內容區 */
.hot-sale-content {
  position: relative;
}

/* 左右布局 */
.hot-sale-layout {
  display: flex;
  gap: 20px;
  margin-bottom: 10px; /* 減少底部間距，因為移除了查看更多按鈕 */
}

/* 左側活動圖片 */
.hot-sale-banner {
  flex: 1;
  border-radius: $border-radius;
  overflow: hidden;
  cursor: pointer;
  transition: $transition;
  height: 350px;
  min-width: 0;
}

.hot-sale-banner:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.hot-sale-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: $border-radius;
}

/* 右側商品列表 */
.hot-sale-products {
  flex: 1;
  position: relative;
  height: 350px;
  min-width: 0;
}

/* 商品網格 (2x2) */
.products-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 15px;
  height: 100%;
}

/* 商品卡片 */
.hot-product-card {
  position: relative;
  border-radius: $border-radius;
  overflow: hidden;
  background: #fff;
  box-shadow: $box-shadow;
  transition: $transition;
  display: flex;
  border: 1px solid rgba(0, 0, 0, 0.03);
  cursor: pointer;
}

.hot-product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.hot-product-card .product-image {
  width: 80px;
  height: 100%;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.hot-product-card .product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.hot-product-card:hover .product-image img {
  transform: scale(1.05);
}

.hot-product-card .product-info {
  padding: 8px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.hot-product-card .product-title {
  font-size: $font-size-s;
  margin: 0 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-height: 1.3;
  color: #303133;
  flex-grow: 1;
}

.hot-product-card .price-container {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 5px;
}

.hot-product-card .current-price {
  color: $danger-color;
  font-weight: 600;
  display: flex;
  align-items: baseline;
}

.hot-product-card .currency {
  font-size: $font-size-xs;
  margin-right: 2px;
}

.hot-product-card .amount {
  font-size: $font-size-base;
}

.hot-product-card .original-price {
  color: #909399;
  text-decoration: line-through;
  margin-left: 6px;
  font-size: $font-size-xs;
}

.hot-product-card .special-tag {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(255, 77, 79, 0.9);
  color: white;
  padding: 1px 6px;
  border-radius: 10px;
  font-size: $font-size-xs;
  z-index: 1;
}

/* 載入中骨架屏 */
.hot-sale-loading {
  min-height: 200px;
}

.hot-sale-skeleton {
  margin-top: 15px;
  display: flex;
  gap: 20px;
  height: 350px;
}

.skeleton-banner {
  flex: 1;
  border-radius: $border-radius;
  overflow: hidden;
}

.skeleton-products {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.product-skeleton-item {
  flex: 1;
  border-radius: $border-radius;
  overflow: hidden;
}

/* 響應式設計 */
@media (max-width: 992px) {
  .hot-sale-layout {
    flex-direction: column;
    height: auto;
  }

  .hot-sale-banner {
    height: 250px;
    width: 100%;
  }

  .hot-sale-products {
    height: 400px;
    width: 100%;
  }

  .products-grid {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .hot-products-section {
    padding: 15px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .countdown {
    margin-top: 10px;
  }

  .star-title h2 {
    font-size: $font-size-lg;
  }

  .star-title i {
    font-size: $font-size-lg;
  }

  .hot-sale-banner {
    height: 200px;
  }

  .hot-sale-products {
    height: 350px;
  }

  .hot-product-card .product-image {
    width: 70px;
  }
}

@media (max-width: 480px) {
  .hot-product-card {
    flex-direction: column;
  }

  .hot-product-card .product-image {
    width: 100%;
    height: 80px;
  }

  .hot-product-card .product-title {
    font-size: $font-size-xs;
  }

  .countdown {
    font-size: $font-size-s;
  }

  .time-block {
    min-width: 24px;
    padding: 1px 4px;
  }
}
</style>
