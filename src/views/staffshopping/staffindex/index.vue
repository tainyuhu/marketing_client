<template>
  <div class="staff-shopping-container">
    <!-- 頂部橫幅 -->
    <banner-component
      :bannerImageUrl="bannerImageUrl"
      :bannerImageDimensions="bannerImageDimensions"
      @validate-image="validateAndSetBannerImage"
    />

    <!-- 今日最熱銷區塊 -->
    <hot-sale-section
      :hotSaleActivities="hotSaleActivities"
      :loading="loadingHotSale"
      :countdown="countdown"
      @activity-click="viewActivityDetail"
    />

    <!-- 商品區塊 -->
    <products-section
      :products="products"
      :totalProducts="totalProducts"
      :loadingProducts="loadingProducts"
      :productPage="productPage"
      :productLimit="productLimit"
      :productActiveTab="productActiveTab"
      @tab-change="handleProductTabChange"
      @page-change="handleProductPageChange"
      @product-click="viewProductDetail"
      @add-to-cart="addToCart"
    />

    <!-- 活動區塊 -->
    <activities-section
      :activities="activities"
      :totalActivities="totalActivities"
      :loadingActivities="loadingActivities"
      :activityPage="activityPage"
      :activityLimit="activityLimit"
      @page-change="handleActivityPageChange"
      @activity-click="viewActivityDetail"
    />

    <!-- 購物車浮窗 -->
    <cart-float-button :cartCount="cartCount" @open-cart="openCart" />

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
import BannerComponent from "./components/BannerComponent.vue";
import HotSaleSection from "./components/HotSaleSection.vue";
import ProductsSection from "./components/ProductsSection.vue";
import ActivitiesSection from "./components/ActivitiesSection.vue";
import CartFloatButton from "./components/CartFloatButton.vue";
import ShoppingCartDrawer from "@/views/staffshopping/activity/components/ShoppingCartDrawer.vue";

export default {
  name: "StaffShoppingIndex",

  components: {
    BannerComponent,
    HotSaleSection,
    ProductsSection,
    ActivitiesSection,
    CartFloatButton,
    ShoppingCartDrawer
  },

  data() {
    return {
      // 橫幅圖片
      bannerImageUrl: null,
      bannerImageDimensions: {
        width: 1920,
        height: 800,
        aspectRatio: 21 / 9
      },

      // 今日最熱銷活動
      hotSaleActivity: {
        id: null,
        name: "",
        bannerUrl: "",
        products: []
      },

      // 添加活動數組給 HotSaleSection 使用
      hotSaleActivities: [],

      // 添加熱銷活動載入狀態
      loadingHotSale: false,

      // 倒計時
      countdown: {
        hours: "15",
        minutes: "13",
        seconds: "04"
      },
      countdownTimer: null,

      // 商品相關
      products: [],
      loadingProducts: false,
      productPage: 1,
      productLimit: 12,
      totalProducts: 0,
      productActiveTab: "all",

      // 活動相關
      activities: [],
      loadingActivities: false,
      activityPage: 1,
      activityLimit: 12,
      totalActivities: 0,

      // 購物車
      cartCount: 0,
      cartVisible: false
    };
  },

  created() {
    this.fetchHotSaleActivity();
    this.fetchProducts();
    this.fetchActivities();
    this.getCartCount();
    this.loadBannerImage();
    this.startCountdown();
  },

  beforeDestroy() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  },

  methods: {
    // 倒計時功能
    startCountdown() {
      this.countdownTimer = setInterval(() => {
        let seconds = parseInt(this.countdown.seconds);
        let minutes = parseInt(this.countdown.minutes);
        let hours = parseInt(this.countdown.hours);

        seconds--;

        if (seconds < 0) {
          seconds = 59;
          minutes--;

          if (minutes < 0) {
            minutes = 59;
            hours--;

            if (hours < 0) {
              // 重置為15小時
              hours = 15;
              minutes = 0;
              seconds = 0;
            }
          }
        }

        // 格式化為兩位數
        this.countdown.seconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
        this.countdown.minutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
        this.countdown.hours = hours < 10 ? `0${hours}` : `${hours}`;
      }, 1000);
    },

    // 獲取今日熱銷活動
    async fetchHotSaleActivity() {
      this.loadingHotSale = true;
      try {
        const response = await Services.getHotSaleActivity();
        if (response && response.data) {
          this.hotSaleActivity = {
            id: response.data.id,
            name: response.data.name,
            bannerUrl: response.data.bannerUrl,
            products: response.data.products || []
          };

          // 更新活動數組
          this.hotSaleActivities = [this.hotSaleActivity];
        }
      } catch (error) {
        console.error("獲取今日最熱銷活動失敗", error);
        this.$notify({
          title: "錯誤",
          message: "獲取熱銷活動失敗，請稍後再試",
          type: "error",
          position: "bottom-right"
        });
      } finally {
        this.loadingHotSale = false;
      }
    },

    // 獲取商品列表
    async fetchProducts() {
      if (this.loadingProducts) return;

      this.loadingProducts = true;

      try {
        const response = await Services.getProductList({
          page: this.productPage,
          limit: this.productLimit,
          type: this.productActiveTab !== "all" ? this.productActiveTab : null
        });

        this.products = response.data || [];
        this.totalProducts = response.total || 0;
      } catch (error) {
        this.$notify({
          title: "錯誤",
          message: "獲取商品列表失敗，請稍後再試",
          type: "error",
          position: "bottom-right"
        });
        console.error("獲取商品列表失敗", error);
      } finally {
        this.loadingProducts = false;
      }
    },

    // 處理商品分頁變更
    handleProductPageChange(page) {
      this.productPage = page;
      this.fetchProducts();
      window.scrollTo({
        top: document.querySelector(".products-section").offsetTop - 20,
        behavior: "smooth"
      });
    },

    // 處理商品標籤切換
    handleProductTabChange(tab) {
      this.productActiveTab = tab;
      this.productPage = 1;
      this.fetchProducts();
    },

    // 獲取活動列表
    async fetchActivities() {
      if (this.loadingActivities) return;

      this.loadingActivities = true;

      try {
        const response = await Services.getActivityList({
          page: this.activityPage,
          limit: this.activityLimit
        });

        this.activities = response.data || [];
        this.totalActivities = response.total || 0;
      } catch (error) {
        this.$notify({
          title: "錯誤",
          message: "獲取活動列表失敗，請稍後再試",
          type: "error",
          position: "bottom-right"
        });
        console.error("獲取活動列表失敗", error);
      } finally {
        this.loadingActivities = false;
      }
    },

    // 處理活動分頁變更
    handleActivityPageChange(page) {
      this.activityPage = page;
      this.fetchActivities();
      window.scrollTo({
        top: document.querySelector(".activities-section").offsetTop - 20,
        behavior: "smooth"
      });
    },

    // 加載橫幅圖片
    async loadBannerImage() {
      try {
        const response = await Services.getBannerImage();

        if (response && response.imageUrl) {
          this.validateAndSetBannerImage(response.imageUrl);
        }
      } catch (error) {
        console.error("獲取橫幅圖片失敗", error);
      }
    },

    // 驗證並設置橫幅圖片
    validateAndSetBannerImage(imageUrl) {
      const img = new Image();
      img.onload = () => {
        const imgAspectRatio = img.width / img.height;
        const targetAspectRatio = this.bannerImageDimensions.aspectRatio;

        const tolerance = 0.01;

        if (
          Math.abs(imgAspectRatio - targetAspectRatio) <= tolerance &&
          img.width >= this.bannerImageDimensions.width &&
          img.height >= this.bannerImageDimensions.height
        ) {
          this.bannerImageUrl = imageUrl;
        } else {
          console.warn("橫幅圖片不符合所需尺寸要求 (21:9 比例, 最小 1920×800)");
        }
      };

      img.onerror = () => {
        console.error("橫幅圖片載入失敗");
      };

      img.src = imageUrl;
    },

    // 添加到購物車
    async addToCart(product) {
      try {
        await Services.addToCart({
          productId: product.id,
          quantity: 1
        });

        this.$message.success("已加入購物車");
        this.cartCount += 1;
      } catch (error) {
        this.$message.error("添加失敗，請稍後再試");
        console.error("加入購物車失敗", error);
      }
    },

    // 獲取購物車數量
    async getCartCount() {
      try {
        const response = await Services.getCartCount();
        this.cartCount = response.data.count;
      } catch (error) {
        console.error("獲取購物車數量失敗", error);
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

    // 查看活動詳情
    viewActivityDetail(activityId) {
      this.$router.push(`/staffshopping/activity/${activityId}`);
    },

    // 查看商品詳情
    viewProductDetail(productId) {
      this.$router.push(`/staffshopping/product/${productId}`);
    },

    // 工具函數
    formatDate,
    getProgressColor
  }
};
</script>

<style lang="scss" scoped>
.staff-shopping-container {
  padding: 0 12px 24px;
  max-width: 1440px;
  margin: 0 auto;
  color: #303133;
  position: relative;
}

/* 回應式調整 */
@media (max-width: 768px) {
  .staff-shopping-container {
    padding: 0 10px 20px;
  }
}

@media (max-width: 480px) {
  .staff-shopping-container {
    padding: 0 8px 16px;
  }
}
</style>
