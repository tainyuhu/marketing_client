// client\src\api\shop.js
// 倉庫管理系統 API 請求層

import request from "@/utils/request";

// 通用歷史紀錄 API
export const historyApi = {
  // 查詢最近異動（各模型個別）
  getItemRecentHistory: (days = 7) =>
    request({
      url: "/wms/recent_history/",
      method: "get",
      params: { days, model: "Item" }
    }),

  getProductRecentHistory: (days = 7) =>
    request({
      url: "/wms/recent_history/",
      method: "get",
      params: { days, model: "Product" }
    }),

  getBatchRecentHistory: (days = 7) =>
    request({
      url: "/wms/recent_history/",
      method: "get",
      params: { days, model: "Batch" }
    }),

  getActivityRecentHistory: (days = 7) =>
    request({
      url: "/wms/recent_history/",
      method: "get",
      params: { days, model: "Activity" }
    }),

  getOrderRecentHistory: (days = 7) =>
    request({
      url: "/wms/recent_history/",
      method: "get",
      params: { days, model: "Order" }
    }),

  getOrderItemRecentHistory: (days = 7) =>
    request({
      url: "/wms/recent_history/",
      method: "get",
      params: { days, model: "OrderItem" }
    }),

  getBannerRecentHistory: (days = 7) =>
    request({
      url: "/wms/recent_history/",
      method: "get",
      params: { days, model: "Banner" }
    }),

  getPromotionRuleRecentHistory: (days = 7) =>
    request({
      url: "/wms/recent_history/",
      method: "get",
      params: { days, model: "PromotionRule" }
    }),

  getUserActivityLogRecentHistory: (days = 7) =>
    request({
      url: "/wms/recent_history/",
      method: "get",
      params: { days, model: "UserActivityLog" }
    }),

  getMaterialCategoryRecentHistory: (days = 7) =>
    request({
      url: "/wms/recent_history/",
      method: "get",
      params: { days, model: "MaterialCategory" }
    }),

  getCategoryRecentHistory: (days = 7) =>
    request({
      url: "/wms/recent_history/",
      method: "get",
      params: { days, model: "Category" }
    })
};

// 物料類別相關 API
export const materialCategoryApi = {
  // 獲取所有物料類別
  getMaterialCategories: params =>
    request({
      url: "/wms/material-category/",
      method: "get",
      params
    }),

  // 獲取特定物料類別
  getMaterialCategory: id =>
    request({
      url: `/wms/material-category/${id}/`,
      method: "get"
    }),

  // 獲取樹狀結構的物料類別
  getMaterialCategoryTree: () =>
    request({
      url: "/wms/material-category/tree/",
      method: "get"
    }),

  // 獲取特定物料類別下的品號
  getMaterialCategoryItems: (categoryId, params) =>
    request({
      url: `/wms/material-category/${categoryId}/items/`,
      method: "get",
      params
    }),

  // 創建物料類別
  createMaterialCategory: data =>
    request({
      url: "/wms/material-category/",
      method: "post",
      data
    }),

  // 更新物料類別
  updateMaterialCategory: (id, data) =>
    request({
      url: `/wms/material-category/${id}/`,
      method: "put",
      data
    }),

  // 刪除物料類別
  deleteMaterialCategory: id =>
    request({
      url: `/wms/material-category/${id}/`,
      method: "delete"
    }),

  // 獲取物料類別分布統計
  getMaterialCategoryDistribution: () =>
    request({
      url: "/wms/material-category/distribution/",
      method: "get"
    }),

  // 獲取物料類別歷史記錄
  getMaterialCategoryHistory: (categoryId, params) =>
    request({
      url: `/wms/material-category/${categoryId}/history/`,
      method: "get",
      params
    })
};

// 類別相關 API
export const categoryApi = {
  // 獲取所有類別
  getCategories: params =>
    request({
      url: "/wms/category/",
      method: "get",
      params
    }),

  // 獲取特定類別
  getCategory: id =>
    request({
      url: `/wms/category/${id}/`,
      method: "get"
    }),

  // 獲取樹狀結構的類別
  getCategoryTree: () =>
    request({
      url: "/wms/category/tree/",
      method: "get"
    }),

  // 獲取特定類別下的產品
  getCategoryProducts: (categoryId, params) =>
    request({
      url: `/wms/category/${categoryId}/products/`,
      method: "get",
      params
    }),

  // 創建類別
  createCategory: data =>
    request({
      url: "/wms/category/",
      method: "post",
      data
    }),

  // 更新類別
  updateCategory: (id, data) =>
    request({
      url: `/wms/category/${id}/`,
      method: "put",
      data
    }),

  // 刪除類別
  deleteCategory: id =>
    request({
      url: `/wms/category/${id}/`,
      method: "delete"
    }),

  // 獲取類別歷史記錄
  getCategoryHistory: (categoryId, params) =>
    request({
      url: `/wms/category/${categoryId}/history/`,
      method: "get",
      params
    })
};

// 品號相關 API
export const itemApi = {
  // 獲取所有品號
  getItems: params =>
    request({
      url: "/wms/item/",
      method: "get",
      params
    }),

  // 獲取特定品號
  getItem: id =>
    request({
      url: `/wms/item/${id}/`,
      method: "get"
    }),

  // 創建品號
  createItem: data =>
    request({
      url: "/wms/item/",
      method: "post",
      data
    }),

  // 更新品號
  updateItem: (id, data) =>
    request({
      url: `/wms/item/${id}/`,
      method: "put",
      data
    }),

  // 刪除品號
  deleteItem: id =>
    request({
      url: `/wms/item/${id}/`,
      method: "delete"
    }),

  // 獲取品號的批號列表
  getItemBatches: (itemId, params) =>
    request({
      url: `/wms/item/${itemId}/batches/`,
      method: "get",
      params
    }),

  // 獲取使用此品號的產品列表
  getItemUsedInProducts: (itemId, params) =>
    request({
      url: `/wms/item/${itemId}/used_in_products/`,
      method: "get",
      params
    }),

  // 獲取物料類別分布統計
  getMaterialCategoryDistribution: () =>
    request({
      url: "/wms/item/material_category_distribution/",
      method: "get"
    }),

  // 獲取品號歷史記錄
  getItemHistory: (itemId, params) =>
    request({
      url: `/wms/item/${itemId}/history/`,
      method: "get",
      params
    })
};

// 產品相關 API
export const productApi = {
  // 獲取產品列表
  getProducts: params =>
    request({
      url: "/wms/product/",
      method: "get",
      params
    }),

  // 獲取包含促銷價格的商品清單（混合活動與常態商品）
  getProductsWithPricing: params =>
    request({
      url: "/wms/products/with-pricing/",
      method: "get",
      params
    }),

  // 獲取特定產品
  getProduct: id =>
    request({
      url: `/wms/product/${id}/`,
      method: "get"
    }),

  // 創建產品
  createProduct: data =>
    request({
      url: "/wms/product/",
      method: "post",
      data
    }),

  // 更新產品
  updateProduct: (id, data) =>
    request({
      url: `/wms/product/${id}/`,
      method: "put",
      data
    }),

  // 部分更新產品
  patchProduct: (id, data) =>
    request({
      url: `/wms/product/${id}/`,
      method: "patch",
      data
    }),

  // 刪除產品
  deleteProduct: id =>
    request({
      url: `/wms/product/${id}/`,
      method: "delete"
    }),

  // 獲取產品的組成品項列表
  getProductComponents: productId =>
    request({
      url: `/wms/product/${productId}/components/`,
      method: "get"
    }),

  // 添加品項到產品
  addComponentToProduct: (productId, data) =>
    request({
      url: `/wms/product/${productId}/add_component/`,
      method: "post",
      data
    }),

  // 從產品中移除品項
  removeComponentFromProduct: (productId, data) =>
    request({
      url: `/wms/product/${productId}/remove_component/`,
      method: "delete",
      data
    }),

  // 獲取產品歷史記錄
  getProductHistory: (productId, params) =>
    request({
      url: `/wms/product/${productId}/history/`,
      method: "get",
      params
    }),

  // 上傳產品圖片
  uploadProductImage: (productId, data) =>
    request({
      url: `/wms/product/${productId}/upload_image/`,
      method: "post",
      data
    }),

  // 刪除產品圖片
  deleteProductImage: (productId, imageId) =>
    request({
      url: `/wms/product/${productId}/delete_image/`,
      method: "delete",
      data: { image_id: imageId }
    }),

  // 獲取類別分布統計
  getCategoryDistribution: () =>
    request({
      url: "/wms/product/category_distribution/",
      method: "get"
    })
};

// 批號相關 API
export const batchApi = {
  // 獲取批號列表
  getBatches: params =>
    request({
      url: "/wms/batch/",
      method: "get",
      params
    }),

  // 獲取特定批號
  getBatch: id =>
    request({
      url: `/wms/batch/${id}/`,
      method: "get"
    }),

  // 創建批號
  createBatch: data =>
    request({
      url: "/wms/batch/",
      method: "post",
      data
    }),

  // 更新批號
  updateBatch: (id, data) =>
    request({
      url: `/wms/batch/${id}/`,
      method: "put",
      data
    }),

  // 部分更新批號
  patchBatch: (id, data) =>
    request({
      url: `/wms/batch/${id}/`,
      method: "patch",
      data
    }),

  // 刪除批號
  deleteBatch: id =>
    request({
      url: `/wms/batch/${id}/`,
      method: "delete"
    }),

  // 獲取批號歷史記錄
  getBatchHistory: batchId =>
    request({
      url: `/wms/batch/${batchId}/history/`,
      method: "get"
    }),

  // 獲取即將過期的批號
  getExpiringSoon: days =>
    request({
      url: "/wms/batch/expiring_soon/",
      method: "get",
      params: { days }
    }),

  // 獲取倉庫庫存統計
  getWarehouseStats: () =>
    request({
      url: "/wms/batch/warehouse_stats/",
      method: "get"
    })
};

// 活動相關 API
export const activityApi = {
  // 獲取活動列表
  getActivities: params =>
    request({
      url: "/wms/activity/",
      method: "get",
      params
    }),

  // 獲取促銷活動列表
  getProductPromotion: params =>
    request({
      url: "/wms/activity/product_promotion/",
      method: "get",
      params
    }),

  // 獲取特定活動
  getActivity: id =>
    request({
      url: `/wms/activity/${id}/`,
      method: "get"
    }),

  // 創建活動
  createActivity: data =>
    request({
      url: "/wms/activity/",
      method: "post",
      data
    }),

  // 更新活動
  updateActivity: (id, data) =>
    request({
      url: `/wms/activity/${id}/`,
      method: "put",
      data
    }),

  // 部分更新活動
  patchActivity: (id, data) =>
    request({
      url: `/wms/activity/${id}/`,
      method: "patch",
      data
    }),

  // 刪除活動
  deleteActivity: id =>
    request({
      url: `/wms/activity/${id}/`,
      method: "delete"
    }),

  // 獲取活動商品列表
  getActivityProducts: (activityId, params) =>
    request({
      url: `/wms/activity/${activityId}/products/`,
      method: "get",
      params
    }),

  // 添加商品到活動
  addProductToActivity: (activityId, data) =>
    request({
      url: `/wms/activity/${activityId}/add_product/`,
      method: "post",
      data
    }),

  // 從活動中移除商品
  removeProductFromActivity: (activityId, productId) =>
    request({
      url: `/wms/activity/${activityId}/remove_product/`,
      method: "delete",
      data: { product_id: productId }
    }),

  // 獲取當前有效的活動
  getActiveActivities: params =>
    request({
      url: "/wms/activity/active/",
      method: "get",
      params
    }),

  // 獲取熱銷活動
  getHotSaleActivity: () =>
    request({
      url: "/wms/activity/hot-sale/",
      method: "get"
    }),

  // 獲取活動歷史記錄
  getActivityHistory: (activityId, params) =>
    request({
      url: `/wms/activity/${activityId}/history/`,
      method: "get",
      params
    })
};

// 活動商品相關 API
export const activityProductApi = {
  // 獲取活動商品列表
  getActivityProducts: params =>
    request({
      url: "/wms/activity-product/",
      method: "get",
      params
    }),

  // 獲取特定活動商品
  getActivityProduct: id =>
    request({
      url: `/wms/activity-product/${id}/`,
      method: "get"
    }),

  // 創建活動商品
  createActivityProduct: data =>
    request({
      url: "/wms/activity-product/",
      method: "post",
      data
    }),

  // 更新活動商品
  updateActivityProduct: (id, data) =>
    request({
      url: `/wms/activity-product/${id}/`,
      method: "put",
      data
    }),

  // 刪除活動商品
  deleteActivityProduct: id =>
    request({
      url: `/wms/activity-product/${id}/`,
      method: "delete"
    }),

  // 獲取活動商品歷史記錄
  getActivityProductHistory: (activityProductId, params) =>
    request({
      url: `/wms/activity-product/${activityProductId}/history/`,
      method: "get",
      params
    }),

  // 獲取商品的指定活動優惠
  getProductActivityPromotion: (productId, activityId) =>
    request({
      url: "/wms/activity-product/product-promotion/",
      method: "get",
      params: { product: productId, activity: activityId }
    }),

  // 計算活動商品庫存
  calculateActivityProductStock: activityProductId =>
    request({
      url: `/wms/activity-product/${activityProductId}/calculated_stock/`,
      method: "get"
    }),

  // 同步活動商品庫存
  syncActivityProductStock: activityProductId =>
    request({
      url: `/wms/activity-product/${activityProductId}/sync_stock/`,
      method: "post"
    }),

  // 重新計算所有活動商品庫存
  recalculateAllActivityProductStock: () =>
    request({
      url: "/wms/activity-product/recalculate_all/",
      method: "post"
    }),

  // 獲取庫存報告
  getStockReport: () =>
    request({
      url: "/wms/activity-product/stock_report/",
      method: "get"
    })
};

// 購物車相關 API
export const cartApi = {
  // 獲取購物車商品列表
  getCartItems: () =>
    request({
      url: "/wms/cart/items/",
      method: "get"
    }),

  // 添加商品到購物車
  addToCart: data =>
    request({
      url: "/wms/cart/add/",
      method: "post",
      data
    }),

  // 更新購物車中的商品數量
  updateCartItem: data =>
    request({
      url: "/wms/cart/update/",
      method: "put",
      data
    }),

  // 從購物車中移除商品
  removeFromCart: data =>
    request({
      url: "/wms/cart/remove/",
      method: "delete",
      data
    }),

  // 獲取購物車商品數量
  getCartCount: () =>
    request({
      url: "/wms/cart/count/",
      method: "get"
    }),

  // 清空購物車 (若後端不支援，可在前端逐一呼叫 removeFromCart 實現)
  clearCart: () =>
    request({
      url: "/wms/cart/clear/",
      method: "delete"
    }),

  // 應用促銷碼
  applyPromoCode: data =>
    request({
      url: "/wms/cart/apply-promo/",
      method: "post",
      data
    }),

  // 獲取購物車摘要（含優惠計算）
  getCartSummary: () =>
    request({
      url: "/wms/cart/summary/",
      method: "get"
    })
};

// 橫幅相關 API
export const bannerApi = {
  // 獲取當前活躍的橫幅
  getActiveBanner: () =>
    request({
      url: "/wms/banner/active/",
      method: "get"
    }),

  // 獲取所有橫幅
  getBanners: params =>
    request({
      url: "/wms/banner/",
      method: "get",
      params
    }),

  // 獲取特定橫幅
  getBanner: id =>
    request({
      url: `/wms/banner/${id}/`,
      method: "get"
    }),

  // 創建橫幅
  createBanner: data =>
    request({
      url: "/wms/banner/",
      method: "post",
      data
    }),

  // 更新橫幅
  updateBanner: (id, data) =>
    request({
      url: `/wms/banner/${id}/`,
      method: "put",
      data
    }),

  // 刪除橫幅
  deleteBanner: id =>
    request({
      url: `/wms/banner/${id}/`,
      method: "delete"
    }),

  // 獲取橫幅歷史記錄
  getBannerHistory: (bannerId, params) =>
    request({
      url: `/wms/banner/${bannerId}/history/`,
      method: "get",
      params
    })
};

// 訂單相關 API
export const orderApi = {
  // 獲取訂單列表
  getOrders: params =>
    request({
      url: "/wms/order/",
      method: "get",
      params
    }),

  // 獲取特定訂單
  getOrder: id =>
    request({
      url: `/wms/order/${id}/`,
      method: "get"
    }),

  // 創建訂單
  createOrder: data =>
    request({
      url: "/wms/order/create_order/",
      method: "post",
      data
    }),

  // 更新訂單
  updateOrder: (id, data) =>
    request({
      url: `/wms/order/${id}/`,
      method: "put",
      data
    }),

  patchOrder: (id, data) =>
    request({
      url: `/wms/order/${id}/`,
      method: "patch",
      data
    }),

  // 刪除訂單
  deleteOrder: id =>
    request({
      url: `/wms/order/${id}/`,
      method: "delete"
    }),

  // 獲取訂單的商品列表
  getOrderItems: orderId =>
    request({
      url: `/wms/order/${orderId}/items/`,
      method: "get"
    }),

  // 獲取訂單的商品詳情列表
  getOrderdetailItems: orderId =>
    request({
      url: `/wms/order/${orderId}/order_detail/`,
      method: "get"
    }),

  // 獲取訂單的出貨明細
  getOrderShipmentItems: orderId =>
    request({
      url: `/wms/order/${orderId}/shipment_items/`,
      method: "get"
    }),

  // 添加出貨明細到訂單
  addShipmentToOrder: (orderId, data) =>
    request({
      url: `/wms/order/${orderId}/add_shipment/`,
      method: "post",
      data
    }),

  // 獲取當前用戶的訂單
  getUserOrders: params =>
    request({
      url: "/wms/order/user_orders/",
      method: "get",
      params
    }),

  // 獲取訂單歷史記錄
  getOrderHistory: (orderId, params) =>
    request({
      url: `/wms/order/${orderId}/history/`,
      method: "get",
      params
    }),

  // 計算訂單優惠（預覽）
  calculateOrderPromotion: data =>
    request({
      url: "/wms/order/calculate-promotion/",
      method: "post",
      data
    }),

  // 確認訂單付款
  // confirmPayment: (orderId, paymentInfo) =>
  //   request({
  //     url: `/wms/order/${orderId}/confirm_payment/`,
  //     method: "post",
  //     data: paymentInfo
  //   }),

  // 回報訂單末五碼
  reportBankCode: (orderId, bankCode) =>
    request({
      url: `/wms/order/${orderId}/confirm_payment/`,
      method: "post",
      data: { bank_code: bankCode }
    })
};

// 訂單項目相關 API
export const orderItemApi = {
  // 獲取訂單項目列表
  getOrderItems: params =>
    request({
      url: "/wms/order-item/",
      method: "get",
      params
    }),

  // 獲取特定訂單項目
  getOrderItem: id =>
    request({
      url: `/wms/order-item/${id}/`,
      method: "get"
    }),

  // 獲取訂單項目歷史記錄
  getOrderItemHistory: (orderItemId, params) =>
    request({
      url: `/wms/order-item/${orderItemId}/history/`,
      method: "get",
      params
    })
};

// 出貨明細相關 API
export const shipmentItemApi = {
  // 獲取出貨明細列表
  getShipmentItems: params =>
    request({
      url: "/wms/shipment-item/",
      method: "get",
      params
    }),

  // 獲取特定出貨明細
  getShipmentItem: id =>
    request({
      url: `/wms/shipment-item/${id}/`,
      method: "get"
    })
};

// 促銷規則相關 API
export const promotionRuleApi = {
  // 獲取促銷規則列表
  getPromotionRules: params =>
    request({
      url: "/wms/promotion-rule/",
      method: "get",
      params
    }),

  // 獲取特定促銷規則
  getPromotionRule: id =>
    request({
      url: `/wms/promotion-rule/${id}/`,
      method: "get"
    }),

  // 創建促銷規則
  createPromotionRule: data =>
    request({
      url: "/wms/promotion-rule/",
      method: "post",
      data
    }),

  // 更新促銷規則
  updatePromotionRule: (id, data) =>
    request({
      url: `/wms/promotion-rule/${id}/`,
      method: "put",
      data
    }),

  // 刪除促銷規則
  deletePromotionRule: id =>
    request({
      url: `/wms/promotion-rule/${id}/`,
      method: "delete"
    }),

  // 獲取所有規則類型
  getRuleTypes: () =>
    request({
      url: "/wms/promotion-rule/rule_types/",
      method: "get"
    }),

  // 獲取促銷規則歷史記錄
  getPromotionRuleHistory: (ruleId, params) =>
    request({
      url: `/wms/promotion-rule/${ruleId}/history/`,
      method: "get",
      params
    }),

  // 獲取當前活躍的促銷規則
  getActivePromotionRules: () =>
    request({
      url: "/wms/promotion-rule/active/",
      method: "get"
    }),

  // 計算訂單級別促銷優惠
  calculateOrderPromotion: data =>
    request({
      url: "/wms/promotion-rule/calculate-order-promotion/",
      method: "post",
      data
    })
};

// 使用者活動參與紀錄相關 API
export const userActivityLogApi = {
  // 獲取使用者活動參與紀錄列表
  getUserActivityLogs: params =>
    request({
      url: "/wms/user-activity-log/",
      method: "get",
      params
    }),

  // 獲取特定使用者活動參與紀錄
  getUserActivityLog: id =>
    request({
      url: `/wms/user-activity-log/${id}/`,
      method: "get"
    }),

  // 參與活動
  joinActivity: data =>
    request({
      url: "/wms/user-activity-log/join_activity/",
      method: "post",
      data
    }),

  // 領取活動贈品
  receiveGift: data =>
    request({
      url: "/wms/user-activity-log/receive_gift/",
      method: "post",
      data
    })
};

// 儀表板相關 API
export const dashboardApi = {
  // 獲取系統統計數據
  getStatistics: () =>
    request({
      url: "/wms/dashboard/statistics/",
      method: "get"
    }),

  // 獲取最近訂單
  getRecentOrders: limit =>
    request({
      url: "/wms/dashboard/recent_orders/",
      method: "get",
      params: { limit }
    }),

  // 獲取熱銷商品
  getTopProducts: limit =>
    request({
      url: "/wms/dashboard/top_products/",
      method: "get",
      params: { limit }
    })
};

// 客服系統設定相關 API
export const customerServiceConfigApi = {
  // 獲取當前客服系統設定（包含營業時間計算）
  getCurrentConfig: () =>
    request({
      url: "/wms/customer-service/config/current/",
      method: "get"
    }),

  // 更新客服系統設定（僅限管理員）
  updateServiceConfig: data =>
    request({
      url: "/wms/customer-service/config/1/", // 假設總是使用 ID 為 1 的配置
      method: "put",
      data
    })
};

// 客服請求相關 API
export const customerServiceRequestApi = {
  // 獲取客服請求列表
  getServiceRequests: params =>
    request({
      url: "/wms/customer-service/requests/",
      method: "get",
      params
    }),

  // 獲取特定客服請求
  getServiceRequest: id =>
    request({
      url: `/wms/customer-service/requests/${id}/`,
      method: "get"
    }),

  // 創建客服請求
  createServiceRequest: data =>
    request({
      url: "/wms/customer-service/requests/",
      method: "post",
      data
    }),

  // 獲取當前用戶的客服請求
  getMyServiceRequests: () =>
    request({
      url: "/wms/customer-service/requests/my-requests/",
      method: "get"
    }),

  // 更新客服請求狀態（僅限管理員）
  updateRequestStatus: (id, data) =>
    request({
      url: `/wms/customer-service/requests/${id}/update-status/`,
      method: "patch",
      data
    }),

  // 獲取待處理的客服請求（僅限管理員）
  getPendingRequests: () =>
    request({
      url: "/wms/customer-service/requests/pending/",
      method: "get"
    }),

  // 獲取客服請求統計（僅限管理員）
  getRequestStats: () =>
    request({
      url: "/wms/customer-service/requests/stats/",
      method: "get"
    })
};

// 客服訊息相關 API
export const customerServiceMessageApi = {
  // 獲取訊息列表
  getServiceMessages: params =>
    request({
      url: "/wms/customer-service/messages/",
      method: "get",
      params
    }),

  // 獲取特定請求的所有訊息
  getRequestMessages: requestId =>
    request({
      url: `/wms/customer-service/messages/by-request/${requestId}/`,
      method: "get"
    }),

  // 回覆客服請求
  replyToServiceRequest: data =>
    request({
      url: "/wms/customer-service/messages/reply/",
      method: "post",
      data
    })
};

// 常見問題相關 API
export const faqApi = {
  // 獲取常見問題列表
  getFAQs: params =>
    request({
      url: "/wms/customer-service/faqs/",
      method: "get",
      params
    }),

  // 獲取特定常見問題
  getFAQ: id =>
    request({
      url: `/wms/customer-service/faqs/${id}/`,
      method: "get"
    }),

  // 獲取按分類分組的常見問題
  getFAQsByCategory: () =>
    request({
      url: "/wms/customer-service/faqs/by-category/",
      method: "get"
    }),

  // 創建常見問題（僅限管理員）
  createFAQ: data =>
    request({
      url: "/wms/customer-service/faqs/",
      method: "post",
      data
    }),

  // 更新常見問題（僅限管理員）
  updateFAQ: (id, data) =>
    request({
      url: `/wms/customer-service/faqs/${id}/`,
      method: "put",
      data
    }),

  // 刪除常見問題（僅限管理員）
  deleteFAQ: id =>
    request({
      url: `/wms/customer-service/faqs/${id}/`,
      method: "delete"
    })
};

// 客服系統歷史記錄相關 API
export const customerServiceHistoryApi = {
  // 查詢客服請求的最近異動
  getCustomerServiceRequestHistory: (days = 7) =>
    request({
      url: "/wms/recent_history/",
      method: "get",
      params: { days, model: "CustomerServiceRequest" }
    }),

  // 查詢客服訊息的最近異動
  getCustomerServiceMessageHistory: (days = 7) =>
    request({
      url: "/wms/recent_history/",
      method: "get",
      params: { days, model: "CustomerServiceMessage" }
    }),

  // 查詢FAQ的最近異動
  getFAQHistory: (days = 7) =>
    request({
      url: "/wms/recent_history/",
      method: "get",
      params: { days, model: "FAQ" }
    })
};

export const orderAdminApi = {
  // 管理員或市場角色：查詢所有訂單與詳情（含商品與圖片）
  getAllOrders: (params = {}) =>
    request({
      url: "/wms/order/admin_orders/",
      method: "get",
      params
    }),

  // 管理員或市場角色：查看所有已接單的訂單及其項目（含圖片）以及出貨明細
  getAllOrdersShipment: (params = {}) =>
    request({
      url: "/wms/order/admin_orders_shipment/",
      method: "get",
      params
    }),

  // 批量更新訂單狀態
  batchUpdateStatus: data =>
    request({
      url: "/wms/order/batch_update_status/",
      method: "post",
      data
    })
};

export const orderRemarkApi = {
  // 獲取訂單備註列表
  getOrderRemarks: (orderId, params = {}) =>
    request({
      url: `/wms/order/${orderId}/remarks/`,
      method: "get",
      params
    }),

  // 獲取訂單最新備註
  getLatestOrderRemark: orderId =>
    request({
      url: `/wms/order/${orderId}/latest_remark/`,
      method: "get"
    }),

  // 批量獲取多個訂單的最新備註
  getBatchLatestRemarks: orderIds =>
    request({
      url: `/wms/order/batch_latest_remarks/`,
      method: "post",
      data: { order_ids: orderIds }
    }),

  // 添加訂單備註
  addOrderRemark: (orderId, data) =>
    request({
      url: `/wms/order/${orderId}/add_remark/`,
      method: "post",
      data
    }),

  // 更新訂單備註
  updateOrderRemark: (orderId, data) =>
    request({
      url: `/wms/order/${orderId}/update_remark/`,
      method: "post",
      data
    }),

  // 刪除訂單備註
  deleteOrderRemark: (orderId, remarkId) =>
    request({
      url: `/wms/order/${orderId}/delete_remark/`,
      method: "post",
      data: { id: remarkId }
    }),

  // 添加備註圖片
  addRemarkImage: (orderId, data) =>
    request({
      url: `/wms/order/${orderId}/add_remark_image/`,
      method: "post",
      data
    }),

  // 刪除備註圖片
  deleteRemarkImage: (orderId, imageId) =>
    request({
      url: `/wms/order/${orderId}/delete_remark_image/`,
      method: "post",
      data: { image_id: imageId }
    }),

  // 上傳備註圖片（如果您的後端支持直接上傳圖片）
  uploadRemarkImages: formData =>
    request({
      url: `/wms/upload/images/`,
      method: "post",
      headers: {
        "Content-Type": "multipart/form-data"
      },
      data: formData
    })
};

// 導出所有 API
export default {
  categoryApi,
  itemApi,
  productApi,
  batchApi,
  activityApi,
  activityProductApi,
  cartApi,
  bannerApi,
  orderApi,
  orderItemApi,
  shipmentItemApi,
  promotionRuleApi,
  userActivityLogApi,
  dashboardApi,
  materialCategoryApi,
  historyApi,
  customerServiceConfigApi,
  customerServiceRequestApi,
  customerServiceMessageApi,
  faqApi,
  customerServiceHistoryApi,
  orderAdminApi,
  orderRemarkApi
};
