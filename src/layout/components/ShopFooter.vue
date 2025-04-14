<template>
  <div class="shop-footer">
    <!-- 版權與政策連結區域 -->
    <div class="footer-container">
      <div class="footer-content">
        <div class="copyright">
          <p>© Copyright {{ currentYear }} {{ companyName }}. 保留所有權利。</p>
        </div>
        <div class="footer-links">
          <router-link
            v-for="(link, index) in footerLinks"
            :key="index"
            :to="link.url"
            class="footer-link"
          >
            {{ link.name }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ShopFooter",
  props: {
    // 公司/商店名稱
    companyName: {
      type: String,
      default: "企業員工專屬團購平台"
    },

    // 底部連結
    footerLinks: {
      type: Array,
      default: () => [
        { name: "隱私政策", url: "/privacy" },
        { name: "使用條款", url: "/terms" },
        { name: "Cookie政策", url: "/cookies" }
      ]
    }
  },

  data() {
    return {
      currentYear: new Date().getFullYear() // 自動獲取當前年份
    };
  }
};
</script>

<style lang="scss" scoped>
// 變量定義 (與導航欄保持一致)
$navy-blue: #003366;
$text-color: #ffffff;
$light-text: #e6e6e6;
$primary-color: #1890ff;
$transition-time: 0.3s;

// 簡化底層欄樣式
.shop-footer {
  background-color: $navy-blue;
  color: $text-color;
  padding: 20px 0;
  width: 100%;

  .footer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;
  }

  .footer-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;

    @media (max-width: 768px) {
      flex-direction: column;
      text-align: center;
    }

    .copyright {
      color: $light-text;
      font-size: 13px;
      margin: 10px 0;
    }

    .footer-links {
      display: flex;
      flex-wrap: wrap;

      @media (max-width: 768px) {
        justify-content: center;
        margin-top: 10px;
      }

      .footer-link {
        color: $light-text;
        text-decoration: none;
        margin-left: 20px;
        font-size: 13px;
        transition: color $transition-time;

        &:hover {
          color: $primary-color;
        }

        @media (max-width: 480px) {
          margin: 0 10px 10px;
        }
      }
    }
  }
}
</style>
