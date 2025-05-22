import { orderAdminApi, orderApi, orderRemarkApi } from "@/api/shop";

function extractData(response) {
  return response && response.data ? response.data : {};
}

// 📦 後台訂單列表（含分頁與過濾條件）
export async function getAdminOrderList(params = { page: 1, limit: 20 }) {
  try {
    const response = await orderAdminApi.getAllOrdersShipment({
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

// 批量更新訂單狀態
export async function batchUpdateFulfillmentStatus(payload) {
  try {
    const response = await orderAdminApi.batchUpdateFulfillmentStatus(payload);
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

export default {
  getAdminOrderList,
  batchUpdateFulfillmentStatus
};
