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

    <!-- 活動區塊 - 使用懒加载 -->
    <activities-section
      v-if="activitiesSectionVisible"
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

    <!-- 購物車抽屜組件 - 只在需要时渲染 -->
    <shopping-cart-drawer
      v-if="cartVisible"
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
// 懒加载次要组件
const ActivitiesSection = () => import("./components/ActivitiesSection.vue");
import CartFloatButton from "./components/CartFloatButton.vue";
// 懒加载购物车组件
const ShoppingCartDrawer = () =>
  import("@/views/staffshopping/activity/components/ShoppingCartDrawer.vue");

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
      cartVisible: false,

      // 懒加载控制
      activitiesSectionVisible: false,

      // 交叉观察器
      observer: null
    };
  },

  created() {
    // 优化数据加载顺序和优先级
    // 第一批：关键数据（并行加载）
    Promise.all([
      this.fetchHotSaleActivity(), // 热销活动（首屏必需）
      this.getCartCount(), // 购物车计数（用户可能立即需要）
      this.fetchProducts() // 商品数据（首屏必需）
    ])
      .then(() => {
        // 第二批：次要数据
        this.loadBannerImage();

        // 第三批：非关键数据（延迟加载）
        setTimeout(() => {
          this.startCountdown(); // 倒计时（非关键功能）
        }, 50);
      })
      .catch(error => {
        console.error("数据加载失败", error);
      });
  },

  mounted() {
    // 设置交叉观察器监听活动区域
    this.setupActivitiesSectionObserver();
  },

  beforeDestroy() {
    // 清理计时器
    if (this.countdownTimer) {
      cancelAnimationFrame(this.countdownTimer);
    }

    // 清理观察器
    if (this.observer) {
      this.observer.disconnect();
    }
  },

  methods: {
    // 设置活动区域的交叉观察器
    setupActivitiesSectionObserver() {
      // 如果浏览器支持交叉观察器API
      if ("IntersectionObserver" in window) {
        this.observer = new IntersectionObserver(
          entries => {
            // 当检测到活动区域即将进入视口
            if (entries[0].isIntersecting) {
              // 加载活动数据并显示活动区域
              this.activitiesSectionVisible = true;
              this.fetchActivities();

              // 观察完成后断开连接
              this.observer.disconnect();
              this.observer = null;
            }
          },
          {
            rootMargin: "200px", // 提前200px开始加载
            threshold: 0.1
          }
        );

        // 观察产品区域的末尾（作为触发点）
        const productsSection = document.querySelector(".products-section");
        if (productsSection) {
          this.observer.observe(productsSection);
        } else {
          // 如果找不到元素，则在DOM更新后重试
          this.$nextTick(() => {
            const productsSection = document.querySelector(".products-section");
            if (productsSection) {
              this.observer.observe(productsSection);
            } else {
              // 降级：直接显示活动区域
              this.activitiesSectionVisible = true;
              setTimeout(() => this.fetchActivities(), 500);
            }
          });
        }
      } else {
        // 降级：如果浏览器不支持，则延迟加载
        this.activitiesSectionVisible = true;
        setTimeout(() => this.fetchActivities(), 1000);
      }
    },

    // 优化倒计时功能，使用requestAnimationFrame代替setInterval
    startCountdown() {
      let lastTimestamp = performance.now();
      const tick = timestamp => {
        // 只有经过接近1秒时才更新，减少不必要的DOM更新
        if (timestamp - lastTimestamp >= 980) {
          // 略小于1秒，避免丢帧
          lastTimestamp = timestamp;

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
                hours = 15;
                minutes = 0;
                seconds = 0;
              }
            }
          }

          // 使用临时对象一次性更新，减少观察者触发次数
          const newCountdown = {
            seconds: seconds < 10 ? `0${seconds}` : `${seconds}`,
            minutes: minutes < 10 ? `0${minutes}` : `${minutes}`,
            hours: hours < 10 ? `0${hours}` : `${hours}`
          };

          // 一次性更新整个对象，只触发一次视图更新
          this.countdown = newCountdown;
        }

        this.countdownTimer = requestAnimationFrame(tick);
      };

      this.countdownTimer = requestAnimationFrame(tick);
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

    // 優化商品列表加載
    async fetchProducts() {
      if (this.loadingProducts) return;

      this.loadingProducts = true;

      try {
        const response = await Services.getProductListWithPricing({
          page: this.productPage,
          limit: this.productLimit,
          type: this.productActiveTab
        });

        // 使用更高效的數據處理
        if (response && response.data) {
          // 預分配數組大小以避免動態擴展
          const resultsLength = response.data.length;
          const results = new Array(resultsLength);

          // 手動循環處理數據
          for (let i = 0; i < resultsLength; i++) {
            const item = response.data[i];
            results[i] = {
              id: item.id,
              code: item.productCode,
              name: item.name,
              imageUrl: item.imageUrl,
              isPromotion: item.isPromotion,
              price: item.price,
              originalPrice: item.originalPrice,
              stock: item.stock
            };
          }

          // 一次性賦值，減少觀察者觸發
          this.products = results;
          this.totalProducts = response.total || 0;
        } else {
          this.products = [];
          this.totalProducts = 0;
        }
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

    // 處理商品分頁變更 - 優化滾動性能
    handleProductPageChange(page) {
      this.productPage = page;
      this.fetchProducts();

      // 使用更高效的滾動
      const element = document.querySelector(".products-section");
      if (element) {
        // 使用原生scrollIntoView (性能更好)
        element.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    },

    // 處理商品標籤切換
    handleProductTabChange(tab) {
      this.productActiveTab = tab;
      this.productPage = 1;
      this.fetchProducts();
    },

    // 獲取活動列表 - 已改为懒加载
    async fetchActivities() {
      if (this.loadingActivities) return;

      this.loadingActivities = true;

      try {
        const response = await Services.getProductPromotion({
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

      const element = document.querySelector(".activities-section");
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    },

    // 優化橫幅圖片加載 - 使用漸進式加載
    async loadBannerImage() {
      try {
        const response = await Services.getBannerImage();

        if (response && response.imageUrl) {
          // 直接設置一個佔位圖片然後再驗證
          this.validateAndSetBannerImage(response.imageUrl);
        }
      } catch (error) {
        console.error("獲取橫幅圖片失敗", error);
      }
    },

    // 驗證並設置橫幅圖片 - 添加超時處理
    validateAndSetBannerImage(imageUrl) {
      // 先设置一个低质量的占位图或缩略图（如果有）
      const placeholderUrl = imageUrl.replace("/original/", "/thumbnail/");
      if (placeholderUrl !== imageUrl) {
        this.bannerImageUrl = placeholderUrl;
      }

      const img = new Image();

      // 设置加载超时
      const timeout = setTimeout(() => {
        console.warn("橫幅圖片加載超時");
        // 如果已设置占位图，保持占位图
        if (!this.bannerImageUrl) {
          this.bannerImageUrl = placeholderUrl;
        }
      }, 3000);

      img.onload = () => {
        clearTimeout(timeout);

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
          // 保留占位图
          if (!this.bannerImageUrl) {
            this.bannerImageUrl = imageUrl; // 仍然使用原图如果没有更好的选择
          }
        }
      };

      img.onerror = () => {
        clearTimeout(timeout);
        console.error("橫幅圖片載入失敗");
        // 错误情况下仍使用占位图
        if (!this.bannerImageUrl) {
          this.bannerImageUrl = "/static/default-banner.jpg"; // 替换为实际的默认图路径
        }
      };

      img.src = imageUrl;
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
    getProgressColor,

    // 添加错误处理
    errorCaptured(err, vm, info) {
      console.error(`組件錯誤: ${err.toString()}\nInfo: ${info}`);
      // 防止错误向上传播
      return false;
    }
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
  contain: content; /* 使用CSS containment优化渲染 */
}

/* 优化CSS选择器性能 */
.staff-shopping-container > * {
  will-change: opacity, transform; /* 硬件加速，提高动画性能 */
  contain: layout style; /* 优化渲染性能 */
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

/* 添加骨架屏动画 */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
