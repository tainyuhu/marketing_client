// services.js - 整合 API 與前端資料處理
import {
  productApi,
  activityApi,
  cartApi,
  bannerApi,
  activityProductApi,
  orderApi,
  customerServiceConfigApi,
  customerServiceRequestApi,
  customerServiceMessageApi,
  faqApi
} from "@/api/shop";

function extractData(response) {
  return response && response.data ? response.data : {};
}

function safeParsePrice(value, fallback = 0) {
  return parseFloat(value !== undefined && value !== null ? value : fallback);
}

// 🧊 橫幅：獲取首頁橫幅圖片
export async function getBannerImage() {
  try {
    const response = await bannerApi.getActiveBanner();
    return extractData(response);
  } catch (error) {
    console.error("獲取橫幅圖片失敗:", error);
    throw error;
  }
}

// 🔥 熱銷活動（單一）
export async function getHotSaleActivity() {
  try {
    const response = await activityApi.getHotSaleActivity();
    return extractData(response);
  } catch (error) {
    console.error("獲取熱銷活動失敗:", error);
    throw error;
  }
}

// 🛒 商品列表（可指定常態 / 促銷）
export async function getProductList(
  params = { page: 1, limit: 12, type: "all" }
) {
  try {
    const apiParams = {
      page: params.page,
      page_size: params.limit
    };
    if (params.type === "promotion") apiParams.is_promotion = true;
    else if (params.type === "regular") apiParams.is_promotion = false;

    const response = await productApi.getProducts(apiParams);
    const data = extractData(response);

    const converted = (data.results || []).map(p => ({
      id: p.id,
      name: p.product_name || p.name,
      productCode: p.product_code || "",
      price: safeParsePrice(p.price),
      originalPrice: safeParsePrice(p.original_price, p.price),
      imageUrl: p.main_image_url || "",
      stock: p.stock || 9999,
      isPromotion: !!p.is_promotion
    }));

    return {
      data: converted,
      total: data.count || 0,
      page: params.page,
      limit: params.limit
    };
  } catch (error) {
    console.error("獲取商品列表失敗:", error);
    throw error;
  }
}

// 🛒 商品清單（含促銷價格）
export async function getProductListWithPricing(
  params = { page: 1, limit: 12, type: "all" }
) {
  try {
    const apiParams = {
      page: params.page,
      page_size: params.limit
    };
    if (params.type === "promotion") apiParams.is_promotion = true;
    else if (params.type === "regular") apiParams.is_promotion = false;

    const response = await productApi.getProductsWithPricing(apiParams);
    const data = extractData(response);

    const converted = (data.results || []).map(p => ({
      id: p.id,
      name: p.product_name,
      productCode: p.product_code,
      price: safeParsePrice(p.price),
      originalPrice: safeParsePrice(p.original_price, p.price),
      imageUrl: p.main_image_url || "",
      stock: p.stock || 9999,
      isPromotion: !!p.is_promotion
    }));

    return {
      data: converted,
      total: data.count || 0,
      page: params.page,
      limit: params.limit
    };
  } catch (error) {
    console.error("獲取商品（含促銷價）列表失敗:", error);
    throw error;
  }
}

// 🧧 活動詳情（含優惠資訊）
export async function getActivityDetailWithPromotion(activityId) {
  try {
    const response = await activityApi.getActivity(activityId);
    const data = extractData(response);

    const promotions = (data.products || []).map(ap => ({
      productId: ap.product,
      productName: ap.product_name,
      price: safeParsePrice(ap.price),
      originalPrice: safeParsePrice(ap.original_price),
      promotionLabel: ap.discount_rate
        ? `${parseFloat(ap.discount_rate * 10)}折`
        : ap.buy_quantity && ap.gift_quantity
        ? `買${ap.buy_quantity}送${ap.gift_quantity}`
        : "",
      giftProduct: ap.gift_product,
      giftQuantity: ap.gift_quantity || 0
    }));

    return {
      data: {
        id: data.id,
        name: data.name,
        imageUrl: data.image_url || data.banner_url,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        progress: data.progress,
        remainingDays: data.remaining_days,
        detailHtml: data.detail_html,
        rulesHtml: data.rules_html,
        promotions
      }
    };
  } catch (error) {
    console.error("獲取活動詳情（含優惠）失敗:", error);
    throw error;
  }
}

// 🎯 查詢指定商品在活動中的優惠資訊
export async function getProductPromotionInActivity(productId, activityId) {
  try {
    const response = await activityProductApi.getProductActivityPromotion(
      productId,
      activityId
    );
    const data = extractData(response);

    return {
      productId: data.product,
      activityId: data.activity,
      price: safeParsePrice(data.price),
      originalPrice: safeParsePrice(data.original_price, data.price),
      promotionLabel: data.discount_rate
        ? `${parseFloat(data.discount_rate * 10)}折`
        : data.buy_quantity && data.gift_quantity
        ? `買${data.buy_quantity}送${data.gift_quantity}`
        : "",
      giftProduct: data.gift_product,
      giftQuantity: data.gift_quantity || 0
    };
  } catch (error) {
    console.error("查詢商品在活動中的優惠失敗:", error);
    throw error;
  }
}

// 📦 購物車操作
export async function getCartItems() {
  try {
    const response = await cartApi.getCartItems();
    return extractData(response.data);
  } catch (error) {
    console.error("獲取購物車列表失敗:", error);
    throw error;
  }
}

export async function addToCart(
  params = { productId: null, quantity: 1, activityId: null }
) {
  try {
    const response = await cartApi.addToCart(params);
    return extractData(response);
  } catch (error) {
    console.error("添加到購物車失敗:", error);
    throw error;
  }
}

export async function updateCartItem(
  params = { productId: null, quantity: 1, activityId: null }
) {
  try {
    const response = await cartApi.updateCartItem(params);
    return extractData(response);
  } catch (error) {
    console.error("更新購物車商品失敗:", error);
    throw error;
  }
}

export async function removeCartItem(cartItemId) {
  try {
    const response = await cartApi.removeFromCart({ id: cartItemId });
    return extractData(response);
  } catch (error) {
    console.error("從購物車移除商品失敗:", error);
    throw error;
  }
}

export async function getCartCount() {
  try {
    const response = await cartApi.getCartCount();
    return extractData(response);
  } catch (error) {
    console.error("獲取購物車數量失敗:", error);
    throw error;
  }
}

// 清空購物車
export async function clearCart() {
  try {
    const response = await cartApi.clearCart();
    return extractData(response);
  } catch (error) {
    console.error("清空購物車失敗:", error);
    throw error;
  }
}

// 🧾 商品詳情
export async function getProductDetail(productId) {
  try {
    const response = await productApi.getProduct(productId);
    return { data: extractData(response) };
  } catch (error) {
    console.error("獲取商品詳情失敗:", error);
    throw error;
  }
}

// 🔍 獲取活動列表
export async function getActivityList(params = { page: 1, limit: 12 }) {
  try {
    const response = await activityApi.getActivities({
      page: params.page,
      page_size: params.limit
    });
    const data = extractData(response);
    return {
      data: data.results || [],
      total: data.count || 0,
      page: params.page,
      limit: params.limit
    };
  } catch (error) {
    console.error("獲取活動列表失敗:", error);
    throw error;
  }
}

// 🔍 獲取活動詳情（未含優惠）
export async function getActivityDetail(activityId) {
  try {
    const response = await activityApi.getActivity(activityId);
    return { data: extractData(response) };
  } catch (error) {
    console.error("獲取活動詳情失敗:", error);
    throw error;
  }
}

// 📦 獲取活動中的商品列表
export async function getActivityProducts({ activityId, page = 1, limit = 8 }) {
  try {
    const response = await activityApi.getActivityProducts(activityId, {
      page,
      page_size: limit
    });
    const data = extractData(response);
    return {
      data: data.results || [],
      hasMore: data.next !== null,
      total: data.count
    };
  } catch (error) {
    console.error("獲取活動商品失敗:", error);
    throw error;
  }
}

// 🛍️ 獲取促銷活動（內建）
export async function getProductPromotion(params = { page: 1, limit: 12 }) {
  try {
    const response = await activityApi.getProductPromotion({
      page: params.page,
      page_size: params.limit
    });
    const data = extractData(response);
    return {
      data: data.results || [],
      total: data.count || 0,
      page: params.page,
      limit: params.limit
    };
  } catch (error) {
    console.error("獲取促銷活動失敗:", error);
    throw error;
  }
}

// 💳 創建訂單
export async function createOrder(orderData) {
  try {
    // 調用 API 創建訂單
    const response = await orderApi.createOrder(orderData);
    return extractData(response);
  } catch (error) {
    console.error("創建訂單失敗:", error);
    throw error;
  }
}

// 獲取使用者訂單列表
export async function getUserOrders(params = { page: 1, limit: 20 }) {
  try {
    const response = await orderApi.getUserOrders({
      page: params.page,
      page_size: params.limit
    });
    const data = extractData(response);

    return {
      data: data.results || [],
      total: data.count || 0,
      page: params.page,
      limit: params.limit
    };
  } catch (error) {
    console.error("獲取使用者訂單失敗:", error);
    throw error;
  }
}

// 獲取訂單詳情（包含訂單項目）
export async function getOrderDetail(orderId) {
  try {
    // 使用更高效的order_detail端點獲取完整訂單信息
    const response = await orderApi.getOrderdetailItems(orderId);
    const data = extractData(response);

    // 根據後端 OrderViewSet.order_detail 方法的返回格式構建返回對象
    console.log("獲取訂單詳情:", error);
    return {
      order: data.order || {},
      order_items: data.order_items || [],
      inventory_reservations: data.inventory_reservations || []
    };
  } catch (error) {
    console.error("獲取訂單詳情失敗:", error);
    throw error;
  }
}

// 👨‍💼 客服系統相關服務

import {
  customerServiceConfigApi,
  customerServiceRequestApi,
  customerServiceMessageApi,
  faqApi
} from "@/api/shop";

// 獲取客服系統設定（包含營業時間計算）
export async function getCustomerServiceConfig() {
  try {
    const response = await customerServiceConfigApi.getCurrentConfig();
    return extractData(response);
  } catch (error) {
    console.error("獲取客服系統設定失敗:", error);
    throw error;
  }
}

// 獲取常見問題列表
export async function getFAQs(category = null) {
  try {
    const params = category ? { category } : {};
    const response = await faqApi.getFAQs(params);
    return extractData(response);
  } catch (error) {
    console.error("獲取常見問題失敗:", error);
    throw error;
  }
}

// 獲取分類後的常見問題
export async function getFAQsByCategory() {
  try {
    const response = await faqApi.getFAQsByCategory();
    return extractData(response);
  } catch (error) {
    console.error("獲取分類常見問題失敗:", error);
    throw error;
  }
}

// 創建客服請求
export async function createServiceRequest(data) {
  try {
    const response = await customerServiceRequestApi.createServiceRequest(data);
    return extractData(response);
  } catch (error) {
    console.error("創建客服請求失敗:", error);
    throw error;
  }
}

// 獲取我的客服請求列表
export async function getMyServiceRequests() {
  try {
    const response = await customerServiceRequestApi.getMyServiceRequests();
    return extractData(response);
  } catch (error) {
    console.error("獲取我的客服請求失敗:", error);
    throw error;
  }
}

// 獲取客服請求詳情
export async function getServiceRequestDetail(requestId) {
  try {
    const response = await customerServiceRequestApi.getServiceRequest(
      requestId
    );
    return extractData(response);
  } catch (error) {
    console.error("獲取客服請求詳情失敗:", error);
    throw error;
  }
}

// 獲取請求對話消息
export async function getRequestMessages(requestId) {
  try {
    const response = await customerServiceMessageApi.getRequestMessages(
      requestId
    );
    return extractData(response);
  } catch (error) {
    console.error("獲取客服訊息失敗:", error);
    throw error;
  }
}

// 回覆客服請求
export async function replyToServiceRequest(data) {
  try {
    const response = await customerServiceMessageApi.replyToServiceRequest(
      data
    );
    return extractData(response);
  } catch (error) {
    console.error("回覆客服請求失敗:", error);
    throw error;
  }
}

export default {
  // 🧊 橫幅相關
  getBannerImage,

  // 🔥 熱銷活動
  getHotSaleActivity,

  // 🛒 商品列表（含常態與促銷）
  getProductList,
  getProductListWithPricing,

  // 🧧 活動列表與詳情
  getActivityList,
  getActivityDetail,
  getActivityDetailWithPromotion, // ⭐️ 活動詳情＋優惠資訊
  getActivityProducts,
  getProductPromotionInActivity, // ⭐️ 單一商品在活動中的優惠展示
  getProductPromotion,

  // 🛍️ 購物車操作
  addToCart,
  getCartCount,
  getCartItems,
  updateCartItem,
  removeCartItem,
  clearCart, // 添加清空購物車方法

  // 🧾 商品詳情
  getProductDetail,

  // 💳 訂單操作
  createOrder,
  getUserOrders,
  getOrderDetail,

  // 👨‍💼 客服系統相關
  getCustomerServiceConfig,
  getFAQs,
  getFAQsByCategory,
  createServiceRequest,
  getMyServiceRequests,
  getServiceRequestDetail,
  getRequestMessages,
  replyToServiceRequest
};
