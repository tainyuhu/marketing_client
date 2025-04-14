<template>
  <div class="banner">
    <div class="banner-image-container">
      <img
        :src="bannerImageUrl || require('@/assets/pic/pic1.jpg')"
        alt="員工優惠購物平台橫幅"
        class="banner-image"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "BannerComponent",

  props: {
    // 橫幅圖片 URL
    bannerImageUrl: {
      type: String,
      default: null
    },

    // 橫幅圖片尺寸要求
    bannerImageDimensions: {
      type: Object,
      default: () => ({
        width: 1920,
        height: 800,
        aspectRatio: 21 / 9
      })
    }
  },

  mounted() {
    // 組件掛載後，嘗試加載橫幅圖片
    this.$emit("validate-image", this.bannerImageUrl);
  }
};
</script>

<style lang="scss" scoped>
// 變量定義
$border-radius: 8px;

/* 橫幅樣式 */
.banner {
  position: relative;
  margin-top: 30px;
  margin-bottom: 24px;
  border-radius: $border-radius;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 1920px;
  margin-left: auto;
  margin-right: auto;
}

.banner-image-container {
  position: relative;
  width: 100%;
  padding-bottom: 42.1053%; /* 保持21:9的比例 (9/21 * 100%) */
  overflow: hidden;
}

.banner-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .banner {
    margin-top: 50px;
    margin-bottom: 16px;
  }
}

@media (max-width: 480px) {
  .banner {
    margin-top: 40px;
    margin-bottom: 12px;
  }
}
</style>
