// client/src/views/wms/multiSku/services/MultiSkuService.js
import { itemApi, materialCategoryApi, historyApi } from "@/api/shop";

/**
 * MultiSkuService - 提供品號管理相關的數據與操作
 */
export default class MultiSkuService {
  /**
   * 獲取品號清單
   * @returns {Promise<Array>} 品號資料陣列
   */
  static async getProductList() {
    try {
      const response = await itemApi.getItems();
      console.log("品號API回應:", response); // 除錯用

      // 檢查API回應格式是否正確
      if (
        response &&
        response.code === 200 &&
        response.data &&
        response.data.results
      ) {
        // 使用 response.data.results 而非 response.data
        return response.data.results.map(item => ({
          id: item.id,
          productCode: item.item_code,
          productName: item.name,
          categorys: item.material_category ? item.material_category_name : "",
          specification: item.specification,
          unit: item.unit,
          boxSize: item.box_size,
          status: item.status,
          createdBy: item.created_by,
          createdAt: item.create_time,
          updatedBy: item.updated_by,
          updatedAt: item.update_time,
          remark: item.remark
        }));
      }

      // 如果找不到資料或格式不對，返回空陣列
      console.warn("API回應格式不符合預期:", response);
      return [];
    } catch (error) {
      console.error("獲取品號資料失敗:", error);
      throw error;
    }
  }

  /**
   * 獲取品號異動記錄
   * @param {Object} params 查詢參數 (可選)
   * @param {Number} itemId 品號ID (必須)
   * @returns {Promise<Array>} 品號異動記錄陣列
   */
  static async getProductHistoryList(params, itemId) {
    try {
      if (!itemId) {
        console.warn("未提供品號ID，無法獲取歷史記錄");
        return [];
      }

      const response = await itemApi.getItemHistory(itemId, params);
      console.log("異動記錄API回應:", response);

      if (
        response &&
        response.code === 200 &&
        response.data &&
        response.data.results
      ) {
        return response.data.results.map(history => {
          let type = "update";
          if (history.history_type === "+") type = "create";
          else if (history.history_type === "-") type = "delete";

          const changes = [];
          if (history.changes) {
            Object.keys(history.changes).forEach(field => {
              const change = history.changes[field];
              changes.push({
                field,
                oldValue: change.from,
                newValue: change.to
              });
            });
          }

          return {
            id: history.history_id || history.id,
            datetime: history.history_date,
            type,
            productCode: history.item_code || "", // 後端要有這欄才有值
            changedFields: changes,
            operator: history.history_user_name || "未知使用者",
            remark: history.history_change_reason || "異動品號資料"
          };
        });
      }

      console.warn("異動記錄API回應格式不符合預期:", response);
      return [];
    } catch (error) {
      console.error("獲取品號異動記錄失敗:", error);
      throw error;
    }
  }

  /**
   * 查詢最近異動的品號記錄（不限單一品號）
   * @param {Number} days - 要查詢的天數（預設 7 天）
   * @returns {Promise<Array>} 最近異動的品號記錄
   */
  static async getRecentProductHistoryList(days = 7) {
    try {
      const response = await historyApi.getItemRecentHistory(days);
      console.log("最近異動品號記錄 API 回應:", response);

      if (
        response &&
        response.code === 200 &&
        response.data &&
        response.data.results
      ) {
        return response.data.results.map(history => {
          let type = "update";
          if (history.history_type === "+") type = "create";
          else if (history.history_type === "~") type = "update";
          else if (history.history_type === "-") type = "delete";

          // 取得品號代碼（優先從 instance，其次從 delta）
          let productCode = "";
          if (history.instance && history.instance.item_code) {
            productCode = history.instance.item_code;
          } else if (history.delta && history.delta.item_code) {
            productCode = history.delta.item_code;
          }

          // 回傳格式統一
          return {
            id: history.history_id || history.id,
            datetime: history.history_date,
            type,
            productCode,
            changes: history.changes || {}, // ✅ 統一支援 row.changes 結構
            operator: history.history_user_name || "",
            reason: history.history_change_reason || "異動品號資料"
          };
        });
      }

      console.warn("最近異動品號記錄 API 回應格式不符:", response);
      return [];
    } catch (error) {
      console.error("獲取最近異動品號記錄失敗:", error);
      throw error;
    }
  }

  /**
   * 獲取物料類別清單
   * @returns {Promise<Array>} 物料類別陣列
   */
  static async getProductCategories() {
    try {
      // 使用 materialCategoryApi 而非 categoryApi
      const response = await materialCategoryApi.getMaterialCategories();
      console.log("物料類別API回應:", response); // 除錯用

      // 檢查API回應格式是否正確
      if (
        response &&
        response.code === 200 &&
        response.data &&
        response.data.results
      ) {
        // 使用 response.data.results 而非 response.data
        return response.data.results.map(category => ({
          id: category.id,
          label: category.name,
          value: category.id,
          description: category.description || "",
          itemCount: category.item_count || 0
        }));
      }

      // 如果找不到資料或格式不對，返回空陣列
      console.warn("物料類別API回應格式不符合預期:", response);
      return [];
    } catch (error) {
      console.error("獲取物料類別失敗:", error);
      throw error;
    }
  }

  /**
   * 儲存品號資訊
   * @param {Object} productData 品號資料
   * @returns {Promise<Object>} 儲存結果
   */
  static async saveProduct(productData) {
    try {
      // 將前端資料格式轉換為 API 要求的格式
      const apiData = {
        item_code: productData.productCode,
        name: productData.productName,
        material_category: productData.categorys, // 使用 material_category 而不是 category
        specification: productData.specification,
        unit: productData.unit,
        box_size: productData.boxSize,
        status: productData.status,
        remark: productData.remark
      };

      let response;
      if (productData.id) {
        // 更新現有品號
        response = await itemApi.updateItem(productData.id, apiData);
      } else {
        // 新增品號
        response = await itemApi.createItem(apiData);
      }

      console.log("儲存品號回應:", response); // 除錯用

      // 檢查API回應是否成功
      if (
        response &&
        (response.code === 200 || response.code === 201) &&
        response.data
      ) {
        return {
          success: true,
          message: productData.id ? "品號資料更新成功" : "品號資料新增成功",
          data: response.data
        };
      } else {
        return {
          success: false,
          message: "儲存品號失敗: API回應格式不符合預期",
          data: null
        };
      }
    } catch (error) {
      console.error("儲存品號資料失敗:", error);
      const errorDetail =
        error.response && error.response.data && error.response.data.detail
          ? error.response.data.detail
          : error.message;
      return {
        success: false,
        message: `儲存品號資料失敗: ${errorDetail}`,
        error
      };
    }
  }

  /**
   * 批次匯入品號
   * @param {Array} productList 品號資料列表
   * @returns {Promise<Object>} 匯入結果
   */
  static async batchImportProducts(productList) {
    try {
      // 注意：此API在提供的shop.js中沒有對應的方法
      // 這裡需要自行實現或使用一個逐一創建的方法

      const successItems = [];
      const failItems = [];

      // 逐一處理每個品號
      for (const product of productList) {
        try {
          const apiData = {
            item_code: product.productCode,
            name: product.productName,
            material_category: product.categorys, // 使用 material_category 而不是 category
            specification: product.specification,
            unit: product.unit,
            box_size: product.boxSize,
            status: product.status || true,
            remark: product.remark
          };

          const response = await itemApi.createItem(apiData);

          // 檢查API回應是否成功
          if (response && response.code === 201 && response.data) {
            successItems.push(product);
          } else {
            failItems.push({
              item: product,
              error: "API回應格式不符合預期"
            });
          }
        } catch (error) {
          const errorDetail =
            error.response && error.response.data && error.response.data.detail
              ? error.response.data.detail
              : error.message;
          failItems.push({
            item: product,
            error: errorDetail
          });
        }
      }

      return {
        success: failItems.length === 0,
        message: `批次匯入完成，成功：${successItems.length}筆，失敗：${
          failItems.length
        }筆`,
        detail: {
          successCount: successItems.length,
          failCount: failItems.length,
          failItems
        }
      };
    } catch (error) {
      console.error("批次匯入品號失敗:", error);
      return {
        success: false,
        message: `批次匯入品號失敗: ${error.message}`,
        error
      };
    }
  }

  /**
   * 刪除品號
   * @param {String} productCode 品號
   * @returns {Promise<Object>} 刪除結果
   */
  static async deleteProduct(productCode) {
    try {
      // 需要先獲取品號的 ID
      const itemsResponse = await itemApi.getItems({
        search: productCode
      });
      console.log("查詢品號回應:", itemsResponse); // 除錯用

      // 檢查API回應格式是否正確
      if (
        !(
          itemsResponse &&
          itemsResponse.code === 200 &&
          itemsResponse.data &&
          itemsResponse.data.results
        )
      ) {
        return {
          success: false,
          message: "查詢品號失敗: API回應格式不符合預期"
        };
      }

      const items = itemsResponse.data.results;
      const item = items.find(item => item.item_code === productCode);

      if (!item) {
        throw new Error(`找不到品號: ${productCode}`);
      }

      const deleteResponse = await itemApi.deleteItem(item.id);
      console.log("刪除品號回應:", deleteResponse); // 除錯用

      // 檢查刪除操作回應 (通常是 204 No Content)
      const isSuccess =
        deleteResponse === undefined ||
        deleteResponse === "" ||
        deleteResponse === null ||
        (deleteResponse &&
          (deleteResponse.code === 204 || deleteResponse.code === 200));

      if (isSuccess) {
        return {
          success: true,
          message: `品號 ${productCode} 已成功刪除`
        };
      } else {
        return {
          success: false,
          message: "刪除品號失敗: API回應格式不符合預期"
        };
      }
    } catch (error) {
      console.error("刪除品號失敗:", error);
      const errorDetail =
        error.response && error.response.data && error.response.data.detail
          ? error.response.data.detail
          : error.message;
      return {
        success: false,
        message: `刪除品號失敗: ${errorDetail}`,
        error
      };
    }
  }
}
