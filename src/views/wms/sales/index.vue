<template>
  <div class="sales-management">
    <!-- 頁面標題區域 -->
    <div class="page-header">
      <h2>訂單管理</h2>
    </div>

    <!-- 主要內容區域 -->
    <div class="page-content">
      <el-tabs v-model="activeTab" type="border-card" class="sales-tabs">
        <!-- 訂單列表 -->
        <el-tab-pane label="訂單列表" name="sales-list">
          <div class="table-operations">
            <div class="operation-wrapper">
              <div class="search-filters">
                <combined-search
                  ref="salesSearch"
                  :search-value="salesSearchQuery"
                  :time-value="salesDateRange"
                  :search-placeholder="'搜尋'"
                  :search-button-text="'搜尋'"
                  :show-search-button="true"
                  :search-button-icon="'el-icon-search'"
                  :immediate-search="false"
                  :time-shortcuts="true"
                  @search="handleCombinedSearch"
                />
                <el-button
                  v-if="isFiltering"
                  type="warning"
                  icon="el-icon-refresh-right"
                  @click="resetFilters"
                  >重置篩選</el-button
                >
              </div>
            </div>
          </div>

          <!-- 子標籤：狀態分類 -->
          <el-tabs v-model="statusTab" type="card" class="status-tabs">
            <!-- 總覽標籤 -->
            <el-tab-pane label="總覽" name="all">
              <data-table
                ref="salesTable"
                :data="filteredSalesData"
                :columns="salesColumns"
                :sub-table-columns="salesDetailColumns"
                :loading="loading"
                :show-selection-column="true"
                :show-index="false"
                :show-action-column="true"
                row-key="id"
                sub-row-key="id"
                action-label="操作"
                action-width="160"
                action-fixed="right"
                :status-options="fulfillmentStatusOptions"
                @selection-change="handleSelectionChange"
                @sort-change="handleSortChange"
                @expand-change="handleExpandChange"
                @sub-row-click="handleSubRowClick"
                @batch-update="handleBatchUpdate"
              >
                <!-- 自訂列格式插槽 -->
                <template #column-fulfillment_status="{ row }">
                  <el-tag
                    :type="getFulfillmentStatusType(row.fulfillment_status)"
                    size="small"
                    effect="dark"
                  >
                    {{ getFulfillmentStatusLabel(row.fulfillment_status) }}
                  </el-tag>
                </template>

                <template #column-final_amount="{ row }">
                  <span class="amount">{{
                    formatCurrency(row.final_amount)
                  }}</span>
                </template>

                <template #column-create_time="{ row }">
                  {{ formatDate(row.create_time) }}
                </template>

                <!-- 操作列插槽 -->
                <template #action="{ row }">
                  <el-tooltip content="編輯訂單" placement="top">
                    <el-button
                      size="mini"
                      type="primary"
                      icon="el-icon-edit"
                      @click="handleEdit(row)"
                    ></el-button>
                  </el-tooltip>
                  <!-- <el-tooltip content="查看訂單異動紀錄" placement="top">
                    <el-button
                      size="mini"
                      type="warning"
                      icon="el-icon-document"
                      @click="viewSalesHistory(row)"
                    ></el-button>
                  </el-tooltip> -->
                </template>
              </data-table>
            </el-tab-pane>

            <!-- 按狀態分類的標籤 -->
            <el-tab-pane
              v-for="status in fulfillmentStatusOptions"
              :key="status.value"
              :label="status.label"
              :name="status.value"
            >
              <data-table
                :data="getStatusFilteredData(status.value)"
                :columns="salesColumns"
                :sub-table-columns="salesDetailColumns"
                :loading="loading"
                :show-selection-column="true"
                :show-index="false"
                :show-action-column="true"
                row-key="id"
                sub-row-key="id"
                action-label="操作"
                action-width="160"
                action-fixed="right"
                :status-options="fulfillmentStatusOptions"
                @selection-change="handleSelectionChange"
                @sort-change="handleSortChange"
                @expand-change="handleExpandChange"
                @sub-row-click="handleSubRowClick"
                @batch-update="handleBatchUpdate"
              >
                <!-- 自訂列格式插槽 -->
                <template #column-fulfillment_status="{ row }">
                  <el-tag
                    :type="getFulfillmentStatusType(row.fulfillment_status)"
                    size="small"
                    effect="dark"
                  >
                    {{ getFulfillmentStatusLabel(row.fulfillment_status) }}
                  </el-tag>
                </template>

                <template #column-final_amount="{ row }">
                  <span class="amount">{{
                    formatCurrency(row.final_amount)
                  }}</span>
                </template>

                <template #column-create_time="{ row }">
                  {{ formatDate(row.create_time) }}
                </template>

                <!-- 操作列插槽 -->
                <template #action="{ row }">
                  <el-tooltip content="編輯訂單" placement="top">
                    <el-button
                      size="mini"
                      type="primary"
                      icon="el-icon-edit"
                      @click="handleEdit(row)"
                    ></el-button>
                  </el-tooltip>
                  <!-- <el-tooltip content="查看訂單異動紀錄" placement="top">
                    <el-button
                      size="mini"
                      type="warning"
                      icon="el-icon-document"
                      @click="viewSalesHistory(row)"
                    ></el-button>
                  </el-tooltip> -->
                </template>
              </data-table>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>

        <!-- 訂單異動紀錄 -->
        <!-- <el-tab-pane label="訂單異動紀錄" name="sales-history">
          <div class="table-operations">
            <div class="operation-wrapper">
              <div class="search-filters">
                <el-button
                  v-if="showBackButton"
                  type="primary"
                  icon="el-icon-back"
                  @click="backToSalesList"
                  >返回訂單列表</el-button
                >
                <combined-search
                  ref="historySearch"
                  :search-value="salesHistorySearchQuery"
                  :time-value="historyDateRange"
                  :search-placeholder="'搜尋訂單異動...'"
                  :search-button-text="'搜尋'"
                  :show-search-button="true"
                  :search-button-icon="'el-icon-search'"
                  :immediate-search="false"
                  :time-shortcuts="true"
                  @search="handleCombinedHistorySearch"
                />
                <el-button
                  v-if="isHistoryFiltering"
                  type="warning"
                  icon="el-icon-refresh-right"
                  @click="resetHistoryFilters"
                  >重置篩選</el-button
                >
              </div>
            </div>
          </div> -->

        <!-- 使用 BaseTable 組件顯示異動記錄 -->
        <!-- <base-table
            ref="historyTable"
            :data="filteredSalesHistoryData"
            :columns="historyColumns"
            :loading="loading"
            :show-selection-column="true"
            :show-index="true"
            :show-toolbar="true"
            :show-pagination="true"
            :page-sizes="[10, 20, 50, 100]"
            :filename="'sales-history-export'"
            border
          >
            <template #column-type="{ row }">
              <el-tag :type="getTypeTag(row.type)" size="small" effect="dark">
                {{ getTypeLabel(row.type) }}
              </el-tag>
            </template>

            <template #column-beforeValue="{ row }">
              <span class="text-danger">
                {{ formatHistoryValue(row.beforeValue) }}
              </span>
            </template>

            <template #column-afterValue="{ row }">
              <span class="text-success">
                {{ formatHistoryValue(row.afterValue) }}
              </span>
            </template>
          </base-table>
        </el-tab-pane> -->
      </el-tabs>
    </div>

    <!-- 對話框組件 -->
    <SalesOrderDialog
      :order-data="currentEditRow"
      :visible.sync="salesDialogVisible"
      @save="handleSaveSales"
    />
  </div>
</template>

<script>
import CombinedSearch from "@/components/SearchBox/CombinedSearch.vue";
import DataTable from "@/components/DataTable/index.vue";
import BaseTable from "@/components/BaseTable/index.vue";
import SalesOrderDialog from "./components/SalesOrderDialog.vue";
import { formatDate } from "@/utils/date";
import { formatPhone } from "@/utils/dataTable";
import { getTypeTag, getTypeLabel } from "@/utils/statusHelpers";
import SalesService from "./services/SalesService";
import SalesServices from "./services/SalesServices";

export default {
  name: "SalesManagement",
  components: {
    CombinedSearch,
    DataTable,
    BaseTable,
    SalesOrderDialog
  },
  data() {
    return {
      activeTab: "sales-list",
      statusTab: "all",
      loading: false,
      showBackButton: false,
      lastViewedRow: null,

      // 記錄上次搜尋條件，避免重複請求
      lastSearchParams: null,
      lastHistorySearchParams: null,

      // 訂單列表相關數據
      salesData: [],
      allSalesData: [], // 儲存所有原始數據，用於重置篩選
      selectedRows: [],
      salesSearchQuery: "",
      salesDateRange: [],
      isFiltering: false,
      filterFulfillmentStatus: "",

      // 異動記錄相關數據
      salesHistoryData: [],
      allSalesHistoryData: [], // 儲存所有原始數據，用於重置篩選
      salesHistorySearchQuery: "",
      historyDateRange: [],
      currentSalesId: null,
      isHistoryFiltering: false,

      // 對話框相關數據
      salesDialogVisible: false,
      shipmentDialogVisible: false,
      currentEditRow: null,
      currentShipOrder: null,
      currentDetailRow: null,

      // 履行狀態選項
      fulfillmentStatusOptions: [
        { label: "未處理", value: "unprocessed", type: "warning" },
        { label: "已處理", value: "processed", type: "success" },
        { label: "處理取消", value: "cancelled", type: "danger" }
      ],

      // 表格列配置
      salesColumns: [
        { prop: "order_number", label: "訂單編號", sortable: true, width: 150 },
        {
          prop: "receiver_name",
          label: "收件人",
          sortable: true,
          width: 120
        },
        { prop: "receiver_phone", label: "收件電話", width: 130 },
        { prop: "fulfillment_status", label: "處理狀態", width: 100 },
        { prop: "receiver_address", label: "收件地址", width: 150 },
        { prop: "create_time", label: "下單日期", sortable: true, width: 150 },
        {
          prop: "shipping_notes",
          label: "備註",
          width: 200,
          showOverflowTooltip: false
        }
      ],
      salesDetailColumns: [
        { prop: "order_number", label: "訂單編號", sortable: true, width: 250 },
        { prop: "product_name", label: "商品名稱", width: 200 },
        { prop: "item_code", label: "品號", width: 200 },
        { prop: "batch_number", label: "批號", width: 200 },
        { prop: "quantity", label: "數量", width: 100, align: "right" }
      ],
      historyColumns: [
        { prop: "user", label: "操作人員", width: 120 },
        { prop: "type", label: "操作類型", width: 100 },
        { prop: "field", label: "欄位", width: 120 },
        { prop: "beforeValue", label: "修改前", width: 200 },
        { prop: "afterValue", label: "修改後", width: 200 },
        { prop: "create_time", label: "操作時間", width: 160, sortable: true }
      ]
    };
  },

  computed: {
    // 過濾後的訂單數據
    filteredSalesData() {
      return this.salesData;
    },

    // 過濾後的訂單異動記錄
    filteredSalesHistoryData() {
      return this.salesHistoryData;
    },

    // 判斷當前是否有篩選條件
    hasFilters() {
      return (
        this.filterFulfillmentStatus ||
        (this.salesDateRange && this.salesDateRange.length === 2) ||
        this.salesSearchQuery
      );
    }
  },

  created() {
    // 設置狀態選項
    this.fulfillmentStatusOptions = this.fulfillmentStatusOptions;
    // 獲取訂單數據
    this.fetchSalesData();
  },

  methods: {
    // 格式化方法
    formatDate,
    formatPhone,
    getTypeTag,
    getTypeLabel,

    // 格式化貨幣
    formatCurrency(value) {
      if (!value) return "NT$ 0";
      return `NT$ ${parseFloat(value).toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })}`;
    },

    // 獲取特定狀態的訂單單
    getStatusFilteredData(status) {
      return this.filteredSalesData.filter(
        sales => sales.fulfillment_status === status
      );
    },

    // 獲取狀態標籤樣式
    getFulfillmentStatusType(status) {
      const statusInfo = this.fulfillmentStatusOptions.find(
        option => option.value === status
      );
      return statusInfo ? statusInfo.type : "info";
    },

    // 獲取狀態顯示文字
    getFulfillmentStatusLabel(status) {
      const statusInfo = this.fulfillmentStatusOptions.find(
        option => option.value === status
      );
      return statusInfo ? statusInfo.label : status;
    },

    // 訂單列表相關方法
    async fetchSalesData(params = null) {
      this.loading = true;
      try {
        const queryParams = params || this.getQueryParams();

        // 調用訂單服務，添加分頁參數
        const response = await SalesServices.getAdminOrderList({
          page: this.currentPage,
          limit: this.pageSize,
          filters: queryParams
        });

        // 判斷數據結構並設置正確的訂單數據陣列和總數
        let salesArray = [];
        let totalCount = 0;

        // 兼容兩種可能的 API 返回結構
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            salesArray = response.data;
            totalCount = response.total || 0;
          } else if (
            response.data.results &&
            Array.isArray(response.data.results)
          ) {
            salesArray = response.data.results;
            totalCount = response.data.count || 0;
          } else {
            console.warn("無法識別的 API 返回數據結構:", response);
            salesArray = [];
            totalCount = 0;
          }
        } else {
          console.warn("API 返回數據缺少 data 屬性:", response);
          salesArray = [];
          totalCount = 0;
        }

        // 確保數據映射
        if (salesArray.length > 0) {
          // 映射數據格式，確保所有數值類型的欄位都有初始值
          const mappedData = salesArray.map(order => {
            // 處理子項目數據
            const orderItems = [];

            // 確保 items 是數組且有內容
            if (
              order.items &&
              Array.isArray(order.items) &&
              order.items.length > 0
            ) {
              // 為每個 item 添加 serialNumber
              order.shipment_items.forEach((item, index) => {
                // 創建一個新對象，包含原始 item 的所有屬性，添加 serialNumber
                orderItems.push({
                  ...item,
                  serialNumber: `${order.order_number || ""}-${index + 1}`
                });
              });
            }

            return {
              id: order.id,
              order_number: order.order_number || "",
              create_time: order.create_time || "",
              fulfillment_status: order.fulfillment_status || "unprocessed",
              payment_method: order.payment_method || "",
              receiver_name: order.receiver_name || "",
              receiver_phone: order.receiver_phone || "",
              final_amount: this.parseNumber(order.final_amount),
              total_amount: this.parseNumber(order.total_amount),
              discount_amount: this.parseNumber(order.discount_amount),
              receiver_address: order.receiver_address || "",
              shipping_notes: order.shipping_notes || "",
              paid_at: order.paid_at || "",
              completed_at: order.completed_at || "",
              cancelled_at: order.cancelled_at || "",
              // 使用處理後的子項目數據
              details: orderItems
            };
          });

          this.salesData = mappedData;
          this.totalSales = totalCount;

          // 若是初次載入或重置篩選，則更新 allSalesData
          if (!params || !Object.keys(params).length) {
            this.allSalesData = [...this.salesData];
            this.isFiltering = false;
          } else {
            this.isFiltering = true;
          }
        } else {
          this.salesData = [];
          this.totalSales = 0;
          console.warn("API 返回的數據為空或無法處理");
        }
      } catch (error) {
        this.$message.error("獲取訂單數據失敗: " + error.message);
        console.error("訂單數據載入錯誤:", error);
        this.salesData = []; // 確保出錯時也有空陣列
        this.totalSales = 0;
      } finally {
        this.loading = false;
      }
    },

    // 解析數字方法
    parseNumber(value) {
      if (value === null || value === undefined || value === "") {
        return 0;
      }
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    },

    // 獲取查詢參數
    getQueryParams() {
      const params = {};

      if (this.salesDateRange && this.salesDateRange.length === 2) {
        params.startDate = formatDate(this.salesDateRange[0], "YYYY-MM-DD");
        params.endDate = formatDate(this.salesDateRange[1], "YYYY-MM-DD");
      }

      if (this.salesSearchQuery) {
        params.search = this.salesSearchQuery;
      }

      if (this.filterFulfillmentStatus) {
        params.fulfillment_status = this.filterFulfillmentStatus;
      }

      return params;
    },

    // 處理CombinedSearch組件的搜尋事件
    handleCombinedSearch(searchParams) {
      console.log("收到搜尋參數:", searchParams);

      // 更新本地的搜尋條件
      this.salesSearchQuery = searchParams.keyword || "";
      this.salesDateRange = searchParams.dateRange || [];

      // 執行搜尋
      this.handleSearch();
    },

    // 搜尋功能
    handleSearch() {
      const params = this.getQueryParams();

      // 檢查是否和上次搜尋參數相同，避免重複請求
      const paramsStr = JSON.stringify(params);
      if (this.lastSearchParams === paramsStr) {
        return;
      }

      this.lastSearchParams = paramsStr;
      this.fetchSalesData(params);
    },

    resetFilters() {
      this.salesSearchQuery = "";
      this.salesDateRange = [];
      this.filterFulfillmentStatus = "";
      if (this.$refs.salesSearch) {
        this.$refs.salesSearch.clear();
      }
      this.salesData = [...this.allSalesData];
      this.isFiltering = false;
      this.lastSearchParams = null;

      // 通知用戶重置成功
      this.$message.success("已重置篩選條件");
    },

    // 異動記錄相關方法
    async fetchSalesHistoryData(salesId = null, params = null) {
      this.loading = true;
      try {
        const queryParams = params || {};

        if (salesId) {
          queryParams.salesId = salesId;
          this.showBackButton = true;
          this.currentSalesId = salesId;
          this.lastViewedRow = this.salesData.find(item => item.id === salesId);
        } else {
          this.showBackButton = false;
          this.currentSalesId = null;

          if (this.historyDateRange && this.historyDateRange.length === 2) {
            queryParams.startDate = formatDate(
              this.historyDateRange[0],
              "YYYY-MM-DD"
            );
            queryParams.endDate = formatDate(
              this.historyDateRange[1],
              "YYYY-MM-DD"
            );
          }

          if (this.salesHistorySearchQuery) {
            queryParams.search = this.salesHistorySearchQuery;
          }
        }

        const response = await SalesService.getSalesHistory(queryParams);
        this.salesHistoryData = response.data || [];

        // 若是初次加載或特定訂單單的記錄，則更新 allSalesHistoryData
        if (salesId || !Object.keys(params || {}).length) {
          this.allSalesHistoryData = [...this.salesHistoryData];
          this.isHistoryFiltering = false;
        } else {
          this.isHistoryFiltering = true;
        }
      } catch (error) {
        this.$message.error("獲取訂單異動記錄失敗: " + error.message);
        this.salesHistoryData = []; // 確保出錯時也有空數組
      } finally {
        this.loading = false;
      }
    },

    // 處理CombinedSearch組件的歷史搜尋事件
    handleCombinedHistorySearch(searchParams) {
      console.log("收到歷史搜尋參數:", searchParams);

      // 更新本地的搜尋條件
      this.salesHistorySearchQuery = searchParams.keyword || "";
      this.historyDateRange = searchParams.dateRange || [];

      // 執行搜尋
      this.handleHistorySearch();
    },

    handleHistorySearch() {
      const params = {};

      if (this.historyDateRange && this.historyDateRange.length === 2) {
        params.startDate = formatDate(this.historyDateRange[0], "YYYY-MM-DD");
        params.endDate = formatDate(this.historyDateRange[1], "YYYY-MM-DD");
      }

      if (this.salesHistorySearchQuery) {
        params.search = this.salesHistorySearchQuery;
      }

      if (this.currentSalesId) {
        params.salesId = this.currentSalesId;
      }

      // 檢查是否和上次搜尋參數相同，避免重複請求
      const paramsStr = JSON.stringify(params);
      if (this.lastHistorySearchParams === paramsStr) {
        return;
      }

      this.lastHistorySearchParams = paramsStr;
      this.fetchSalesHistoryData(null, params);
    },

    resetHistoryFilters() {
      this.salesHistorySearchQuery = "";
      this.historyDateRange = [];
      if (this.$refs.historySearch) {
        this.$refs.historySearch.clear();
      }
      this.salesHistoryData = [...this.allSalesHistoryData];
      this.isHistoryFiltering = false;
      this.lastHistorySearchParams = null;

      // 通知用戶重置成功
      this.$message.success("已重置異動記錄篩選條件");
    },

    formatHistoryValue(value) {
      if (value === null || value === undefined) {
        return "-";
      }

      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === "object") {
          return "[物件資料]";
        }
        return value;
      } catch {
        return value;
      }
    },

    handleEdit(row) {
      this.currentEditRow = JSON.parse(JSON.stringify(row));
      this.salesDialogVisible = true;
    },

    handleSelectionChange(selection) {
      this.selectedRows = selection;
    },

    handleSortChange({ prop, order }) {
      // 排序變化處理
      console.log("排序變化:", prop, order);
    },

    handleExpandChange(row, expanded) {
      // 展開/折疊處理
      console.log("行展開狀態變化:", row, expanded);
    },

    handleSubRowClick(subRow, parentRow) {
      // 子表格行點擊處理
      console.log("子表格行點擊:", subRow, parentRow);
    },

    async handleSaveSales() {
      try {
        this.loading = true;
        this.salesDialogVisible = false;
        this.fetchSalesData();
      } catch (error) {
        this.$message.error("保存失敗: " + error.message);
      } finally {
        this.loading = false;
      }
    },

    viewSalesHistory(row) {
      this.activeTab = "sales-history";
      this.fetchSalesHistoryData(row.id);
    },

    backToSalesList() {
      this.activeTab = "sales-list";
      this.statusTab = "all";
      this.historyDateRange = [];
      this.salesHistorySearchQuery = "";
      this.showBackButton = false;

      this.$nextTick(() => {
        if (this.lastViewedRow) {
          const table = this.$refs.salesTable;
          if (table) {
            const rows = table.$el.querySelectorAll(".el-table__row");
            for (let i = 0; i < rows.length; i++) {
              const cells = rows[i].getElementsByTagName("td");
              if (
                cells.length > 0 &&
                cells[0].textContent === this.lastViewedRow.order_number
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

    handleCreateNew() {
      this.currentEditRow = {
        items: [],
        shipping_notes: "",
        receiver_name: "",
        receiver_phone: "",
        receiver_address: "",
        payment_method: "bankTransfer",
        fulfillment_status: "unprocessed"
      };
      this.salesDialogVisible = true;
    },

    async handleSaveShipment(data) {
      try {
        this.loading = true;
        await SalesService.updateShipment(data);
        this.$message.success("出貨安排已成功儲存");
        this.shipmentDialogVisible = false;
        this.fetchSalesData();
      } catch (error) {
        this.$message.error("儲存出貨安排失敗: " + error.message);
      } finally {
        this.loading = false;
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

.sales-management {
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

    .sales-tabs {
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

    // 狀態標籤樣式
    .status-tabs {
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
  .sales-management {
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
