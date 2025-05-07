// client/src/constants/tableColumns.js
import { formatDate } from "@/utils/date";

// 基礎欄位定義
export const baseColumns = {
  // 通用欄位
  commonFields: {
    createdBy: { prop: "createdBy", label: "建立人員", width: 120 },
    createdAt: {
      prop: "createdAt",
      label: "建立時間",
      width: 160,
      formatter: row => formatDate(row.createdAt, "YYYY-MM-DD HH:mm:ss")
    },
    updatedBy: { prop: "updatedBy", label: "修改人員", width: 120 },
    updatedAt: {
      prop: "updatedAt",
      label: "修改時間",
      width: 160,
      formatter: row => formatDate(row.updatedAt, "YYYY-MM-DD HH:mm:ss")
    },
    remark: { prop: "remark", label: "備註" }
  },

  // 異動記錄通用欄位
  historyFields: {
    datetime: {
      prop: "datetime",
      label: "異動時間",
      width: 180,
      sortable: true
    },
    type: { prop: "type", label: "異動類型", width: 120 },
    operator: { prop: "operator", label: "操作人員", width: 120 },
    beforeValue: { prop: "beforeValue", label: "異動前值", width: 150 },
    afterValue: { prop: "afterValue", label: "異動後值", width: 150 }
  }
};

// 倉管品號相關欄位定義
export const productsColumns = {
  // 品號主表欄位
  list: [
    { prop: "productCode", label: "品號", width: 120, sortable: true },
    { prop: "productName", label: "品名", sortable: true },
    { prop: "specification", label: "規格", width: 120 },
    { prop: "categorys", label: "類別", width: "120" },
    { prop: "unit", label: "單位", width: 80 },
    { prop: "boxSize", label: "裝箱容量", width: 120 },
    {
      prop: "status",
      label: "狀態",
      width: 100,
      formatter: row => (row.status ? "啟用" : "停用")
    },
    baseColumns.commonFields.createdBy,
    baseColumns.commonFields.createdAt,
    baseColumns.commonFields.updatedBy,
    baseColumns.commonFields.updatedAt,
    baseColumns.commonFields.remark
  ],

  // 品號異動記錄欄位
  history: [
    baseColumns.historyFields.datetime,
    baseColumns.historyFields.type,
    { prop: "changes", label: "變更內容", minWidth: 300 },
    baseColumns.historyFields.operator,
    { prop: "reason", label: "變更原因", width: 150 }
  ]
};

// 庫存相關欄位定義
export const inventoryColumns = {
  // 庫存主表欄位
  list: [
    { prop: "productCode", label: "品號", width: 120, sortable: true },
    { prop: "productName", label: "品名", sortable: true },
    { prop: "category", label: "類別", width: 80, sortable: true },
    { prop: "batchNumber", label: "批號", width: 120, sortable: true },
    { prop: "state", label: "狀態", width: 80, sortable: true },
    { prop: "quantity", label: "現有數量", width: 120, sortable: true },
    { prop: "boxCount", label: "箱數", width: 80, sortable: true },
    { prop: "safetyStock", label: "安全存量", width: 100, sortable: true },
    { prop: "expiryDate", label: "效期", width: 120, sortable: true },
    baseColumns.commonFields.createdBy,
    baseColumns.commonFields.createdAt,
    baseColumns.commonFields.updatedBy,
    baseColumns.commonFields.updatedAt
  ],

  // 庫存異動記錄欄位
  history: [
    { prop: "number", label: "異動單號", width: 150, sortable: true },
    baseColumns.historyFields.datetime,
    baseColumns.historyFields.type,
    { prop: "productCode", label: "品號", width: 120 },
    { prop: "batchNumber", label: "批號", width: 120 },
    { prop: "quantity", label: "異動數量", width: 100 },
    { prop: "boxCount", label: "異動箱數", width: 100 },
    { prop: "beforeQty", label: "異動前數量", width: 100 },
    { prop: "afterQty", label: "異動後數量", width: 100 },
    baseColumns.historyFields.operator,
    baseColumns.commonFields.remark
  ],

  // 庫存欄位異動記錄
  fieldHistory: [
    baseColumns.historyFields.datetime,
    baseColumns.historyFields.type,
    { prop: "productCode", label: "品號", width: 120 },
    { prop: "batchNumber", label: "批號", width: 120 },
    { prop: "field", label: "異動欄位", width: 120 },
    baseColumns.historyFields.beforeValue,
    baseColumns.historyFields.afterValue,
    baseColumns.historyFields.operator,
    baseColumns.commonFields.remark
  ]
};

export const inventorysColumns = {
  // 庫存主表欄位 (產品資料表)
  product: [
    { prop: "productCode", label: "品號", width: 120, sortable: true },
    { prop: "productName", label: "品名", sortable: true },
    { prop: "productcategory", label: "行銷類別", width: 80, sortable: true },
    { prop: "category", label: "品號類別", width: 80, sortable: true },
    { prop: "totalStock", label: "總庫存", width: 100, sortable: true },
    { prop: "safetyStock", label: "安全存量", width: 100, sortable: true },
    { prop: "reorderPoint", label: "再轉倉點", width: 100, sortable: true },
    { prop: "batchCount", label: "批號數量", width: 100, sortable: true },
    { prop: "stockStatus", label: "庫存狀態", width: 100, sortable: true },
    {
      prop: "lastTransferDate",
      label: "最近轉倉日期",
      width: 120,
      sortable: true
    },
    baseColumns.commonFields.createdBy,
    baseColumns.commonFields.createdAt,
    baseColumns.commonFields.updatedBy,
    baseColumns.commonFields.updatedAt
  ],

  // 庫存批號表欄位 (批號詳細資料)
  batch: [
    { prop: "productCode", label: "品號", width: 120, sortable: true },
    { prop: "batchNumber", label: "批號", width: 120, sortable: true },
    { prop: "warehouse", label: "倉別", width: 80, sortable: true },
    { prop: "location", label: "儲位編號", width: 100, sortable: true },
    { prop: "state", label: "狀態", width: 80, sortable: true },
    { prop: "quantity", label: "總數量", width: 120, sortable: true },
    { prop: "activeStock", label: "活動庫存", width: 120, sortable: true },
    { prop: "stock", label: "常態庫存", width: 120, sortable: true },
    { prop: "boxCount", label: "箱數", width: 80, sortable: true },
    { prop: "expiryDate", label: "效期", width: 120, sortable: true },
    { prop: "daysToExpiry", label: "剩餘天數", width: 100, sortable: true },
    baseColumns.commonFields.createdBy,
    baseColumns.commonFields.createdAt,
    baseColumns.commonFields.updatedBy,
    baseColumns.commonFields.updatedAt
  ],

  // 庫存異動記錄欄位
  history: [
    { prop: "number", label: "異動單號", width: 150, sortable: true },
    { prop: "relatedDocument", label: "關聯單據", width: 150, sortable: true },
    baseColumns.historyFields.datetime,
    baseColumns.historyFields.type,
    { prop: "warehouse", label: "倉別", width: 80 },
    { prop: "productCode", label: "品號", width: 120 },
    { prop: "batchNumber", label: "批號", width: 120 },
    { prop: "quantity", label: "異動數量", width: 100 },
    { prop: "boxCount", label: "異動箱數", width: 100 },
    { prop: "beforeQty", label: "異動前數量", width: 100 },
    { prop: "afterQty", label: "異動後數量", width: 100 },
    baseColumns.historyFields.operator,
    baseColumns.commonFields.remark
  ],

  // 庫存欄位異動記錄
  fieldHistory: [
    baseColumns.historyFields.datetime,
    baseColumns.historyFields.type,
    { prop: "productCode", label: "品號", width: 120 },
    { prop: "batchNumber", label: "批號", width: 120 },
    { prop: "warehouse", label: "倉別", width: 80 },
    { prop: "field", label: "異動欄位", width: 120 },
    baseColumns.historyFields.beforeValue,
    baseColumns.historyFields.afterValue,
    baseColumns.historyFields.operator,
    baseColumns.commonFields.remark
  ]
};

// 行銷品號相關欄位定義
export const productColumns = {
  // 品號主表欄位
  list: [
    { prop: "productCode", label: "品號", width: 120, sortable: true },
    { prop: "productName", label: "品名", sortable: true },
    { prop: "category", label: "類別", width: 120, sortable: true },
    { prop: "originalPrice", label: "原價", width: 150, sortable: true },
    { prop: "specification", label: "規格", width: 120 },
    { prop: "unit", label: "單位", width: 80 },
    { prop: "boxSize", label: "裝箱容量", width: 120 },
    {
      prop: "status",
      label: "狀態",
      width: 100,
      formatter: row => (row.status ? "啟用" : "停用")
    },
    baseColumns.commonFields.createdBy,
    baseColumns.commonFields.createdAt,
    baseColumns.commonFields.updatedBy,
    baseColumns.commonFields.updatedAt,
    baseColumns.commonFields.remark
  ],

  // 品號異動記錄欄位
  history: [
    baseColumns.historyFields.datetime,
    baseColumns.historyFields.type,
    { prop: "productCode", label: "品號", width: 150 },
    { prop: "field", label: "異動欄位", width: 150 },
    baseColumns.historyFields.beforeValue,
    baseColumns.historyFields.afterValue,
    baseColumns.historyFields.operator,
    baseColumns.commonFields.remark
  ]
};

// 銷貨管理相關欄位定義
export const salesColumns = {
  // 銷貨單主表欄位
  list: [
    { prop: "orderNumber", label: "單號", sortable: true, width: 120 },
    { prop: "shipmentDate", label: "出貨日期", sortable: true, width: 120 },
    { prop: "customerName", label: "客戶名稱", sortable: true, width: 150 },
    { prop: "paymentMethod", label: "付款方式", sortable: true, width: 120 },
    { prop: "contactPerson", label: "聯絡人", width: 100 },
    { prop: "contactPhone", label: "聯絡電話", width: 120 },
    { prop: "shippingAddress", label: "出貨地址", sortable: true },
    { prop: "totalAmount", label: "總金額", sortable: true, width: 120 },
    { prop: "status", label: "狀態", sortable: true, width: 100 },
    baseColumns.commonFields.remark
  ],

  salesDetail: [
    { prop: "productCode", label: "品號", width: 120, sortable: true },
    { prop: "productName", label: "品名", sortable: true },
    { prop: "specification", label: "規格", width: 120 },
    { prop: "unit", label: "單位", width: 80 },
    { prop: "quantity", label: "數量", width: 100 },
    { prop: "amount", label: "金額", width: 120 },
    { prop: "box", label: "裝箱入數", width: 120 },
    { prop: "batchNumber", label: "出貨批號", width: 120 },
    { prop: "warehouseCode", label: "庫別", width: 120 },
    { prop: "warehouseName", label: "庫別名稱", width: 120 },
    { prop: "storageLocation", label: "儲位", width: 120 },
    baseColumns.commonFields.remark
  ],

  // 銷貨單異動記錄欄位
  history: [
    baseColumns.historyFields.datetime,
    baseColumns.historyFields.type,
    { prop: "orderNumber", label: "單號", width: 120 },
    { prop: "fieldName", label: "異動欄位", width: 150 },
    baseColumns.historyFields.beforeValue,
    baseColumns.historyFields.afterValue,
    baseColumns.historyFields.operator,
    baseColumns.commonFields.remark
  ]
};

export const preorderColumns = {
  // 銷貨單主表欄位
  list: [
    { prop: "orderNumber", label: "單號", sortable: true, width: 120 },
    { prop: "shipmentDate", label: "出貨日期", sortable: true, width: 120 },
    { prop: "customerName", label: "客戶名稱", sortable: true, width: 150 },
    { prop: "paymentMethod", label: "付款方式", sortable: true, width: 120 },
    { prop: "contactPerson", label: "聯絡人", width: 100 },
    { prop: "contactPhone", label: "聯絡電話", width: 120 },
    { prop: "shippingAddress", label: "出貨地址", sortable: true },
    { prop: "totalAmount", label: "總金額", sortable: true, width: 120 },
    { prop: "status", label: "狀態", sortable: true, width: 100 },
    baseColumns.commonFields.remark
  ],

  preorderDetail: [
    { prop: "productCode", label: "品號", width: 120, sortable: true },
    { prop: "productName", label: "品名", sortable: true },
    { prop: "specification", label: "規格", width: 120 },
    { prop: "unit", label: "單位", width: 80 },
    { prop: "quantity", label: "數量", width: 100 },
    { prop: "amount", label: "金額", width: 120 },
    { prop: "box", label: "裝箱入數", width: 120 },
    { prop: "batchNumber", label: "出貨批號", width: 120 },
    { prop: "warehouseCode", label: "庫別", width: 120 },
    { prop: "warehouseName", label: "庫別名稱", width: 120 },
    { prop: "storageLocation", label: "儲位", width: 120 },
    baseColumns.commonFields.remark
  ],

  // 銷貨單異動記錄欄位
  history: [
    baseColumns.historyFields.datetime,
    baseColumns.historyFields.type,
    { prop: "orderNumber", label: "單號", width: 120 },
    { prop: "fieldName", label: "異動欄位", width: 150 },
    baseColumns.historyFields.beforeValue,
    baseColumns.historyFields.afterValue,
    baseColumns.historyFields.operator,
    baseColumns.commonFields.remark
  ]
};

// 搜尋欄位定義
export const searchFields = {
  // 品號搜尋欄位
  product: [
    { label: "品號", prop: "productCode" },
    { label: "品名", prop: "productName" },
    { label: "類別", prop: "category" },
    { label: "規格", prop: "specification" }
  ],

  // 品號異動記錄搜尋欄位
  productHistory: [
    { label: "品號", prop: "productCode" },
    { label: "品名", prop: "productName" },
    { label: "操作人員", prop: "operator" }
  ],

  // 庫存搜尋欄位
  inventory: [
    { label: "品號", prop: "productCode" },
    { label: "批號", prop: "batchNumber" },
    { label: "類別", prop: "category" }
  ],

  // 庫存異動記錄搜尋欄位
  inventoryHistory: [
    { label: "品號", prop: "productCode" },
    { label: "異動單號", prop: "number" },
    { label: "批號", prop: "batchNumber" },
    { label: "操作人員", prop: "operator" }
  ],

  // 庫存欄位異動記錄搜尋欄位
  inventoryFieldHistory: [
    { label: "品號", prop: "productCode" },
    { label: "批號", prop: "batchNumber" },
    { label: "操作人員", prop: "operator" },
    { label: "異動欄位", prop: "field" }
  ],

  salesSearch: [
    { label: "單號", value: "orderNumber" },
    { label: "客戶名稱", value: "customerName" },
    { label: "聯絡人", value: "contactPerson" },
    { label: "產品", value: "productName" }
  ],

  salesHistorySearch: [
    { label: "單號", value: "orderNumber" },
    { label: "欄位", value: "fieldName" },
    { label: "操作人", value: "operator" }
  ]
};

export const statusOptions = {
  salesStatusOptions: [
    { value: "pending", label: "未處理", type: "warning" },
    { value: "completed", label: "已處理", type: "success" },
    { value: "cancelled", label: "已取消", type: "danger" }
  ],

  preorderStatusOptions: [
    { value: "pending", label: "未處理", type: "warning" },
    { value: "completed", label: "已處理", type: "success" },
    { value: "cancelled", label: "已取消", type: "danger" }
  ]
};
