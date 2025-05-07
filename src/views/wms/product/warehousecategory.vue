<template>
  <div class="warehouse-category">
    <!-- 頁面標題區域 -->
    <div class="page-header">
      <h2>品號類別管理</h2>
      <div class="action-buttons">
        <el-button type="success" @click="handleAddCategory">
          <i class="el-icon-plus"></i>
          <span class="button-text">新增類別</span>
        </el-button>
      </div>
    </div>

    <!-- 主要內容區域 -->
    <div class="page-content">
      <!-- 搜尋區域 -->
      <div class="table-operations">
        <div class="operation-wrapper">
          <el-form :inline="true">
            <el-form-item label="類別名稱">
              <search-box
                v-model="searchKeyword"
                placeholder="請輸入類別名稱"
                @clear="handleSearchClear"
                @input="handleSearch"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 資料載入中 -->
      <div v-if="loading" class="loading-container">
        <el-spinner type="primary" />
        <p>正在載入類別資料...</p>
      </div>

      <!-- 表格區域 -->
      <base-table
        v-else
        ref="baseTable"
        :data="categoryData"
        :columns="columns"
        :loading="loading"
        :showActionColumn="true"
        @selection-change="handleSelectionChange"
      >
        <!-- 產品數量列自定義 -->
        <template #column-productCount="{ row }">
          <div class="product-count-cell">
            <span>{{ row.productCount }}</span>
            <el-tooltip
              v-if="row.productCount > 0"
              content="查看產品詳情"
              placement="top"
            >
              <i
                class="el-icon-warning-outline product-info-icon"
                @click.stop="showProductDetails(row)"
              ></i>
            </el-tooltip>
          </div>
        </template>

        <!-- 操作列 -->
        <template #action="{ row }">
          <div class="action-buttons">
            <!-- 編輯類別 -->
            <el-tooltip content="編輯類別" placement="top">
              <el-button
                size="mini"
                type="warning"
                icon="el-icon-edit"
                @click="handleEditCategory(row)"
              ></el-button>
            </el-tooltip>

            <!-- 刪除類別 -->
            <el-tooltip content="刪除類別" placement="top">
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                @click="handleDeleteCategory(row)"
              ></el-button>
            </el-tooltip>
          </div>
        </template>
      </base-table>
    </div>

    <!-- 使用組件化的類別對話框 -->
    <warehouse-category-dialog
      :visible.sync="dialogVisible"
      :type="dialogType"
      :category="categoryForm"
      @save="handleSaveCategory"
      @cancel="dialogVisible = false"
      @close="handleDialogClose"
    />

    <!-- 使用組件化的產品詳情對話框 -->
    <product-detail-dialog
      :visible.sync="productDialogVisible"
      :category-name="currentCategoryName"
      :products="currentProducts"
    />
  </div>
</template>

<script>
import BaseTable from "@/components/BaseTable/index.vue";
import SearchBox from "@/components/SearchBox";
import WarehouseCategoryDialog from "./components/WarehouseCategoryDialog.vue";
import ProductDetailDialog from "./components/ProductDetailDialog.vue";
import WarehouseCategoryService from "./services/WarehouseCategoryService.js";

export default {
  name: "WarehouseCategory",

  components: {
    BaseTable,
    SearchBox,
    WarehouseCategoryDialog,
    ProductDetailDialog
  },

  data() {
    return {
      // 搜尋關鍵字
      searchKeyword: "",
      // 資料載入狀態
      loading: true,
      // 選擇的行
      selectedRows: [],

      // 表格列定義
      columns: [
        {
          prop: "name",
          label: "類別名稱",
          minWidth: 200
        },
        {
          prop: "description",
          label: "類別描述"
        },
        {
          prop: "productCount",
          label: "產品數量",
          width: 120,
          align: "center"
        },
        {
          prop: "createTime",
          label: "創建時間",
          width: 160,
          sortable: true
        },
        {
          prop: "updateTime",
          label: "更新時間",
          width: 160,
          sortable: true
        }
      ],

      // 類別數據
      categoryData: [],

      // 對話框相關
      dialogVisible: false,
      dialogType: "", // 'add' 或 'edit'
      categoryForm: {
        id: null,
        name: "",
        description: ""
      },
      // 產品詳情對話框
      productDialogVisible: false,
      currentProducts: [],
      currentCategoryName: ""
    };
  },

  created() {
    this.fetchCategories();
  },

  methods: {
    // 獲取類別數據
    async fetchCategories() {
      this.loading = true;
      try {
        // 使用CategoryService獲取所有類別
        this.categoryData = await WarehouseCategoryService.fetchAllCategories();
      } catch (error) {
        console.error("獲取類別資料失敗", error);
        this.$message.error("獲取類別資料失敗");
      } finally {
        this.loading = false;
      }
    },

    // 搜尋相關方法
    async handleSearch(value) {
      this.searchKeyword = value;
      if (value) {
        try {
          // 使用服務層搜尋功能
          this.loading = true;
          this.categoryData = await WarehouseCategoryService.searchCategories(
            value
          );
        } catch (error) {
          console.error("搜尋類別失敗", error);
          this.$message.error("搜尋類別失敗");
        } finally {
          this.loading = false;
        }
      } else {
        this.fetchCategories();
      }
    },

    async handleSearchClear() {
      this.searchKeyword = "";
      this.fetchCategories();
    },

    // 處理選擇變更
    handleSelectionChange(rows) {
      this.selectedRows = rows;
    },

    // 新增類別
    handleAddCategory() {
      this.dialogType = "add";
      this.categoryForm = { id: null, name: "", description: "" };
      this.dialogVisible = true;
    },

    // 編輯類別
    handleEditCategory(row) {
      this.dialogType = "edit";
      this.categoryForm = {
        id: row.id,
        name: row.name,
        description: row.description || ""
      };
      this.dialogVisible = true;
    },

    // 刪除類別
    handleDeleteCategory(row) {
      if (row.productCount > 0) {
        this.$msgbox(
          `「${row.name}」類別下有 ${
            row.productCount
          } 個關聯產品，無法刪除。是否查看產品詳情？`,
          "提示",
          {
            confirmButtonText: "查看詳情",
            cancelButtonText: "取消",
            type: "warning"
          }
        )
          .then(() => {
            // 查看產品詳情
            this.showProductDetails(row);
          })
          .catch(() => {});
        return;
      }

      // 一般刪除確認
      this.$msgbox({
        title: "提示",
        message: `確認要刪除類別「${row.name}」嗎？`,
        showCancelButton: true,
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          try {
            // 使用CategoryService刪除類別
            const result = await WarehouseCategoryService.deleteCategory(
              row.id
            );

            if (result.success) {
              // 從數據中移除該項
              const index = this.categoryData.findIndex(
                item => item.id === row.id
              );
              if (index > -1) {
                this.categoryData.splice(index, 1);
              }

              this.$message.success("刪除成功");
            } else {
              this.$message.error(result.message || "刪除類別失敗");
            }
          } catch (error) {
            console.error("刪除類別失敗", error);
            this.$message.error("刪除類別失敗");
          }
        })
        .catch(() => {});
    },

    // 保存類別
    async handleSaveCategory(formData) {
      try {
        if (this.dialogType === "add") {
          // 新增類別
          const response = await WarehouseCategoryService.addCategory(formData);

          if (response.success) {
            const newCategory = response.data;
            this.categoryData.push(newCategory);
            this.$message.success("新增類別成功");
            this.dialogVisible = false;
          } else {
            this.$message.error(response.message || "新增類別失敗");
          }
        } else {
          // 編輯類別
          const response = await WarehouseCategoryService.updateCategory(
            formData
          );

          if (response.success) {
            const index = this.categoryData.findIndex(
              item => item.id === formData.id
            );
            if (index > -1) {
              this.categoryData[index] = response.data;
            }
            this.$message.success("編輯類別成功");
            this.dialogVisible = false;
          } else {
            this.$message.error(response.message || "編輯類別失敗");
          }
        }
      } catch (error) {
        console.error("保存類別失敗", error);
        this.$message.error("保存類別失敗");
      }
    },

    // 關閉對話框
    handleDialogClose() {
      this.dialogVisible = false;
    },

    // 顯示產品詳情
    async showProductDetails(row) {
      if (row.productCount > 0) {
        try {
          this.currentCategoryName = row.name;
          this.productDialogVisible = true;
          this.currentProducts = []; // 先清空，避免顯示舊數據

          // 在對話框打開後再載入數據，避免等待時間太長
          this.$nextTick(async () => {
            // 使用 CategoryService 獲取產品列表
            this.currentProducts = await WarehouseCategoryService.fetchProductsByCategory(
              row.id
            );
          });
        } catch (error) {
          console.error("獲取產品列表失敗", error);
          this.$message.error("獲取產品列表失敗");
        }
      } else {
        this.$message.info(`「${row.name}」類別沒有關聯的產品數據`);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
// 變量定義
$primary-color: #1890ff;
$success-color: #52c41a;
$warning-color: #faad14;
$danger-color: #ff4d4f;
$border-radius: 8px;
$box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
$transition: all 0.3s ease;

// 字體大小
$font-size-base: 18px;
$font-size-lg: 20px;
$font-size-xl: 24px;

.warehouse-category {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;

  // 頁面標題區域
  .page-header {
    background: white;
    padding: 24px;
    border-radius: $border-radius;
    box-shadow: $box-shadow;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      font-size: $font-size-xl;
      position: relative;

      &::after {
        content: "";
        position: absolute;
        bottom: -8px;
        left: 0;
        width: 40px;
        height: 3px;
        background: $primary-color;
        border-radius: 2px;
      }
    }

    .action-buttons {
      display: flex;
      gap: 12px;

      .el-button {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  }

  // 內容區域
  .page-content {
    background: white;
    border-radius: $border-radius;
    box-shadow: $box-shadow;
    padding: 20px;
  }

  // 表格操作區域
  .table-operations {
    margin-bottom: 20px;

    .operation-wrapper {
      padding: 16px;
      background: #f8f9fa;
      border-radius: $border-radius;
    }
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 8px;
  }

  .dialog-footer {
    text-align: right;
    margin-top: 20px;
  }

  .product-count-cell {
    display: flex;
    align-items: center;
    justify-content: center;

    .product-info-icon {
      margin-left: 8px;
      color: $warning-color;
      cursor: pointer;
      transition: $transition;

      &:hover {
        transform: scale(1.2);
        color: darken($warning-color, 10%);
      }
    }
  }

  // 載入中容器
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
    color: #909399;

    p {
      margin-top: 16px;
    }
  }
}

// 響應式設計
@media screen and (max-width: 768px) {
  .warehouse-category {
    padding: 16px;

    .page-header {
      padding: 16px;
      flex-direction: column;
      gap: 16px;

      .action-buttons {
        width: 100%;
        justify-content: space-between;
      }
    }

    .table-operations {
      .operation-wrapper {
        padding: 12px;
      }
    }
  }
}

// 動畫效果
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
