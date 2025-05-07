<template>
  <div class="multi-sku">
    <!-- 頁面標題區域 -->
    <div class="page-header">
      <h2>品號管理</h2>
      <div class="action-buttons">
        <el-button type="success" @click="handleAdd">
          <i class="el-icon-plus"></i>
          <span class="button-text">新增品號</span>
        </el-button>
        <el-button type="primary" @click="handleBatchImport">
          <i class="el-icon-upload2"></i>
          <span class="button-text">批次匯入</span>
        </el-button>
      </div>
    </div>

    <!-- 主要內容區域 -->
    <div class="page-content">
      <el-tabs v-model="activeTab" type="border-card" class="product-tabs">
        <!-- 品號列表 -->
        <el-tab-pane label="品號列表" name="products">
          <div class="table-operations">
            <div class="operation-wrapper">
              <CombinedSearch
                ref="productSearch"
                :search-placeholder="'搜尋品號列表...'"
                :show-time-search="false"
                @search="handleProductSearch"
              />
            </div>
          </div>

          <!-- 子標籤：總覽和分類 -->
          <el-tabs v-model="categorysTab" type="card" class="categorys-tabs">
            <!-- 總覽標籤 -->
            <el-tab-pane label="總覽" name="overview">
              <BaseTable
                ref="productTable"
                :data="filteredProductData"
                :columns="productColumns"
                :loading="loading"
                :filename="'products-export'"
                :show-action-column="true"
                border
                row-key="id"
              >
                <template #column-categorys="{ row }">
                  <el-tag size="small" effect="plain">{{
                    row.categorys || "-"
                  }}</el-tag>
                </template>

                <template #column-createdBy="{ row }">
                  {{ row.createdBy || "-" }}
                </template>

                <template #column-updatedBy="{ row }">
                  {{ row.updatedBy || "-" }}
                </template>

                <template #column-createdAt="{ row }">
                  {{ formatDateDisplay(row.createdAt) }}
                </template>

                <template #column-updatedAt="{ row }">
                  {{ formatDateDisplay(row.updatedAt) }}
                </template>

                <template #column-status="{ row }">
                  <el-tag
                    :type="row.status ? 'success' : 'info'"
                    size="small"
                    effect="dark"
                  >
                    {{ row.status ? "啟用" : "停用" }}
                  </el-tag>
                </template>

                <template #action="{ row }">
                  <el-tooltip content="編輯品號" placement="top">
                    <el-button
                      size="mini"
                      type="primary"
                      icon="el-icon-edit"
                      @click="handleEdit(row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip content="查看品號異動紀錄" placement="top">
                    <el-button
                      size="mini"
                      type="warning"
                      icon="el-icon-document"
                      @click="viewProductHistory(row)"
                    ></el-button>
                  </el-tooltip>
                </template>
              </BaseTable>
            </el-tab-pane>

            <!-- 分類標籤 -->
            <el-tab-pane
              v-for="category in productCategories"
              :key="category.value"
              :label="category.label"
              :name="category.value.toString()"
            >
              <BaseTable
                :data="getCategoryProducts(category.value)"
                :columns="productColumns"
                :loading="loading"
                :filename="'products-' + category.value + '-export'"
                :show-action-column="true"
                border
                row-key="id"
              >
                <template #column-categorys="{ row }">
                  <el-tag size="small" effect="plain">{{
                    row.categorys || "-"
                  }}</el-tag>
                </template>

                <template #column-createdBy="{ row }">
                  {{ row.createdBy || "-" }}
                </template>

                <template #column-updatedBy="{ row }">
                  {{ row.updatedBy || "-" }}
                </template>

                <template #column-createdAt="{ row }">
                  {{ formatDateDisplay(row.createdAt) }}
                </template>

                <template #column-updatedAt="{ row }">
                  {{ formatDateDisplay(row.updatedAt) }}
                </template>

                <template #column-status="{ row }">
                  <el-tag
                    :type="row.status ? 'success' : 'info'"
                    size="small"
                    effect="dark"
                  >
                    {{ row.status ? "啟用" : "停用" }}
                  </el-tag>
                </template>

                <template #action="{ row }">
                  <el-tooltip content="編輯品號" placement="top">
                    <el-button
                      size="mini"
                      type="primary"
                      icon="el-icon-edit"
                      @click="handleEdit(row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip content="查看品號異動紀錄" placement="top">
                    <el-button
                      size="mini"
                      type="warning"
                      icon="el-icon-document"
                      @click="viewProductHistory(row)"
                    ></el-button>
                  </el-tooltip>
                </template>
              </BaseTable>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>

        <!-- 品號異動記錄 -->
        <el-tab-pane label="品號異動記錄" name="product-history">
          <div class="table-operations">
            <div class="operation-wrapper">
              <div class="search-filters">
                <el-button
                  v-if="showBackButton"
                  type="primary"
                  icon="el-icon-back"
                  @click="backToProducts"
                  >返回品號列表</el-button
                >
                <CombinedSearch
                  ref="historySearch"
                  :search-placeholder="'搜尋品號異動...'"
                  :show-time-search="true"
                  @search="handleHistorySearch"
                />
              </div>
            </div>
          </div>
          <BaseTable
            ref="historyTable"
            :data="processedHistoryData"
            :columns="productHistoryColumns"
            :loading="loading"
            :filename="'product-history-export'"
            :show-action-column="false"
            border
            row-key="id"
          >
            <!-- 使用自定義模板格式化日期時間 -->
            <template #column-datetime="{ row }">
              {{ formatDateDisplay(row.datetime) }}
            </template>

            <template #column-type="{ row }">
              <el-tag :type="getTypeTag(row.type)" size="small" effect="dark">
                {{ getTypeLabel(row.type) }}
              </el-tag>
            </template>

            <template #column-changes="{ row }">
              <div v-if="row.type === 'create'" class="change-item">
                <div class="change-summary">
                  建立品號: {{ row.productCode }}
                </div>
                <div class="change-detail" v-if="row.changes">
                  <div
                    v-for="(change, fieldName) in row.changes"
                    :key="fieldName"
                    class="change-detail"
                  >
                    <span class="field-name"
                      >{{ getFieldLabel(fieldName) }}:</span
                    >
                    <span class="new-value">{{
                      formatSimpleValue(change.to)
                    }}</span>
                  </div>
                </div>
              </div>

              <div
                v-else-if="
                  row.type === 'update' &&
                    row.changes &&
                    Object.keys(row.changes).length
                "
                class="changes-container"
              >
                <div
                  v-for="(change, fieldName) in row.changes"
                  :key="fieldName"
                  class="change-item"
                >
                  <div class="field-name">{{ getFieldLabel(fieldName) }}:</div>
                  <div class="change-values">
                    <span class="old-value">{{
                      formatSimpleValue(change.from) || "(空)"
                    }}</span>
                    <i class="el-icon-arrow-right"></i>
                    <span class="new-value">{{
                      formatSimpleValue(change.to) || "(空)"
                    }}</span>
                  </div>
                </div>
              </div>

              <div v-else-if="row.type === 'delete'" class="change-item">
                <div class="change-summary danger-text">
                  刪除品號: {{ row.productCode }}
                </div>
              </div>

              <div v-else class="no-changes">無明確變更記錄</div>
            </template>

            <template #column-operator="{ row }">
              <span>{{ row.operator || "-" }}</span>
            </template>

            <template #column-reason="{ row }">
              <span>{{ row.reason || "-" }}</span>
            </template>
          </BaseTable>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 編輯對話框 -->
    <ProductCodeDialog
      :visible.sync="productDialogVisible"
      :data="currentEditRow"
      @save="handleSaveProduct"
    />

    <!-- 批次匯入對話框 -->
    <BatchImportDialog
      :visible.sync="batchImportDialogVisible"
      @submit="handleBatchImportSubmit"
    />
  </div>
</template>

<script>
import BaseTable from "@/components/BaseTable/index.vue";
import CombinedSearch from "@/components/SearchBox/CombinedSearch.vue";
import ProductCodeDialog from "./components/ProductCodeDialog.vue";
import BatchImportDialog from "./components/BatchImportDialog.vue";
import { formatDate } from "@/utils/date";
import MultiSkuService from "./services/MultiSkuService";
import { productsColumns } from "@/constants/tableColumns";

export default {
  name: "MultiSku",

  components: {
    CombinedSearch,
    BaseTable,
    ProductCodeDialog,
    BatchImportDialog
  },

  data() {
    return {
      // 基本設置
      activeTab: "products",
      categorysTab: "overview",
      loading: false,
      showBackButton: false,
      lastViewedRow: null,
      fieldLabels: {
        item_code: "品號",
        name: "品名",
        productCode: "品號",
        productName: "品名",
        specification: "規格",
        unit: "單位",
        box_size: "裝箱容量",
        boxSize: "裝箱容量",
        status: "狀態",
        remark: "備註",
        material_category: "物料類別",
        materialCategoryId: "物料類別",
        categorys: "物料類別"
      },

      // 產品類別定義
      productCategories: [],

      // 表格欄位定義
      productColumns: [
        { prop: "productCode", label: "品號", minWidth: 120 },
        { prop: "productName", label: "品名", minWidth: 150 },
        { prop: "categorys", label: "物料類別", minWidth: 120 },
        { prop: "specification", label: "規格", minWidth: 150 },
        { prop: "unit", label: "單位", width: 80 },
        { prop: "boxSize", label: "裝箱容量", width: 100 },
        { prop: "status", label: "狀態", width: 80 },
        { prop: "createdBy", label: "建立人員", width: 100 },
        { prop: "createdAt", label: "建立時間", width: 160 },
        { prop: "updatedBy", label: "修改人員", width: 100 },
        { prop: "updatedAt", label: "修改時間", width: 160 }
      ],

      productHistoryColumns: productsColumns.history,

      // 對話框顯示控制
      productDialogVisible: false,
      batchImportDialogVisible: false,
      currentEditRow: null,

      // 搜索參數
      productSearchParams: {
        keyword: "",
        field: "",
        dateRange: []
      },

      historySearchParams: {
        keyword: "",
        field: "",
        dateRange: []
      },

      // 資料
      productData: [],
      productHistoryData: []
    };
  },

  computed: {
    // 過濾後的品號資料
    filteredProductData() {
      let data = this.productData;
      const { keyword, field } = this.productSearchParams;

      if (keyword) {
        data = this.filterData(data, keyword, field);
      }

      return data;
    },

    filteredProductHistoryData() {
      let data = this.productHistoryData;
      const { keyword, field, dateRange } = this.historySearchParams;

      if (dateRange && dateRange.length === 2) {
        data = this.filterByDateRange(data, dateRange);
      }

      if (keyword) {
        data = this.filterData(data, keyword, field);
      }

      return data;
    },

    processedHistoryData() {
      return this.filteredProductHistoryData.map(history => {
        return {
          ...history,
          productName: this.getProductNameFromHistory(history),
          specification: this.getSpecificationFromHistory(history),
          reason: history.remark || "系統自動記錄"
        };
      });
    }
  },

  created() {
    this.initData();
  },

  methods: {
    // 初始化數據
    async initData() {
      try {
        this.loading = true;
        await Promise.all([
          this.loadProductData(),
          this.loadProductHistoryData(),
          this.loadProductCategories()
        ]);
      } catch (error) {
        console.error("加載數據失敗:", error);
        this.$message.error("加載數據失敗");
      } finally {
        this.loading = false;
      }
    },

    // 加載品號資料
    async loadProductData() {
      try {
        this.productData = await MultiSkuService.getProductList();
        console.log("品號資料載入完成:", this.productData);
      } catch (error) {
        console.error("加載品號資料失敗:", error);
        this.$message.error("加載品號資料失敗");
      }
    },

    // 加載品號異動記錄
    async loadProductHistoryData(itemId = null) {
      try {
        this.loading = true;

        if (itemId) {
          // 特定品號歷史紀錄
          this.productHistoryData = await MultiSkuService.getProductHistoryList(
            {},
            itemId
          );
        } else {
          // 最近異動（全部品號）
          this.productHistoryData = await MultiSkuService.getRecentProductHistoryList(
            7
          );
        }

        // 標準化日期格式
        this.productHistoryData = this.productHistoryData.map(item => {
          if (item.datetime) {
            try {
              const date = new Date(item.datetime);
              if (!isNaN(date.getTime())) {
                // 確保所有日期使用一致的 ISO 格式
                item.datetime = date.toISOString();
              }
            } catch (e) {
              console.error("日期標準化錯誤:", e);
            }
          }
          return item;
        });

        console.log(`已載入 ${this.productHistoryData.length} 筆品號異動記錄`);

        // 顯示幾筆日期樣本，以確認格式
        if (this.productHistoryData.length > 0) {
          const samples = this.productHistoryData
            .slice(0, 3)
            .map(item => item.datetime);
          console.log("日期樣本:", samples);
        }
      } catch (error) {
        console.error("加載品號異動記錄失敗:", error);
        this.$message.error("加載品號異動記錄失敗");
      }
    },

    // 加載產品類別
    async loadProductCategories() {
      try {
        this.productCategories = await MultiSkuService.getProductCategories();
        console.log("物料類別載入完成:", this.productCategories);
      } catch (error) {
        console.error("加載物料類別失敗:", error);
        this.$message.error("加載物料類別失敗");
      }
    },

    // 處理品號搜尋
    handleProductSearch(params) {
      this.productSearchParams = { ...params };
    },

    // 處理歷史記錄搜尋
    handleHistorySearch(params) {
      console.log("品號異動搜尋參數:", {
        keyword: params.keyword,
        field: params.field,
        dateRange: params.dateRange
          ? [
              params.dateRange[0]
                ? formatDate(params.dateRange[0], "YYYY-MM-DD")
                : null,
              params.dateRange[1]
                ? formatDate(params.dateRange[1], "YYYY-MM-DD")
                : null
            ]
          : null
      });

      this.historySearchParams = { ...params };
    },

    // 取得特定類別的產品
    getCategoryProducts(categoryId) {
      return this.filteredProductData.filter(
        product => product.materialCategoryId === categoryId
      );
    },

    // 處理新增
    handleAdd() {
      this.currentEditRow = null;
      this.productDialogVisible = true;
    },

    // 處理編輯
    handleEdit(row) {
      this.currentEditRow = { ...row };
      this.productDialogVisible = true;
    },

    // 批次匯入
    handleBatchImport() {
      this.batchImportDialogVisible = true;
    },

    // 處理保存品號
    async handleSaveProduct(data) {
      try {
        this.loading = true;
        const result = await MultiSkuService.saveProduct(data);

        if (result.success) {
          this.$message.success(result.message || "保存成功");

          // ✅ 重新載入品號列表
          await this.loadProductData();

          // ✅ 關閉編輯對話框
          this.productDialogVisible = false;
        } else {
          this.$message.error(result.message || "保存失敗");
        }
      } catch (error) {
        console.error("保存品號失敗:", error);
        this.$message.error("保存品號失敗");
      } finally {
        this.loading = false;
      }
    },

    // 處理批次匯入提交
    async handleBatchImportSubmit(data) {
      try {
        this.loading = true;
        const result = await MultiSkuService.batchImportProducts(data);

        if (result.success) {
          this.$message.success(result.message || "批次匯入成功");
          this.batchImportDialogVisible = false;
          // 重新載入數據
          await this.loadProductData();
          await this.loadProductHistoryData();
        } else {
          this.$message.error(result.message || "批次匯入失敗");
        }
      } catch (error) {
        console.error("批次匯入失敗:", error);
        this.$message.error("批次匯入失敗");
      } finally {
        this.loading = false;
      }
    },

    // 取得欄位顯示名稱
    getFieldLabel(fieldName) {
      return this.fieldLabels[fieldName] || fieldName;
    },

    // 從歷史記錄獲取品名
    getProductNameFromHistory(history) {
      try {
        if (history.afterValue) {
          const data = JSON.parse(history.afterValue);
          return data.productName || data.name || "";
        }
      } catch (error) {
        console.error("解析品名失敗:", error);
      }
      return "";
    },

    // 從歷史記錄獲取規格
    getSpecificationFromHistory(history) {
      try {
        if (history.afterValue) {
          const data = JSON.parse(history.afterValue);
          return data.specification || "";
        }
      } catch (error) {
        console.error("解析規格失敗:", error);
      }
      return "";
    },

    // 格式化簡單值
    formatSimpleValue(value) {
      if (value === null || value === undefined) return "";
      if (typeof value === "object") return JSON.stringify(value);
      return String(value);
    },

    // 查看品號異動紀錄
    viewProductHistory(row) {
      this.lastViewedRow = row;
      this.activeTab = "product-history";
      this.showBackButton = true;

      // 計算默認的日期範圍 (例如：最近30天)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // 最近30天

      console.log(
        `查看品號 ${row.productCode} 的異動記錄，日期範圍：${formatDate(
          startDate,
          "YYYY-MM-DD"
        )} 至 ${formatDate(endDate, "YYYY-MM-DD")}`
      );

      // 載入特定品號的歷史記錄
      this.loadProductHistoryData(row.id);

      // 設定搜尋條件
      this.$nextTick(() => {
        if (this.$refs.historySearch) {
          this.$refs.historySearch.setDefaults({
            keyword: row.productCode,
            field: "productCode",
            dateRange: [startDate, endDate], // 添加默認日期範圍
            search: true
          });
        }
      });
    },

    // 格式化日期時間顯示
    formatDateDisplay(dateString, format = "YYYY-MM-DD HH:mm:ss") {
      if (!dateString) return "-";

      try {
        return formatDate(dateString, format);
      } catch (error) {
        console.error("日期顯示格式化錯誤:", error);
        return dateString;
      }
    },

    // 格式化 ISO 日期
    formatISODate(dateString) {
      if (!dateString) return null;

      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;
        return date.toISOString();
      } catch (error) {
        console.error("日期格式化錯誤:", error);
        return null;
      }
    },

    // 返回品號列表
    backToProducts() {
      this.activeTab = "products";
      this.categorysTab = "overview";
      this.showBackButton = false;

      // 清除歷史記錄的搜尋
      if (this.$refs.historySearch) {
        this.$refs.historySearch.clear();
      }

      this.$nextTick(() => {
        if (this.lastViewedRow) {
          const table = this.$refs.productTable;
          if (table) {
            const rows = table.$el.querySelectorAll(".el-table__row");
            for (let i = 0; i < rows.length; i++) {
              const cells = rows[i].getElementsByTagName("td");
              if (
                cells.length > 0 &&
                cells[1].textContent.trim() === this.lastViewedRow.productCode
              ) {
                // 滾動到目標行
                rows[i].scrollIntoView({ behavior: "smooth", block: "center" });

                // 添加高亮效果
                rows[i].classList.add("highlight-row");
                setTimeout(() => {
                  rows[i].classList.remove("highlight-row");
                }, 2000);

                break;
              }
            }
          }
        }
      });
    },

    // 數據過濾方法
    filterData(data, keyword, field) {
      if (!keyword) return data;

      return data.filter(item => {
        if (!field) {
          // 全欄位搜索
          return Object.values(item).some(
            val =>
              val !== null &&
              val !== undefined &&
              String(val)
                .toLowerCase()
                .includes(keyword.toLowerCase())
          );
        }

        // 特定欄位搜索
        const value = item[field];
        return (
          value !== null &&
          value !== undefined &&
          String(value)
            .toLowerCase()
            .includes(keyword.toLowerCase())
        );
      });
    },

    // 日期範圍過濾
    filterByDateRange(data, dateRange) {
      if (!dateRange || dateRange.length !== 2) return data;

      const [startDate, endDate] = dateRange;
      if (!startDate || !endDate) return data;

      // 確保開始日期從當天的 00:00:00 開始
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      // 確保結束日期到當天的 23:59:59 結束
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      // 添加調試信息
      console.log("過濾日期範圍:", {
        start: start.toISOString(),
        end: end.toISOString()
      });

      // 使用強化的日期過濾邏輯
      return data.filter(record => {
        // 安全檢查
        if (!record.datetime) {
          console.warn("記錄缺少 datetime 欄位:", record);
          return false;
        }

        try {
          // 將記錄的日期轉換為 Date 對象
          const recordDate = new Date(record.datetime);

          // 檢查日期是否有效
          if (isNaN(recordDate.getTime())) {
            console.warn("無效的日期格式:", record.datetime);
            return false;
          }

          // 完整的日期時間比較
          const result = recordDate >= start && recordDate <= end;

          return result;
        } catch (error) {
          console.error("日期比較錯誤:", error);
          return false;
        }
      });
    },

    // 取得異動類型標籤樣式
    getTypeTag(type) {
      const tags = {
        create: "success",
        update: "warning",
        delete: "danger"
      };
      return tags[type] || "info";
    },

    // 取得異動類型顯示文字
    getTypeLabel(type) {
      const labels = {
        create: "新增",
        update: "修改",
        delete: "刪除"
      };
      return labels[type] || type;
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

.changes-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.change-item {
  padding: 4px 0;
}

.change-summary {
  font-weight: bold;
  margin-bottom: 4px;
}

.change-detail {
  margin-left: 12px;
  margin-bottom: 4px;
}

.field-name {
  font-weight: bold;
  color: #606266;
  margin-right: 8px;
}

.change-values {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
}

.old-value {
  color: #f56c6c;
  text-decoration: line-through;
  font-size: 0.9em;
}

.new-value {
  color: #67c23a;
  font-weight: bold;
}

.no-changes {
  color: #909399;
  font-style: italic;
}

.danger-text {
  color: #f56c6c;
}

.multi-sku {
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

    .product-tabs {
      ::v-deep .el-tabs__header {
        margin: 0;
        padding: 0 20px;
        background: #f8f9fa;
      }

      ::v-deep .el-tabs__nav {
        border: none;
      }

      ::v-deep .el-tabs__item {
        height: 40px;
        line-height: 40px;
        font-size: $font-size-base;
        border: none;
        margin: 0;
        padding: 0 20px;

        &:hover {
          color: $primary-color;
        }

        &.is-active {
          background: white;
          border-bottom: 2px solid $primary-color;
          font-weight: 500;
        }
      }

      .el-tab-pane {
        padding: 20px;
      }
    }

    // 分類標籤樣式
    .categorys-tabs {
      margin: 0 -20px 20px;

      ::v-deep .el-tabs__header {
        margin: 0;
        padding: 0 20px;
        background: #f8f9fa;
        border-bottom: 1px solid #e4e7ed;
      }

      ::v-deep .el-tabs__nav {
        border: none;
      }

      ::v-deep .el-tabs__item {
        height: 40px;
        line-height: 40px;
        font-size: $font-size-base;
        border: none;
        margin: 0;
        padding: 0 20px;

        &:hover {
          color: $primary-color;
        }

        &.is-active {
          background: white;
          border-bottom: 2px solid $primary-color;
          font-weight: 500;
        }
      }

      .el-tab-pane {
        padding: 20px;
      }
    }
  }

  // 表格操作區域
  .table-operations {
    margin-bottom: 20px;

    .operation-wrapper {
      padding: 16px;
      background: #f8f9fa;
      border-radius: $border-radius;

      .search-filters {
        display: flex;
        gap: 16px;
        align-items: center;
        flex-wrap: wrap;
      }
    }
  }

  // 標籤樣式
  .el-tag {
    border-radius: 4px;
    padding: 0 8px;
    height: 24px;
    line-height: 22px;

    &--small {
      height: 20px;
      padding: 0 6px;
      line-height: 18px;
    }
  }

  // 狀態文字樣式
  .text-success {
    color: $success-color;
  }
  .text-danger {
    color: $danger-color;
  }
  .text-warning {
    color: $warning-color;
  }

  // 高亮效果
  .highlight-row {
    background-color: rgba($primary-color, 0.1);
    transition: background-color 0.5s ease;
  }
}

// 響應式設計
@media screen and (max-width: 768px) {
  .multi-sku {
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
        .search-filters {
          flex-direction: column;
          gap: 12px;

          > * {
            width: 100%;
          }
        }
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
