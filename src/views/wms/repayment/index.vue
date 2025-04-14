<template>
  <div class="refund-processing-management">
    <!-- 頁面標題區域 -->
    <div class="page-header">
      <h2>退款處理管理</h2>
    </div>

    <!-- 主要內容區域 -->
    <div class="page-content">
      <el-tabs v-model="activeTab" type="border-card" class="refund-tabs">
        <!-- 退款處理列表 -->
        <el-tab-pane label="退款處理列表" name="refund-processing-list">
          <div class="table-operations">
            <div class="operation-wrapper">
              <div class="search-filters">
                <combined-search
                  ref="refundProcessingSearch"
                  :search-value="searchQuery"
                  :time-value="dateRange"
                  :search-placeholder="'搜尋退款處理單...'"
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
                ref="refundProcessingTable"
                :data="filteredRefundProcessingData"
                :columns="refundProcessingColumns"
                :loading="loading"
                :show-selection-column="true"
                :show-index="false"
                :show-action-column="true"
                :show-sub-table="false"
                :show-batch-update-button="false"
                row-key="id"
                action-label="操作"
                action-width="160"
                action-fixed="right"
                :status-options="statusOptions"
                @selection-change="handleSelectionChange"
                @sort-change="handleSortChange"
                @batch-update="handleBatchUpdate"
                @export="handleExport"
              >
                <!-- 自訂列格式插槽 -->
                <template #column-applyDate="{ row }">
                  {{ formatDate(row.applyDate) }}
                </template>

                <template #column-status="{ row }">
                  <el-tag
                    :type="getStatusType(row.status)"
                    size="small"
                    effect="dark"
                  >
                    {{ getStatusLabel(row.status) }}
                  </el-tag>
                </template>

                <template #column-refundMethod="{ row }">
                  <span>{{ getRefundMethodLabel(row.refundMethod) }}</span>
                </template>

                <template #column-refundAmount="{ row }">
                  <span class="refund-amount">{{
                    formatCurrency(row.refundAmount)
                  }}</span>
                </template>

                <template #column-scheduledDate="{ row }">
                  {{ formatDate(row.scheduledDate) }}
                </template>

                <template #column-completedDate="{ row }">
                  {{ row.completedDate ? formatDate(row.completedDate) : "-" }}
                </template>

                <template #column-bankInfo="{ row }">
                  <bank-info-display
                    :bank-info="row.bankInfo"
                    :bank-options="bankOptions"
                  />
                </template>

                <!-- 備註欄位插槽 -->
                <template #column-remarks="{ row }">
                  <latest-remark-preview
                    :remark="getLatestRemark(row.id)"
                    :remark-count="getRemarkCount(row.id)"
                    :add-remark-text="'添加備註'"
                    @view-timeline="openRemarkTimeline(row)"
                  />
                </template>

                <!-- 操作列插槽 -->
                <template #action="{ row }">
                  <el-tooltip content="編輯退款處理" placement="top">
                    <el-button
                      size="mini"
                      type="primary"
                      icon="el-icon-edit"
                      @click="handleEdit(row)"
                      :disabled="row.status === 'completed'"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip content="查看異動紀錄" placement="top">
                    <el-button
                      size="mini"
                      type="warning"
                      icon="el-icon-document"
                      @click="viewProcessingHistory(row)"
                    ></el-button>
                  </el-tooltip>
                  <el-dropdown
                    size="mini"
                    @command="cmd => handleMoreActions(cmd, row)"
                  >
                    <el-button size="mini" type="text">
                      <i class="el-icon-more"></i>
                    </el-button>
                  </el-dropdown>
                </template>
              </data-table>
            </el-tab-pane>

            <!-- 按狀態分類的標籤 -->
            <el-tab-pane
              v-for="status in statusOptions"
              :key="status.value"
              :label="status.label"
              :name="status.value"
            >
              <data-table
                :data="getStatusFilteredData(status.value)"
                :columns="refundProcessingColumns"
                :loading="loading"
                :show-selection-column="true"
                :show-index="false"
                :show-action-column="true"
                :show-sub-table="false"
                :show-batch-update-button="false"
                row-key="id"
                action-label="操作"
                action-width="160"
                action-fixed="right"
                :status-options="statusOptions"
                @selection-change="handleSelectionChange"
                @sort-change="handleSortChange"
                @batch-update="handleBatchUpdate"
                @export="handleExport"
              >
                <!-- 自訂列格式插槽 -->
                <template #column-applyDate="{ row }">
                  {{ formatDate(row.applyDate) }}
                </template>

                <template #column-status="{ row }">
                  <el-tag
                    :type="getStatusType(row.status)"
                    size="small"
                    effect="dark"
                  >
                    {{ getStatusLabel(row.status) }}
                  </el-tag>
                </template>

                <template #column-refundMethod="{ row }">
                  <span>{{ getRefundMethodLabel(row.refundMethod) }}</span>
                </template>

                <template #column-refundAmount="{ row }">
                  <span class="refund-amount">{{
                    formatCurrency(row.refundAmount)
                  }}</span>
                </template>

                <template #column-scheduledDate="{ row }">
                  {{ formatDate(row.scheduledDate) }}
                </template>

                <template #column-completedDate="{ row }">
                  {{ row.completedDate ? formatDate(row.completedDate) : "-" }}
                </template>

                <template #column-bankInfo="{ row }">
                  <bank-info-display
                    :bank-info="row.bankInfo"
                    :bank-options="bankOptions"
                  />
                </template>

                <!-- 備註欄位插槽 -->
                <template #column-remarks="{ row }">
                  <latest-remark-preview
                    :remark="getLatestRemark(row.id)"
                    :remark-count="getRemarkCount(row.id)"
                    :add-remark-text="'添加備註'"
                    @view-timeline="openRemarkTimeline(row)"
                  />
                </template>

                <!-- 操作列插槽 -->
                <template #action="{ row }">
                  <el-tooltip content="編輯退款處理" placement="top">
                    <el-button
                      size="mini"
                      type="primary"
                      icon="el-icon-edit"
                      @click="handleEdit(row)"
                      :disabled="row.status === 'completed'"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip content="查看異動紀錄" placement="top">
                    <el-button
                      size="mini"
                      type="warning"
                      icon="el-icon-document"
                      @click="viewProcessingHistory(row)"
                    ></el-button>
                  </el-tooltip>
                </template>
              </data-table>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>

        <!-- 退款處理異動紀錄 -->
        <el-tab-pane label="退款處理異動紀錄" name="refund-processing-history">
          <div class="table-operations">
            <div class="operation-wrapper">
              <div class="search-filters">
                <el-button
                  v-if="showBackButton"
                  type="primary"
                  icon="el-icon-back"
                  @click="backToProcessingList"
                  >返回退款處理列表</el-button
                >
                <combined-search
                  ref="historySearch"
                  :search-value="historySearchQuery"
                  :time-value="historyDateRange"
                  :search-placeholder="'搜尋退款處理異動...'"
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
          </div>

          <!-- 使用 BaseTable 組件顯示異動記錄 -->
          <base-table
            ref="historyTable"
            :data="filteredHistoryData"
            :columns="historyColumns"
            :loading="loading"
            :show-selection-column="false"
            :show-index="true"
            :show-toolbar="true"
            :show-pagination="true"
            :page-sizes="[10, 20, 50, 100]"
            :filename="'refund-processing-history-export'"
            border
          >
            <!-- 自訂列格式插槽 -->
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
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 備註時間線對話框 -->
    <remark-timeline-dialog
      :visible.sync="remarkDialogVisible"
      :remarks="currentRemarks"
      :order-id="currentRefundId"
      :order-info="currentRefundInfo"
      :has-more="hasMoreRemarks"
      :is-loading="loadingRemarks"
      @load-more="loadMoreRemarks"
      @add-remark="addRemark"
      @update-remark="updateRemark"
      @delete-remark="deleteRemark"
    />

    <!-- 退款處理編輯對話框 -->
    <refund-processing-dialog
      :visible.sync="processingDialogVisible"
      :data="currentEditRow"
      :refund-methods="refundMethodOptions"
      :banks="bankOptions"
      @save="handleSaveRefundProcessing"
    />
  </div>
</template>

<script>
import CombinedSearch from "@/components/SearchBox/CombinedSearch.vue";
import DataTable from "@/components/DataTable/index.vue";
import BaseTable from "@/components/BaseTable/index.vue";
import LatestRemarkPreview from "@/components/Remark/LatestRemarkPreview.vue";
import RemarkTimelineDialog from "@/components/Remark/RemarkTimelineDialog.vue";
import RefundProcessingDialog from "./components/RefundProcessingDialog.vue";
import BankInfoDisplay from "@/components/BankInfoDisplay/index.vue";
import { formatDate } from "@/utils/date";
import { getTypeTag, getTypeLabel } from "@/utils/statusHelpers";
import RefundProcessingService from "./services/RefundProcessingService.js";

export default {
  name: "Repayment",
  components: {
    CombinedSearch,
    DataTable,
    BaseTable,
    LatestRemarkPreview,
    RemarkTimelineDialog,
    RefundProcessingDialog,
    BankInfoDisplay
  },
  data() {
    return {
      activeTab: "refund-processing-list",
      statusTab: "all",
      loading: false,
      showBackButton: false,
      lastViewedRow: null,

      // 搜尋與篩選
      searchQuery: "",
      dateRange: [],
      historySearchQuery: "",
      historyDateRange: [],
      isFiltering: false,
      isHistoryFiltering: false,
      lastSearchParams: null,
      lastHistorySearchParams: null,

      // 數據
      refundProcessingData: [],
      allRefundProcessingData: [], // 儲存所有原始數據，用於重置篩選
      selectedRows: [],
      historyData: [],
      allHistoryData: [], // 儲存所有原始數據，用於重置篩選
      currentRefundId: null,

      // 對話框控制
      processingDialogVisible: false,
      remarkDialogVisible: false,
      currentEditRow: null,

      // 備註相關
      currentRemarks: [],
      currentRefundInfo: {},
      hasMoreRemarks: false,
      loadingRemarks: false,
      allRemarks: {}, // 依照退款單ID存儲所有備註

      // 狀態選項
      statusOptions: [
        { value: "pending", label: "待處理", type: "warning" },
        { value: "processing", label: "處理中", type: "primary" },
        { value: "scheduled", label: "已排程", type: "info" },
        { value: "completed", label: "已完成", type: "success" },
        { value: "cancelled", label: "已取消", type: "danger" }
      ],

      // 退款方式選項
      refundMethodOptions: [
        { value: "credit_card", label: "信用卡退款" },
        { value: "bank_transfer", label: "銀行轉帳" },
        { value: "store_credit", label: "商店購物金" },
        { value: "third_party", label: "第三方支付退款" },
        { value: "cash", label: "現金退款" }
      ],

      // 銀行選項
      bankOptions: [
        { value: "bank_004", label: "臺灣銀行" },
        { value: "bank_005", label: "土地銀行" },
        { value: "bank_006", label: "合作金庫銀行" },
        { value: "bank_007", label: "第一銀行" },
        { value: "bank_008", label: "華南銀行" },
        { value: "bank_009", label: "彰化銀行" },
        { value: "bank_011", label: "上海商業儲蓄銀行" },
        { value: "bank_012", label: "台北富邦銀行" },
        { value: "bank_013", label: "國泰世華銀行" },
        { value: "bank_015", label: "兆豐國際商業銀行" },
        { value: "bank_050", label: "臺灣企銀" },
        { value: "bank_052", label: "渣打國際商業銀行" },
        { value: "bank_081", label: "滙豐(台灣)商業銀行" },
        { value: "bank_810", label: "星展(台灣)商業銀行" },
        { value: "bank_822", label: "中國信託商業銀行" }
      ],

      // 表格列配置
      refundProcessingColumns: [
        { prop: "id", label: "退款單號", width: 120, sortable: true },
        { prop: "refundOrderId", label: "關聯退貨單號", width: 150 },
        { prop: "originalOrderId", label: "原始訂單編號", width: 150 },
        { prop: "customerName", label: "客戶名稱", width: 120 },
        { prop: "contactPhone", label: "聯絡電話", width: 120 },
        { prop: "applyDate", label: "申請日期", width: 120, sortable: true },
        { prop: "refundAmount", label: "退款金額", width: 120, sortable: true },
        { prop: "refundMethod", label: "退款方式", width: 120 },
        { prop: "bankInfo", label: "銀行資訊", width: 180 },
        { prop: "status", label: "處理狀態", width: 100 },
        { prop: "scheduledDate", label: "預計退款日期", width: 120 },
        { prop: "completedDate", label: "實際退款日期", width: 120 },
        { prop: "processor", label: "處理人員", width: 100 },
        { prop: "remarks", label: "備註", minWidth: 200 }
      ],

      // 歷史記錄表格
      historyColumns: [
        { prop: "timestamp", label: "時間", width: 160, sortable: true },
        { prop: "refundId", label: "退款單號", width: 120 },
        { prop: "user", label: "操作人員", width: 120 },
        { prop: "type", label: "操作類型", width: 100 },
        { prop: "field", label: "變更欄位", width: 120 },
        { prop: "beforeValue", label: "變更前", minWidth: 200 },
        { prop: "afterValue", label: "變更後", minWidth: 200 }
      ]
    };
  },

  computed: {
    // 過濾後的退款處理數據
    filteredRefundProcessingData() {
      return this.refundProcessingData;
    },

    // 過濾後的歷史記錄數據
    filteredHistoryData() {
      return this.historyData;
    }
  },

  created() {
    this.fetchRefundProcessingData();
    this.fetchAllRemarks();
  },

  methods: {
    // 格式化方法
    formatDate,
    getTypeTag,
    getTypeLabel,

    // 格式化貨幣
    formatCurrency(value) {
      if (value === null || value === undefined) return "NT$ 0";
      return `NT$ ${Number(value).toLocaleString("zh-TW", {
        minimumFractionDigits: 0
      })}`;
    },

    // 獲取特定狀態的退款處理單
    getStatusFilteredData(status) {
      return this.filteredRefundProcessingData.filter(
        item => item.status === status
      );
    },

    // 獲取狀態標籤樣式
    getStatusType(status) {
      const statusInfo = this.statusOptions.find(
        option => option.value === status
      );
      return statusInfo ? statusInfo.type : "info";
    },

    // 獲取狀態顯示文字
    getStatusLabel(status) {
      const statusInfo = this.statusOptions.find(
        option => option.value === status
      );
      return statusInfo ? statusInfo.label : status;
    },

    // 獲取退款方式顯示文字
    getRefundMethodLabel(method) {
      const methodInfo = this.refundMethodOptions.find(
        option => option.value === method
      );
      return methodInfo ? methodInfo.label : method;
    },

    // 備註相關方法
    getLatestRemark(refundId) {
      if (
        !this.allRemarks[refundId] ||
        this.allRemarks[refundId].length === 0
      ) {
        return null;
      }
      return this.allRemarks[refundId][0]; // 假設已按時間排序，第一個是最新的
    },

    getRemarkCount(refundId) {
      if (!this.allRemarks[refundId]) {
        return 0;
      }
      return this.allRemarks[refundId].length;
    },

    openRemarkTimeline(row) {
      this.currentRefundId = row.id;
      this.currentRefundInfo = {
        orderNumber: row.id,
        customerName: row.customerName,
        contactPhone: row.contactPhone,
        refundAmount: row.refundAmount
      };

      // 如果已經有備註數據，則直接顯示
      if (this.allRemarks[row.id]) {
        this.currentRemarks = [...this.allRemarks[row.id]];
      } else {
        this.currentRemarks = [];
      }

      this.remarkDialogVisible = true;

      // 如果沒有備註數據，則加載
      if (!this.allRemarks[row.id] || this.allRemarks[row.id].length === 0) {
        this.loadRemarks(row.id);
      }
    },

    // 資料獲取相關方法
    async fetchRefundProcessingData(params = null) {
      this.loading = true;
      try {
        const queryParams = params || this.getQueryParams();
        const response = await RefundProcessingService.getRefundProcessingList(
          queryParams
        );
        this.refundProcessingData = response.data || [];

        // 若是初次加載或重置篩選，則更新 allRefundProcessingData
        if (!params || !Object.keys(params).length) {
          this.allRefundProcessingData = [...this.refundProcessingData];
          this.isFiltering = false;
        } else {
          this.isFiltering = true;
        }
      } catch (error) {
        this.$message.error("獲取退款處理數據失敗: " + error.message);
        this.refundProcessingData = []; // 確保出錯時也有空數組
      } finally {
        this.loading = false;
      }
    },

    async fetchAllRemarks() {
      try {
        const response = await RefundProcessingService.getAllRemarkPreviews();
        this.allRemarks = response.data || {};
      } catch (error) {
        console.error("獲取備註預覽失敗:", error);
        this.$message.error("獲取備註預覽失敗: " + error.message);
      }
    },

    async loadRemarks(refundId) {
      this.loadingRemarks = true;
      try {
        const response = await RefundProcessingService.getRemarks(refundId);
        this.currentRemarks = response.data || [];
        this.allRemarks[refundId] = [...this.currentRemarks];
        this.hasMoreRemarks = response.hasMore || false;
      } catch (error) {
        console.error("獲取備註失敗:", error);
        this.$message.error("獲取備註失敗: " + error.message);
      } finally {
        this.loadingRemarks = false;
      }
    },

    loadMoreRemarks() {
      if (!this.currentRefundId || this.loadingRemarks) return;

      this.loadingRemarks = true;
      RefundProcessingService.getMoreRemarks(
        this.currentRefundId,
        this.currentRemarks.length
      )
        .then(response => {
          const newRemarks = response.data || [];
          this.currentRemarks = [...this.currentRemarks, ...newRemarks];
          this.hasMoreRemarks = response.hasMore || false;

          // 更新全局備註緩存
          this.allRemarks[this.currentRefundId] = [...this.currentRemarks];
        })
        .catch(error => {
          console.error("加載更多備註失敗:", error);
          this.$message.error("加載更多備註失敗: " + error.message);
        })
        .finally(() => {
          this.loadingRemarks = false;
        });
    },

    // 備註相關操作
    addRemark(remarkData) {
      RefundProcessingService.addRemark(remarkData)
        .then(response => {
          const newRemark = response.data;

          // 更新當前顯示的備註
          this.currentRemarks = [newRemark, ...this.currentRemarks];

          // 更新全局備註緩存
          if (!this.allRemarks[remarkData.orderId]) {
            this.allRemarks[remarkData.orderId] = [];
          }
          this.allRemarks[remarkData.orderId] = [
            newRemark,
            ...this.allRemarks[remarkData.orderId]
          ];

          this.$message.success("備註添加成功");
        })
        .catch(error => {
          console.error("添加備註失敗:", error);
          this.$message.error("添加備註失敗: " + error.message);
        });
    },

    updateRemark(remarkData) {
      RefundProcessingService.updateRemark(remarkData)
        .then(response => {
          const updatedRemark = response.data;

          // 更新當前顯示的備註
          const index = this.currentRemarks.findIndex(
            r => r.id === updatedRemark.id
          );
          if (index !== -1) {
            this.currentRemarks[index] = updatedRemark;
            this.currentRemarks = [...this.currentRemarks];
          }

          // 更新全局備註緩存
          if (this.allRemarks[this.currentRefundId]) {
            const cacheIndex = this.allRemarks[this.currentRefundId].findIndex(
              r => r.id === updatedRemark.id
            );
            if (cacheIndex !== -1) {
              this.allRemarks[this.currentRefundId][cacheIndex] = updatedRemark;
              this.allRemarks[this.currentRefundId] = [
                ...this.allRemarks[this.currentRefundId]
              ];
            }
          }

          this.$message.success("備註更新成功");
        })
        .catch(error => {
          console.error("更新備註失敗:", error);
          this.$message.error("更新備註失敗: " + error.message);
        });
    },

    deleteRemark(remarkData) {
      RefundProcessingService.deleteRemark(remarkData.id)
        .then(() => {
          // 更新當前顯示的備註
          this.currentRemarks = this.currentRemarks.filter(
            r => r.id !== remarkData.id
          );

          // 更新全局備註緩存
          if (this.allRemarks[this.currentRefundId]) {
            this.allRemarks[this.currentRefundId] = this.allRemarks[
              this.currentRefundId
            ].filter(r => r.id !== remarkData.id);
          }

          this.$message.success("備註刪除成功");
        })
        .catch(error => {
          console.error("刪除備註失敗:", error);
          this.$message.error("刪除備註失敗: " + error.message);
        });
    },

    // 搜尋相關方法
    getQueryParams() {
      const params = {};

      if (this.dateRange && this.dateRange.length === 2) {
        params.startDate = formatDate(this.dateRange[0], "YYYY-MM-DD");
        params.endDate = formatDate(this.dateRange[1], "YYYY-MM-DD");
      }

      if (this.searchQuery) {
        params.search = this.searchQuery;
      }

      return params;
    },

    // 處理CombinedSearch組件的搜尋事件
    handleCombinedSearch(searchParams) {
      // 更新本地的搜尋條件
      this.searchQuery = searchParams.keyword || "";
      this.dateRange = searchParams.dateRange || [];

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
      this.fetchRefundProcessingData(params);
    },

    resetFilters() {
      this.searchQuery = "";
      this.dateRange = [];
      if (this.$refs.refundProcessingSearch) {
        this.$refs.refundProcessingSearch.clear();
      }
      this.refundProcessingData = [...this.allRefundProcessingData];
      this.isFiltering = false;
      this.lastSearchParams = null;

      // 通知用戶重置成功
      this.$message.success("已重置篩選條件");
    },

    // 歷史記錄相關方法
    async fetchHistoryData(refundId = null, params = null) {
      this.loading = true;
      try {
        const queryParams = params || {};

        if (refundId) {
          queryParams.refundId = refundId;
          this.showBackButton = true;
          this.currentRefundId = refundId;
          this.lastViewedRow = this.refundProcessingData.find(
            item => item.id === refundId
          );
        } else {
          this.showBackButton = false;
          this.currentRefundId = null;

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

          if (this.historySearchQuery) {
            queryParams.search = this.historySearchQuery;
          }
        }

        const response = await RefundProcessingService.getRefundProcessingHistory(
          queryParams
        );
        this.historyData = response.data || [];

        // 若是初次加載或特定退款單的記錄，則更新 allHistoryData
        if (refundId || !Object.keys(params || {}).length) {
          this.allHistoryData = [...this.historyData];
          this.isHistoryFiltering = false;
        } else {
          this.isHistoryFiltering = true;
        }
      } catch (error) {
        this.$message.error("獲取退款處理異動記錄失敗: " + error.message);
        this.historyData = []; // 確保出錯時也有空數組
      } finally {
        this.loading = false;
      }
    },

    // 處理CombinedSearch組件的歷史搜尋事件
    handleCombinedHistorySearch(searchParams) {
      // 更新本地的搜尋條件
      this.historySearchQuery = searchParams.keyword || "";
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

      if (this.historySearchQuery) {
        params.search = this.historySearchQuery;
      }

      if (this.currentRefundId) {
        params.refundId = this.currentRefundId;
      }

      // 檢查是否和上次搜尋參數相同，避免重複請求
      const paramsStr = JSON.stringify(params);
      if (this.lastHistorySearchParams === paramsStr) {
        return;
      }

      this.lastHistorySearchParams = paramsStr;
      this.fetchHistoryData(null, params);
    },

    resetHistoryFilters() {
      this.historySearchQuery = "";
      this.historyDateRange = [];
      if (this.$refs.historySearch) {
        this.$refs.historySearch.clear();
      }
      this.historyData = [...this.allHistoryData];
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

    // 表格事件處理
    handleSelectionChange(selection) {
      this.selectedRows = selection;
    },

    handleSortChange({ prop, order }) {
      // 排序變化處理
      console.log("排序變化:", prop, order);
    },

    handleBatchUpdate(payload) {
      // 批量更新處理
      console.log("批量更新:", payload);
    },

    handleExport(options) {
      // 導出處理
      console.log("導出選項:", options);
    },

    // 編輯與更新操作
    handleEdit(row) {
      this.currentEditRow = JSON.parse(JSON.stringify(row));
      this.processingDialogVisible = true;
    },

    async handleSaveRefundProcessing(refundData) {
      try {
        this.loading = true;
        const response = await RefundProcessingService.updateRefundProcessing(
          refundData
        );
        this.$message.success(response.message || "退款處理更新成功");
        this.processingDialogVisible = false;
        this.fetchRefundProcessingData();
      } catch (error) {
        this.$message.error("保存失敗: " + error.message);
      } finally {
        this.loading = false;
      }
    },

    // 其他操作
    viewProcessingHistory(row) {
      this.activeTab = "refund-processing-history";
      this.fetchHistoryData(row.id);
    },

    backToProcessingList() {
      this.activeTab = "refund-processing-list";
      this.statusTab = "all";
      this.historyDateRange = [];
      this.historySearchQuery = "";
      this.showBackButton = false;

      this.$nextTick(() => {
        if (this.lastViewedRow) {
          const table = this.$refs.refundProcessingTable;
          if (table) {
            const rows = table.$el.querySelectorAll(".el-table__row");
            for (let i = 0; i < rows.length; i++) {
              const cells = rows[i].getElementsByTagName("td");
              if (
                cells.length > 0 &&
                cells[0].textContent === this.lastViewedRow.id
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
$font-size-base: 14px;
$font-size-lg: 16px;
$font-size-xl: 20px;

.refund-processing-management {
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

    .refund-tabs {
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
  ::v-deep .el-tag {
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
  ::v-deep .highlight-row {
    background-color: rgba($primary-color, 0.1);
    transition: background-color 0.5s ease;
  }

  // 退款金額樣式
  .refund-amount {
    color: $danger-color;
    font-weight: 500;
  }

  // 覆寫表格樣式
  ::v-deep .el-table {
    .el-table__header-wrapper {
      th {
        background-color: #f2f6fc;
        font-weight: 600;
        color: #303133;
      }
    }

    .el-table__row {
      td {
        padding: 8px 0;
      }

      &:hover {
        background-color: #f5f7fa;
      }
    }
  }

  // 備註預覽樣式
  ::v-deep .latest-remark-preview {
    margin: 0;

    .remark-content {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .remark-count {
      font-size: 12px;
      background: $primary-color;
      color: white;
      border-radius: 10px;
      padding: 0 6px;
      margin-left: 5px;
    }

    .add-remark-btn {
      margin-left: 8px;
      font-size: 12px;
    }
  }
}

// 對話框樣式
::v-deep .el-dialog {
  border-radius: $border-radius;
  overflow: hidden;

  .el-dialog__header {
    padding: 15px 20px;
    background: #f8f9fa;
    margin-right: 0;
    border-bottom: 1px solid #ebeef5;

    .el-dialog__title {
      font-size: $font-size-lg;
      font-weight: 500;
    }
  }

  .el-dialog__body {
    padding: 20px;
  }

  .el-dialog__footer {
    padding: 15px 20px;
    border-top: 1px solid #ebeef5;
    background: #f8f9fa;
  }
}

// 響應式設計
@media screen and (max-width: 768px) {
  .refund-processing-management {
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
