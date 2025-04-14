<template>
  <div class="shop-layout">
    <!-- 商城導航欄 -->
    <shop-navbar
      :logo-url="logoUrl"
      :title="title"
      :cart-count="cartCount"
      :contact-info="contactInfo"
      :show-title="false"
      @search="handleSearch"
      @open-cart="openShoppingCart"
    />
    <!-- 主內容區域 -->
    <div class="main-content">
      <app-main />
    </div>
    <!-- 底層欄 -->
    <shop-footer
      :logo-url="logoUrl"
      :company-name="title"
      :contact-info="contactInfo"
      :is-fixed="false"
      :show-back-to-top="true"
    />
    <!-- 購物車抽屜組件 -->
    <shopping-cart-drawer
      :visible.sync="cartVisible"
      @update:count="updateCartCount"
    />
  </div>
</template>

<script>
import { AppMain } from "@/layout/components";
import ShopNavbar from "@/layout/components/ShopNavbar.vue";
import ShopFooter from "@/layout/components/ShopFooter.vue";
import ShoppingCartDrawer from "@/views/staffshopping/activity/components/ShoppingCartDrawer.vue";

export default {
  name: "ShopLayout",
  components: {
    AppMain,
    ShopNavbar,
    ShopFooter,
    ShoppingCartDrawer
  },
  data() {
    return {
      logoUrl: require("@/assets/logo/sunny_logo.png"),
      title: "企業員工專屬團購平台",
      cartCount: 0,
      cartVisible: false,
      contactInfo: {
        phone: "0800-123-456",
        email: "service@example.com",
        workHours: "週一至週五 9:00-18:00"
      }
    };
  },
  created() {
    // 獲取購物車數量
    this.getCartCount();
  },
  methods: {
    // 處理搜索
    handleSearch(query) {
      console.log("搜索查詢:", query);
      // 可以在這裡處理搜索邏輯，或者由路由處理
    },
    // 打開購物車抽屜
    openShoppingCart() {
      this.cartVisible = true;
    },
    // 更新購物車數量
    updateCartCount(count) {
      this.cartCount = count;
    },
    // 獲取購物車數量
    async getCartCount() {
      try {
        // 從您的服務調用中獲取購物車數量
        // const response = await Services.getCartCount();
        // this.cartCount = response.data.count;
        // 模擬數據
        this.cartCount = 5;
      } catch (error) {
        console.error("獲取購物車數量失敗:", error);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.shop-layout {
  position: relative;
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.main-content {
  padding-top: 60px; /* 與導航欄高度相匹配 */
  flex: 1 0 auto; /* 確保主內容區域可以伸展以填充空間 */
  min-height: calc(100vh - 60px - 60px); /* 減去底層欄的大致高度 */
}

@media (max-width: 768px) {
  .main-content {
    padding-top: 50px; /* 與手機版導航欄高度匹配 */
    min-height: calc(100vh - 50px - 50px); /* 手機版底層欄可能更高 */
  }
}
</style>
