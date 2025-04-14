import axios from "axios";

// API 基礎 URL，可以根據環境變數或實際需求配置
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || "/api";

// 模擬數據（僅用於開發和測試）
const mockData = {
  // 模擬退款處理列表數據
  refundProcessingList: [
    {
      id: "RP202404010001",
      refundOrderId: "RF202404010001",
      originalOrderId: "SO202403290123",
      customerName: "王大明",
      contactPhone: "0912-345-678",
      applyDate: "2024-04-01",
      refundAmount: 3280,
      refundMethod: "bank_transfer",
      bankInfo: JSON.stringify({
        bankCode: "bank_013",
        bankBranch: "信義分行",
        bankAccount: "1234567890",
        bankAccountName: "王大明"
      }),
      status: "processing",
      scheduledDate: "2024-04-05",
      completedDate: null,
      processor: "陳經理",
      remarks: "顧客因商品尺寸不合申請退款"
    }
  ],

  // 模擬退款處理歷史記錄
  refundProcessingHistory: [
    {
      id: "RPH202404010001",
      timestamp: "2024-04-01 10:30:45",
      refundId: "RP202404010001",
      user: "系統",
      type: "create",
      field: "創建",
      beforeValue: null,
      afterValue: "新增退款處理單"
    },
    {
      id: "RPH202404010002",
      timestamp: "2024-04-01 11:15:22",
      refundId: "RP202404010001",
      user: "陳經理",
      type: "update",
      field: "處理狀態",
      beforeValue: "pending",
      afterValue: "processing"
    },
    {
      id: "RPH202404010003",
      timestamp: "2024-04-01 14:20:36",
      refundId: "RP202404010001",
      user: "陳經理",
      type: "update",
      field: "預計退款日期",
      beforeValue: null,
      afterValue: "2024-04-05"
    }
  ],

  // 模擬備註數據
  remarks: [
    {
      id: "RM202404010001",
      orderId: "RP202404010001",
      user: "陳經理",
      content: "已聯絡客戶確認退款銀行資訊",
      timestamp: "2024-04-01 11:30:22"
    },
    {
      id: "RM202404010002",
      orderId: "RP202404010001",
      user: "李小姐",
      content: "已將退款申請提交財務部處理",
      timestamp: "2024-04-01 14:25:18"
    }
  ]
};

class RefundProcessingService {
  /**
   * 獲取退款處理列表
   * @param {Object} params - 查詢參數
   * @returns {Promise<Object>} - 返回退款處理列表數據
   */
  static async getRefundProcessingList(params = {}) {
    try {
      // 實際環境下使用此行
      // const response = await axios.get(`${API_BASE_URL}/refund-processing`, { params });

      // 模擬 API 回應
      console.log("查詢參數:", params);

      // 模擬搜尋邏輯
      let filteredData = [...mockData.refundProcessingList];

      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredData = filteredData.filter(
          item =>
            item.id.toLowerCase().includes(searchLower) ||
            item.refundOrderId.toLowerCase().includes(searchLower) ||
            item.originalOrderId.toLowerCase().includes(searchLower) ||
            item.customerName.toLowerCase().includes(searchLower) ||
            item.contactPhone.includes(params.search)
        );
      }

      // 模擬日期範圍過濾
      if (params.startDate && params.endDate) {
        filteredData = filteredData.filter(item => {
          const itemDate = new Date(item.applyDate);
          const startDate = new Date(params.startDate);
          const endDate = new Date(params.endDate);

          return itemDate >= startDate && itemDate <= endDate;
        });
      }

      return {
        success: true,
        data: filteredData,
        total: filteredData.length
      };
    } catch (error) {
      console.error("獲取退款處理列表失敗:", error);
      throw error;
    }
  }

  /**
   * 獲取特定退款處理單
   * @param {string} id - 退款處理單ID
   * @returns {Promise<Object>} - 返回特定退款處理單數據
   */
  static async getRefundProcessingById(id) {
    try {
      // 實際環境下使用此行
      // const response = await axios.get(`${API_BASE_URL}/refund-processing/${id}`);

      // 模擬 API 回應
      const refundProcessing = mockData.refundProcessingList.find(
        item => item.id === id
      );

      if (!refundProcessing) {
        throw new Error("找不到指定的退款處理單");
      }

      return {
        success: true,
        data: refundProcessing
      };
    } catch (error) {
      console.error("獲取退款處理單失敗:", error);
      throw error;
    }
  }

  /**
   * 更新退款處理單
   * @param {Object} refundData - 退款處理單數據
   * @returns {Promise<Object>} - 返回更新結果
   */
  static async updateRefundProcessing(refundData) {
    try {
      // 實際環境下使用此行
      // const response = await axios.put(`${API_BASE_URL}/refund-processing/${refundData.id}`, refundData);

      // 模擬 API 回應
      console.log("更新退款處理單:", refundData);

      // 模擬更新數據
      const index = mockData.refundProcessingList.findIndex(
        item => item.id === refundData.id
      );

      if (index !== -1) {
        mockData.refundProcessingList[index] = {
          ...mockData.refundProcessingList[index],
          ...refundData
        };

        // 添加一條歷史記錄
        const newHistoryRecord = {
          id: `RPH${Date.now()}`,
          timestamp: new Date()
            .toISOString()
            .replace("T", " ")
            .substring(0, 19),
          refundId: refundData.id,
          user: refundData.processor || "系統",
          type: "update",
          field: "退款處理單更新",
          beforeValue: "原數據",
          afterValue: "更新後數據"
        };

        mockData.refundProcessingHistory.unshift(newHistoryRecord);
      } else {
        throw new Error("找不到指定的退款處理單");
      }

      return {
        success: true,
        message: "退款處理單更新成功",
        data: mockData.refundProcessingList[index]
      };
    } catch (error) {
      console.error("更新退款處理單失敗:", error);
      throw error;
    }
  }

  /**
   * 更新退款處理單狀態
   * @param {Object} statusData - 狀態數據 { id, status, completedDate? }
   * @returns {Promise<Object>} - 返回更新結果
   */
  static async updateRefundProcessingStatus(statusData) {
    try {
      // 實際環境下使用此行
      // const response = await axios.patch(`${API_BASE_URL}/refund-processing/${statusData.id}/status`, statusData);

      // 模擬 API 回應
      console.log("更新退款處理單狀態:", statusData);

      // 模擬更新狀態
      const index = mockData.refundProcessingList.findIndex(
        item => item.id === statusData.id
      );

      if (index !== -1) {
        const oldStatus = mockData.refundProcessingList[index].status;

        // 更新狀態
        mockData.refundProcessingList[index].status = statusData.status;

        // 如果有提供完成日期且狀態為已完成，則更新完成日期
        if (statusData.completedDate && statusData.status === "completed") {
          const formattedDate = new Date(statusData.completedDate)
            .toISOString()
            .split("T")[0];
          mockData.refundProcessingList[index].completedDate = formattedDate;
        }

        // 添加一條歷史記錄
        const newHistoryRecord = {
          id: `RPH${Date.now()}`,
          timestamp: new Date()
            .toISOString()
            .replace("T", " ")
            .substring(0, 19),
          refundId: statusData.id,
          user: mockData.refundProcessingList[index].processor || "系統",
          type: "status",
          field: "處理狀態",
          beforeValue: oldStatus,
          afterValue: statusData.status
        };

        mockData.refundProcessingHistory.unshift(newHistoryRecord);
      } else {
        throw new Error("找不到指定的退款處理單");
      }

      const statusMessages = {
        pending: "退款處理單已標記為待處理",
        processing: "退款處理單已標記為處理中",
        scheduled: "退款處理單已標記為已排程",
        completed: "退款處理單已標記為已完成",
        cancelled: "退款處理單已標記為已取消"
      };

      return {
        success: true,
        message: statusMessages[statusData.status] || "退款處理單狀態已更新",
        data: mockData.refundProcessingList[index]
      };
    } catch (error) {
      console.error("更新退款處理單狀態失敗:", error);
      throw error;
    }
  }

  /**
   * 獲取退款處理單異動記錄
   * @param {Object} params - 查詢參數
   * @returns {Promise<Object>} - 返回異動記錄數據
   */
  static async getRefundProcessingHistory(params = {}) {
    try {
      // 實際環境下使用此行
      // const response = await axios.get(`${API_BASE_URL}/refund-processing/history`, { params });

      // 模擬 API 回應
      console.log("查詢參數:", params);

      // 模擬搜尋邏輯
      let filteredData = [...mockData.refundProcessingHistory];

      // 如果提供了退款單ID，則過濾特定退款單的記錄
      if (params.refundId) {
        filteredData = filteredData.filter(
          item => item.refundId === params.refundId
        );
      }

      // 模擬搜尋文字過濾
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredData = filteredData.filter(
          item =>
            item.refundId.toLowerCase().includes(searchLower) ||
            item.user.toLowerCase().includes(searchLower) ||
            (item.beforeValue &&
              item.beforeValue.toLowerCase().includes(searchLower)) ||
            (item.afterValue &&
              item.afterValue.toLowerCase().includes(searchLower))
        );
      }

      // 模擬日期範圍過濾
      if (params.startDate && params.endDate) {
        filteredData = filteredData.filter(item => {
          const itemDate = new Date(item.timestamp.split(" ")[0]);
          const startDate = new Date(params.startDate);
          const endDate = new Date(params.endDate);

          return itemDate >= startDate && itemDate <= endDate;
        });
      }

      // 按時間倒序排列
      filteredData.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      return {
        success: true,
        data: filteredData,
        total: filteredData.length
      };
    } catch (error) {
      console.error("獲取退款處理單異動記錄失敗:", error);
      throw error;
    }
  }

  /**
   * 獲取所有備註預覽（用於顯示最新備註）
   * @returns {Promise<Object>} - 返回備註預覽數據
   */
  static async getAllRemarkPreviews() {
    try {
      // 實際環境下使用此行
      // const response = await axios.get(`${API_BASE_URL}/refund-processing/remarks/previews`);

      // 模擬 API 回應
      const remarksByOrderId = {};

      // 按訂單ID分組
      mockData.remarks.forEach(remark => {
        if (!remarksByOrderId[remark.orderId]) {
          remarksByOrderId[remark.orderId] = [];
        }
        remarksByOrderId[remark.orderId].push(remark);
      });

      // 對每組備註按時間排序
      Object.keys(remarksByOrderId).forEach(orderId => {
        remarksByOrderId[orderId].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
      });

      return {
        success: true,
        data: remarksByOrderId
      };
    } catch (error) {
      console.error("獲取備註預覽失敗:", error);
      throw error;
    }
  }

  /**
   * 獲取特定退款處理單的備註
   * @param {string} refundId - 退款處理單ID
   * @returns {Promise<Object>} - 返回備註數據
   */
  static async getRemarks(refundId) {
    try {
      // 實際環境下使用此行
      // const response = await axios.get(`${API_BASE_URL}/refund-processing/${refundId}/remarks`);

      // 模擬 API 回應
      let filteredRemarks = mockData.remarks.filter(
        remark => remark.orderId === refundId
      );

      // 按時間倒序排列
      filteredRemarks.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      return {
        success: true,
        data: filteredRemarks,
        hasMore: false
      };
    } catch (error) {
      console.error("獲取備註失敗:", error);
      throw error;
    }
  }

  /**
   * 加載更多備註
   * @param {string} refundId - 退款處理單ID
   * @param {number} offset - 偏移量
   * @returns {Promise<Object>} - 返回更多備註數據
   */
  static async getMoreRemarks(refundId, offset) {
    try {
      // 實際環境下使用此行
      // const response = await axios.get(`${API_BASE_URL}/refund-processing/${refundId}/remarks`, { params: { offset } });

      // 模擬 API 回應 - 由於模擬數據有限，這裡直接返回空數組
      return {
        success: true,
        data: [],
        hasMore: false
      };
    } catch (error) {
      console.error("加載更多備註失敗:", error);
      throw error;
    }
  }

  /**
   * 添加備註
   * @param {Object} remarkData - 備註數據
   * @returns {Promise<Object>} - 返回添加結果
   */
  static async addRemark(remarkData) {
    try {
      // 實際環境下使用此行
      // const response = await axios.post(`${API_BASE_URL}/refund-processing/${remarkData.orderId}/remarks`, remarkData);

      // 模擬 API 回應
      console.log("添加備註:", remarkData);

      const newRemark = {
        id: `RM${Date.now()}`,
        orderId: remarkData.orderId,
        user: remarkData.user || "系統用戶",
        content: remarkData.content,
        timestamp: new Date()
          .toISOString()
          .replace("T", " ")
          .substring(0, 19)
      };

      // 添加到模擬數據中
      mockData.remarks.unshift(newRemark);

      return {
        success: true,
        message: "備註添加成功",
        data: newRemark
      };
    } catch (error) {
      console.error("添加備註失敗:", error);
      throw error;
    }
  }

  /**
   * 更新備註
   * @param {Object} remarkData - 備註數據
   * @returns {Promise<Object>} - 返回更新結果
   */
  static async updateRemark(remarkData) {
    try {
      // 實際環境下使用此行
      // const response = await axios.put(`${API_BASE_URL}/refund-processing/remarks/${remarkData.id}`, remarkData);

      // 模擬 API 回應
      console.log("更新備註:", remarkData);

      const index = mockData.remarks.findIndex(
        item => item.id === remarkData.id
      );

      if (index !== -1) {
        mockData.remarks[index] = {
          ...mockData.remarks[index],
          content: remarkData.content,
          timestamp:
            new Date()
              .toISOString()
              .replace("T", " ")
              .substring(0, 19) + " (已編輯)"
        };

        return {
          success: true,
          message: "備註更新成功",
          data: mockData.remarks[index]
        };
      } else {
        throw new Error("找不到指定的備註");
      }
    } catch (error) {
      console.error("更新備註失敗:", error);
      throw error;
    }
  }

  /**
   * 刪除備註
   * @param {string} remarkId - 備註ID
   * @returns {Promise<Object>} - 返回刪除結果
   */
  static async deleteRemark(remarkId) {
    try {
      // 實際環境下使用此行
      // const response = await axios.delete(`${API_BASE_URL}/refund-processing/remarks/${remarkId}`);

      // 模擬 API 回應
      console.log("刪除備註:", remarkId);

      const index = mockData.remarks.findIndex(item => item.id === remarkId);

      if (index !== -1) {
        mockData.remarks.splice(index, 1);

        return {
          success: true,
          message: "備註刪除成功"
        };
      } else {
        throw new Error("找不到指定的備註");
      }
    } catch (error) {
      console.error("刪除備註失敗:", error);
      throw error;
    }
  }
}

export default RefundProcessingService;
