import { materialCategoryApi } from "@/api/shop";

class WarehouseCategoryService {
  constructor() {
    // 不再使用 mock 資料
    this.useMock = false;
  }

  /**
   * 轉換類別數據格式（從後端到前端）
   * @private
   * @param {Object} item 後端返回的類別項目
   * @returns {Object} 轉換後的類別項目
   */
  _convertCategoryFormat(item) {
    return {
      id: item.id,
      name: item.name,
      description: item.description || "",
      productCount: item.item_count || 0,
      createTime: item.create_time,
      updateTime: item.update_time
    };
  }

  /**
   * 檢查 API 響應是否成功
   * @private
   * @param {Object} response API 響應
   * @returns {boolean} 是否成功
   */
  _isSuccessResponse(response) {
    return response && (response.code === 200 || response.code === 201);
  }

  /**
   * 獲取所有類別
   * @returns {Promise<Array>} 類別列表
   */
  async fetchAllCategories() {
    try {
      const response = await materialCategoryApi.getMaterialCategories();

      // 獲取列表數據
      const categories =
        response.data && response.data.results ? response.data.results : [];

      // 將後端數據格式轉換為前端需要的格式
      return categories.map(item => this._convertCategoryFormat(item));
    } catch (error) {
      console.error("獲取所有類別失敗", error);
      throw error;
    }
  }

  /**
   * 搜尋類別
   * @param {string} keyword 搜尋關鍵字
   * @returns {Promise<Array>} 搜尋結果
   */
  async searchCategories(keyword) {
    try {
      const response = await materialCategoryApi.getMaterialCategories({
        search: keyword
      });

      // 獲取列表數據
      const categories =
        response.data && response.data.results ? response.data.results : [];

      // 將後端數據格式轉換為前端需要的格式
      return categories.map(item => this._convertCategoryFormat(item));
    } catch (error) {
      console.error("搜尋類別失敗", error);
      throw error;
    }
  }

  /**
   * 新增類別
   * @param {Object} data 類別數據
   * @returns {Promise<Object>} 新增結果
   */
  async addCategory(data) {
    try {
      const response = await materialCategoryApi.createMaterialCategory(data);

      // 檢查 API 響應的 code 是否為成功（200或201）
      const isSuccess = this._isSuccessResponse(response);

      // 轉換後端返回的數據
      const convertedData = isSuccess
        ? this._convertCategoryFormat(response.data)
        : null;

      return {
        success: isSuccess,
        data: convertedData,
        message: isSuccess ? "新增成功" : response.msg || "新增失敗"
      };
    } catch (error) {
      console.error("新增類別失敗", error);
      throw error;
    }
  }

  /**
   * 更新類別
   * @param {Object} data 類別數據
   * @returns {Promise<Object>} 更新結果
   */
  async updateCategory(data) {
    try {
      const response = await materialCategoryApi.updateMaterialCategory(
        data.id,
        data
      );

      // 檢查 API 響應的 code 是否為成功（200或201）
      const isSuccess = this._isSuccessResponse(response);

      // 轉換後端返回的數據
      const convertedData = isSuccess
        ? this._convertCategoryFormat(response.data)
        : null;

      return {
        success: isSuccess,
        data: convertedData,
        message: isSuccess ? "更新成功" : response.msg || "更新失敗"
      };
    } catch (error) {
      console.error("更新類別失敗", error);
      throw error;
    }
  }

  /**
   * 刪除類別
   * @param {number|string} id 類別ID
   * @returns {Promise<Object>} 刪除結果
   */
  async deleteCategory(id) {
    try {
      const response = await materialCategoryApi.deleteMaterialCategory(id);

      // 檢查 API 響應的 code 是否為成功（200或201或204）
      const isSuccess =
        response.code === 200 || response.code === 201 || response.code === 204;

      return {
        success: isSuccess,
        message: isSuccess ? "刪除成功" : response.msg || "刪除失敗"
      };
    } catch (error) {
      console.error("刪除類別失敗", error);
      throw error;
    }
  }

  /**
   * 獲取類別關聯的產品
   * @param {number|string} categoryId 類別ID
   * @returns {Promise<Array>} 產品列表
   */
  async fetchProductsByCategory(categoryId) {
    try {
      const response = await materialCategoryApi.getMaterialCategoryItems(
        categoryId
      );

      // 獲取列表數據
      const products =
        response.data && response.data.results ? response.data.results : [];

      // 格式化回傳數據，確保有 productCode、productName 和 specification 欄位
      return products.map(item => ({
        productCode: item.code || item.item_code || "",
        productName: item.name || item.item_name || "",
        specification: item.specification || ""
      }));
    } catch (error) {
      console.error("獲取類別產品失敗", error);
      throw error;
    }
  }

  /**
   * 獲取樹狀結構的類別
   * @returns {Promise<Array>} 樹狀結構的類別
   */
  async fetchCategoryTree() {
    try {
      const response = await materialCategoryApi.getMaterialCategoryTree();

      // 獲取樹狀數據
      const treeData = response.data || [];

      // 遞歸轉換樹狀結構
      const convertTree = nodes => {
        return nodes.map(node => ({
          id: node.id,
          name: node.name,
          description: node.description || "",
          productCount: node.item_count || 0,
          createTime: node.create_time,
          updateTime: node.update_time,
          children: node.children ? convertTree(node.children) : []
        }));
      };

      return convertTree(treeData);
    } catch (error) {
      console.error("獲取類別樹失敗", error);
      throw error;
    }
  }

  /**
   * 獲取特定類別
   * @param {number|string} id 類別ID
   * @returns {Promise<Object>} 類別詳情
   */
  async fetchCategoryDetail(id) {
    try {
      const response = await materialCategoryApi.getMaterialCategory(id);
      return this._convertCategoryFormat(response.data);
    } catch (error) {
      console.error("獲取類別詳情失敗", error);
      throw error;
    }
  }

  /**
   * 獲取物料類別分布統計
   * @returns {Promise<Object>} 統計數據
   */
  async fetchCategoryDistribution() {
    try {
      const response = await materialCategoryApi.getMaterialCategoryDistribution();
      return response.data || {};
    } catch (error) {
      console.error("獲取類別分布統計失敗", error);
      throw error;
    }
  }
}

export default new WarehouseCategoryService();
