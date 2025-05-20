<template>
  <div class="order-taking-management">
    <!-- 頁面標題區域 -->
    <div class="page-header">
      <h2>接單管理</h2>

      <!-- <div class="action-buttons">
        <el-button type="primary" @click="handleBatchImport">
          <i class="el-icon-upload2"></i>
          <span class="button-text">對帳作業</span>
        </el-button>
      </div> -->
    </div>

    <!-- 主要內容區域 -->
    <div class="page-content">
      <el-tabs v-model="activeTab" type="border-card" class="order-tabs">
        <!-- 接單列表 -->
        <el-tab-pane label="接單列表" name="order-list">
          <div class="table-operations">
            <div class="operation-wrapper">
              <div class="search-filters">
                <combined-search
                  ref="orderSearch"
                  :search-value="orderSearchQuery"
                  :time-value="orderDateRange"
                  :search-placeholder="'搜尋接單單...'"
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
              <data-table-upgrade
                ref="orderTable"
                :data="filteredOrderData"
                :columns="orderColumns"
                :sub-table-columns="orderDetailColumns"
                :loading="loading"
                :show-selection-column="true"
                :show-index="false"
                :show-action-column="true"
                row-key="id"
                sub-row-key="serialNumber"
                title-field="orderNumber"
                action-label="操作"
                action-width="160"
                action-fixed="right"
                :payment-status-options="paymentStatusOptions"
                :order-status-options="orderStatusOptions"
                :show-pagination="true"
                :page-sizes="[10, 20, 50, 100]"
                :current-page="currentPage"
                :page-size="pageSize"
                :total="totalOrders"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                @selection-change="handleSelectionChange"
                @sort-change="handleSortChange"
                @expand-change="handleExpandChange"
                @sub-row-click="handleSubRowClick"
                @batch-update="handleBatchUpdate"
                @export="handleExport"
              >
                <!-- 自訂列格式插槽 -->
                <template #column-orderDate="{ row }">
                  {{ formatDate(row.orderDate) }}
                </template>

                <template #column-paymentDate="{ row }">
                  {{ formatDate(row.paymentDate) }}
                </template>

                <template #column-contactPhone="{ row }">
                  {{ formatPhone(row.contactPhone, row.extension) }}
                </template>

                <template #column-paymentStatus="{ row }">
                  <el-tag
                    :type="getPaymentStatusType(row.paymentStatus)"
                    size="small"
                    effect="dark"
                  >
                    {{ getPaymentStatusLabel(row.paymentStatus) }}
                  </el-tag>
                </template>

                <template #column-orderStatus="{ row }">
                  <el-tag
                    :type="getOrderStatusType(row.orderStatus)"
                    size="small"
                    effect="dark"
                  >
                    {{ getOrderStatusLabel(row.orderStatus) }}
                  </el-tag>
                </template>

                <template #column-bankScreenshot="{ row }">
                  <template
                    v-if="
                      row.bankScreenshot &&
                        typeof row.bankScreenshot === 'string' &&
                        row.bankScreenshot.trim() !== ''
                    "
                  >
                    <el-image
                      :src="row.bankScreenshot"
                      :preview-src-list="[row.bankScreenshot]"
                      fit="cover"
                      style="width: 50px; height: 50px; border-radius: 4px;"
                    >
                      <div slot="error" class="image-slot">
                        <i class="el-icon-picture-outline"></i>
                      </div>
                    </el-image>
                  </template>
                  <span v-else>無</span>
                </template>

                <!-- 備註欄插槽-->
                <template #column-remark="{ row }">
                  <latest-remark-preview
                    :remark="getLatestRemark(row.id)"
                    :remark-count="getRemarkCount(row.id)"
                    :add-remark-text="'添加備註'"
                    @view-timeline="showRemarkTimeline(row)"
                  />
                </template>

                <!-- 操作列插槽 -->
                <template #action="{ row }">
                  <el-tooltip content="編輯接單" placement="top">
                    <el-button
                      size="mini"
                      type="primary"
                      icon="el-icon-edit"
                      @click="handleEdit(row)"
                    ></el-button>
                  </el-tooltip>
                  <!-- <el-tooltip content="查看接單異動紀錄" placement="top">
                    <el-button
                      size="mini"
                      type="warning"
                      icon="el-icon-document"
                      @click="viewOrderHistory(row)"
                    ></el-button>
                  </el-tooltip> -->
                  <el-tooltip content="回報末五碼" placement="top">
                    <el-button
                      size="mini"
                      type="warning"
                      icon="el-icon-wallet"
                      @click="openBankCodeReport(row)"
                    ></el-button>
                  </el-tooltip>
                </template>
              </data-table-upgrade>
            </el-tab-pane>

            <!-- 按付款狀態分類的標籤 -->
            <el-tab-pane
              v-for="status in paymentStatusOptions"
              :key="status.value"
              :label="status.label"
              :name="status.value"
            >
              <data-table-upgrade
                :data="getStatusFilteredData(status.value, 'paymentStatus')"
                :columns="orderColumns"
                :sub-table-columns="orderDetailColumns"
                :loading="loading"
                :show-selection-column="true"
                :show-index="false"
                :show-action-column="true"
                row-key="id"
                sub-row-key="serialNumber"
                title-field="orderNumber"
                action-label="操作"
                action-width="160"
                action-fixed="right"
                :payment-status-options="paymentStatusOptions"
                :order-status-options="orderStatusOptions"
                :show-pagination="true"
                :page-sizes="[10, 20, 50, 100]"
                :current-page="currentPage"
                :page-size="pageSize"
                :total="totalOrders"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                @selection-change="handleSelectionChange"
                @sort-change="handleSortChange"
                @expand-change="handleExpandChange"
                @sub-row-click="handleSubRowClick"
                @batch-update="handleBatchUpdate"
                @export="handleExport"
              >
                <!-- 自訂列格式插槽 -->
                <template #column-orderDate="{ row }">
                  {{ formatDate(row.orderDate) }}
                </template>

                <template #column-paymentDate="{ row }">
                  {{ formatDate(row.paymentDate) }}
                </template>

                <template #column-contactPhone="{ row }">
                  {{ formatPhone(row.contactPhone, row.extension) }}
                </template>

                <template #column-paymentStatus="{ row }">
                  <el-tag
                    :type="getPaymentStatusType(row.paymentStatus)"
                    size="small"
                    effect="dark"
                  >
                    {{ getPaymentStatusLabel(row.paymentStatus) }}
                  </el-tag>
                </template>

                <template #column-orderStatus="{ row }">
                  <el-tag
                    :type="getOrderStatusType(row.orderStatus)"
                    size="small"
                    effect="dark"
                  >
                    {{ getOrderStatusLabel(row.orderStatus) }}
                  </el-tag>
                </template>

                <template #column-bankScreenshot="{ row }">
                  <template
                    v-if="
                      row.bankScreenshot &&
                        typeof row.bankScreenshot === 'string' &&
                        row.bankScreenshot.trim() !== ''
                    "
                  >
                    <el-image
                      :src="row.bankScreenshot"
                      :preview-src-list="[row.bankScreenshot]"
                      fit="cover"
                      style="width: 50px; height: 50px; border-radius: 4px;"
                    >
                      <div slot="error" class="image-slot">
                        <i class="el-icon-picture-outline"></i>
                      </div>
                    </el-image>
                  </template>
                  <span v-else>無</span>
                </template>

                <!-- 備註欄插槽 - 使用新的 LatestRemarkPreview 組件 -->
                <template #column-remark="{ row }">
                  <latest-remark-preview
                    :remark="getLatestRemark(row.id)"
                    :remark-count="getRemarkCount(row.id)"
                    :add-remark-text="'添加備註'"
                    @view-timeline="showRemarkTimeline(row)"
                  />
                </template>

                <!-- 操作列插槽 -->
                <template #action="{ row }">
                  <el-tooltip content="編輯接單" placement="top">
                    <el-button
                      size="mini"
                      type="primary"
                      icon="el-icon-edit"
                      @click="handleEdit(row)"
                    ></el-button>
                  </el-tooltip>
                  <!-- <el-tooltip content="查看接單異動紀錄" placement="top">
                    <el-button
                      size="mini"
                      type="warning"
                      icon="el-icon-document"
                      @click="viewOrderHistory(row)"
                    ></el-button>
                  </el-tooltip> -->
                  <el-tooltip content="回報末五碼" placement="top">
                    <el-button
                      size="mini"
                      type="warning"
                      icon="el-icon-wallet"
                      @click="openBankCodeReport(row)"
                    ></el-button>
                  </el-tooltip>
                </template>
              </data-table-upgrade>
            </el-tab-pane>

            <!-- 按訂單狀態分類的標籤 -->
            <el-tab-pane
              v-for="status in orderStatusOptions"
              :key="'order-' + status.value"
              :label="status.label"
              :name="'order-' + status.value"
            >
              <data-table-upgrade
                :data="getStatusFilteredData(status.value, 'orderStatus')"
                :columns="orderColumns"
                :sub-table-columns="orderDetailColumns"
                :loading="loading"
                :show-selection-column="true"
                :show-index="false"
                :show-action-column="true"
                row-key="id"
                sub-row-key="serialNumber"
                title-field="orderNumber"
                action-label="操作"
                action-width="160"
                action-fixed="right"
                :payment-status-options="paymentStatusOptions"
                :order-status-options="orderStatusOptions"
                :show-pagination="true"
                :page-sizes="[10, 20, 50, 100]"
                :current-page="currentPage"
                :page-size="pageSize"
                :total="totalOrders"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                @selection-change="handleSelectionChange"
                @sort-change="handleSortChange"
                @expand-change="handleExpandChange"
                @sub-row-click="handleSubRowClick"
                @batch-update="handleBatchUpdate"
                @export="handleExport"
              >
                <!-- 自訂列格式插槽 -->
                <template #column-orderDate="{ row }">
                  {{ formatDate(row.orderDate) }}
                </template>

                <template #column-paymentDate="{ row }">
                  {{ formatDate(row.paymentDate) }}
                </template>

                <template #column-contactPhone="{ row }">
                  {{ formatPhone(row.contactPhone, row.extension) }}
                </template>

                <template #column-paymentStatus="{ row }">
                  <el-tag
                    :type="getPaymentStatusType(row.paymentStatus)"
                    size="small"
                    effect="dark"
                  >
                    {{ getPaymentStatusLabel(row.paymentStatus) }}
                  </el-tag>
                </template>

                <template #column-orderStatus="{ row }">
                  <el-tag
                    :type="getOrderStatusType(row.orderStatus)"
                    size="small"
                    effect="dark"
                  >
                    {{ getOrderStatusLabel(row.orderStatus) }}
                  </el-tag>
                </template>

                <template #column-bankScreenshot="{ row }">
                  <template
                    v-if="
                      row.bankScreenshot &&
                        typeof row.bankScreenshot === 'string' &&
                        row.bankScreenshot.trim() !== ''
                    "
                  >
                    <el-image
                      :src="row.bankScreenshot"
                      :preview-src-list="[row.bankScreenshot]"
                      fit="cover"
                      style="width: 50px; height: 50px; border-radius: 4px;"
                    >
                      <div slot="error" class="image-slot">
                        <i class="el-icon-picture-outline"></i>
                      </div>
                    </el-image>
                  </template>
                  <span v-else>無</span>
                </template>

                <!-- 備註欄插槽 - 使用新的 LatestRemarkPreview 組件 -->
                <template #column-remark="{ row }">
                  <latest-remark-preview
                    :remark="getLatestRemark(row.id)"
                    :remark-count="getRemarkCount(row.id)"
                    :add-remark-text="'添加備註'"
                    @view-timeline="showRemarkTimeline(row)"
                  />
                </template>

                <!-- 操作列插槽 -->
                <template #action="{ row }">
                  <el-tooltip content="編輯接單" placement="top">
                    <el-button
                      size="mini"
                      type="primary"
                      icon="el-icon-edit"
                      @click="handleEdit(row)"
                    ></el-button>
                  </el-tooltip>
                  <!-- <el-tooltip content="備註歷史" placement="top">
                    <el-button
                      size="mini"
                      type="success"
                      icon="el-icon-chat-line-square"
                      @click="showRemarkTimeline(row)"
                    ></el-button>
                  </el-tooltip> -->
                  <!-- <el-tooltip content="查看接單異動紀錄" placement="top">
                    <el-button
                      size="mini"
                      type="warning"
                      icon="el-icon-document"
                      @click="viewOrderHistory(row)"
                    ></el-button>
                  </el-tooltip> -->
                  <el-tooltip content="回報末五碼" placement="top">
                    <el-button
                      size="mini"
                      type="warning"
                      icon="el-icon-wallet"
                      @click="openBankCodeReport(row)"
                    ></el-button>
                  </el-tooltip>
                </template>
              </data-table-upgrade>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>

        <!-- 接單異動紀錄 -->
        <!-- <el-tab-pane label="接單異動紀錄" name="order-history">
          <div class="table-operations">
            <div class="operation-wrapper">
              <div class="search-filters">
                <el-button
                  v-if="showBackButton"
                  type="primary"
                  icon="el-icon-back"
                  @click="backToOrderList"
                  >返回接單列表</el-button
                >
                <combined-search
                  ref="historySearch"
                  :search-value="orderHistorySearchQuery"
                  :time-value="historyDateRange"
                  :search-placeholder="'搜尋接單異動...'"
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

          <base-table
            ref="historyTable"
            :data="filteredOrderHistoryData"
            :columns="historyColumns"
            :loading="loading"
            :show-selection-column="true"
            :show-index="true"
            :show-toolbar="true"
            :show-pagination="true"
            :page-sizes="[10, 20, 50, 100]"
            :filename="'order-history-export'"
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

    <!-- 備註時間線對話框-->
    <remark-timeline-dialog
      :visible.sync="remarkTimelineVisible"
      :order-id="currentOrderForRemark ? currentOrderForRemark.id : ''"
      :order-info="currentOrderForRemark || {}"
      :remarks="
        currentOrderForRemark && currentOrderForRemark.id
          ? orderRemarks[currentOrderForRemark.id] || []
          : []
      "
      :is-loading="remarkLoading"
      :has-more="hasMoreRemarks"
      @add-remark="handleAddRemark"
      @update-remark="handleUpdateRemark"
      @delete-remark="handleDeleteRemark"
      @load-more="loadMoreRemarks"
    />

    <!-- 編輯接單對話框 -->
    <order-taking-dialog
      :visible.sync="orderDialogVisible"
      :order-data="currentEditRow"
      :order-detail-data="currentDetailRow ? [currentDetailRow] : []"
      :payment-status-options="paymentStatusOptions"
      :order-status-options="orderStatusOptions"
      @update-success="handleUpdateSuccess"
    />

    <BatchImportDialog
      :visible.sync="batchImportDialogVisible"
      @submit="handleBatchImportSubmit"
    />

    <BankCodeReporter
      v-model="bankCodeReportVisible"
      :order-info="currentReportOrder"
      @success="handleBankCodeReportSuccess"
    />
  </div>
</template>
<script>
import CombinedSearch from "@/components/SearchBox/CombinedSearch.vue";
import DataTableUpgrade from "@/components/DataTableUpgrade/index.vue";
import BaseTable from "@/components/BaseTable/index.vue";
import BatchImportDialog from "./components/BatchImportDialog.vue";
import LatestRemarkPreview from "@/components/Remark/LatestRemarkPreview.vue";
import RemarkTimelineDialog from "@/components/Remark/RemarkTimelineDialog.vue";
import OrderTakingDialog from "./components/OrderTakingDialog.vue";
import BankCodeReporter from "@/components/BankInfoDisplay/BankCodeReporter";
import { formatDate } from "@/utils/date";
import { formatPhone } from "@/utils/dataTable";
import { getTypeTag, getTypeLabel } from "@/utils/statusHelpers";
import OrderTakingService from "./services/OrderTakingService.js";
import OrderTakingServices from "./services/OrderTakingServices.js";

export default {
  name: "OrderTakingManagement",
  components: {
    CombinedSearch,
    DataTableUpgrade,
    BaseTable,
    LatestRemarkPreview,
    RemarkTimelineDialog,
    OrderTakingDialog,
    BatchImportDialog,
    BankCodeReporter
  },

  data() {
    return {
      activeTab: "order-list",
      statusTab: "all",
      loading: false,
      showBackButton: false,
      lastViewedRow: null,

      // 記錄上次搜尋條件，避免重複請求
      lastSearchParams: null,
      lastHistorySearchParams: null,

      // 接單列表相關數據
      orderData: [],
      allOrderData: [], // 儲存所有原始數據，用於重置篩選
      selectedRows: [],
      orderSearchQuery: "",
      orderDateRange: [],
      isFiltering: false,

      // 分頁相關屬性
      currentPage: 1,
      pageSize: 20,
      totalOrders: 0,

      // 末五碼回報對話框（新增）
      bankCodeReportVisible: false,
      currentReportOrder: null,

      // 異動記錄相關數據
      orderHistoryData: [],
      allOrderHistoryData: [], // 儲存所有原始數據，用於重置篩選
      orderHistorySearchQuery: "",
      historyDateRange: [],
      currentOrderId: null,
      isHistoryFiltering: false,

      // 對話框相關數據
      orderDialogVisible: false,
      currentEditRow: null,
      currentDetailRow: null,

      // 備註相關數據
      remarkTimelineVisible: false,
      batchImportDialogVisible: false,
      currentOrderForRemark: null,
      remarkLoading: false,
      hasMoreRemarks: false,
      latestRemarks: {}, // 用於緩存每個訂單的最新備註
      remarkCounts: {}, // 用於緩存每個訂單的備註數量
      orderRemarks: {}, // 用於緩存每個訂單的備註列表

      // 狀態選項
      paymentStatusOptions: [
        {
          value: "pending",
          label: "待付款",
          type: "warning",
          icon: "el-icon-wallet"
        },
        {
          value: "paid",
          label: "已付款",
          type: "success",
          icon: "el-icon-check"
        },
        {
          value: "confirming",
          label: "付款確認中",
          type: "info",
          icon: "el-icon-time"
        },
        {
          value: "refunded",
          label: "已退款",
          type: "danger",
          icon: "el-icon-refresh-left"
        },
        {
          value: "cancelled",
          label: "付款取消",
          type: "info",
          icon: "el-icon-circle-close"
        }
      ],
      orderStatusOptions: [
        {
          value: "unconfirmed",
          label: "未接單",
          type: "warning",
          icon: "el-icon-time"
        },
        {
          value: "confirmed",
          label: "已接單",
          type: "success",
          icon: "el-icon-circle-check"
        },
        {
          value: "rejected",
          label: "已拒絕",
          type: "info",
          icon: "el-icon-circle-close"
        }
      ],

      // 表格列配置
      orderColumns: [
        { prop: "orderNumber", label: "訂單編號", sortable: true, width: 150 },
        { prop: "customerName", label: "客戶名稱", sortable: true, width: 120 },
        { prop: "contactPhone", label: "聯絡電話", width: 130 },
        {
          prop: "totalAmount",
          label: "訂單金額",
          sortable: true,
          width: 120,
          formatter: value => {
            // 確保值不是 undefined 或 null
            return value !== undefined && value !== null
              ? `$${parseFloat(value).toLocaleString()}`
              : "$0.00";
          }
        },
        {
          prop: "paidAmount",
          label: "已付金額",
          sortable: true,
          width: 120,
          formatter: value => {
            // 確保值不是 undefined 或 null
            return value !== undefined && value !== null
              ? `$${parseFloat(value).toLocaleString()}`
              : "$0.00";
          }
        },
        { prop: "paymentMethod", label: "付款方式", width: 100 },
        { prop: "bankLastFive", label: "末五碼", width: 100 },
        // {
        //   prop: "bankScreenshot",
        //   label: "銀行截圖",
        //   width: 100
        // },
        {
          prop: "paymentStatus",
          label: "付款狀態",
          sortable: true,
          width: 120,
          type: "status",
          statusOptions: [
            { value: "pending", label: "待付款", type: "warning" },
            { value: "confirming", label: "付款確認中", type: "info" },
            { value: "paid", label: "已付款", type: "success" },
            { value: "refunded", label: "已退款", type: "primary" },
            { value: "cancelled", label: "付款取消", type: "danger" }
          ]
        },
        {
          prop: "orderStatus",
          label: "接單狀態",
          sortable: true,
          width: 120,
          type: "status",
          statusOptions: [
            { value: "unconfirmed", label: "未接單", type: "warning" },
            { value: "confirmed", label: "已接單", type: "success" },
            { value: "rejected", label: "已拒絕", type: "info" }
          ]
        },
        { prop: "receiverAddress", label: "收件地址", width: 150 },
        { prop: "orderDate", label: "下單日期", sortable: true, width: 150 },
        { prop: "paymentDate", label: "付款日期", sortable: true, width: 150 },
        { prop: "processor", label: "處理人員", width: 100 },
        {
          prop: "remark",
          label: "備註",
          width: 200,
          showOverflowTooltip: false
        }
      ],
      // 確保子表格配置正確 - 修改為使用API返回的屬性名稱
      orderDetailColumns: [
        { prop: "serialNumber", label: "流水號", width: 240 },
        { prop: "activity_name", label: "活動名稱", width: 150 },
        { prop: "product_name", label: "商品名稱", width: 200 }, // 使用 product_name
        { prop: "product_code", label: "規格", width: 150 },
        {
          prop: "unit_price", // 使用 unit_price
          label: "單價",
          width: 120,
          formatter: value => {
            // 確保值不是 undefined 或 null
            return value !== undefined && value !== null
              ? `$${parseFloat(value).toLocaleString()}`
              : "$0.00";
          }
        },
        { prop: "quantity", label: "數量", width: 80 },
        {
          prop: "total_price", // 使用 total_price
          label: "小計",
          width: 120,
          formatter: value => {
            // 確保值不是 undefined 或 null
            return value !== undefined && value !== null
              ? `$${parseFloat(value).toLocaleString()}`
              : "$0.00";
          }
        },
        {
          prop: "is_gift", // 使用 is_gift
          label: "贈品",
          width: 80,
          formatter: value => {
            return value ? "是" : "否";
          }
        }
      ],
      historyColumns: [
        { prop: "timestamp", label: "操作時間", width: 180, sortable: true },
        { prop: "orderNumber", label: "訂單編號", width: 150 },
        { prop: "type", label: "操作類型", width: 120 },
        { prop: "field", label: "修改欄位", width: 120 },
        { prop: "beforeValue", label: "修改前", width: 150 },
        { prop: "afterValue", label: "修改後", width: 150 },
        { prop: "operator", label: "操作人員", width: 120 }
      ]
    };
  },

  computed: {
    // 過濾後的接單數據
    filteredOrderData() {
      return this.orderData;
    },

    // 過濾後的接單異動記錄
    filteredOrderHistoryData() {
      return this.orderHistoryData;
    }
  },

  async created() {
    await this.fetchOrderData();
  },

  async mounted() {
    this.$nextTick(() => {
      this.checkSubTableData();
    });
  },

  updated() {
    // 檢查子表格數據
    this.$nextTick(() => {
      this.checkSubTableData();
    });
  },

  methods: {
    // 格式化方法
    formatDate,
    formatPhone,
    getTypeTag,
    getTypeLabel,

    // 安全解析數字的輔助方法
    parseNumber(value) {
      if (value === undefined || value === null || value === "") {
        return 0;
      }
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    },

    // 檢查子表格數據
    checkSubTableData() {
      // console.log("檢查主數據:", this.orderData);
      // if (this.orderData && this.orderData.length > 0) {
      //   // 檢查每行是否有 items 屬性，以及 items 是否為數組且有數據
      //   this.orderData.forEach(order => {
      //     console.log(`訂單 ${order.orderNumber} 的 items:`, order.items);
      //     if (
      //       !order.items ||
      //       !Array.isArray(order.items) ||
      //       order.items.length === 0
      //     ) {
      //       console.warn(
      //         `訂單 ${order.orderNumber} 沒有 items 數據或 items 為空`
      //       );
      //     } else {
      //       // 檢查第一個 item 是否有 serialNumber 屬性
      //       console.log("第一個 item:", order.items[0]);
      //       if (!order.items[0].serialNumber) {
      //         console.warn(
      //           `訂單 ${order.orderNumber} 的 items 中沒有 serialNumber 屬性`
      //         );
      //       }
      //     }
      //   });
      // }
    },

    // 對帳
    handleBatchImport() {
      this.batchImportDialogVisible = true;
    },

    openBankCodeReport(order) {
      this.currentReportOrder = order;
      this.bankCodeReportVisible = true;
    },

    // 末五碼回報成功後的處理
    handleBankCodeReportSuccess() {
      // 刷新訂單列表
      this.fetchOrderData();
    },

    // 獲取特定狀態的接單
    getStatusFilteredData(statusValue, statusField) {
      return this.filteredOrderData.filter(
        order => order[statusField] === statusValue
      );
    },

    // 獲取付款狀態標籤樣式
    getPaymentStatusType(status) {
      const statusInfo = this.paymentStatusOptions.find(
        option => option.value === status
      );
      return statusInfo ? statusInfo.type : "info";
    },

    // 獲取付款狀態顯示文字
    getPaymentStatusLabel(status) {
      const statusInfo = this.paymentStatusOptions.find(
        option => option.value === status
      );
      return statusInfo ? statusInfo.label : status;
    },

    // 獲取接單狀態標籤樣式
    getOrderStatusType(status) {
      const statusInfo = this.orderStatusOptions.find(
        option => option.value === status
      );
      return statusInfo ? statusInfo.type : "info";
    },

    // 獲取接單狀態顯示文字
    getOrderStatusLabel(status) {
      const statusInfo = this.orderStatusOptions.find(
        option => option.value === status
      );
      return statusInfo ? statusInfo.label : status;
    },

    // 備註相關方法
    async fetchLatestRemarks() {
      if (this.orderData.length === 0) return;

      const orderIds = this.orderData.map(order => order.id);
      this.loading = true;

      try {
        // 使用批量獲取API
        const response = await OrderTakingServices.getBatchLatestRemarks(
          orderIds
        );

        console.log(response);

        if (response.success) {
          // 處理返回的數據
          for (const [orderId, remarkData] of Object.entries(response.data)) {
            this.$set(this.latestRemarks, orderId, remarkData);
          }

          // 更新備註計數
          for (const [orderId, count] of Object.entries(response.counts)) {
            this.$set(this.remarkCounts, orderId, count);
          }
        }
      } catch (error) {
        console.error("獲取備註數據失敗:", error);
      } finally {
        this.loading = false;
      }
    },

    // 獲取特定訂單的備註數據
    async fetchOrderRemarkById(orderId) {
      if (!orderId) return;
      this.remarkLoading = true;
      try {
        // 獲取備註列表
        const remarksResponse = await OrderTakingServices.getOrderRemarks(
          orderId
        );

        if (remarksResponse.success && remarksResponse.data) {
          // 更新備註列表
          this.$set(
            this.orderRemarks,
            orderId,
            remarksResponse.data.data.remarks
          );
        }

        // 更新主表格
        this.$nextTick(() => {
          if (this.$refs.orderTable) {
            this.$refs.orderTable.refreshTable();
          }
        });
      } catch (error) {
        console.error("獲取備註數據失敗:", error);
        this.$message.error(`獲取備註資料失敗: ${error.message || "未知錯誤"}`);
      } finally {
        this.remarkLoading = false;
      }
    },

    // 獲取最新備註
    getLatestRemark(orderId) {
      return this.latestRemarks[orderId];
    },

    // 獲取備註計數
    getRemarkCount(orderId) {
      return this.remarkCounts[orderId] || 0;
    },

    // 檢查是否為重要備註
    isImportantRemark(orderId) {
      const remark = this.getLatestRemark(orderId);
      return remark && (remark.is_important || remark.is_pinned);
    },

    // 顯示備註時間線
    async showRemarkTimeline(row) {
      console.log("Showing remark timeline for row:", row);
      this.currentOrderForRemark = row;

      // 確保在顯示對話框前已經獲取了備註數據
      try {
        await this.fetchOrderRemarkById(row.id);
        console.log("Remarks for order:", this.orderRemarks[row.id]);
      } catch (error) {
        console.error("Error fetching remarks:", error);
      }

      this.remarkTimelineVisible = true;
    },

    // 處理添加備註
    async handleAddRemark(remarkData) {
      try {
        this.remarkLoading = true;

        // 處理文件上傳
        const formData = new FormData();
        if (remarkData.files && remarkData.files.length > 0) {
          remarkData.files.forEach(file => {
            formData.append("images", file);
          });
        }

        // 添加備註數據
        const response = await OrderTakingServices.addOrderRemark(
          {
            orderId: remarkData.orderId,
            content: remarkData.content,
            is_pinned: remarkData.is_pinned,
            is_important: remarkData.is_important
          },
          formData
        );

        if (response.success) {
          this.$message.success("備註添加成功");
          // 更新備註數據
          await this.fetchOrderRemarkById(remarkData.orderId);
        } else {
          this.$message.error(response.message || "備註添加失敗");
        }
      } catch (error) {
        this.$message.error("添加備註失敗: " + error.message);
      } finally {
        this.remarkLoading = false;
      }
    },

    // 處理更新備註
    async handleUpdateRemark(remark) {
      try {
        this.remarkLoading = true;
        const response = await OrderTakingServices.updateOrderRemark(remark);
        if (response.success) {
          this.$message.success("備註更新成功");
          await this.fetchOrderRemarkById(remark.orderId);
        } else {
          this.$message.error(response.message || "備註更新失敗");
        }
      } catch (error) {
        this.$message.error("更新備註失敗: " + error.message);
      } finally {
        this.remarkLoading = false;
      }
    },

    // 處理刪除備註
    async handleDeleteRemark(remark) {
      try {
        this.remarkLoading = true;
        const response = await OrderTakingServices.deleteOrderRemark(remark.id);
        if (response.success) {
          this.$message.success("備註刪除成功");
          await this.fetchOrderRemarkById(remark.orderId);
        } else {
          this.$message.error(response.message || "備註刪除失敗");
        }
      } catch (error) {
        this.$message.error("刪除備註失敗: " + error.message);
      } finally {
        this.remarkLoading = false;
      }
    },

    // 加載更多備註
    async loadMoreRemarks() {
      if (!this.currentOrderForRemark) return;

      try {
        this.remarkLoading = true;
        const currentRemarks =
          this.orderRemarks[this.currentOrderForRemark.id] || [];
        const page = Math.ceil(currentRemarks.length / 10) + 1;
        const response = await OrderTakingServices.getOrderRemarks(
          this.currentOrderForRemark.id,
          { page }
        );

        console.log(response);

        if (response.success && response.data) {
          // 合併新備註到現有列表
          const currentRemarks =
            this.orderRemarks[this.currentOrderForRemark.id] || [];
          this.$set(this.orderRemarks, this.currentOrderForRemark.id, [
            ...currentRemarks,
            ...response.data
          ]);

          // 更新是否有更多 (根據 API 響應結構調整)
          this.hasMoreRemarks = response.data.length > 0;
        }
      } catch (error) {
        console.error("加載更多備註失敗:", error);
        this.$message.error("加載更多備註失敗");
      } finally {
        this.remarkLoading = false;
      }
    },

    // 接單列表相關方法
    async fetchOrderData(params = null) {
      this.loading = true;
      try {
        const queryParams = params || this.getQueryParams();

        // 調用訂單服務，添加分頁參數
        const response = await OrderTakingServices.getAdminOrderList({
          page: this.currentPage,
          limit: this.pageSize,
          filters: queryParams
        });

        // 判斷數據結構並設置正確的訂單數據陣列和總數
        let orderArray = [];
        let totalCount = 0;

        // 兼容兩種可能的 API 返回結構
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            orderArray = response.data;
            totalCount = response.total || 0;
          } else if (
            response.data.results &&
            Array.isArray(response.data.results)
          ) {
            orderArray = response.data.results;
            totalCount = response.data.count || 0;
          } else {
            console.warn("無法識別的 API 返回數據結構:", response);
            orderArray = [];
            totalCount = 0;
          }
        } else {
          console.warn("API 返回數據缺少 data 屬性:", response);
          orderArray = [];
          totalCount = 0;
        }

        // 確保數據映射
        if (orderArray.length > 0) {
          // 映射數據格式，確保所有數值類型的欄位都有初始值
          const mappedData = orderArray.map(order => {
            // 處理子項目數據
            const orderItems = [];

            // 確保 items 是數組且有內容
            if (
              order.items &&
              Array.isArray(order.items) &&
              order.items.length > 0
            ) {
              // 為每個 item 添加 serialNumber
              order.items.forEach((item, index) => {
                // 創建一個新對象，包含原始 item 的所有屬性，添加 serialNumber
                orderItems.push({
                  ...item,
                  serialNumber: `${order.order_number || ""}-${index + 1}`
                });
              });
            }

            return {
              id: order.id,
              orderNumber: order.order_number || "",
              customerName: order.receiver_name || "",
              contactPhone: order.receiver_phone || "",
              totalAmount: this.parseNumber(order.total_amount),
              paidAmount: order.paid_at
                ? this.parseNumber(order.final_amount)
                : 0,
              paymentMethod: this.formatPaymentMethod(order.payment_method),
              bankLastFive: order.bank_last_five || "",
              bankScreenshot:
                order.bank_screenshot_url === null
                  ? ""
                  : order.bank_screenshot_url,

              receiverAddress: order.receiver_address || "",
              paymentStatus: order.payment_status || "pending",
              orderStatus: order.order_status || "unconfirmed",
              orderDate: order.create_time || "",
              paymentDate: order.paid_at || "",
              processor: order.created_by || order.updated_by || "",
              remark: order.order_notes || "",
              // 使用處理後的子項目數據
              items: orderItems
            };
          });

          this.orderData = mappedData;
          this.totalOrders = totalCount;

          // 若是初次載入或重置篩選，則更新 allOrderData
          if (!params || !Object.keys(params).length) {
            this.allOrderData = [...this.orderData];
            this.isFiltering = false;
          } else {
            this.isFiltering = true;
          }
        } else {
          this.orderData = [];
          this.totalOrders = 0;
          console.warn("API 返回的數據為空或無法處理");
        }

        // 資料載入後獲取備註資訊
        if (this.orderData.length > 0) {
          await this.fetchLatestRemarks();
        }
      } catch (error) {
        this.$message.error("獲取接單數據失敗: " + error.message);
        console.error("訂單數據載入錯誤:", error);
        this.orderData = []; // 確保出錯時也有空陣列
        this.totalOrders = 0;
      } finally {
        this.loading = false;
      }
    },

    // 格式化付款方式
    formatPaymentMethod(method) {
      const methodMap = {
        bankTransfer: "銀行轉帳"
      };
      return methodMap[method] || method || "";
    },

    // 處理頁面大小變更
    handleSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1; // 切換頁面大小時，重置到第一頁
      this.fetchOrderData();
    },

    // 處理當前頁變更
    handleCurrentChange(page) {
      this.currentPage = page;
      this.fetchOrderData();
    },

    getQueryParams() {
      const params = {};

      if (this.orderDateRange && this.orderDateRange.length === 2) {
        params.startDate = formatDate(this.orderDateRange[0], "YYYY-MM-DD");
        params.endDate = formatDate(this.orderDateRange[1], "YYYY-MM-DD");
      }

      if (this.orderSearchQuery) {
        params.search = this.orderSearchQuery;
      }

      return params;
    },

    // 處理CombinedSearch組件的搜尋事件
    handleCombinedSearch(searchParams) {
      // 更新本地的搜尋條件
      this.orderSearchQuery = searchParams.keyword || "";
      this.orderDateRange = searchParams.dateRange || [];

      // 重置到第一頁
      this.currentPage = 1;

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
      this.fetchOrderData(params);
    },

    resetFilters() {
      this.orderSearchQuery = "";
      this.orderDateRange = [];
      if (this.$refs.orderSearch) {
        this.$refs.orderSearch.clear();
      }

      // 重置分頁
      this.currentPage = 1;

      // 重新獲取數據
      this.fetchOrderData();

      this.isFiltering = false;
      this.lastSearchParams = null;

      // 通知用戶重置成功
      this.$message.success("已重置篩選條件");
    },

    // 異動記錄相關方法
    async fetchOrderHistoryData(orderId = null, params = null) {
      this.loading = true;
      try {
        const queryParams = params || {};

        if (orderId) {
          queryParams.orderId = orderId;
          this.showBackButton = true;
          this.currentOrderId = orderId;
          this.lastViewedRow = this.orderData.find(item => item.id === orderId);
        } else {
          this.showBackButton = false;
          this.currentOrderId = null;

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

          if (this.orderHistorySearchQuery) {
            queryParams.search = this.orderHistorySearchQuery;
          }
        }

        const response = await OrderTakingServices.getOrderHistory(queryParams);
        this.orderHistoryData = response.data || [];

        // 若是初次加載或特定接單的記錄，則更新 allOrderHistoryData
        if (orderId || !Object.keys(params || {}).length) {
          this.allOrderHistoryData = [...this.orderHistoryData];
          this.isHistoryFiltering = false;
        } else {
          this.isHistoryFiltering = true;
        }
      } catch (error) {
        this.$message.error("獲取接單異動記錄失敗: " + error.message);
        this.orderHistoryData = []; // 確保出錯時也有空數組
      } finally {
        this.loading = false;
      }
    },

    // 處理CombinedSearch組件的歷史搜尋事件
    handleCombinedHistorySearch(searchParams) {
      // 更新本地的搜尋條件
      this.orderHistorySearchQuery = searchParams.keyword || "";
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

      if (this.orderHistorySearchQuery) {
        params.search = this.orderHistorySearchQuery;
      }

      if (this.currentOrderId) {
        params.orderId = this.currentOrderId;
      }

      // 檢查是否和上次搜尋參數相同，避免重複請求
      const paramsStr = JSON.stringify(params);
      if (this.lastHistorySearchParams === paramsStr) {
        return;
      }

      this.lastHistorySearchParams = paramsStr;
      this.fetchOrderHistoryData(null, params);
    },

    resetHistoryFilters() {
      this.orderHistorySearchQuery = "";
      this.historyDateRange = [];
      if (this.$refs.historySearch) {
        this.$refs.historySearch.clear();
      }
      this.orderHistoryData = [...this.allOrderHistoryData];
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
      this.orderDialogVisible = true;
    },

    handleSelectionChange(selection) {
      this.selectedRows = selection;
    },

    handleSortChange({ prop, order }) {
      // 排序變化處理
      // console.log("排序變化:", prop, order);
    },

    handleExpandChange(row, expanded) {
      // 展開/折疊處理
      // console.log("行展開狀態變化:", row, expanded);
      // if (expanded) {
      //   // 當展開時，檢查子表格數據
      //   console.log("展開的行:", row);
      //   console.log("子表格數據:", row.items);
      // }
    },

    handleSubRowClick(subRow, parentRow) {
      // 子表格行點擊處理
      // console.log("子表格行點擊:", subRow, parentRow);
    },

    async handleSaveOrder(orderData) {
      try {
        this.loading = true;
        if (orderData.id) {
          // 更新
          await OrderTakingServices.updateOrder(orderData);
          this.$message.success("接單資料更新成功");
        } else {
          // 新增
          await OrderTakingServices.createOrder(orderData);
          this.$message.success("接單資料創建成功");
        }

        this.orderDialogVisible = false;
        this.fetchOrderData();
      } catch (error) {
        this.$message.error("保存失敗: " + error.message);
      } finally {
        this.loading = false;
      }
    },

    viewOrderHistory(row) {
      this.activeTab = "order-history";
      this.fetchOrderHistoryData(row.id);
    },

    backToOrderList() {
      this.activeTab = "order-list";
      this.statusTab = "all";
      this.historyDateRange = [];
      this.orderHistorySearchQuery = "";
      this.showBackButton = false;

      this.$nextTick(() => {
        if (this.lastViewedRow) {
          const table = this.$refs.orderTable;
          if (table) {
            const rows = table.$el.querySelectorAll(".el-table__row");
            for (let i = 0; i < rows.length; i++) {
              const cells = rows[i].getElementsByTagName("td");
              if (
                cells.length > 0 &&
                cells[0].textContent === this.lastViewedRow.orderNumber
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

    // 處理批量更新
    handleBatchUpdate(updateResult) {
      // 如果需要刷新數據，直接刷新
      if (updateResult.shouldRefreshData) {
        this.fetchOrderData();
        return;
      }

      // 如果不需要刷新，進行本地數據更新
      // 獲取更新類型和狀態
      const updateType = updateResult.updateType; // 'order' 或 'payment'
      const newStatus = updateResult.status;
      const rows = updateResult.rows;
      const updateRelatedStatus =
        updateResult.updateRelatedStatus !== undefined
          ? updateResult.updateRelatedStatus
          : true; // 默認為 true

      // 更新本地數據
      rows.forEach(updatedRow => {
        const index = this.orderData.findIndex(row => row.id === updatedRow.id);
        if (index !== -1) {
          // 更新主狀態
          this.$set(
            this.orderData[index],
            updateType === "order" ? "orderStatus" : "paymentStatus",
            newStatus
          );

          // 處理聯動狀態
          if (updateType === "order") {
            if (newStatus === "confirmed") {
              // 已接單，強制將付款狀態設為已付款
              this.$set(this.orderData[index], "paymentStatus", "paid");
            } else if (newStatus === "rejected" && updateRelatedStatus) {
              // 已拒絕且勾選了更新關聯狀態，將付款狀態設為付款取消
              this.$set(this.orderData[index], "paymentStatus", "cancelled");
            }
          } else if (updateType === "payment") {
            if (newStatus === "paid" && updateRelatedStatus) {
              // 已付款且勾選了更新關聯狀態，更新為已接單
              this.$set(this.orderData[index], "orderStatus", "confirmed");
            } else if (newStatus === "refunded" || newStatus === "cancelled") {
              // 已退款或付款取消，強制更新為已拒絕
              this.$set(this.orderData[index], "orderStatus", "rejected");
            }
          }
        }
      });
    },

    // 創建更新歷史記錄 (可選)
    createUpdateHistoryEntry(rows, updateType, newStatus, comment) {
      // console.log("記錄批量更新歷史:", {
      //   rows,
      //   updateType,
      //   newStatus,
      //   comment
      // });
      // 實際項目中可以調用API創建歷史記錄
    },

    // 處理接單資料更新成功
    handleUpdateSuccess(updatedData) {
      // 更新本地數據
      const index = this.orderData.findIndex(
        item => item.id === updatedData.id
      );
      if (index !== -1) {
        this.$set(this.orderData, index, updatedData);
      }

      // 重新獲取數據，確保所有相關數據都更新
      this.fetchOrderData();

      // 重新獲取備註
      this.fetchOrderRemarkById(updatedData.id);

      this.$message.success("接單資料更新成功");
    },

    // 處理對帳批量導入提交
    handleBatchImportSubmit(data) {
      // console.log("處理批量導入提交", data);

      // 根據返回的確認數據更新本地訂單狀態
      if (data && data.confirmedOrders && data.confirmedOrders.length > 0) {
        // 更新訂單付款狀態
        data.confirmedOrders.forEach(confirmedOrder => {
          const index = this.orderData.findIndex(
            order => order.orderNumber === confirmedOrder.orderNumber
          );

          if (index !== -1) {
            // 更新付款狀態為已付款
            this.$set(this.orderData[index], "paymentStatus", "paid");

            // 更新付款日期
            this.$set(
              this.orderData[index],
              "paymentDate",
              confirmedOrder.paymentDate
            );

            // 可能還需要更新其他相關欄位
            this.$set(
              this.orderData[index],
              "bankLastFive",
              confirmedOrder.accountInfo &&
                confirmedOrder.accountInfo.length > 5
                ? confirmedOrder.accountInfo.slice(-5)
                : confirmedOrder.accountInfo
            );
          }
        });

        // 顯示成功消息
        this.$message.success(
          `批量導入成功，已更新 ${data.confirmedOrders.length} 筆訂單的付款狀態`
        );

        // 關閉對話框
        this.batchImportDialogVisible = false;

        // 刷新數據（可選）
        // this.fetchOrderData();
      }
    },

    handleExport(options) {
      // 導出處理
      // console.log("導出選項:", options);
      this.$message.success(`成功匯出 ${options.selectedRows.length} 筆數據`);
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

.order-taking-management {
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

    .order-tabs {
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

  // 備註預覽樣式
  .remark-preview {
    cursor: pointer;
    padding: 6px 8px;
    background: #f8f9fa;
    border-radius: 4px;
    border: 1px solid #ebeef5;
    transition: $transition;

    &:hover {
      background: #f0f2f5;
      border-color: #d9d9d9;
    }

    .remark-content {
      font-size: 14px;
      line-height: 1.4;
      margin-bottom: 4px;
      display: flex;
      align-items: flex-start;
      gap: 4px;

      .remark-badge {
        color: $warning-color;
        font-size: 12px;
      }
    }

    .remark-meta {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #909399;

      .remark-count {
        background: $primary-color;
        color: white;
        padding: 0 4px;
        border-radius: 10px;
        font-size: 10px;
        line-height: 1.5;
      }
    }

    .no-remark {
      color: #909399;
      font-size: 14px;
      text-align: center;
      padding: 4px 0;
    }
  }
}

// 響應式設計
@media screen and (max-width: 768px) {
  .order-taking-management {
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
