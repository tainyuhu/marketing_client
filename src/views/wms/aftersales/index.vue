<template>
  <div class="after-sales-service-center">
    <!-- 頁面標題區域 -->
    <div class="page-header">
      <h2>售後服務中心</h2>
      <div class="action-buttons">
        <el-button type="primary" icon="el-icon-plus" @click="handleCreateCase">
          新增售後案件
        </el-button>
      </div>
    </div>

    <!-- 主要內容區域 -->
    <div class="page-content">
      <el-tabs v-model="activeTab" type="border-card" class="service-tabs">
        <!-- 售後案件列表 -->
        <el-tab-pane label="售後案件列表" name="case-list">
          <div class="table-operations">
            <div class="operation-wrapper">
              <div class="search-filters">
                <combined-search
                  ref="caseSearch"
                  :search-value="caseSearchQuery"
                  :time-value="caseDateRange"
                  :search-placeholder="'搜尋售後案件...'"
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
              <enhanced-data-table
                ref="mainTable"
                :data="filteredCaseData"
                :columns="mainColumns"
                :sub-table-configs="subTableConfigs"
                :row-key="'orderNumber'"
                :sub-row-key="'id'"
                :title-field="'orderNumber'"
                :show-toolbar="true"
                :show-selection-column="true"
                :border="true"
                :loading="loading"
                :show-pagination="true"
                :page-sizes="[10, 20, 50, 100]"
                :show-action-column="true"
                :action-fixed="'right'"
                :action-width="160"
                :action-label="'操作'"
                :filename="'售後案件數據'"
                :empty-text="'暫無售後案件數據'"
                :status-options="statusOptions"
                @selection-change="handleSelectionChange"
                @expand-change="handleExpandChange"
                @sort-change="handleSortChange"
                @sub-row-click="handleSubRowClick"
                @sub-table-change="handleSubTableChange"
              >
                <!-- 自定義格式化 -->
                <!-- 訂單編號列 -->
                <template #column-originalOrderId="{ row }">
                  <el-link
                    type="primary"
                    @click="viewOrderDetails(row.originalOrderId)"
                  >
                    {{ row.originalOrderId }}
                  </el-link>
                </template>

                <!-- 日期列 -->
                <template #column-applyDate="{ row }">
                  {{ formatDate(row.applyDate) }}
                </template>

                <!-- 優先級列 -->
                <template #column-priority="{ row }">
                  <el-tag
                    :type="getPriorityTagType(row.priority)"
                    size="small"
                    effect="dark"
                  >
                    {{ row.priority }}
                  </el-tag>
                </template>

                <!-- 處理狀態列 -->
                <template #column-status="{ row }">
                  <el-tag :type="getStatusTagType(row.status)" size="small">
                    {{ row.status }}
                  </el-tag>
                </template>

                <!-- 問題簡述 -->
                <template #column-problemSummary="{ row }">
                  <el-popover placement="top-start" width="300" trigger="hover">
                    <div class="problem-popover-content">
                      {{ row.problemSummary }}
                    </div>
                    <template #reference>
                      <el-link type="info" :underline="false">
                        {{ truncateText(row.problemSummary, 6) }}
                      </el-link>
                    </template>
                  </el-popover>
                </template>

                <!-- 處理備註 -->
                <template #column-processingRemarks="{ row }">
                  <latest-remark-preview
                    :remark="getLatestRemark(row.orderNumber)"
                    :remark-count="getRemarkCount(row.orderNumber)"
                    :add-remark-text="'添加備註'"
                    @view-timeline="openRemarkTimeline(row)"
                  />
                </template>

                <!-- 操作列 -->
                <template #action="{ row }">
                  <el-tooltip content="編輯案件" placement="top">
                    <el-button
                      size="mini"
                      type="primary"
                      icon="el-icon-edit"
                      @click="handleEdit(row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip content="查看歷史記錄" placement="top">
                    <el-button
                      size="mini"
                      type="info"
                      icon="el-icon-document"
                      @click="viewCaseHistory(row)"
                    ></el-button>
                  </el-tooltip>
                  <el-dropdown
                    size="mini"
                    @command="cmd => handleMoreActions(cmd, row)"
                  >
                    <el-button size="mini" type="text">
                      <i class="el-icon-more"></i>
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                      <!-- 子表格操作 - 問題反應詳情 -->
                      <el-dropdown-item command="editProblemDetails">
                        編輯問題詳情
                      </el-dropdown-item>
                      <el-dropdown-item
                        command="viewFiles"
                        :disabled="!hasEvidenceFiles(row)"
                      >
                        查看附件
                      </el-dropdown-item>

                      <!-- 子表格操作 - 退換貨處理明細 -->
                      <el-dropdown-item command="editReturnDetails">
                        編輯退換貨明細
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>

                <!-- 子表格-A: 問題反應詳情 -->
                <template #sub-column-0-productName="{ row }">
                  <span>{{ row.productName }}</span>
                </template>

                <template #sub-column-0-productIssueType="{ row }">
                  <el-tag size="small" type="danger">{{
                    row.productIssueType
                  }}</el-tag>
                </template>

                <template #sub-column-0-evidenceFiles="{ row }">
                  <el-button
                    v-if="row.evidenceFiles && row.evidenceFiles.length > 0"
                    size="mini"
                    type="primary"
                    round
                    @click="viewFiles(row.evidenceFiles)"
                    class="small-text-button"
                  >
                    檢視附件
                  </el-button>
                  <span v-else>無檔案</span>
                </template>

                <!-- 子表格-B: 退換貨處理明細 -->
                <template #sub-column-1-returnExchangeStatus="{ row }">
                  <el-tag
                    size="small"
                    :type="getReturnStatusType(row.returnExchangeStatus)"
                  >
                    {{ row.returnExchangeStatus }}
                  </el-tag>
                </template>

                <template #sub-column-1-refundAmount="{ row }">
                  <span class="refund-amount">{{
                    formatCurrency(row.refundAmount)
                  }}</span>
                </template>
              </enhanced-data-table>
            </el-tab-pane>

            <!-- 按狀態分類的標籤 -->
            <el-tab-pane
              v-for="status in statusOptions"
              :key="status.value"
              :label="status.label"
              :name="status.value.toString()"
            >
              <enhanced-data-table
                :data="getStatusFilteredData(status.value)"
                :columns="mainColumns"
                :sub-table-configs="subTableConfigs"
                :default-sub-table-index="activeSubTableIndex"
                row-key="orderNumber"
                sub-row-key="id"
                title-field="orderNumber"
                :show-toolbar="true"
                :show-selection-column="true"
                :border="true"
                :loading="loading"
                :show-pagination="true"
                :page-sizes="[10, 20, 50, 100]"
                :show-action-column="true"
                action-fixed="right"
                action-width="160"
                action-label="操作"
                filename="售後案件數據"
                :empty-text="'暫無售後案件數據'"
                :status-options="statusOptions"
                @selection-change="handleSelectionChange"
                @expand-change="handleExpandChange"
                @sort-change="handleSortChange"
                @sub-row-click="handleSubRowClick"
                @sub-table-change="handleSubTableChange"
              >
                <!-- 自定義格式化 -->
                <!-- 訂單編號列 -->
                <template #column-originalOrderId="{ row }">
                  <el-link
                    type="primary"
                    @click="viewOrderDetails(row.originalOrderId)"
                  >
                    {{ row.originalOrderId }}
                  </el-link>
                </template>

                <!-- 日期列 -->
                <template #column-applyDate="{ row }">
                  {{ formatDate(row.applyDate) }}
                </template>

                <!-- 優先級列 -->
                <template #column-priority="{ row }">
                  <el-tag
                    :type="getPriorityTagType(row.priority)"
                    size="small"
                    effect="dark"
                  >
                    {{ row.priority }}
                  </el-tag>
                </template>

                <!-- 處理狀態列 -->
                <template #column-status="{ row }">
                  <el-tag :type="getStatusTagType(row.status)" size="small">
                    {{ row.status }}
                  </el-tag>
                </template>

                <!-- 問題簡述 -->
                <template #column-problemSummary="{ row }">
                  <el-popover placement="top-start" width="300" trigger="hover">
                    <div class="problem-popover-content">
                      {{ row.problemSummary }}
                    </div>
                    <template #reference>
                      <el-link type="info" :underline="false">
                        {{ truncateText(row.problemSummary, 6) }}
                      </el-link>
                    </template>
                  </el-popover>
                </template>

                <!-- 處理備註 -->
                <template #column-processingRemarks="{ row }">
                  <latest-remark-preview
                    :remark="getLatestRemark(row.orderNumber)"
                    :remark-count="getRemarkCount(row.orderNumber)"
                    :add-remark-text="'添加備註'"
                    @view-timeline="openRemarkTimeline(row)"
                  />
                </template>

                <!-- 操作列 -->
                <template #action="{ row }">
                  <el-tooltip content="編輯案件" placement="top">
                    <el-button
                      size="mini"
                      type="primary"
                      icon="el-icon-edit"
                      @click="handleEdit(row)"
                    ></el-button>
                  </el-tooltip>
                  <el-tooltip content="查看歷史記錄" placement="top">
                    <el-button
                      size="mini"
                      type="info"
                      icon="el-icon-document"
                      @click="viewCaseHistory(row)"
                    ></el-button>
                  </el-tooltip>
                  <el-dropdown
                    size="mini"
                    @command="cmd => handleMoreActions(cmd, row)"
                  >
                    <el-button size="mini" type="text">
                      <i class="el-icon-more"></i>
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                      <!-- 子表格操作 - 問題反應詳情 -->
                      <el-dropdown-item command="editProblemDetails">
                        編輯問題詳情
                      </el-dropdown-item>
                      <el-dropdown-item
                        command="viewFiles"
                        :disabled="!hasEvidenceFiles(row)"
                      >
                        查看附件
                      </el-dropdown-item>

                      <!-- 子表格操作 - 退換貨處理明細 -->
                      <el-dropdown-item command="editReturnDetails">
                        編輯退換貨明細
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>

                <!-- 子表格-A: 問題反應詳情 -->
                <template #sub-column-0-productName="{ row }">
                  <span>{{ row.productName }}</span>
                </template>

                <template #sub-column-0-productIssueType="{ row }">
                  <el-tag size="small" type="danger">{{
                    row.productIssueType
                  }}</el-tag>
                </template>

                <template #sub-column-0-evidenceFiles="{ row }">
                  <el-button
                    v-if="row.evidenceFiles && row.evidenceFiles.length > 0"
                    size="mini"
                    type="primary"
                    round
                    @click="viewFiles(row.evidenceFiles)"
                    class="small-text-button"
                  >
                    檢視附件
                  </el-button>
                  <span v-else>無檔案</span>
                </template>

                <!-- 子表格-B: 退換貨處理明細 -->
                <template #sub-column-1-returnExchangeStatus="{ row }">
                  <el-tag
                    size="small"
                    :type="getReturnStatusType(row.returnExchangeStatus)"
                  >
                    {{ row.returnExchangeStatus }}
                  </el-tag>
                </template>

                <template #sub-column-1-refundAmount="{ row }">
                  <span class="refund-amount">{{
                    formatCurrency(row.refundAmount)
                  }}</span>
                </template>
              </enhanced-data-table>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>

        <!-- 案件歷史記錄 -->
        <el-tab-pane label="案件歷史記錄" name="case-history">
          <div class="table-operations">
            <div class="operation-wrapper">
              <div class="search-filters">
                <el-button
                  v-if="showBackButton"
                  type="primary"
                  icon="el-icon-back"
                  @click="backToCaseList"
                  >返回案件列表</el-button
                >
                <combined-search
                  ref="historySearch"
                  :search-value="historySearchQuery"
                  :time-value="historyDateRange"
                  :search-placeholder="'搜尋案件歷史...'"
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
            :data="filteredHistoryData"
            :columns="historyColumns"
            :loading="loading"
            :show-selection-column="false"
            :show-index="true"
            :show-toolbar="true"
            :show-pagination="true"
            :page-sizes="[10, 20, 50, 100]"
            :filename="'case-history-export'"
            border
          >
            <!-- 自定義列格式插槽 -->
            <template #column-operationType="{ row }">
              <el-tag
                :type="getOperationTypeTag(row.operationType)"
                size="small"
                effect="dark"
              >
                {{ getOperationTypeLabel(row.operationType) }}
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
      :order-id="currentCaseId"
      :order-info="currentCaseInfo"
      :has-more="hasMoreRemarks"
      :is-loading="loadingRemarks"
      @load-more="loadMoreRemarks"
      @add-remark="addRemark"
      @update-remark="updateRemark"
      @delete-remark="deleteRemark"
    />

    <!-- 售後案件詳情對話框 -->
    <after-sales-case-dialog
      :visible.sync="caseDialogVisible"
      :data="currentEditCase"
      :is-edit="isEditMode"
      :priority-options="priorityOptions"
      :problem-type-options="problemTypeOptions"
      :processing-method-options="processingMethodOptions"
      :status-options="statusOptions"
      @save="handleSaveCase"
    />

    <!-- 訂單詳情對話框 -->
    <order-details-dialog
      :visible.sync="orderDialogVisible"
      :order-id="currentOrderId"
    />

    <!-- 文件預覽對話框 -->
    <file-preview-dialog
      :visible.sync="filePreviewVisible"
      :files="previewFiles"
      title="預覽"
    />

    <!-- 子表格編輯對話框 -->
    <problem-details-dialog
      :visible.sync="problemDetailsDialogVisible"
      :data="currentEditProblemDetail"
      :case-id="currentCaseId"
      :product-issue-types="productIssueTypes"
      :non-product-issue-types="nonProductIssueTypes"
      @save="handleSaveProblemDetail"
    />

    <return-exchange-dialog
      :visible.sync="returnExchangeDialogVisible"
      :data="currentEditReturnExchange"
      :case-id="currentCaseId"
      :status-options="returnStatusOptions"
      @save="handleSaveReturnExchange"
    />
  </div>
</template>

<script>
import EnhancedDataTable from "@/components/DataTableUpgrade/EnhancedDataTable.vue";
import BaseTable from "@/components/BaseTable/index.vue";
import CombinedSearch from "@/components/SearchBox/CombinedSearch.vue";
import LatestRemarkPreview from "@/components/Remark/LatestRemarkPreview.vue";
import RemarkTimelineDialog from "@/components/Remark/RemarkTimelineDialog.vue";
import AfterSalesCaseDialog from "./components/AfterSalesCaseDialog.vue";
import OrderDetailsDialog from "./components/OrderDetailsDialog.vue";
import FilePreviewDialog from "@/components/FilePreviewDialog/index.vue";
import ProblemDetailsDialog from "./components/ProblemDetailsDialog.vue";
import ReturnExchangeDialog from "./components/ReturnExchangeDialog.vue";
import AfterSalesService from "./services/AfterSalesService.js";
import { formatDate } from "@/utils/date";

export default {
  name: "AfterSalesServiceCenter",

  components: {
    EnhancedDataTable,
    BaseTable,
    CombinedSearch,
    LatestRemarkPreview,
    RemarkTimelineDialog,
    AfterSalesCaseDialog,
    OrderDetailsDialog,
    FilePreviewDialog,
    ProblemDetailsDialog,
    ReturnExchangeDialog
  },

  data() {
    return {
      // 頁面控制
      activeTab: "case-list",
      statusTab: "all",
      activeSubTableIndex: 0,
      loading: false,
      showBackButton: false,
      lastViewedCase: null,
      showBatchActions: false,

      // 搜尋與篩選
      caseSearchQuery: "",
      caseDateRange: [],
      historySearchQuery: "",
      historyDateRange: [],
      isFiltering: false,
      isHistoryFiltering: false,
      lastSearchParams: null,
      lastHistorySearchParams: null,

      // 數據
      caseData: [],
      allCaseData: [],
      selectedRows: [],
      historyData: [],
      allHistoryData: [],
      currentCaseId: null,

      // 對話框控制
      caseDialogVisible: false,
      remarkDialogVisible: false,
      orderDialogVisible: false,
      filePreviewVisible: false,
      problemDetailsDialogVisible: false,
      returnExchangeDialogVisible: false,

      // 當前編輯/查看的數據
      currentEditCase: null,
      isEditMode: false,
      currentOrderId: null,
      previewFiles: [],
      currentEditProblemDetail: null,
      currentEditReturnExchange: null,

      // 備註相關
      currentRemarks: [],
      currentCaseInfo: {},
      hasMoreRemarks: false,
      loadingRemarks: false,
      allRemarks: {}, // 依照案件ID存儲所有備註

      // 選項
      priorityOptions: [
        { value: "緊急", label: "緊急", type: "danger" },
        { value: "高", label: "高", type: "warning" },
        { value: "中", label: "中", type: "primary" },
        { value: "低", label: "低", type: "info" }
      ],

      problemTypeOptions: [
        { value: "退貨/退款申請", label: "退貨/退款申請" },
        { value: "商品品質問題", label: "商品品質問題" },
        { value: "商品不符", label: "商品不符" },
        { value: "配送問題", label: "配送問題" },
        { value: "商品數量錯誤", label: "商品數量錯誤" },
        { value: "客戶投訴", label: "客戶投訴" },
        { value: "客戶詢問", label: "客戶詢問" },
        { value: "其他", label: "其他" }
      ],

      processingMethodOptions: [
        { value: "退貨＋全額退款", label: "退貨＋全額退款" },
        { value: "退貨＋部分退款", label: "退貨＋部分退款" },
        { value: "退貨＋換貨（不退款）", label: "退貨＋換貨（不退款）" },
        { value: "退貨＋換貨＋部分退款", label: "退貨＋換貨＋部分退款" },
        { value: "退貨但不補償", label: "退貨但不補償" },
        { value: "不退貨＋全額退款", label: "不退貨＋全額退款" },
        { value: "不退貨＋部分退款", label: "不退貨＋部分退款" },
        { value: "不退貨＋補寄商品", label: "不退貨＋補寄商品" },
        { value: "不退貨＋補寄＋部分退款", label: "不退貨＋補寄＋部分退款" },
        {
          value: "出貨前取消訂單（全額退款）",
          label: "出貨前取消訂單（全額退款）"
        },
        {
          value: "出貨後退貨＋取消訂單（全額退款）",
          label: "出貨後退貨＋取消訂單（全額退款）"
        }
      ],

      statusOptions: [
        { value: "待處理", label: "待處理", type: "warning" },
        { value: "處理中", label: "處理中", type: "primary" },
        { value: "待客戶回覆", label: "待客戶回覆", type: "info" },
        { value: "待退貨", label: "待退貨", type: "warning" },
        { value: "已收到退貨", label: "已收到退貨", type: "success" },
        { value: "退款處理中", label: "退款處理中", type: "primary" },
        { value: "換貨/補寄處理中", label: "換貨/補寄處理中", type: "primary" },
        { value: "已完成", label: "已完成", type: "success" },
        { value: "不受理", label: "不受理", type: "danger" },
        { value: "已取消", label: "已取消", type: "info" }
      ],

      returnStatusOptions: [
        { value: "待處理", label: "待處理", type: "warning" },
        { value: "處理中", label: "處理中", type: "primary" },
        { value: "已出貨", label: "已出貨", type: "success" },
        { value: "已送達", label: "已送達", type: "success" },
        { value: "已取消", label: "已取消", type: "info" },
        { value: "已完成", label: "已完成", type: "success" }
      ],

      productIssueTypes: [
        { value: "品質不良", label: "品質不良" },
        { value: "腐壞/變質", label: "腐壞/變質" },
        { value: "外觀損壞", label: "外觀損壞" },
        { value: "新鮮度不佳", label: "新鮮度不佳" },
        { value: "與描述不符", label: "與描述不符" },
        { value: "少量/短少", label: "少量/短少" },
        { value: "尺寸不符", label: "尺寸不符" },
        { value: "味道異常", label: "味道異常" },
        { value: "其他", label: "其他" }
      ],

      nonProductIssueTypes: [
        { value: "配送延誤", label: "配送延誤" },
        { value: "配送錯誤", label: "配送錯誤" },
        { value: "訂單處理問題", label: "訂單處理問題" },
        { value: "客服溝通問題", label: "客服溝通問題" },
        { value: "網站/App問題", label: "網站/App問題" },
        { value: "支付問題", label: "支付問題" },
        { value: "其他", label: "其他" }
      ],

      // 表格列配置
      mainColumns: [
        { prop: "orderNumber", label: "售後單號", width: 160, sortable: true },
        { prop: "originalOrderId", label: "原訂單編號", width: 160 },
        { prop: "customerName", label: "客戶名稱", width: 120 },
        { prop: "contactPhone", label: "聯絡方式", width: 150 },
        { prop: "orderTotal", label: "訂單總金額", width: 120, sortable: true },
        { prop: "applyDate", label: "申請日期", width: 120, sortable: true },
        { prop: "priority", label: "優先級", width: 80 },
        { prop: "problemType", label: "問題類型", width: 130 },
        { prop: "processingMethod", label: "處理方式", width: 180 },
        { prop: "status", label: "處理狀態", width: 120 },
        { prop: "processor", label: "處理人員", width: 100 },
        {
          prop: "lastUpdateTime",
          label: "最後更新",
          width: 160,
          sortable: true
        },
        { prop: "expectedCompletionDate", label: "預計完成日期", width: 120 },
        { prop: "processingRemarks", label: "處理備註", width: 200 },
        { prop: "problemSummary", label: "問題簡述", minWidth: 200 }
      ],

      // 子表格設定
      subTableConfigs: [
        {
          title: "問題反應詳情",
          icon: "el-icon-warning-outline",
          dataKey: "problemDetails",
          columns: [
            { prop: "problemType", label: "問題反應類型", width: 140 },
            { prop: "productId", label: "問題商品ID", width: 120 },
            { prop: "productName", label: "商品名稱", width: 180 },
            { prop: "productCode", label: "品號", width: 120 },
            { prop: "specification", label: "規格", width: 120 },
            { prop: "purchaseQuantity", label: "購買數量", width: 100 },
            { prop: "problemQuantity", label: "問題數量", width: 100 },
            { prop: "productIssueType", label: "問題類型", width: 140 },
            { prop: "evidenceFiles", label: "問題照片/影片", width: 140 },
            {
              prop: "problemDescription",
              label: "問題詳細描述",
              minWidth: 200
            },
            { prop: "problemDiscoveryTime", label: "問題發現時間", width: 160 }
          ]
        },
        {
          title: "問題處理詳情",
          icon: "el-icon-document",
          dataKey: "returnExchangeDetails",
          columns: [
            { prop: "processingId", label: "單號", width: 160 },
            { prop: "processingStatus", label: "處理狀態", width: 120 },
            { prop: "items", label: "品項/退款金額", width: 200 }
          ]
        }
      ],

      // 歷史記錄表格
      historyColumns: [
        { prop: "timestamp", label: "時間", width: 180, sortable: true },
        { prop: "orderNumber", label: "售後單號", width: 160 },
        { prop: "user", label: "操作人員", width: 120 },
        { prop: "operationType", label: "操作類型", width: 120 },
        { prop: "field", label: "變更欄位", width: 140 },
        { prop: "beforeValue", label: "變更前", minWidth: 200 },
        { prop: "afterValue", label: "變更後", minWidth: 200 }
      ]
    };
  },

  computed: {
    // 過濾後的案件數據
    filteredCaseData() {
      return this.caseData;
    },

    // 過濾後的歷史記錄數據
    filteredHistoryData() {
      return this.historyData;
    }
  },

  created() {
    this.fetchCaseData();
    this.fetchAllRemarks();
  },

  methods: {
    // 格式化方法
    formatDate(date) {
      if (!date) return "";
      return typeof date === "string" ? date : formatDate(date, "YYYY-MM-DD");
    },

    formatDateTime(date) {
      if (!date) return "";
      return typeof date === "string"
        ? date
        : formatDate(date, "YYYY-MM-DD HH:mm:ss");
    },

    // 格式化貨幣
    formatCurrency(value) {
      if (value === null || value === undefined) return "NT$ 0";
      return `NT$ ${Number(value).toLocaleString("zh-TW", {
        minimumFractionDigits: 0
      })}`;
    },

    // 截斷文字
    truncateText(text, maxLength) {
      if (!text) return "";
      return text.length > maxLength
        ? text.substring(0, maxLength) + "..."
        : text;
    },

    // 獲取各種標籤顏色
    getPriorityTagType(priority) {
      const priorityMap = {
        緊急: "danger",
        高: "warning",
        中: "primary",
        低: "info"
      };
      return priorityMap[priority] || "info";
    },

    getStatusTagType(status) {
      const statusInfo = this.statusOptions.find(
        option => option.value === status
      );
      return statusInfo ? statusInfo.type : "info";
    },

    getReturnStatusType(status) {
      const statusInfo = this.returnStatusOptions.find(
        option => option.value === status
      );
      return statusInfo ? statusInfo.type : "info";
    },

    getOperationTypeTag(type) {
      const typeMap = {
        create: "success",
        update: "primary",
        delete: "danger",
        status: "warning",
        remark: "info"
      };
      return typeMap[type] || "info";
    },

    getOperationTypeLabel(type) {
      const typeMap = {
        create: "新增",
        update: "更新",
        delete: "刪除",
        status: "狀態變更",
        remark: "備註"
      };
      return typeMap[type] || type;
    },

    // 獲取特定狀態的案件
    getStatusFilteredData(status) {
      return this.filteredCaseData.filter(
        caseItem => caseItem.status === status
      );
    },

    // 判斷是否能標記為完成
    canCompleteCase(status) {
      const completableStatuses = [
        "處理中",
        "已收到退貨",
        "退款處理中",
        "換貨/補寄處理中"
      ];
      return completableStatuses.includes(status);
    },

    // 備註相關方法
    getLatestRemark(orderNumber) {
      if (!this.allRemarks[orderNumber] || this.allRemarks[orderNumber].length === 0) {
        return null;
      }
      return this.allRemarks[orderNumber][0]; // 假設已按時間排序，第一個是最新的
    },

    getRemarkCount(orderNumber) {
      if (!this.allRemarks[orderNumber]) {
        return 0;
      }
      return this.allRemarks[orderNumber].length;
    },

    openRemarkTimeline(row) {
      this.currentCaseId = row.orderNumber;
      this.currentCaseInfo = {
        caseNumber: row.orderNumber,
        customerName: row.customerName,
        contactPhone: row.contactPhone,
        problemType: row.problemType
      };

      // 如果已經有備註數據，則直接顯示
      if (this.allRemarks[row.orderNumber]) {
        this.currentRemarks = [...this.allRemarks[row.orderNumber]];
      } else {
        this.currentRemarks = [];
      }

      this.remarkDialogVisible = true;

      // 如果沒有備註數據，則加載
      if (
        !this.allRemarks[row.orderNumber] ||
        this.allRemarks[row.orderNumber].length === 0
      ) {
        this.loadRemarks(row.orderNumber);
      }
    },

    // 資料獲取相關方法
    async fetchCaseData(params = null) {
      this.loading = true;
      try {
        const queryParams = params || this.getQueryParams();
        const response = await AfterSalesService.getCaseList(queryParams);
        this.caseData = response.data || [];

        // 若是初次加載或重置篩選，則更新 allCaseData
        if (!params || !Object.keys(params).length) {
          this.allCaseData = [...this.caseData];
          this.isFiltering = false;
        } else {
          this.isFiltering = true;
        }
      } catch (error) {
        this.$message.error("獲取售後案件數據失敗: " + error.message);
        this.caseData = []; // 確保出錯時也有空數組
      } finally {
        this.loading = false;
      }
    },

    async fetchAllRemarks() {
      try {
        const response = await AfterSalesService.getAllRemarkPreviews();
        this.allRemarks = response.data || {};
      } catch (error) {
        console.error("獲取備註預覽失敗:", error);
        this.$message.error("獲取備註預覽失敗: " + error.message);
      }
    },

    async loadRemarks(orderNumber) {
      this.loadingRemarks = true;
      try {
        const response = await AfterSalesService.getRemarks(orderNumber);
        this.currentRemarks = response.data || [];
        this.allRemarks[orderNumber] = [...this.currentRemarks];
        this.hasMoreRemarks = response.hasMore || false;
      } catch (error) {
        console.error("獲取備註失敗:", error);
        this.$message.error("獲取備註失敗: " + error.message);
      } finally {
        this.loadingRemarks = false;
      }
    },

    loadMoreRemarks() {
      if (!this.currentCaseId || this.loadingRemarks) return;

      this.loadingRemarks = true;
      AfterSalesService.getMoreRemarks(
        this.currentCaseId,
        this.currentRemarks.length
      )
        .then(response => {
          const newRemarks = response.data || [];
          this.currentRemarks = [...this.currentRemarks, ...newRemarks];
          this.hasMoreRemarks = response.hasMore || false;

          // 更新全局備註緩存
          this.allRemarks[this.currentCaseId] = [...this.currentRemarks];
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
      AfterSalesService.addRemark(remarkData)
        .then(response => {
          const newRemark = response.data;

          // 更新當前顯示的備註
          this.currentRemarks = [newRemark, ...this.currentRemarks];

          // 更新全局備註緩存
          if (!this.allRemarks[remarkData.orderNumber]) {
            this.allRemarks[remarkData.orderNumber] = [];
          }
          this.allRemarks[remarkData.orderNumber] = [
            newRemark,
            ...this.allRemarks[remarkData.orderNumber]
          ];

          this.$message.success("備註添加成功");
        })
        .catch(error => {
          console.error("添加備註失敗:", error);
          this.$message.error("添加備註失敗: " + error.message);
        });
    },

    updateRemark(remarkData) {
      AfterSalesService.updateRemark(remarkData)
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
          if (this.allRemarks[this.currentCaseId]) {
            const cacheIndex = this.allRemarks[this.currentCaseId].findIndex(
              r => r.id === updatedRemark.id
            );
            if (cacheIndex !== -1) {
              this.allRemarks[this.currentCaseId][cacheIndex] = updatedRemark;
              this.allRemarks[this.currentCaseId] = [
                ...this.allRemarks[this.currentCaseId]
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
      AfterSalesService.deleteRemark(remarkData.id)
        .then(() => {
          // 更新當前顯示的備註
          this.currentRemarks = this.currentRemarks.filter(
            r => r.id !== remarkData.id
          );

          // 更新全局備註緩存
          if (this.allRemarks[this.currentCaseId]) {
            this.allRemarks[this.currentCaseId] = this.allRemarks[
              this.currentCaseId
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

      if (this.caseDateRange && this.caseDateRange.length === 2) {
        params.startDate = this.formatDate(this.caseDateRange[0]);
        params.endDate = this.formatDate(this.caseDateRange[1]);
      }

      if (this.caseSearchQuery) {
        params.search = this.caseSearchQuery;
      }

      return params;
    },

    // 處理CombinedSearch組件的搜尋事件
    handleCombinedSearch(searchParams) {
      // 更新本地的搜尋條件
      this.caseSearchQuery = searchParams.keyword || "";
      this.caseDateRange = searchParams.dateRange || [];

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
      this.fetchCaseData(params);
    },

    resetFilters() {
      this.caseSearchQuery = "";
      this.caseDateRange = [];
      if (this.$refs.caseSearch) {
        this.$refs.caseSearch.clear();
      }
      this.caseData = [...this.allCaseData];
      this.isFiltering = false;
      this.lastSearchParams = null;

      // 通知用戶重置成功
      this.$message.success("已重置篩選條件");
    },

    // 歷史記錄相關方法
    async fetchCaseHistoryData(orderNumber = null, params = null) {
      this.loading = true;
      try {
        const queryParams = params || {};

        if (orderNumber) {
          queryParams.orderNumber = orderNumber;
          this.showBackButton = true;
          this.currentCaseId = orderNumber;
          this.lastViewedCase = this.caseData.find(
            item => item.orderNumber === orderNumber
          );
        } else {
          this.showBackButton = false;
          this.currentCaseId = null;

          if (this.historyDateRange && this.historyDateRange.length === 2) {
            queryParams.startDate = this.formatDate(this.historyDateRange[0]);
            queryParams.endDate = this.formatDate(this.historyDateRange[1]);
          }

          if (this.historySearchQuery) {
            queryParams.search = this.historySearchQuery;
          }
        }

        const response = await AfterSalesService.getCaseHistory(queryParams);
        this.historyData = response.data || [];

        // 若是初次加載或特定售後單的記錄，則更新 allHistoryData
        if (orderNumber || !Object.keys(params || {}).length) {
          this.allHistoryData = [...this.historyData];
          this.isHistoryFiltering = false;
        } else {
          this.isHistoryFiltering = true;
        }
      } catch (error) {
        this.$message.error("獲取案件歷史記錄失敗: " + error.message);
        this.historyData = []; // 確保出錯時也有空數組
      } finally {
        this.loading = false;
      }
    },

    // 處理歷史記錄搜尋
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
        params.startDate = this.formatDate(this.historyDateRange[0]);
        params.endDate = this.formatDate(this.historyDateRange[1]);
      }

      if (this.historySearchQuery) {
        params.search = this.historySearchQuery;
      }

      if (this.currentCaseId) {
        params.orderNumber = this.currentCaseId;
      }

      // 檢查是否和上次搜尋參數相同，避免重複請求
      const paramsStr = JSON.stringify(params);
      if (this.lastHistorySearchParams === paramsStr) {
        return;
      }

      this.lastHistorySearchParams = paramsStr;
      this.fetchCaseHistoryData(null, params);
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
      this.$message.success("已重置歷史記錄篩選條件");
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
    refreshTable() {
      this.fetchCaseData();
      this.$refs.mainTable.refreshTable();
      this.$message.success("數據已刷新");
    },

    handleSelectionChange(rows) {
      this.selectedRows = rows;
      this.showBatchActions = rows.length > 0;
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

    handleSubTableChange(index, config) {
      // 子表格切換處理
      this.activeSubTableIndex = index;
      console.log("子表格切換:", index, config);
    },

    // 編輯與創建
    handleCreateCase() {
      this.isEditMode = false;
      this.currentEditCase = {
        orderNumber: "", // 新建時由後端生成
        originalOrderId: "",
        customerName: "",
        contactPhone: "",
        orderTotal: 0,
        applyDate: new Date(),
        priority: "中", // 默認中優先級
        problemType: "",
        processingMethod: "",
        status: "待處理", // 默認待處理
        processor: this.$store.state.user
          ? this.$store.state.user.username
          : "",
        lastUpdateTime: new Date(),
        expectedCompletionDate: "",
        processingRemarks: "",
        problemSummary: "",
        problemDetails: [],
        returnExchangeDetails: []
      };
      this.caseDialogVisible = true;
    },

    handleEdit(row) {
      this.isEditMode = true;
      this.currentEditCase = JSON.parse(JSON.stringify(row));
      this.caseDialogVisible = true;
    },

    async handleSaveCase(caseData) {
      try {
        this.loading = true;
        let response;

        if (this.isEditMode) {
          response = await AfterSalesService.updateCase(caseData);
          this.$message.success(response.message || "售後案件更新成功");
        } else {
          response = await AfterSalesService.createCase(caseData);
          this.$message.success(response.message || "售後案件創建成功");
        }

        this.caseDialogVisible = false;
        this.fetchCaseData();
      } catch (error) {
        this.$message.error("保存失敗: " + error.message);
      } finally {
        this.loading = false;
      }
    },

    // 子表格編輯
    handleEditSubRow(row, parentRow, subTableIndex) {
      if (subTableIndex === 0) {
        // 問題反應詳情
        this.currentCaseId = parentRow.orderNumber;
        this.currentEditProblemDetail = JSON.parse(JSON.stringify(row));
        this.problemDetailsDialogVisible = true;
      } else if (subTableIndex === 1) {
        // 退貨/換貨/退款處理
        this.currentCaseId = parentRow.orderNumber;
        this.currentEditReturnExchange = JSON.parse(JSON.stringify(row));
        this.returnExchangeDialogVisible = true;
      }
    },

    async handleSaveProblemDetail(detailData) {
      try {
        this.loading = true;
        const response = await AfterSalesService.updateProblemDetail(
          detailData
        );
        this.$message.success(response.message || "問題詳情更新成功");
        this.problemDetailsDialogVisible = false;
        this.fetchCaseData();
      } catch (error) {
        this.$message.error("保存問題詳情失敗: " + error.message);
      } finally {
        this.loading = false;
      }
    },

    async handleSaveReturnExchange(returnData) {
      try {
        this.loading = true;
        const response = await AfterSalesService.updateReturnExchange(
          returnData
        );
        this.$message.success(response.message || "退換貨處理更新成功");
        this.returnExchangeDialogVisible = false;
        this.fetchCaseData();
      } catch (error) {
        this.$message.error("保存退換貨處理失敗: " + error.message);
      } finally {
        this.loading = false;
      }
    },

    // 其他功能
    viewCaseHistory(row) {
      this.activeTab = "case-history";
      this.fetchCaseHistoryData(row.orderNumber);
    },

    backToCaseList() {
      this.activeTab = "case-list";
      this.statusTab = "all";
      this.historyDateRange = [];
      this.historySearchQuery = "";
      this.showBackButton = false;

      this.$nextTick(() => {
        if (this.lastViewedCase) {
          const table = this.$refs.mainTable.$refs.table;
          if (table) {
            const rows = table.$el.querySelectorAll(".el-table__row");
            for (let i = 0; i < rows.length; i++) {
              const cells = rows[i].getElementsByTagName("td");
              if (
                cells.length > 0 &&
                cells[0].textContent === this.lastViewedCase.orderNumber
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

    viewOrderDetails(orderId) {
      this.currentOrderId = orderId;
      this.orderDialogVisible = true;
    },

    // 查看文件方法
    viewFiles(files) {
      // 準備文件數據（確保包含必要屬性）
      this.previewFiles = files.map(file => ({
        name: file.name || "unknown.file",
        url: file.url,
        type: file.type || this.inferFileType(file.url),
        size: file.size,
        uploadTime: file.uploadTime,
        uploader: file.uploader,
        description: file.description
      }));

      // 打開預覽對話框
      this.filePreviewVisible = true;
    },

    // 輔助方法：根據URL推斷文件類型
    inferFileType(url) {
      if (!url) return "";

      const ext = url
        .split(".")
        .pop()
        .toLowerCase();
      const typeMap = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        pdf: "application/pdf",
        mp4: "video/mp4",
        mp3: "audio/mpeg"
        // 可以添加更多擴展名映射
      };

      return typeMap[ext] || "";
    },

    // 檢查是否有證據檔案
    hasEvidenceFiles(row) {
      if (!row.problemDetails || row.problemDetails.length === 0) {
        return false;
      }

      return row.problemDetails.some(
        detail => detail.evidenceFiles && detail.evidenceFiles.length > 0
      );
    },

    // 批量操作
    batchUpdateStatus() {
      if (this.selectedRows.length === 0) {
        this.$message.warning("請先選擇售後案件");
        return;
      }

      this.$prompt("請選擇要更新的狀態", "批量更新狀態", {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        inputType: "select",
        inputPlaceholder: "請選擇狀態",
        inputValue: "",
        inputOptions: this.statusOptions.map(option => ({
          value: option.value,
          label: option.label
        }))
      })
        .then(({ value }) => {
          if (!value) {
            this.$message.warning("請選擇有效的狀態");
            return;
          }

          const caseIds = this.selectedRows.map(row => row.orderNumber);
          AfterSalesService.batchUpdateStatus({
            caseIds,
            status: value
          })
            .then(response => {
              this.$message.success(response.message || "批量更新狀態成功");
              this.fetchCaseData();
            })
            .catch(error => {
              this.$message.error("批量更新狀態失敗: " + error.message);
            });
        })
        .catch(() => {
          // 用戶取消操作
        });
    },

    batchAssignStaff() {
      if (this.selectedRows.length === 0) {
        this.$message.warning("請先選擇售後案件");
        return;
      }

      this.$prompt("請輸入處理人員", "批量分配處理人員", {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        inputPlaceholder: "請輸入處理人員名稱"
      })
        .then(({ value }) => {
          if (!value) {
            this.$message.warning("處理人員不能為空");
            return;
          }

          const caseIds = this.selectedRows.map(row => row.orderNumber);
          AfterSalesService.batchAssignStaff({
            caseIds,
            processor: value
          })
            .then(response => {
              this.$message.success(response.message || "批量分配處理人員成功");
              this.fetchCaseData();
            })
            .catch(error => {
              this.$message.error("批量分配處理人員失敗: " + error.message);
            });
        })
        .catch(() => {
          // 用戶取消操作
        });
    },

    // 處理更多操作下拉選單
    handleMoreActions(command, row) {
      switch (command) {
        // 子表格操作 - 問題反應詳情
        case "editProblemDetails":
          this.editProblemDetails(row);
          break;
        case "viewFiles":
          // 獲取問題詳情中的文件並查看
          const problemDetails = this.getProblemDetails(row.orderNumber);
          if (problemDetails && problemDetails.evidenceFiles) {
            this.viewFiles(problemDetails.evidenceFiles);
          }
          break;

        // 子表格操作 - 退換貨處理明細
        case "editReturnDetails":
          this.editReturnDetails(row);
          break;

        // 取消案件
        case "cancel":
          this.confirmCancelCase(row);
          break;
      }
    },

    // 編輯問題詳情
    editProblemDetails(row) {
      // 假設第一個問題詳情，實際上可能需要選擇
      if (row.problemDetails && row.problemDetails.length > 0) {
        this.currentCaseId = row.orderNumber;
        this.currentEditProblemDetail = JSON.parse(
          JSON.stringify(row.problemDetails[0])
        );
        this.problemDetailsDialogVisible = true;
      } else {
        this.$message.warning("該案件沒有問題反應詳情");
      }
    },

    // 獲取問題詳情(用於顯示檔案)
    getProblemDetails(orderNumber) {
      const caseItem = this.caseData.find(item => item.orderNumber === orderNumber);
      if (
        caseItem &&
        caseItem.problemDetails &&
        caseItem.problemDetails.length > 0
      ) {
        // 合併所有問題詳情的檔案
        const allFiles = [];
        caseItem.problemDetails.forEach(detail => {
          if (detail.evidenceFiles && detail.evidenceFiles.length > 0) {
            allFiles.push(...detail.evidenceFiles);
          }
        });
        return { evidenceFiles: allFiles };
      }
      return null;
    },

    // 編輯退換貨明細
    editReturnDetails(row) {
      if (row.returnExchangeDetails && row.returnExchangeDetails.length > 0) {
        this.currentCaseId = row.orderNumber;
        this.currentEditReturnExchange = JSON.parse(
          JSON.stringify(row.returnExchangeDetails[0])
        );
        this.returnExchangeDialogVisible = true;
      } else {
        this.$message.warning("該案件沒有退換貨處理明細");
      }
    },

    // 確認取消案件
    confirmCancelCase(row) {
      this.$confirm("確定要取消此售後案件嗎? 此操作不可恢復!", "操作確認", {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.cancelCase(row);
        })
        .catch(() => {
          // 用戶取消操作
        });
    },

    printCase(row) {
      // 打印功能
      this.$message.info("準備打印售後案件: " + row.orderNumber);
      // 在實際應用中，這裡可能會調用打印API或打開打印預覽窗口
    },

    completeCase(row) {
      this.$confirm("確定要將此售後案件標記為完成嗎?", "操作確認", {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          AfterSalesService.updateCaseStatus({
            orderNumber: row.orderNumber,
            status: "已完成"
          })
            .then(response => {
              this.$message.success(response.message || "案件已標記為完成");
              this.fetchCaseData();
            })
            .catch(error => {
              this.$message.error("操作失敗: " + error.message);
            });
        })
        .catch(() => {
          // 用戶取消操作
        });
    },

    cancelCase(row) {
      AfterSalesService.updateCaseStatus({
        orderNumber: row.orderNumber,
        status: "已取消"
      })
        .then(response => {
          this.$message.success(response.message || "案件已取消");
          this.fetchCaseData();
        })
        .catch(error => {
          this.$message.error("操作失敗: " + error.message);
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

.after-sales-service-center {
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

    .service-tabs {
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

  .small-text-button {
    font-size: 14px !important;
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

  // 工具欄自定義
  .table-action-group {
    margin-right: 16px;
  }

  .batch-actions {
    display: inline-flex;
    gap: 12px;
    padding-left: 12px;
    border-left: 1px solid #ebeef5;
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

  // 問題描述彈出內容
  .problem-popover-content {
    max-height: 300px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: $font-size-base;
    line-height: 1.5;
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

    .el-table__expanded-cell {
      padding: 10px 40px;
    }
  }

  // 自定義列樣式
  ::v-deep .priority-column {
    .el-tag--danger {
      background-color: rgba($danger-color, 0.1);
      border-color: rgba($danger-color, 0.2);
      color: $danger-color;
    }

    .el-tag--warning {
      background-color: rgba($warning-color, 0.1);
      border-color: rgba($warning-color, 0.2);
      color: $warning-color;
    }

    .el-tag--primary {
      background-color: rgba($primary-color, 0.1);
      border-color: rgba($primary-color, 0.2);
      color: $primary-color;
    }

    .el-tag--info {
      background-color: rgba(144, 147, 153, 0.1);
      border-color: rgba(144, 147, 153, 0.2);
      color: #909399;
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
  .after-sales-service-center {
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

    .batch-actions {
      margin-top: 10px;
      padding-left: 0;
      border-left: none;
      width: 100%;
      justify-content: space-between;
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
