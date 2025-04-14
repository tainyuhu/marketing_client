// Services.js - 整合 API 服務和資料
import axios from "axios";

// 模擬API請求延遲
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// 模擬資料總量
const TOTAL_ACTIVITIES = 30;
const TOTAL_PRODUCTS = 50;

/**
 * 獲取橫幅圖片
 * @returns {Promise<Object>} 橫幅圖片資訊
 */
export async function getBannerImage() {
  try {
    // 嘗試從真實 API 獲取
    try {
      const response = await axios.get("/api/banners/active");
      return response.data;
    } catch (apiError) {
      console.log("使用模擬橫幅數據");

      // 模擬 API 請求延遲
      await delay(200);

      // 返回模擬數據
      return {
        imageUrl: require("@/assets/pic/pic1.jpg")
      };
    }
  } catch (error) {
    console.error("獲取橫幅圖片失敗:", error);
    throw error;
  }
}

/**
 * 獲取熱銷活動資訊
 * @returns {Promise<Object>} 熱銷活動資訊
 */
export async function getHotSaleActivity() {
  try {
    // 嘗試從真實 API 獲取
    try {
      const response = await axios.get("/api/activities/hot-sale");
      return response;
    } catch (apiError) {
      console.log("使用模擬熱銷活動數據");

      // 模擬 API 請求延遲
      await delay(300);

      // 生成模擬熱銷活動
      const hotActivity = generateMockHotSaleActivity();

      return {
        data: hotActivity
      };
    }
  } catch (error) {
    console.error("獲取熱銷活動失敗:", error);
    throw error;
  }
}

/**
 * 獲取商品列表
 * @param {Object} params - 查詢參數
 * @param {Number} params.page - 頁碼
 * @param {Number} params.limit - 每頁數量
 * @param {String} params.type - 商品類型 (all, promotion, regular)
 * @returns {Promise<Object>} 商品列表和分頁資訊
 */
export async function getProductList(
  params = { page: 1, limit: 12, type: "all" }
) {
  try {
    // 嘗試從真實 API 獲取
    try {
      const response = await axios.get("/api/products", { params });
      return response.data;
    } catch (apiError) {
      console.log("使用模擬商品列表數據");

      // 模擬 API 請求延遲
      await delay(400);

      // 生成模擬商品列表
      const products = generateMockProducts(
        params.page,
        params.limit,
        params.type
      );

      // 計算過濾後的總商品數
      let filteredTotal = TOTAL_PRODUCTS;

      // 根據類型調整總數
      if (params.type === "promotion") {
        filteredTotal = Math.floor(TOTAL_PRODUCTS * 0.4); // 假設 40% 是活動商品
      } else if (params.type === "regular") {
        filteredTotal = Math.floor(TOTAL_PRODUCTS * 0.6); // 假設 60% 是常態商品
      }

      return {
        data: products,
        total: filteredTotal,
        page: params.page,
        limit: params.limit
      };
    }
  } catch (error) {
    console.error("獲取商品列表失敗:", error);
    throw error;
  }
}

/**
 * 獲取活動列表
 * @param {Object} params - 查詢參數
 * @param {Number} params.page - 頁碼
 * @param {Number} params.limit - 每頁數量
 * @param {String} params.filter - 過濾條件
 * @param {String} params.sort - 排序方式
 * @returns {Promise<Object>} 活動列表、總數和分頁信息
 */
export async function getActivityList(
  params = { page: 1, limit: 12, filter: "all", sort: "newest" }
) {
  try {
    // 嘗試從真實 API 獲取
    try {
      const response = await axios.get("/api/activities", { params });
      return response.data;
    } catch (apiError) {
      console.log("使用模擬活動列表數據");

      // 模擬 API 請求延遲
      await delay(500);

      // 生成模擬數據
      const activities = generateMockActivities(
        params.page,
        params.limit,
        params.filter,
        params.sort
      );

      // 計算過濾後的總活動數
      let filteredTotal = TOTAL_ACTIVITIES;

      // 根據過濾條件調整總數
      if (params.filter === "popular") {
        filteredTotal = Math.floor(TOTAL_ACTIVITIES * 0.7); // 假設 70% 是熱門活動
      } else if (params.filter === "ending") {
        filteredTotal = Math.floor(TOTAL_ACTIVITIES * 0.3); // 假設 30% 即將結束
      } else if (params.filter === "new") {
        filteredTotal = Math.floor(TOTAL_ACTIVITIES * 0.4); // 假設 40% 是新活動
      }

      return {
        data: activities,
        total: filteredTotal,
        page: params.page,
        limit: params.limit,
        pages: Math.ceil(filteredTotal / params.limit)
      };
    }
  } catch (error) {
    console.error("獲取活動列表失敗:", error);
    throw error;
  }
}

/**
 * 獲取購物車商品列表
 * @returns {Promise<Object>} 購物車商品列表
 */
export async function getCartItems() {
  try {
    // 嘗試從真實 API 獲取
    try {
      const response = await axios.get("/api/cart/items");
      return response.data;
    } catch (apiError) {
      console.log("使用模擬購物車數據");

      // 模擬API請求延遲
      await delay(300);

      // 模擬購物車商品數據
      const cartItems = generateMockCartItems();
      return {
        data: cartItems
      };
    }
  } catch (error) {
    console.error("獲取購物車商品列表失敗:", error);
    throw error;
  }
}

/**
 * 獲取活動詳情
 * @param {String} activityId - 活動ID
 * @returns {Promise<Object>} 活動詳情
 */
export async function getActivityDetail(activityId) {
  try {
    // 嘗試從真實 API 獲取
    try {
      const response = await axios.get(`/api/activities/${activityId}`);
      return response.data;
    } catch (apiError) {
      console.log("使用模擬活動詳情數據");

      // 模擬API請求延遲
      await delay(300);

      // 生成模擬數據
      const activity = generateMockActivityDetail(activityId);
      return {
        data: activity
      };
    }
  } catch (error) {
    console.error("獲取活動詳情失敗:", error);
    throw error;
  }
}

/**
 * 獲取商品詳情
 * @param {String} productId - 商品ID
 * @returns {Promise<Object>} 商品詳情
 */
export async function getProductDetail(productId) {
  try {
    // 嘗試從真實 API 獲取
    try {
      const response = await axios.get(`/api/products/${productId}`);
      return response.data;
    } catch (apiError) {
      console.log("使用模擬商品詳情數據");

      // 模擬API請求延遲
      await delay(300);

      // 生成模擬數據
      const product = generateMockProductDetail(productId);
      return {
        data: product
      };
    }
  } catch (error) {
    console.error("獲取商品詳情失敗:", error);
    throw error;
  }
}

/**
 * 獲取活動商品列表
 * @param {Object} params - 查詢參數
 * @param {String} params.activityId - 活動ID
 * @param {Number} params.page - 頁碼
 * @param {Number} params.limit - 每頁數量
 * @returns {Promise<Object>} 商品列表和是否有更多數據
 */
export async function getActivityProducts(
  params = { activityId: null, page: 1, limit: 8 }
) {
  try {
    // 嘗試從真實 API 獲取
    try {
      const response = await axios.get(
        `/api/activities/${params.activityId}/products`,
        {
          params: {
            page: params.page,
            limit: params.limit
          }
        }
      );
      return response.data;
    } catch (apiError) {
      console.log("使用模擬活動商品數據");

      // 模擬API請求延遲
      await delay(400);

      // 生成模擬數據
      const products = generateMockActivityProducts(
        params.activityId,
        params.page,
        params.limit
      );
      return {
        data: products,
        hasMore: products.length === params.limit && params.page < 3 // 最多模擬3頁數據
      };
    }
  } catch (error) {
    console.error("獲取活動商品列表失敗:", error);
    throw error;
  }
}

/**
 * 添加商品到購物車
 * @param {Object} params - 添加參數
 * @param {String} params.productId - 商品ID
 * @param {Number} params.quantity - 數量
 * @param {String} params.activityId - 活動ID (可選)
 * @returns {Promise<Object>} 添加結果
 */
export async function addToCart(
  params = { productId: null, quantity: 1, activityId: null }
) {
  try {
    // 嘗試調用真實 API
    try {
      const response = await axios.post("/api/cart/add", params);
      return response.data;
    } catch (apiError) {
      console.log("使用模擬添加購物車功能");

      // 模擬API請求延遲
      await delay(300);

      // 模擬添加成功
      return {
        data: {
          success: true,
          message: "添加成功"
        }
      };
    }
  } catch (error) {
    console.error("添加到購物車失敗:", error);
    throw error;
  }
}

/**
 * 獲取購物車商品數量
 * @returns {Promise<Object>} 購物車數量
 */
export async function getCartCount() {
  try {
    // 嘗試從真實 API 獲取
    try {
      const response = await axios.get("/api/cart/count");
      return response.data;
    } catch (apiError) {
      console.log("使用模擬購物車數量");

      // 模擬API請求延遲
      await delay(200);

      // 模擬購物車數量，隨機返回1-9之間的數字
      return {
        data: {
          count: Math.floor(Math.random() * 9) + 1
        }
      };
    }
  } catch (error) {
    console.error("獲取購物車數量失敗:", error);
    throw error;
  }
}

/**
 * 生成模擬熱銷活動（開發/測試使用）
 * @returns {Object} 熱銷活動信息
 */
function generateMockHotSaleActivity() {
  // 當前日期
  const now = new Date();

  // 活動結束日期 (3天後)
  const endDate = new Date(now);
  endDate.setDate(now.getDate() + 3);

  // 隨機生成4-8個熱銷商品
  const productCount = Math.floor(Math.random() * 5) + 4;
  const products = [];

  for (let i = 0; i < productCount; i++) {
    const price = Math.floor(Math.random() * 5000) + 500;
    const hasDiscount = Math.random() > 0.2; // 80% 的概率有折扣
    const originalPrice = hasDiscount
      ? Math.floor(price * (1 + Math.random() * 0.7))
      : null;

    // 隨機標籤
    const specialTags = ["限時特惠", "今日特價", "員工專享", "限量優惠"];
    const hasTag = Math.random() > 0.5;

    products.push({
      id: `hotproduct-${i + 1}`,
      name: getRandomProductName(),
      shortDescription: `超值特惠，限時折扣，數量有限，先到先得！`,
      price: price,
      originalPrice: originalPrice,
      imageUrl: require("@/assets/pic/pic3.jpg"),
      specialTag: hasTag
        ? specialTags[Math.floor(Math.random() * specialTags.length)]
        : null
    });
  }

  return {
    id: "hot-sale-activity",
    name: "今日最熱銷優惠活動",
    bannerUrl: require("@/assets/pic/pic2.jpg"),
    endDate: endDate.toISOString(),
    products: products
  };
}

/**
 * 生成模擬活動列表（開發/測試使用）
 * @param {Number} page - 頁碼
 * @param {Number} limit - 每頁數量
 * @param {String} filter - 過濾條件
 * @param {String} sort - 排序方式
 * @returns {Array} 活動列表
 */
function generateMockActivities(page, limit, filter, sort) {
  const result = [];
  const startIndex = (page - 1) * limit;

  // 創建所有活動的完整列表
  const allActivities = [];
  for (let i = 0; i < TOTAL_ACTIVITIES; i++) {
    const now = new Date();

    // 隨機生成開始日期（過去 0-20 天）
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - Math.floor(Math.random() * 20));

    // 隨機生成結束日期（未來 1-30 天）
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + Math.floor(Math.random() * 30) + 1);

    // 計算剩餘天數
    const remainingDays = Math.max(
      0,
      Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
    );

    // 隨機銷售進度
    const progress = Math.floor(Math.random() * 100);

    // 是否為熱門活動（根據進度決定）
    const isPopular = progress > 60;

    allActivities.push({
      id: `activity-${i + 1}`,
      name: `員工優惠活動 ${i + 1}`,
      imageUrl: require("@/assets/pic/pic2.jpg"),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      remainingDays: remainingDays,
      progress: progress,
      isPopular: isPopular,
      // 計算創建時間差（用於確定是否為新活動）
      daysFromStart: Math.ceil((now - startDate) / (1000 * 60 * 60 * 24))
    });
  }

  // 根據過濾條件過濾活動
  let filteredActivities = [...allActivities];

  if (filter === "popular") {
    filteredActivities = filteredActivities.filter(a => a.isPopular);
  } else if (filter === "ending") {
    filteredActivities = filteredActivities.filter(a => a.remainingDays <= 7);
  } else if (filter === "new") {
    filteredActivities = filteredActivities.filter(a => a.daysFromStart <= 7);
  }

  // 根據排序條件排序
  if (sort === "newest") {
    filteredActivities.sort(
      (a, b) => new Date(b.startDate) - new Date(a.startDate)
    );
  } else if (sort === "popular") {
    filteredActivities.sort((a, b) => b.progress - a.progress);
  } else if (sort === "endDate") {
    filteredActivities.sort((a, b) => a.remainingDays - b.remainingDays);
  }

  // 模擬分頁
  const paginatedActivities = filteredActivities.slice(
    startIndex,
    startIndex + limit
  );

  return paginatedActivities;
}

/**
 * 生成模擬活動詳情（開發/測試使用）
 * @param {String} activityId - 活動ID
 * @returns {Object} 活動詳情
 */
function generateMockActivityDetail(activityId) {
  const activityIndex = parseInt(activityId.split("-")[1]) || 1;
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - Math.floor(Math.random() * 10));
  const endDate = new Date(now);
  endDate.setDate(now.getDate() + Math.floor(Math.random() * 20) + 1);
  const remainingDays = Math.max(
    0,
    Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
  );

  // 添加HTML內容示例
  const detailHtml = `
    <p>這是一個專為員工提供的特別優惠活動，提供多種商品折扣。</p>
    <p>活動時間有限，請把握機會！這是第${activityIndex}個活動的詳細描述。</p>
    <ul>
      <li>特別優惠價格</li>
      <li>限量商品</li>
      <li>專屬員工福利</li>
    </ul>
    <p>更多詳情請咨詢人力資源部門。</p>
  `;

  const rulesHtml = `
    <ol>
      <li>每位員工限購數量：3件</li>
      <li>活動期間內，先到先得</li>
      <li>不可與其他優惠同時使用</li>
      <li>公司保留最終解釋權</li>
    </ol>
    <p><strong>注意：</strong>請務必在活動結束前完成購買。</p>
  `;

  return {
    id: activityId,
    name: `員工優惠活動 ${activityIndex}`,
    description: `這是一個專為員工提供的特別優惠活動，提供多種商品折扣。活動說明詳情，活動時間有限，請把握機會！這是第${activityIndex}個活動的詳細描述。`,
    imageUrl: require("@/assets/pic/pic2.jpg"),
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    remainingDays: remainingDays,
    progress: Math.floor(Math.random() * 100),
    detailHtml: detailHtml,
    rulesHtml: rulesHtml
  };
}

/**
 * 生成模擬活動商品列表（開發/測試使用）
 * @param {String} activityId - 活動ID
 * @param {Number} page - 頁碼
 * @param {Number} limit - 每頁數量
 * @returns {Array} 商品列表
 */
function generateMockActivityProducts(activityId, page, limit) {
  const result = [];
  const activityIndex = parseInt(activityId.split("-")[1]) || 1;
  const startIndex = (page - 1) * limit;

  for (let i = 0; i < limit; i++) {
    const index = startIndex + i;
    if (index >= 24) break; // 假設每個活動最多 24 個商品

    const price = Math.floor(Math.random() * 1000) + 100;
    const hasDiscount = Math.random() > 0.3; // 70% 的概率有折扣
    const originalPrice = hasDiscount
      ? Math.floor(price * (1 + Math.random() * 0.5))
      : price;
    const stock = Math.floor(Math.random() * 20); // 有些商品可能已售罄

    result.push({
      id: `product-${activityIndex}-${index + 1}`,
      name: `${getRandomProductName()} ${index + 1}`,
      price: price,
      originalPrice: originalPrice,
      imageUrl: require("@/assets/pic/pic3.jpg"),
      stock: stock
    });
  }

  return result;
}

/**
 * 生成模擬商品列表（開發/測試使用）
 * @param {Number} page - 頁碼
 * @param {Number} limit - 每頁數量
 * @param {String} type - 商品類型
 * @returns {Array} 商品列表
 */
function generateMockProducts(page, limit, type) {
  const result = [];
  const startIndex = (page - 1) * limit;

  // 創建所有商品的完整列表
  const allProducts = [];
  for (let i = 0; i < TOTAL_PRODUCTS; i++) {
    const price = Math.floor(Math.random() * 2000) + 100;
    const hasDiscount = Math.random() > 0.4; // 60% 的概率有折扣
    const originalPrice = hasDiscount
      ? Math.floor(price * (1 + Math.random() * 0.5))
      : price;
    const stock = Math.floor(Math.random() * 20); // 0-19庫存
    const isPromotion = Math.random() > 0.6; // 40% 是活動商品

    allProducts.push({
      id: `product-regular-${i + 1}`,
      name: `${getRandomProductName()} ${i + 1}`,
      price: price,
      originalPrice: originalPrice,
      imageUrl: require("@/assets/pic/pic3.jpg"),
      stock: stock,
      isPromotion: isPromotion
    });
  }

  // 根據類型過濾商品
  let filteredProducts = [...allProducts];

  if (type === "promotion") {
    filteredProducts = filteredProducts.filter(p => p.isPromotion);
  } else if (type === "regular") {
    filteredProducts = filteredProducts.filter(p => !p.isPromotion);
  }

  // 模擬分頁
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + limit
  );

  return paginatedProducts;
}

/**
 * 隨機生成商品名稱（開發/測試使用）
 * @returns {String} 商品名稱
 */
function getRandomProductName() {
  const prefixes = [
    "優質",
    "限量",
    "特惠",
    "精選",
    "高級",
    "實用",
    "熱銷",
    "超值"
  ];
  const items = [
    "商品",
    "禮品",
    "套裝",
    "家電",
    "數碼產品",
    "辦公用品",
    "生活用品",
    "廚具"
  ];

  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomItem = items[Math.floor(Math.random() * items.length)];

  return `${randomPrefix}${randomItem}`;
}

/**
 * 生成模擬購物車商品（開發/測試使用）
 * @returns {Array} 購物車商品列表
 */
function generateMockCartItems() {
  const itemCount = Math.floor(Math.random() * 5) + 1; // 1-5個商品
  const result = [];

  for (let i = 0; i < itemCount; i++) {
    const price = Math.floor(Math.random() * 1000) + 100;
    const quantity = Math.floor(Math.random() * 3) + 1; // 1-3件

    result.push({
      id: `cart-item-${i + 1}`,
      productId: `product-${Math.floor(Math.random() * 10) + 1}-${Math.floor(
        Math.random() * 10
      ) + 1}`,
      name: `${getRandomProductName()} ${i + 1}`,
      price: price,
      quantity: quantity,
      imageUrl: require("@/assets/pic/pic3.jpg"),
      activityId: `activity-${Math.floor(Math.random() * 5) + 1}`,
      activityName: `員工優惠活動 ${Math.floor(Math.random() * 5) + 1}`
    });
  }

  return result;
}

/**
 * 生成模擬產品詳情（開發/測試使用）
 * @param {String} productId - 商品ID
 * @returns {Object} 商品詳情
 */
function generateMockProductDetail(productId) {
  // 從產品ID解析活動ID和產品索引
  const parts = productId.split("-");
  let activityId = null;
  let productIndex = 1;

  if (parts.length >= 3) {
    activityId = `activity-${parts[1]}`;
    productIndex = parseInt(parts[2]) || 1;
  }

  const price = Math.floor(Math.random() * 2000) + 500;
  const hasDiscount = Math.random() > 0.3; // 70% 的概率有折扣
  const originalPrice = hasDiscount
    ? Math.floor(price * (1 + Math.random() * 0.5))
    : price;
  const stock = Math.floor(Math.random() * 20); // 0-19庫存

  // 生成多張產品圖片
  const imageUrls = [
    require("@/assets/pic/pic3.jpg"),
    require("@/assets/pic/pic3.jpg"),
    require("@/assets/pic/pic3.jpg")
  ];

  // 產品描述HTML
  const descriptionHtml = `
    <div class="product-description">
      <p>這是一款高品質的${getRandomProductName()}，特別為員工優惠活動設計。</p>
      <p>產品特點：</p>
      <ul>
        <li>優質材料，耐用實用</li>
        <li>精緻設計，美觀大方</li>
        <li>多種功能，滿足日常需求</li>
      </ul>
      <p>產品尺寸：${Math.floor(Math.random() * 30) + 10}cm x ${Math.floor(
    Math.random() * 20
  ) + 10}cm</p>
      <p>產品重量：${(Math.random() * 2 + 0.5).toFixed(2)}kg</p>
    </div>
  `;

  // 產品規格HTML
  const specificationHtml = `
    <div class="product-specification">
      <h3>基本信息</h3>
      <table>
        <tr>
          <td>品牌</td>
          <td>優品牌${Math.floor(Math.random() * 10) + 1}</td>
        </tr>
        <tr>
          <td>型號</td>
          <td>TP-${1000 + Math.floor(Math.random() * 1000)}</td>
        </tr>
        <tr>
          <td>顏色</td>
          <td>${
            ["黑色", "白色", "銀色", "金色"][Math.floor(Math.random() * 4)]
          }</td>
        </tr>
        <tr>
          <td>產地</td>
          <td>${
            ["台灣", "中國", "日本", "韓國"][Math.floor(Math.random() * 4)]
          }</td>
        </tr>
      </table>
    </div>
  `;

  return {
    id: productId,
    name: `${getRandomProductName()} ${productIndex}`,
    price: price,
    originalPrice: originalPrice,
    mainImageUrl: require("@/assets/pic/pic3.jpg"),
    imageUrls: imageUrls,
    stock: stock,
    activityId: activityId,
    activityName: activityId ? `員工優惠活動 ${parts[1]}` : null,
    descriptionHtml: descriptionHtml,
    specificationHtml: specificationHtml,
    tags: ["品質保證", "限時優惠", "員工專享"]
  };
}

// 將所有方法匯出為默認對象
export default {
  getBannerImage,
  getHotSaleActivity,
  getProductList,
  getActivityList,
  getActivityDetail,
  getActivityProducts,
  addToCart,
  getCartCount,
  getCartItems,
  getProductDetail
};
