<template>
  <div class="product-gallery">
    <div class="main-image">
      <img
        :src="selectedImage || mainImage || fallbackImage"
        :alt="product.product_name"
        @error="handleImageError"
      />
    </div>
    <div class="thumbnail-list" v-if="displayImages.length > 1">
      <div
        v-for="(image, index) in displayImages"
        :key="index"
        class="thumbnail"
        :class="{ active: selectedImage === image }"
        @click="selectedImage = image"
      >
        <img
          :src="image"
          :alt="`${product.product_name} - 圖片 ${index + 1}`"
          @error="handleThumbnailError($event, index)"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProductGallery",
  props: {
    product: {
      type: Object,
      required: true
    },
    images: {
      type: Array,
      default: () => []
    },
    mainImage: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      selectedImage: null,
      fallbackImage: "https://via.placeholder.com/400x400?text=No+Image", // 預設圖片
      failedImages: new Set() // 記錄載入失敗的圖片
    };
  },
  computed: {
    // 組合所有可顯示的圖片
    displayImages() {
      const allImages = [];
      // 首先添加主圖（如果存在）
      if (this.mainImage && !this.failedImages.has(this.mainImage)) {
        allImages.push(this.mainImage);
      }

      // 然後添加其他圖片（確保不重複添加主圖）
      if (this.images && this.images.length) {
        this.images.forEach(img => {
          if (img && img !== this.mainImage && !this.failedImages.has(img)) {
            allImages.push(img);
          }
        });
      }

      // 如果沒有可用圖片，則使用預設圖片
      if (allImages.length === 0) {
        allImages.push(this.fallbackImage);
      }

      return allImages;
    }
  },
  watch: {
    // 當產品變更時，重置選擇的圖片和失敗記錄
    product() {
      this.failedImages.clear();
      this.resetSelectedImage();
    },
    // 當圖片列表變更時，重置選擇的圖片
    displayImages() {
      this.resetSelectedImage();
    },
    // 當主圖變更時，重置選擇的圖片
    mainImage() {
      this.resetSelectedImage();
    }
  },
  mounted() {
    this.resetSelectedImage();
  },
  methods: {
    // 重置選擇的圖片為第一張
    resetSelectedImage() {
      if (this.displayImages.length > 0) {
        this.selectedImage = this.displayImages[0];
      } else {
        this.selectedImage = this.fallbackImage;
      }
    },

    // 處理主圖加載失敗
    handleImageError(event) {
      const src = event.target.src;
      if (src !== this.fallbackImage) {
        this.failedImages.add(src);
        event.target.src = this.fallbackImage;

        // 如果選中的圖片加載失敗，需要更新選中狀態
        if (this.selectedImage === src) {
          this.resetSelectedImage();
        }
      }
    },

    // 處理縮略圖加載失敗
    handleThumbnailError(event, index) {
      const src = event.target.src;
      if (src !== this.fallbackImage) {
        this.failedImages.add(src);

        // 如果當前選中的圖片加載失敗，則切換到其他可用圖片
        if (this.selectedImage === src) {
          this.resetSelectedImage();
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
$primary-color: #1890ff;
$border-radius: 8px;

.product-gallery {
  flex: 1;
  min-width: 300px;

  .main-image {
    width: 100%;
    height: 400px;
    border-radius: $border-radius;
    overflow: hidden;
    border: 1px solid #ebeef5;
    margin-bottom: 16px;
    background-color: #fafafa;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      transition: transform 0.3s ease;
    }

    &:hover img {
      transform: scale(1.02);
    }
  }

  .thumbnail-list {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 8px;

    &::-webkit-scrollbar {
      height: 4px;
    }

    &::-webkit-scrollbar-track {
      background: #f5f7fa;
    }

    &::-webkit-scrollbar-thumb {
      background: #c0c4cc;
      border-radius: 2px;
    }

    .thumbnail {
      width: 80px;
      height: 80px;
      border: 1px solid #ebeef5;
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      flex-shrink: 0;
      background-color: #fafafa;

      &.active {
        border: 2px solid $primary-color;
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
      }

      &:hover {
        border-color: lighten($primary-color, 20%);
        transform: translateY(-2px);
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}

/* 響應式調整 */
@media (max-width: 992px) {
  .product-gallery .main-image {
    height: 350px;
  }
}

@media (max-width: 768px) {
  .product-gallery {
    min-width: 100%;

    .main-image {
      height: 300px;
    }
  }
}

@media (max-width: 480px) {
  .product-gallery .main-image {
    height: 250px;
  }

  .product-gallery .thumbnail-list .thumbnail {
    width: 60px;
    height: 60px;
  }
}
</style>
