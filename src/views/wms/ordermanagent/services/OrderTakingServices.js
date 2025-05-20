import { orderAdminApi, orderApi, orderRemarkApi } from "@/api/shop";

function extractData(response) {
  return response && response.data ? response.data : {};
}

// 📦 後台訂單列表（含分頁與過濾條件）
export async function getAdminOrderList(params = { page: 1, limit: 20 }) {
  try {
    const response = await orderAdminApi.getAllOrders({
      page: params.page || 1,
      page_size: params.limit || 20,
      ...params.filters
    });
    const data = extractData(response);
    return {
      data: data.results || [], // 返回當前頁數據
      total: data.count || 0, // 返回總條數(用於分頁器顯示)
      page: params.page || 1,
      limit: params.limit || 20
    };
  } catch (error) {
    console.error("後台訂單列表查詢失敗:", error);
    throw error;
  }
}

export async function patchOrderInfo(orderId, patchData) {
  try {
    console.log("準備更新訂單，ID:", orderId, "數據:", patchData);
    const response = await orderApi.patchOrder(orderId, patchData);
    console.log("訂單更新成功，回應:", response);
    return {
      success: true,
      data: extractData(response),
      message: "訂單部分更新成功"
    };
  } catch (error) {
    console.error("部分更新訂單失敗:", error);
    return {
      success: false,
      message:
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        "更新訂單失敗，請稍後再試"
    };
  }
}

// 批量更新訂單狀態
export async function batchUpdateOrderStatus(payload) {
  try {
    console.log("準備批量更新訂單狀態:", payload);
    const response = await orderAdminApi.batchUpdateStatus(payload);
    console.log("批量更新成功，回應:", response);
    return {
      success: true,
      data: extractData(response),
      message: "批量更新訂單狀態成功"
    };
  } catch (error) {
    console.error("批量更新訂單狀態失敗:", error);
    return {
      success: false,
      message:
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        "批量更新訂單狀態失敗，請稍後再試"
    };
  }
}

// 🔴 訂單備註相關函數

// 獲取訂單備註列表
export async function getOrderRemarks(orderId, params = {}) {
  try {
    const response = await orderRemarkApi.getOrderRemarks(orderId, params);
    return {
      success: true,
      data: extractData(response)
    };
  } catch (error) {
    console.error("獲取訂單備註失敗:", error);
    return {
      success: false,
      data: [],
      message:
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        "獲取訂單備註失敗"
    };
  }
}

// 獲取訂單最新備註
export async function getLatestOrderRemark(orderId) {
  try {
    const response = await orderRemarkApi.getLatestOrderRemark(orderId);
    return {
      success: true,
      data: extractData(response)
    };
  } catch (error) {
    console.error("獲取最新備註失敗:", error);
    return {
      success: false,
      data: null,
      message:
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        "獲取最新備註失敗"
    };
  }
}

// 批量獲取多個訂單的最新備註
export async function getBatchLatestRemarks(orderIds) {
  try {
    const response = await orderRemarkApi.getBatchLatestRemarks(orderIds);
    return {
      success: true,
      data: response.data.data || {},
      counts: response.data.counts || {}
    };
  } catch (error) {
    console.error("批量獲取最新備註失敗:", error);
    return {
      success: false,
      data: {},
      counts: {},
      message:
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        "批量獲取備註失敗"
    };
  }
}

// 添加訂單備註
export async function addOrderRemark(remarkData, formData = null) {
  try {
    // 檢查是否有文件上傳
    let images = [];
    if (formData && formData.has("images")) {
      // 上傳圖片
      const uploadResponse = await orderRemarkApi.uploadRemarkImages(formData);
      if (
        uploadResponse &&
        uploadResponse.data &&
        uploadResponse.data.image_urls
      ) {
        images = uploadResponse.data.image_urls;
      }
    }

    // 添加備註
    const response = await orderRemarkApi.addOrderRemark(remarkData.orderId, {
      content: remarkData.content,
      is_important: remarkData.is_important || false,
      is_pinned: remarkData.is_pinned || false,
      images: images.length > 0 ? images : remarkData.images || []
    });

    const data = extractData(response);
    return {
      success: true,
      data: data.remark || null,
      message: data.message || "備註添加成功"
    };
  } catch (error) {
    console.error("添加訂單備註失敗:", error);
    return {
      success: false,
      message:
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        "添加備註失敗"
    };
  }
}

// 更新訂單備註
export async function updateOrderRemark(remarkData) {
  try {
    const response = await orderRemarkApi.updateOrderRemark(
      remarkData.orderId,
      {
        id: remarkData.id,
        content: remarkData.content,
        is_important: remarkData.isImportant,
        is_pinned: remarkData.isPinned
      }
    );

    const data = extractData(response);
    return {
      success: true,
      data: data.remark || null,
      message: data.message || "備註更新成功"
    };
  } catch (error) {
    console.error("更新訂單備註失敗:", error);
    return {
      success: false,
      message:
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        "更新備註失敗"
    };
  }
}

// 刪除訂單備註
export async function deleteOrderRemark(remarkId, orderId) {
  try {
    const response = await orderRemarkApi.deleteOrderRemark(orderId, remarkId);

    const data = extractData(response);
    return {
      success: true,
      message: data.message || "備註刪除成功"
    };
  } catch (error) {
    console.error("刪除訂單備註失敗:", error);
    return {
      success: false,
      message:
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        "刪除備註失敗"
    };
  }
}

// 添加備註圖片
export async function addRemarkImage(orderId, remarkId, imageUrl) {
  try {
    const response = await orderRemarkApi.addRemarkImage(orderId, {
      remark_id: remarkId,
      image_url: imageUrl
    });

    const data = extractData(response);
    return {
      success: true,
      data: data.image || null,
      message: data.message || "圖片添加成功"
    };
  } catch (error) {
    console.error("添加備註圖片失敗:", error);
    return {
      success: false,
      message:
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        "添加圖片失敗"
    };
  }
}

// 刪除備註圖片
export async function deleteRemarkImage(orderId, imageId) {
  try {
    const response = await orderRemarkApi.deleteRemarkImage(orderId, imageId);

    const data = extractData(response);
    return {
      success: true,
      message: data.message || "圖片刪除成功"
    };
  } catch (error) {
    console.error("刪除備註圖片失敗:", error);
    return {
      success: false,
      message:
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        "刪除圖片失敗"
    };
  }
}

export default {
  getAdminOrderList,
  patchOrderInfo,
  batchUpdateOrderStatus,
  getOrderRemarks,
  getLatestOrderRemark,
  getBatchLatestRemarks,
  addOrderRemark,
  updateOrderRemark,
  deleteOrderRemark,
  addRemarkImage,
  deleteRemarkImage
};
