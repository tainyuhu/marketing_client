<template>
  <div class="banner">
    <!-- 预先设置固定宽高比容器，防止CLS -->
    <div class="banner-image-container">
      <!-- 骨架屏 - 显示在图片加载前 -->
      <div v-if="!imageLoaded" class="banner-skeleton"></div>

      <!-- 图片 - 使用单一图片策略 -->
      <img
        :src="imageUrl"
        alt="員工優惠購物平台橫幅"
        class="banner-image"
        :class="{ loaded: imageLoaded }"
        @load="handleImageLoaded"
        fetchpriority="high"
        decoding="async"
        ref="bannerImage"
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

  data() {
    return {
      imageLoaded: false, // 图片是否已加载完成
      imageUrl: "", // 实际使用的图片URL
      defaultImage: require("@/assets/pic/pic1.jpg") // 默认图片
    };
  },

  created() {
    // 在组件创建时立即设置图片URL (不用等到mounted)
    this.setImageUrl();
  },

  watch: {
    // 监听外部传入的bannerImageUrl变化
    bannerImageUrl: {
      handler() {
        this.setImageUrl();
      }
    }
  },

  methods: {
    // 设置图片URL - 优先考虑小尺寸图片以提高加载速度
    setImageUrl() {
      // 重置加载状态
      this.imageLoaded = false;

      if (!this.bannerImageUrl) {
        // 如果没有提供图片URL，使用默认图片
        this.imageUrl = this.defaultImage;
        return;
      }

      // 检查是否可以加载小尺寸版本
      const smallerImageUrl = this.getSmallerImageUrl(this.bannerImageUrl);

      // 设置URL (优先使用较小的图片)
      this.imageUrl = smallerImageUrl || this.bannerImageUrl;
    },

    // 获取较小尺寸图片的URL
    getSmallerImageUrl(originalUrl) {
      if (!originalUrl || typeof originalUrl !== "string") return null;

      // 根据实际CDN配置调整此部分
      // 这里以图片服务URL参数为例进行优化
      if (!originalUrl.includes("width=") && !originalUrl.includes("format=")) {
        const separator = originalUrl.includes("?") ? "&" : "?";
        // 设置合理的尺寸和格式，兼顾加载速度和视觉质量
        return `${originalUrl}${separator}width=960&format=webp&quality=80`;
      }

      return null;
    },

    // 处理图片加载完成
    handleImageLoaded() {
      // 不使用setTimeout，立即标记为已加载
      this.imageLoaded = true;

      // 通知父组件验证图片
      this.$emit("validate-image", this.bannerImageUrl);
    }
  }
};
</script>

<style lang="scss" scoped>
// 變量定義
$border-radius: 8px;
$skeleton-bg: #f0f2f5;
$placeholder-color: rgba(240, 242, 245, 0.5);

/* 橫幅樣式 */
.banner {
  position: relative;
  margin-top: 20px;
  margin-bottom: 20px;
  border-radius: $border-radius;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 1920px;
  margin-left: auto;
  margin-right: auto;

  /* 重要：预留固定空间 */
  min-height: 100px;
}

/* 图片容器 - 使用固定宽高比防止CLS */
.banner-image-container {
  position: relative;
  width: 100%;
  /* 固定宽高比，防止CLS */
  padding-top: 42.1053%; /* 固定21:9的比例 (9/21 * 100%) */
  background-color: $placeholder-color;
}

/* 骨架屏 - 简化为静态背景 */
.banner-skeleton {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: $skeleton-bg;
  border-radius: $border-radius;
  z-index: 1;
}

/* 图片样式 */
.banner-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 2;
  opacity: 0; /* 初始透明 */
  transition: opacity 0.3s ease;

  /* 硬件加速 */
  transform: translateZ(0);
  will-change: opacity;

  &.loaded {
    opacity: 1;
  }
}

/* 響應式調整 */
@media (max-width: 768px) {
  .banner {
    margin-top: 16px;
    margin-bottom: 16px;
    min-height: 80px;
  }
}

@media (max-width: 480px) {
  .banner {
    margin-top: 12px;
    margin-bottom: 12px;
    min-height: 60px;
  }
}
</style>
