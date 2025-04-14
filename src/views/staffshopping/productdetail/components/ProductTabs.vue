<template>
  <div class="product-details-section">
    <el-tabs type="card">
      <el-tab-pane label="商品介紹">
        <div class="details-content" v-html="product.descriptionHtml"></div>
        <div v-if="!product.descriptionHtml" class="empty-content">
          暫無商品介紹
        </div>
      </el-tab-pane>
      <el-tab-pane label="規格參數">
        <div class="specifications" v-if="product.specificationHtml">
          <div v-html="product.specificationHtml"></div>
        </div>
        <div v-else class="empty-content">
          暫無規格參數
        </div>
      </el-tab-pane>
      <el-tab-pane label="注意事項">
        <div class="notes-content" v-if="product.tags && product.tags.length">
          <ul class="tag-list">
            <li v-for="(tag, index) in product.tags" :key="index">
              {{ tag }}
            </li>
          </ul>
        </div>
        <div v-else class="empty-content">
          暫無注意事項
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: "ProductTabs",

  props: {
    product: {
      type: Object,
      required: true
    }
  },

  computed: {
    // 檢查是否有規格參數
    hasSpecifications() {
      return (
        this.product.specifications && this.product.specifications.length > 0
      );
    }
  }
};
</script>

<style lang="scss" scoped>
$border-radius: 8px;
$box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

/* 產品詳情區 */
.product-details-section {
  background-color: #fff;
  border-radius: $border-radius;
  box-shadow: $box-shadow;
  padding: 24px;
  margin-top: 24px;

  .tag-list {
    padding-left: 20px;
    li {
      margin-bottom: 8px;
    }
  }

  .details-content,
  .notes-content {
    padding: 16px 0;

    ::v-deep img {
      max-width: 100%;
      height: auto;
      margin: 16px 0;
    }
  }

  .empty-content {
    color: #909399;
    text-align: center;
    padding: 40px 0;
  }

  .specifications {
    margin: 16px 0;

    ::v-deep .el-descriptions-item__label {
      width: 120px;
      background-color: #f5f7fa;
    }
  }
}

/* 響應式調整 */
@media (max-width: 768px) {
  .product-details-section {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .product-details-section {
    padding: 12px;

    ::v-deep .el-tabs__item {
      padding: 0 12px;
    }

    .specifications {
      ::v-deep .el-descriptions-item__label {
        width: 100px;
      }
    }
  }
}
</style>
