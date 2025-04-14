<template>
  <div class="shop-navbar" :class="{ 'navbar-scrolled': isScrolled }">
    <div class="container">
      <!-- Logo區域 -->
      <div class="navbar-logo" @click="goToHome">
        <img :src="resolvedLogoUrl" alt="商城Logo" class="logo-image" />
        <span v-if="showTitle" class="logo-title">{{ title }}</span>
      </div>

      <!-- 搜索區域 -->
      <div class="navbar-search">
        <div class="search-container">
          <i class="el-icon-search search-icon"></i>
          <input
            ref="searchInput"
            type="text"
            class="search-input"
            v-model="searchQuery"
            placeholder="搜索商品..."
            @keyup.enter="handleSearch"
          />
          <i
            v-if="searchQuery"
            class="el-icon-close clear-icon"
            @click="clearSearch"
          ></i>
        </div>
      </div>

      <!-- 右側功能區 -->
      <div class="navbar-actions">
        <!-- 購物車 -->
        <div class="navbar-cart" @click="openCart">
          <div class="cart-icon-wrapper">
            <i class="el-icon-shopping-cart-2"></i>
            <span
              v-if="cartCount > 0"
              class="cart-badge"
              :class="{ 'cart-updated': cartUpdated }"
              >{{ formatCartCount(cartCount) }}</span
            >
          </div>
        </div>

        <!-- 客服按鈕 -->
        <div class="navbar-service" @click="showContactInfo">
          <i class="el-icon-service"></i>
        </div>

        <!-- 用戶信息 (整合您現有的用戶頭像功能) -->
        <el-dropdown
          class="avatar-container"
          trigger="click"
          v-if="showUserInfo"
        >
          <div class="avatar-wrapper">
            <img
              :src="avatar + '?imageView2/1/w/80/h/80'"
              class="user-avatar"
            />
            <i class="el-icon-caret-bottom" />
          </div>
          <el-dropdown-menu slot="dropdown" class="user-dropdown">
            <router-link to="/">
              <el-dropdown-item>首頁</el-dropdown-item>
            </router-link>
            <router-link to="/staffshopping/orders">
              <el-dropdown-item>我的訂單</el-dropdown-item>
            </router-link>
            <router-link to="/changepassword">
              <el-dropdown-item divided>修改密碼</el-dropdown-item>
            </router-link>
            <el-dropdown-item divided @click.native="logout">
              <span style="display:block;">登出</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <!-- 手機版搜索區域 (固定在頂部下方) -->
    <div class="mobile-search-container">
      <div class="search-container">
        <i class="el-icon-search search-icon"></i>
        <input
          type="text"
          class="search-input"
          v-model="searchQuery"
          placeholder="搜索商品..."
          @keyup.enter="handleSearch"
        />
        <i
          v-if="searchQuery"
          class="el-icon-close clear-icon"
          @click="clearSearch"
        ></i>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
// Import default logo
import defaultLogo from "@/assets/logo/sunny_logo.png";

export default {
  name: "ShopNavbar",

  props: {
    // 商城Logo URL
    logoUrl: {
      type: String,
      default: ""
    },

    // 商城標題
    title: {
      type: String,
      default: "企業員工專屬團購平台"
    },

    // 購物車商品數量
    cartCount: {
      type: Number,
      default: 0
    },

    // 客服聯繫信息
    contactInfo: {
      type: Object,
      default: () => ({
        phone: "0800-123-456",
        email: "service@example.com",
        workHours: "週一至週五 9:00-18:00"
      })
    },

    // 是否顯示商城標題
    showTitle: {
      type: Boolean,
      default: false
    },

    // 是否顯示用戶信息
    showUserInfo: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      searchQuery: "", // 搜索查詢文本
      isScrolled: false, // 頁面滾動狀態
      cartUpdated: false, // 購物車更新狀態 (用於動畫)
      previousCartCount: 0, // 上一次的購物車數量
      isMobile: false, // 是否為手機版
      defaultLogo // 保存默認logo路徑
    };
  },

  computed: {
    ...mapGetters(["avatar", "name"]),

    // 解析logo URL
    resolvedLogoUrl() {
      // 如果提供了logoUrl prop，則使用它，否則使用默認logo
      return (
        this.logoUrl ||
        this.defaultLogo ||
        require("@/assets/logo/sunny_logo.png")
      );
    }
  },

  watch: {
    // 監視購物車數量變化，添加動畫效果
    cartCount(newVal, oldVal) {
      if (newVal > oldVal) {
        this.cartUpdated = true;
        setTimeout(() => {
          this.cartUpdated = false;
        }, 300);
      }
      this.previousCartCount = newVal;
    }
  },

  mounted() {
    // 監聽滾動事件
    window.addEventListener("scroll", this.handleScroll);

    // 監聽視窗大小變化，用於響應式設計
    window.addEventListener("resize", this.handleResize);

    // 初始化
    this.handleResize();
    this.previousCartCount = this.cartCount;

    // 如果logo加載失敗，可以嘗試使用備用logo
    this.handleLogoError();
  },

  beforeDestroy() {
    // 移除事件監聽
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.handleResize);
  },

  methods: {
    // 處理logo載入錯誤
    handleLogoError() {
      // 可以在這裡實現備用方案，例如使用其他路徑的logo
      console.warn("Logo could not be loaded. Using fallback if available.");
    },

    // 跳轉到首頁
    goToHome() {
      this.$router.push("/staffshopping");
    },

    // 處理搜索
    handleSearch() {
      if (this.searchQuery.trim()) {
        this.$emit("search", this.searchQuery);

        // 根據需求可以直接跳轉到搜索結果頁
        this.$router.push({
          path: "/staffshopping/search",
          query: { q: this.searchQuery }
        });
      }
    },

    // 清空搜索內容
    clearSearch() {
      this.searchQuery = "";
      this.$refs.searchInput.focus();
    },

    // 打開購物車
    openCart() {
      this.$emit("open-cart");
    },

    // 顯示客服聯繫方式
    showContactInfo() {
      this.$alert(
        `電話: ${this.contactInfo.phone}<br>
               信箱: ${this.contactInfo.email}<br>
               服務時間: ${this.contactInfo.workHours}`,
        "聯繫客服",
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "確定"
        }
      );
    },

    // 處理頁面滾動
    handleScroll() {
      this.isScrolled = window.scrollY > 50;
    },

    // 處理視窗大小變化
    handleResize() {
      this.isMobile = window.innerWidth <= 768;
    },

    // 格式化購物車數量顯示
    formatCartCount(count) {
      return count > 99 ? "99+" : count;
    },

    // 登出 (整合您現有的登出功能)
    async logout() {
      await this.$store.dispatch("user/logout");
      this.$router.push(`/login?redirect=${this.$route.fullPath}`);
    }
  }
};
</script>

<style lang="scss" scoped>
// 變量定義
$primary-color: #1890ff;
$navy-blue: #003366; // 新增海軍藍變量
$text-color: #ffffff; // 改為白色文
$lighter-text: #e6e6e6; // 新增淺白色
$border-color: #004080; // 新增深藍色邊框
$navbar-height: 60px;
$navbar-height-scrolled: 50px;
$navbar-height-mobile: 50px;
$transition-time: 0.3s; // 新增過渡時間變量
$border-radius: 4px; // 新增邊框圓角變量
$box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3); // 新增陰影變量

.shop-navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: $navbar-height;
  background-color: $navy-blue; // 改為海軍藍背景
  box-shadow: $box-shadow;
  z-index: 1000;
  transition: height $transition-time, box-shadow $transition-time;

  // 滾動後樣式
  &.navbar-scrolled {
    height: $navbar-height-scrolled;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    background-color: darken($navy-blue, 5%); // 滾動後更深一點的顏色

    .container {
      height: $navbar-height-scrolled;
    }

    .logo-image {
      max-height: $navbar-height-scrolled - 20px;
    }

    .logo-title {
      font-size: 14px;
    }
  }

  .container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;
    transition: height $transition-time;
  }

  // Logo 區域
  .navbar-logo {
    cursor: pointer;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.05);
    }

    .logo-image {
      max-height: $navbar-height - 20px;
      max-width: 140px;
      transition: max-height $transition-time;
    }

    .logo-title {
      font-size: 16px;
      color: $text-color;
      margin-top: 2px;
      transition: font-size $transition-time;
    }
  }

  // 搜索區域
  .navbar-search {
    flex: 1;
    max-width: 500px;
    margin: 0 20px;

    .search-container {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;

      .search-icon {
        position: absolute;
        left: 10px;
        color: $lighter-text;
        font-size: 18px;
      }

      .search-input {
        width: 100%;
        height: 36px;
        padding: 0 36px 0 36px;
        border: 1px solid $border-color;
        border-radius: $border-radius;
        font-size: 14px;
        color: #333; // 搜索框內文字保持黑色
        background-color: rgba(255, 255, 255, 0.9); // 搜索框背景為白色半透明
        transition: all $transition-time;

        &:focus {
          border-color: $primary-color;
          box-shadow: 0 0 0 2px rgba($primary-color, 0.3);
          outline: none;
          background-color: #fff; // 聚焦時完全不透明
        }

        &::placeholder {
          color: #777; // 更深的佔位符顏色
        }
      }

      .clear-icon {
        position: absolute;
        right: 10px;
        color: #c0c4cc;
        cursor: pointer;

        &:hover {
          color: $text-color;
        }
      }
    }
  }

  // 手機版搜索區域
  .mobile-search-container {
    display: none;
    width: 100%;
    padding: 10px 15px;
    background-color: $navy-blue; // 與導航欄一致的海軍藍
    border-top: 1px solid rgba(255, 255, 255, 0.1); // 半透明白色邊框

    .search-container {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;

      .search-icon {
        position: absolute;
        left: 10px;
        color: rgba(255, 255, 255, 0.7); // 半透明白色圖標
        font-size: 18px;
      }

      .search-input {
        width: 100%;
        height: 36px;
        padding: 0 36px 0 36px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: $border-radius;
        font-size: 14px;
        color: #333; // 文字保持黑色以便閱讀
        background-color: rgba(255, 255, 255, 0.9); // 半透明白色背景

        &:focus {
          border-color: $primary-color;
          box-shadow: 0 0 0 2px rgba($primary-color, 0.3);
          outline: none;
          background-color: #fff; // 聚焦時完全不透明
        }

        &::placeholder {
          color: #777;
        }
      }

      .clear-icon {
        position: absolute;
        right: 10px;
        color: #c0c4cc;
        cursor: pointer;

        &:hover {
          color: $text-color;
        }
      }
    }
  }

  // 右側功能區
  .navbar-actions {
    display: flex;
    align-items: center;

    .navbar-cart,
    .navbar-service {
      position: relative;
      margin-left: 20px;
      font-size: 22px;
      color: $text-color; // 已更改為白色
      cursor: pointer;
      transition: color $transition-time;

      &:hover {
        color: rgba(255, 255, 255, 0.7); // 懸停時半透明白色
      }
    }

    .navbar-cart {
      .cart-icon-wrapper {
        position: relative;
      }

      .cart-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        border-radius: 8px;
        background-color: #f56c6c;
        color: #fff;
        font-size: 12px;
        line-height: 16px;
        text-align: center;
        transition: transform 0.2s;
        transform-origin: center;

        // 購物車更新時的動畫效果類
        &.cart-updated {
          animation: cartBadgePulse 0.3s;
        }
      }
    }

    // 用戶頭像區域 (整合您現有的頭像樣式)
    .avatar-container {
      margin-left: 20px;

      .avatar-wrapper {
        position: relative;
        display: flex;
        align-items: center;

        .user-avatar {
          cursor: pointer;
          width: 36px;
          height: 36px;
          border-radius: 8px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          margin-left: 4px;
          font-size: 12px;
        }
      }
    }
  }
}

// 購物車動畫
@keyframes cartBadgePulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

// 響應式設計
@media (max-width: 768px) {
  .shop-navbar {
    height: $navbar-height-mobile;

    .container {
      height: $navbar-height-mobile;
      padding: 0 10px;
    }

    .navbar-logo {
      flex-direction: row;

      .logo-image {
        max-height: $navbar-height-mobile - 15px;
        max-width: 100px;
      }

      .logo-title {
        display: none;
      }
    }

    // 桌面版搜索框在手機版隱藏
    .navbar-search {
      display: none;
    }

    // 手機版顯示獨立搜索區域
    .mobile-search-container {
      display: block;
    }

    .navbar-actions {
      .navbar-cart,
      .navbar-service {
        margin-left: 15px;
        font-size: 20px;
      }

      .avatar-container {
        margin-left: 15px;

        .avatar-wrapper {
          .user-avatar {
            width: 30px;
            height: 30px;
          }

          .el-icon-caret-bottom {
            display: none;
          }
        }
      }
    }
  }

  // 調整主內容區域的上邊距，為手機版搜索框留出空間
  .main-content {
    padding-top: calc(
      #{$navbar-height-mobile} + 56px
    ) !important; // 50px導航欄 + 搜索框高度
  }
}

@media (max-width: 480px) {
  .shop-navbar {
    .navbar-logo {
      .logo-image {
        max-width: 80px;
      }
    }

    .navbar-actions {
      .navbar-cart,
      .navbar-service {
        margin-left: 10px;
      }

      .avatar-container {
        margin-left: 10px;
      }
    }
  }
}
</style>
