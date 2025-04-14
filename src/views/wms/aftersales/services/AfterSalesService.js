import axios from "axios";
import { formatDate } from "@/utils/date";

// 模擬資料 - 售後案件資料
const mockCaseData = [
  {
    orderNumber: "AS-20250327-001",
    originalOrderId: "SO-20250317-001",
    customerName: "王小明",
    contactPhone: "0912-345-678",
    orderTotal: 3580,
    applyDate: "2025-03-27",
    priority: "高",
    problemType: "商品品質問題",
    processingMethod: "退貨＋全額退款",
    status: "處理中",
    processor: "陳經理",
    lastUpdateTime: "2025-03-27 14:30:45",
    expectedCompletionDate: "2025-04-05",
    processingRemarks: "客戶表示收到的商品與描述不符，且有外觀損壞",
    problemSummary: "商品外觀損壞，顏色與網站展示不符，要求退貨退款",
    problemDetails: [
      {
        id: "PD001",
        problemType: "與產品相關",
        productId: "PROD-8745",
        productName: "高級陶瓷餐具組",
        productCode: "TC-8745",
        specification: "20件組/白色",
        purchaseQuantity: 1,
        problemQuantity: 1,
        productIssueType: "外觀損壞",
        evidenceFiles: [
          {
            id: "FILE-001",
            name: "損壞照片1.jpg",
            url: "https://via.placeholder.com/300x200?text=损坏照片1"
          },
          {
            id: "FILE-002",
            name: "損壞照片2.jpg",
            url: "https://via.placeholder.com/300x200?text=损坏照片2"
          }
        ],
        problemDescription:
          "收到後發現包裝完好但部分餐盤有崩裂痕跡，且顏色是米色而非網站展示的白色",
        problemDiscoveryTime: "2025-03-26 18:45:00"
      }
    ],
    returnExchangeDetails: [
      {
        id: "RE001",
        processingId: "RET-20250327-001",
        processingStatus: "處理中",
        items: "高級陶瓷餐具組 x 1"
      },
      {
        id: "RE001",
        processingId: "REF-20250327-001",
        processingStatus: "待處理",
        items: 3580
      }
    ]
  }
];

// 模擬資料 - 案件歷史記錄
const mockHistoryData = [
  {
    id: "HIST-001",
    timestamp: "2025-03-27 10:15:30",
    orderNumber: "AS-20250327-001",
    user: "系統",
    operationType: "create",
    field: "售後案件",
    beforeValue: null,
    afterValue: "AS-20250327-001 已創建"
  },
  {
    id: "HIST-002",
    timestamp: "2025-03-27 11:05:22",
    orderNumber: "AS-20250327-001",
    user: "李客服",
    operationType: "update",
    field: "處理人員",
    beforeValue: "未分配",
    afterValue: "陳經理"
  },
  {
    id: "HIST-003",
    timestamp: "2025-03-27 14:30:45",
    orderNumber: "AS-20250327-001",
    user: "陳經理",
    operationType: "status",
    field: "處理狀態",
    beforeValue: "待處理",
    afterValue: "處理中"
  },
  {
    id: "HIST-004",
    timestamp: "2025-03-27 14:32:18",
    orderNumber: "AS-20250327-001",
    user: "陳經理",
    operationType: "remark",
    field: "備註",
    beforeValue: null,
    afterValue: "已與客戶電話聯繫，確認退貨方式"
  }
];

// 模擬資料 - 備註資料
const mockRemarks = {
  "AS-20250327-001": [
    {
      id: "RMK-001",
      orderNumber: "AS-20250327-001",
      createdBy: "陳經理",
      createdAt: "2025-03-27 14:32:18",
      content: "已與客戶電話聯繫，確認退貨方式",
      isInternal: true
    },
    {
      id: "RMK-002",
      orderNumber: "AS-20250327-001",
      createdBy: "陳經理",
      createdAt: "2025-03-27 16:45:10",
      content: "已發送退貨指引郵件給客戶，請客戶三天內安排寄回",
      isInternal: true
    }
  ]
};

// 模擬延遲
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// 封裝API響應
const mockResponse = (data, success = true, message = "請求成功") => {
  return {
    code: success ? 200 : 500,
    data,
    message,
    success
  };
};

// 過濾案件數據
const filterCaseData = (data, params) => {
  if (!params) return data;

  let filtered = [...data];

  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(
      item =>
        item.orderNumber.toLowerCase().includes(searchLower) ||
        item.originalOrderId.toLowerCase().includes(searchLower) ||
        item.customerName.toLowerCase().includes(searchLower)
    );
  }

  if (params.startDate && params.endDate) {
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.applyDate);
      const startDate = new Date(params.startDate);
      const endDate = new Date(params.endDate);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }

  return filtered;
};

// 過濾歷史記錄數據
const filterHistoryData = (data, params) => {
  if (!params) return data;

  let filtered = [...data];

  if (params.orderNumber) {
    filtered = filtered.filter(item => item.orderNumber === params.orderNumber);
  }

  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(
      item =>
        item.orderNumber.toLowerCase().includes(searchLower) ||
        item.user.toLowerCase().includes(searchLower) ||
        (item.afterValue && item.afterValue.toLowerCase().includes(searchLower))
    );
  }

  if (params.startDate && params.endDate) {
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.timestamp.split(" ")[0]);
      const startDate = new Date(params.startDate);
      const endDate = new Date(params.endDate);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }

  return filtered;
};

// Service物件
const AfterSalesService = {
  // 獲取售後案件列表
  getCaseList: async params => {
    try {
      // 在這裡可以替換為實際的API調用
      // return await axios.get('/api/aftersales/cases', { params });

      // 模擬API延遲
      await delay(800);

      // 過濾數據
      const filteredData = filterCaseData(mockCaseData, params);

      return mockResponse(filteredData);
    } catch (error) {
      console.error("獲取售後案件列表失敗:", error);
      return mockResponse([], false, error.message || "獲取售後案件列表失敗");
    }
  },

  // 創建售後案件
  createCase: async caseData => {
    try {
      // 在這裡可以替換為實際的API調用
      // return await axios.post('/api/aftersales/cases', caseData);

      // 模擬API延遲
      await delay(1000);

      // 生成新的案件ID
      const now = new Date();
      const dateStr = formatDate(now, "YYYYMMDD");
      const newCaseId = `AS-${dateStr}-${(mockCaseData.length + 1)
        .toString()
        .padStart(3, "0")}`;

      // 準備新案件數據
      const newCase = {
        ...caseData,
        orderNumber: newCaseId,
        lastUpdateTime: formatDate(now, "YYYY-MM-DD HH:mm:ss")
      };

      // 添加到模擬數據中
      mockCaseData.unshift(newCase);

      // 添加創建記錄到歷史數據
      mockHistoryData.unshift({
        id: `HIST-${mockHistoryData.length + 1}`,
        timestamp: formatDate(now, "YYYY-MM-DD HH:mm:ss"),
        orderNumber: newCaseId,
        user: caseData.processor || "系統",
        operationType: "create",
        field: "售後案件",
        beforeValue: null,
        afterValue: `${newCaseId} 已創建`
      });

      return mockResponse(newCase, true, "售後案件創建成功");
    } catch (error) {
      console.error("創建售後案件失敗:", error);
      return mockResponse(null, false, error.message || "創建售後案件失敗");
    }
  },

  // 更新售後案件
  updateCase: async caseData => {
    try {
      // 在這裡可以替換為實際的API調用
      // return await axios.put(`/api/aftersales/cases/${caseData.orderNumber}`, caseData);

      // 模擬API延遲
      await delay(1000);

      // 查找指定的案件
      const index = mockCaseData.findIndex(
        item => item.orderNumber === caseData.orderNumber
      );

      if (index === -1) {
        throw new Error("找不到指定的售後案件");
      }

      // 為了模擬歷史記錄，我們需要記錄原始數據
      const originalCase = { ...mockCaseData[index] };

      // 更新案件數據
      const now = new Date();
      const updatedCase = {
        ...originalCase,
        ...caseData,
        lastUpdateTime: formatDate(now, "YYYY-MM-DD HH:mm:ss")
      };

      mockCaseData[index] = updatedCase;

      // 檢查狀態是否變更，如有則添加歷史記錄
      if (originalCase.status !== updatedCase.status) {
        mockHistoryData.unshift({
          id: `HIST-${mockHistoryData.length + 1}`,
          timestamp: formatDate(now, "YYYY-MM-DD HH:mm:ss"),
          orderNumber: caseData.orderNumber,
          user: caseData.processor || "系統",
          operationType: "status",
          field: "處理狀態",
          beforeValue: originalCase.status,
          afterValue: updatedCase.status
        });
      }

      return mockResponse(updatedCase, true, "售後案件更新成功");
    } catch (error) {
      console.error("更新售後案件失敗:", error);
      return mockResponse(null, false, error.message || "更新售後案件失敗");
    }
  },

  // 更新售後案件狀態
  updateCaseStatus: async statusData => {
    try {
      // 在這裡可以替換為實際的API調用
      // return await axios.patch(`/api/aftersales/cases/${statusData.orderNumber}/status`, statusData);

      // 模擬API延遲
      await delay(800);

      // 查找指定的案件
      const index = mockCaseData.findIndex(
        item => item.orderNumber === statusData.orderNumber
      );

      if (index === -1) {
        throw new Error("找不到指定的售後案件");
      }

      // 記錄原狀態
      const originalStatus = mockCaseData[index].status;

      // 更新狀態
      mockCaseData[index].status = statusData.status;
      mockCaseData[index].lastUpdateTime = formatDate(
        new Date(),
        "YYYY-MM-DD HH:mm:ss"
      );

      // 添加歷史記錄
      mockHistoryData.unshift({
        id: `HIST-${mockHistoryData.length + 1}`,
        timestamp: formatDate(new Date(), "YYYY-MM-DD HH:mm:ss"),
        orderNumber: statusData.orderNumber,
        user: mockCaseData[index].processor || "系統",
        operationType: "status",
        field: "處理狀態",
        beforeValue: originalStatus,
        afterValue: statusData.status
      });

      return mockResponse(
        { orderNumber: statusData.orderNumber, status: statusData.status },
        true,
        "案件狀態更新成功"
      );
    } catch (error) {
      console.error("更新案件狀態失敗:", error);
      return mockResponse(null, false, error.message || "更新案件狀態失敗");
    }
  },

  // 獲取案件歷史記錄
  getCaseHistory: async params => {
    try {
      // 在這裡可以替換為實際的API調用
      // return await axios.get('/api/aftersales/history', { params });

      // 模擬API延遲
      await delay(700);

      // 過濾數據
      const filteredData = filterHistoryData(mockHistoryData, params);

      // 按時間排序
      const sortedData = filteredData.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      return mockResponse(sortedData);
    } catch (error) {
      console.error("獲取案件歷史記錄失敗:", error);
      return mockResponse([], false, error.message || "獲取案件歷史記錄失敗");
    }
  },

  // 獲取所有備註預覽
  getAllRemarkPreviews: async () => {
    try {
      // 在這裡可以替換為實際的API調用
      // return await axios.get('/api/aftersales/remarks/previews');

      // 模擬API延遲
      await delay(500);

      // 返回備註預覽
      return mockResponse(mockRemarks);
    } catch (error) {
      console.error("獲取備註預覽失敗:", error);
      return mockResponse({}, false, error.message || "獲取備註預覽失敗");
    }
  },

  // 獲取特定案件的備註
  getRemarks: async orderNumber => {
    try {
      // 在這裡可以替換為實際的API調用
      // return await axios.get(`/api/aftersales/cases/${orderNumber}/remarks`);

      // 模擬API延遲
      await delay(600);

      // 檢查該案件是否有備註
      const remarks = mockRemarks[orderNumber] || [];

      // 按時間排序 (新到舊)
      const sortedRemarks = remarks.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      return mockResponse({
        data: sortedRemarks,
        hasMore: false
      });
    } catch (error) {
      console.error("獲取備註失敗:", error);
      return mockResponse([], false, error.message || "獲取備註失敗");
    }
  },

  // 獲取更多備註 (分頁)
  getMoreRemarks: async (orderNumber, offset) => {
    try {
      // 在這裡可以替換為實際的API調用
      // return await axios.get(`/api/aftersales/cases/${orderNumber}/remarks?offset=${offset}`);

      // 模擬API延遲
      await delay(600);

      // 由於這只是模擬數據，我們假設沒有更多數據了
      return mockResponse({
        data: [],
        hasMore: false
      });
    } catch (error) {
      console.error("獲取更多備註失敗:", error);
      return mockResponse([], false, error.message || "獲取更多備註失敗");
    }
  },

  // 添加備註
  addRemark: async remarkData => {
    try {
      // 在這裡可以替換為實際的API調用
      // return await axios.post(`/api/aftersales/cases/${remarkData.orderNumber}/remarks`, remarkData);

      // 模擬API延遲
      await delay(700);

      // 創建新備註
      const now = new Date();
      const newRemark = {
        id: `RMK-${Date.now()}`,
        orderNumber: remarkData.orderNumber,
        createdBy: remarkData.createdBy || "當前用戶",
        createdAt: formatDate(now, "YYYY-MM-DD HH:mm:ss"),
        content: remarkData.content,
        isInternal: remarkData.isInternal || true
      };

      // 檢查該案件是否已有備註
      if (!mockRemarks[remarkData.orderNumber]) {
        mockRemarks[remarkData.orderNumber] = [];
      }

      // 添加新備註
      mockRemarks[remarkData.orderNumber].unshift(newRemark);

      // 添加歷史記錄
      mockHistoryData.unshift({
        id: `HIST-${mockHistoryData.length + 1}`,
        timestamp: newRemark.createdAt,
        orderNumber: remarkData.orderNumber,
        user: newRemark.createdBy,
        operationType: "remark",
        field: "備註",
        beforeValue: null,
        afterValue: remarkData.content
      });

      // 更新案件的最後更新時間
      const caseIndex = mockCaseData.findIndex(
        item => item.orderNumber === remarkData.orderNumber
      );
      if (caseIndex !== -1) {
        mockCaseData[caseIndex].lastUpdateTime = newRemark.createdAt;
      }

      return mockResponse(newRemark, true, "備註添加成功");
    } catch (error) {
      console.error("添加備註失敗:", error);
      return mockResponse(null, false, error.message || "添加備註失敗");
    }
  },

  // 更新備註
  updateRemark: async remarkData => {
    try {
      // 在這裡可以替換為實際的API調用
      // return await axios.put(`/api/aftersales/remarks/${remarkData.id}`, remarkData);

      // 模擬API延遲
      await delay(600);

      // 在所有備註中查找
      let foundRemark = null;
      let remarkCaseId = null;

      Object.entries(mockRemarks).forEach(([orderNumber, remarks]) => {
        const index = remarks.findIndex(r => r.id === remarkData.id);
        if (index !== -1) {
          foundRemark = remarks[index];
          remarkCaseId = orderNumber;
        }
      });

      if (!foundRemark) {
        throw new Error("找不到指定的備註");
      }

      // 記錄原內容
      const originalContent = foundRemark.content;

      // 更新備註內容
      foundRemark.content = remarkData.content;
      foundRemark.updatedAt = formatDate(new Date(), "YYYY-MM-DD HH:mm:ss");

      // 添加歷史記錄
      mockHistoryData.unshift({
        id: `HIST-${mockHistoryData.length + 1}`,
        timestamp: foundRemark.updatedAt,
        orderNumber: remarkCaseId,
        user: foundRemark.createdBy,
        operationType: "update",
        field: "備註",
        beforeValue: originalContent,
        afterValue: remarkData.content
      });

      return mockResponse(foundRemark, true, "備註更新成功");
    } catch (error) {
      console.error("更新備註失敗:", error);
      return mockResponse(null, false, error.message || "更新備註失敗");
    }
  },

  // 刪除備註
  deleteRemark: async remarkId => {
    try {
      // 在這裡可以替換為實際的API調用
      // return await axios.delete(`/api/aftersales/remarks/${remarkId}`);

      // 模擬API延遲
      await delay(600);

      // 在所有備註中查找並刪除
      let deletedRemark = null;
      let remarkCaseId = null;

      Object.entries(mockRemarks).forEach(([orderNumber, remarks]) => {
        const index = remarks.findIndex(r => r.id === remarkId);
        if (index !== -1) {
          deletedRemark = remarks[index];
          remarkCaseId = orderNumber;
          mockRemarks[orderNumber].splice(index, 1);
        }
      });

      if (!deletedRemark) {
        throw new Error("找不到指定的備註");
      }

      // 添加歷史記錄
      mockHistoryData.unshift({
        id: `HIST-${mockHistoryData.length + 1}`,
        timestamp: formatDate(new Date(), "YYYY-MM-DD HH:mm:ss"),
        orderNumber: remarkCaseId,
        user: deletedRemark.createdBy,
        operationType: "delete",
        field: "備註",
        beforeValue: deletedRemark.content,
        afterValue: null
      });

      return mockResponse({ id: remarkId }, true, "備註刪除成功");
    } catch (error) {
      console.error("刪除備註失敗:", error);
      return mockResponse(null, false, error.message || "刪除備註失敗");
    }
  },

  // 更新問題詳情
  updateProblemDetail: async detailData => {
    try {
      // 在這裡可以替換為實際的API調用
      // return await axios.put(`/api/aftersales/problems/${detailData.id}`, detailData);

      // 模擬API延遲
      await delay(900);

      // 查找案件
      const caseIndex = mockCaseData.findIndex(
        item => item.orderNumber === detailData.orderNumber
      );

      if (caseIndex === -1) {
        throw new Error("找不到相關售後案件");
      }

      // 查找問題詳情
      const detailIndex = mockCaseData[caseIndex].problemDetails.findIndex(
        item => item.id === detailData.id
      );

      if (detailIndex === -1) {
        // 如果找不到，則為新增
        detailData.id = `PD${mockCaseData[caseIndex].problemDetails.length +
          1}`.padStart(5, "0");
        mockCaseData[caseIndex].problemDetails.push(detailData);
      } else {
        // 更新現有詳情
        mockCaseData[caseIndex].problemDetails[detailIndex] = {
          ...mockCaseData[caseIndex].problemDetails[detailIndex],
          ...detailData
        };
      }

      // 更新案件的最後更新時間
      mockCaseData[caseIndex].lastUpdateTime = formatDate(
        new Date(),
        "YYYY-MM-DD HH:mm:ss"
      );

      return mockResponse(detailData, true, "問題詳情更新成功");
    } catch (error) {
      console.error("更新問題詳情失敗:", error);
      return mockResponse(null, false, error.message || "更新問題詳情失敗");
    }
  },

  // 更新退換貨處理
  updateReturnExchange: async returnData => {
    try {
      // 在這裡可以替換為實際的API調用
      // return await axios.put(`/api/aftersales/returns/${returnData.id}`, returnData);

      // 模擬API延遲
      await delay(900);

      // 查找案件
      const caseIndex = mockCaseData.findIndex(
        item => item.orderNumber === returnData.orderNumber
      );

      if (caseIndex === -1) {
        throw new Error("找不到相關售後案件");
      }

      // 查找退換貨詳情
      const returnIndex = mockCaseData[
        caseIndex
      ].returnExchangeDetails.findIndex(item => item.id === returnData.id);

      if (returnIndex === -1) {
        // 如果找不到，則為新增
        returnData.id = `RE${mockCaseData[caseIndex].returnExchangeDetails
          .length + 1}`.padStart(5, "0");
        mockCaseData[caseIndex].returnExchangeDetails.push(returnData);
      } else {
        // 更新現有詳情
        mockCaseData[caseIndex].returnExchangeDetails[returnIndex] = {
          ...mockCaseData[caseIndex].returnExchangeDetails[returnIndex],
          ...returnData
        };
      }

      // 更新案件的最後更新時間
      mockCaseData[caseIndex].lastUpdateTime = formatDate(
        new Date(),
        "YYYY-MM-DD HH:mm:ss"
      );

      return mockResponse(returnData, true, "退換貨處理更新成功");
    } catch (error) {
      console.error("更新退換貨處理失敗:", error);
      return mockResponse(null, false, error.message || "更新退換貨處理失敗");
    }
  },

  // 批量更新狀態
  batchUpdateStatus: async batchData => {
    try {
      // 在這裡可以替換為實際的API調用
      // return await axios.patch('/api/aftersales/cases/batch/status', batchData);

      // 模擬API延遲
      await delay(1000);

      const { caseIds, status } = batchData;
      const now = formatDate(new Date(), "YYYY-MM-DD HH:mm:ss");
      const updatedCases = [];

      // 批量更新狀態
      caseIds.forEach(orderNumber => {
        const caseIndex = mockCaseData.findIndex(
          item => item.orderNumber === orderNumber
        );

        if (caseIndex !== -1) {
          // 記錄原狀態
          const originalStatus = mockCaseData[caseIndex].status;

          // 更新狀態
          mockCaseData[caseIndex].status = status;
          mockCaseData[caseIndex].lastUpdateTime = now;

          updatedCases.push(mockCaseData[caseIndex]);

          // 添加歷史記錄
          mockHistoryData.unshift({
            id: `HIST-${mockHistoryData.length + 1}`,
            timestamp: now,
            orderNumber: orderNumber,
            user: mockCaseData[caseIndex].processor || "系統",
            operationType: "status",
            field: "處理狀態",
            beforeValue: originalStatus,
            afterValue: status
          });
        }
      });

      return mockResponse(
        {
          updatedCount: updatedCases.length,
          updatedCases
        },
        true,
        `成功更新${updatedCases.length}個案件狀態`
      );
    } catch (error) {
      console.error("批量更新狀態失敗:", error);
      return mockResponse(null, false, error.message || "批量更新狀態失敗");
    }
  },

  // 批量分配處理人員
  batchAssignStaff: async batchData => {
    try {
      // 在這裡可以替換為實際的API調用
      // return await axios.patch('/api/aftersales/cases/batch/assign', batchData);

      // 模擬API延遲
      await delay(1000);

      const { caseIds, processor } = batchData;
      const now = formatDate(new Date(), "YYYY-MM-DD HH:mm:ss");
      const updatedCases = [];

      // 批量更新處理人員
      caseIds.forEach(orderNumber => {
        const caseIndex = mockCaseData.findIndex(
          item => item.orderNumber === orderNumber
        );

        if (caseIndex !== -1) {
          // 記錄原處理人員
          const originalProcessor = mockCaseData[caseIndex].processor;

          // 更新處理人員
          mockCaseData[caseIndex].processor = processor;
          mockCaseData[caseIndex].lastUpdateTime = now;

          updatedCases.push(mockCaseData[caseIndex]);

          // 添加歷史記錄
          mockHistoryData.unshift({
            id: `HIST-${mockHistoryData.length + 1}`,
            timestamp: now,
            orderNumber: orderNumber,
            user: "系統",
            operationType: "update",
            field: "處理人員",
            beforeValue: originalProcessor || "未分配",
            afterValue: processor
          });
        }
      });

      return mockResponse(
        {
          updatedCount: updatedCases.length,
          updatedCases
        },
        true,
        `成功分配${updatedCases.length}個案件給${processor}`
      );
    } catch (error) {
      console.error("批量分配處理人員失敗:", error);
      return mockResponse(null, false, error.message || "批量分配處理人員失敗");
    }
  },

  // 導出案件數據
  exportCaseData: async () => {
    try {
      // 在這裡可以替換為實際的API調用
      // return await axios.get('/api/aftersales/export', { responseType: 'blob' });

      // 模擬API延遲
      await delay(1200);

      // 由於瀏覽器環境不能真正創建文件下載，這裡只返回成功信息
      // 實際應用中，後端會返回一個Blob對象，前端使用它創建下載
      return {
        data: new Blob(["模擬的文件內容"], {
          type: "application/vnd.ms-excel"
        }),
        success: true
      };
    } catch (error) {
      console.error("導出案件數據失敗:", error);
      return mockResponse(null, false, error.message || "導出案件數據失敗");
    }
  }
};

export default AfterSalesService;
