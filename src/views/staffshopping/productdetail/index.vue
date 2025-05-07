<template>
  <div class="product-detail-container">
    <!-- 返回按鈕 -->
    <div class="back-btn">
      <el-button icon="el-icon-arrow-left" @click="goBack">返回列表</el-button>
    </div>

    <!-- 主內容區 -->
    <div v-if="loading">
      <el-skeleton :rows="10" animated />
    </div>

    <div v-else-if="product" class="product-content">
      <div class="product-main">
        <!-- 頂部產品信息區 -->
        <div class="product-top-section">
          <!-- 產品圖片區 -->
          <product-gallery
            :product="product"
            :images="product.images || []"
            :main-image="product.main_image_url"
          />

          <!-- 產品資訊區 -->
          <product-info
            :product="product"
            @add-to-cart="addToCart"
            @go-to-activity="goToActivity"
          />
        </div>

        <!-- 產品詳細內容標籤頁 -->
        <product-tabs :product="product" />

        <!-- 將來放相關產品的位置 -->
        <div class="related-products-container" v-if="false">
          <!-- 相關產品組件將來放這裡 -->
        </div>
      </div>
    </div>

    <!-- 錯誤信息 -->
    <div v-else-if="error" class="error-message">
      <el-result icon="error" title="加載失敗" :sub-title="error.message">
        <template #extra>
          <el-button type="primary" @click="fetchProductDetail">重試</el-button>
          <el-button @click="goBack">返回列表</el-button>
        </template>
      </el-result>
    </div>

    <!-- 購物車浮窗 -->
    <div class="cart-float" v-if="cartCount > 0" @click="openCart">
      <el-badge :value="cartCount" class="cart-badge">
        <i class="el-icon-shopping-cart-2"></i>
      </el-badge>
      <span>去結算</span>
    </div>

    <!-- 購物車抽屜組件 -->
    <shopping-cart-drawer
      :visible.sync="cartVisible"
      @update:count="updateCartCount"
    />
  </div>
</template>

<script>
import Services from "@/views/staffshopping/services/Services.js";
import ShoppingCartDrawer from "@/views/staffshopping/activity/components/ShoppingCartDrawer.vue";
import ProductGallery from "./components/ProductGallery.vue";
import ProductInfo from "./components/ProductInfo.vue";
import ProductTabs from "./components/ProductTabs.vue";

export default {
  name: "ProductDetail",

  components: {
    ShoppingCartDrawer,
    ProductGallery,
    ProductInfo,
    ProductTabs
  },

  data() {
    return {
      productId: null,
      product: null,
      loading: true,
      error: null,
      cartCount: 0,
      cartVisible: false
    };
  },

  created() {
    this.productId = this.$route.params.id;
    this.fetchProductDetail();
    this.getCartCount();
  },

  methods: {
    // 獲取商品詳情
    async fetchProductDetail() {
      this.loading = true;
      this.error = null;

      try {
        const response = await Services.getProductDetail(this.productId);
        console.log("API Response:", response);
        // 數據結構適配
        this.product = response.data || response; // 根據實際API響應結構調整
      } catch (error) {
        this.error = error;
        console.error("Failed to fetch product detail", error);
      } finally {
        this.loading = false;
      }
    },

    // 添加到購物車
    async addToCart(quantity) {
      if (!this.product || !this.checkStock()) {
        this.$message.warning("商品庫存不足");
        return;
      }

      try {
        const params = {
          productId: this.product.id,
          quantity: quantity,
          activityId: this.product.activity_id
        };
        await Services.addToCart(params);
        this.$message.success("已加入購物車");
        this.cartCount += quantity;
      } catch (error) {
        this.$message.error("添加失敗，請稍後再試");
        console.error("Failed to add to cart", error);
      }
    },

    // 檢查庫存
    checkStock() {
      if (!this.product) return false;

      // 直接使用API返回的庫存數據
      return this.product.has_stock && this.product.stock > 0;
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
      this.$router.go(-1);
    },

    // 前往活動頁面
    goToActivity(activityId) {
      if (activityId) {
        this.$router.push(`/staffshopping/activity/${activityId}`);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
// 變量定義
$primary-color: #1890ff;
$success-color: #52c41a;
$border-radius: 8px;
$box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
$transition: all 0.3s ease;

.product-detail-container {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 20px 16px;
  background-color: #f7f8fa;
  min-height: 100vh;
}

.back-btn {
  margin-bottom: 16px;
}

/* 主內容區 */
.product-content {
  background-color: transparent;
  margin-bottom: 24px;
  width: 100%;
}

.product-main {
  width: 100%;
}

/* 頂部區塊 */
.product-top-section {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 24px;
  background-color: #fff;
  border-radius: $border-radius;
  box-shadow: $box-shadow;
  padding: 24px;
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
@media (max-width: 992px) {
  .product-top-section {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .product-detail-container {
    padding: 12px;
  }

  .product-top-section {
    flex-direction: column;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .product-detail-container {
    padding: 8px;
  }
}
</style>
