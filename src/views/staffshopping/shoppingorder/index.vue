<template>
  <div class="consumer-orders">
    <div class="page-header">
      <div class="title-container">
        <i class="el-icon-shopping-bag-1 title-icon"></i>
        <h1 class="page-title">我的訂單</h1>
      </div>
    </div>

    <!-- 搜索區域 -->
    <div class="search-section">
      <combined-search
        ref="searchComponent"
        :fields="searchFields"
        :show-fields="true"
        :show-time-search="true"
        :show-tags="true"
        :search-placeholder="'搜尋訂單'"
        :immediate-search="true"
        @search="handleSearch"
      />
    </div>

    <!-- 訂單列表區域 -->
    <div class="orders-list" v-loading="loading">
      <!-- 空數據顯示 -->
      <div v-if="filteredOrders.length === 0" class="empty-orders">
        <el-empty description="暫無訂單記錄" :image-size="120">
          <el-button type="primary" @click="goToShopping">
            繼續購物
          </el-button>
        </el-empty>
      </div>

      <!-- 訂單卡片列表 -->
      <div v-else class="order-cards">
        <div
          v-for="order in pagedOrders"
          :key="order.orderNumber"
          class="order-card"
        >
          <!-- 訂單頭部 (可點擊收合) -->
          <div class="order-header" @click="toggleOrderExpand(order)">
            <div class="order-number">
              <span class="label">訂單編號：</span>
              <span class="value">{{ order.orderNumber }}</span>
            </div>
            <div class="order-date">
              <span class="label">訂單日期：</span>
              <span class="value">{{ formatDate(order.orderDate) }}</span>
            </div>
            <!-- 訂單狀態 (已註解) -->
            <!-- <div class="order-status" v-if="order.status">
              <el-tag :type="getOrderStatusType(order.status)">
                {{ getOrderStatusText(order.status) }}
              </el-tag>
            </div> -->
            <div class="expand-icon">
              <i
                :class="
                  order.expanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'
                "
              ></i>
            </div>
          </div>

          <!-- 訂單內容區 (可收合) -->
          <div class="order-content" v-show="order.expanded">
            <!-- 商品列表（添加卷軸） -->
            <div class="product-list-container">
              <h3 class="section-title">商品明細</h3>
              <div class="product-list-scrollable">
                <div
                  v-for="item in order.details"
                  :key="item.id"
                  class="product-item"
                >
                  <div class="product-image">
                    <img :src="item.imageUrl" :alt="item.name" />
                  </div>
                  <div class="product-info">
                    <div class="product-name">{{ item.name }}</div>
                    <div class="product-price">
                      NT${{ item.price.toFixed(2) }} x {{ item.quantity }}
                    </div>
                  </div>
                  <div class="product-subtotal">
                    NT${{ (item.price * item.quantity).toFixed(2) }}
                  </div>
                </div>
              </div>
              <!-- 商品數量顯示 -->
              <div class="product-count">
                <span
                  >共 {{ order.details.length }} 種商品，{{
                    order.totalItems
                  }}
                  件</span
                >
              </div>
            </div>

            <!-- 訂單信息區 -->
            <div class="order-info">
              <!-- 收貨信息 -->
              <div class="info-section">
                <h3 class="section-title">收貨信息</h3>
                <div class="info-content">
                  <div class="info-item">
                    <span class="info-label">收件人：</span>
                    <span class="info-value">{{ order.receiverName }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">聯絡電話：</span>
                    <span class="info-value">{{ order.receiverPhone }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">收件地址：</span>
                    <span class="info-value">{{ order.receiverAddress }}</span>
                  </div>
                  <div class="info-item" v-if="order.shippingNotes">
                    <span class="info-label">運輸備註：</span>
                    <span
                      class="info-value multiline-text"
                      v-tooltip="order.shippingNotes"
                      >{{ order.shippingNotes }}</span
                    >
                  </div>
                </div>
              </div>

              <!-- 付款信息 -->
              <div class="info-section">
                <h3 class="section-title">付款信息</h3>
                <div class="info-content">
                  <div class="info-item">
                    <span class="info-label">付款方式：</span>
                    <span class="info-value">{{
                      getPaymentMethodText(order.paymentMethod)
                    }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">訂單總額：</span>
                    <span class="info-value total-amount"
                      >NT${{ order.totalAmount.toFixed(2) }}</span
                    >
                  </div>
                </div>
              </div>

              <!-- 訂單備註 -->
              <div class="info-section" v-if="order.orderNotes">
                <h3 class="section-title">訂單備註</h3>
                <div class="info-content">
                  <div class="info-item">
                    <span
                      class="info-value multiline-text"
                      v-tooltip="order.orderNotes"
                      >{{ order.orderNotes }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 訂單底部 -->
          <div class="order-footer" v-show="order.expanded">
            <div class="order-summary">
              <span class="label">商品數量：</span>
              <span class="value">{{ order.totalItems }} 件</span>
              <span class="label total">總計：</span>
              <span class="value total"
                >NT${{ order.totalAmount.toFixed(2) }}</span
              >
            </div>
            <div class="order-actions">
              <el-button
                size="small"
                type="primary"
                @click.stop="openCustomerService(order)"
              >
                <i class="el-icon-service"></i> 聯絡客服
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 優化的分頁組件 -->
      <responsive-pagination
        v-if="filteredOrders.length > 0"
        :current-page="currentPage"
        :page-size="pageSize"
        :total-count="filteredOrders.length"
        :page-sizes="[5, 10, 20, 50]"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="order-pagination"
      >
      </responsive-pagination>
    </div>

    <!-- 回到頂部按鈕 -->
    <el-backtop :right="20" :bottom="20">
      <div class="back-to-top">
        <i class="el-icon-arrow-up"></i>
      </div>
    </el-backtop>

    <!-- 客服對話框 -->
    <customer-service-dialog
      :visible.sync="customerServiceVisible"
      :order-info="currentServiceOrder"
      @close="customerServiceVisible = false"
    />
  </div>
</template>

<script>
import CombinedSearch from "@/components/SearchBox/CombinedSearch";
import CustomerServiceDialog from "./components/CustomerServiceDialog";
import ResponsivePagination from "@/components/Pagination/ResponsivePagination";

export default {
  name: "ConsumerOrders",

  components: {
    CombinedSearch,
    CustomerServiceDialog,
    ResponsivePagination
  },

  directives: {
    tooltip: {
      bind(el, binding) {
        if (binding.value) {
          el.setAttribute("title", binding.value);
          el.classList.add("has-tooltip");
        }
      },
      update(el, binding) {
        if (binding.value) {
          el.setAttribute("title", binding.value);
          el.classList.add("has-tooltip");
        } else {
          el.removeAttribute("title");
          el.classList.remove("has-tooltip");
        }
      }
    }
  },

  data() {
    return {
      // 加載狀態
      loading: false,

      // 篩選條件
      searchParams: {
        keyword: "",
        field: "",
        dateRange: []
      },

      // 分頁
      currentPage: 1,
      pageSize: 5,

      // 訂單數據
      orders: [],
      expandedOrders: {},

      // 客服對話框
      customerServiceVisible: false,
      currentServiceOrder: null,

      // 搜索欄位定義
      searchFields: [
        { label: "訂單編號", prop: "orderNumber" },
        { label: "商品名稱", prop: "itemName" }
      ],

      // 訂單狀態定義
      orderStatusOptions: [
        { value: 1, label: "已付款", type: "success" },
        { value: 2, label: "已出貨", type: "primary" },
        { value: 3, label: "已完成", type: "info" },
        { value: 4, label: "已取消", type: "danger" }
      ]
    };
  },

  computed: {
    // 過濾後的訂單數據（排序由新到舊）
    filteredOrders() {
      let result = [...this.orders];

      // 關鍵字搜索
      if (this.searchParams.keyword) {
        const keyword = this.searchParams.keyword.toLowerCase();
        const field = this.searchParams.field;

        if (field === "orderNumber") {
          result = result.filter(order =>
            order.orderNumber.toLowerCase().includes(keyword)
          );
        } else if (field === "itemName") {
          result = result.filter(
            order =>
              order.details &&
              order.details.some(item =>
                item.name.toLowerCase().includes(keyword)
              )
          );
        } else {
          // 搜索所有欄位
          result = result.filter(
            order =>
              order.orderNumber.toLowerCase().includes(keyword) ||
              (order.details &&
                order.details.some(item =>
                  item.name.toLowerCase().includes(keyword)
                ))
          );
        }
      }

      // 日期範圍篩選
      if (
        this.searchParams.dateRange &&
        this.searchParams.dateRange.length === 2
      ) {
        const startDate = new Date(this.searchParams.dateRange[0]);
        const endDate = new Date(this.searchParams.dateRange[1]);
        endDate.setHours(23, 59, 59, 999); // 設置為當天最後一秒

        result = result.filter(order => {
          const orderDate = new Date(order.orderDate);
          return orderDate >= startDate && orderDate <= endDate;
        });
      }

      // 按日期排序（由新到舊）
      result.sort((a, b) => {
        return new Date(b.orderDate) - new Date(a.orderDate);
      });

      return result;
    },

    // 當前頁的訂單
    pagedOrders() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredOrders.slice(start, end);
    }
  },

  created() {
    this.fetchOrders();
  },

  methods: {
    // 獲取訂單列表
    async fetchOrders() {
      this.loading = true;

      try {
        // 實際專案中應該調用 API
        // const response = await this.$api.getOrders();
        // this.orders = response.data;

        // 測試數據
        await this.mockFetchOrders();
      } catch (error) {
        console.error("獲取訂單列表失敗", error);
        this.$message.error("獲取訂單列表失敗，請稍後再試");
      } finally {
        this.loading = false;
      }
    },

    // 模擬獲取訂單數據（開發/測試用）
    async mockFetchOrders() {
      // 模擬延遲
      await new Promise(resolve => setTimeout(resolve, 800));

      const paymentMethods = ["bankTransfer", "creditCard", "mobilePay"];
      const mockOrders = [];

      // 生成隨機訂單
      for (let i = 0; i < 15; i++) {
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));

        const orderNumber = `ORD${orderDate.getFullYear()}${String(
          orderDate.getMonth() + 1
        ).padStart(2, "0")}${String(i + 1).padStart(4, "0")}`;
        const paymentMethod =
          paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

        // 生成訂單明細
        const itemCount = Math.floor(Math.random() * 3) + 8;
        const orderDetails = [];
        let totalAmount = 0;
        let totalItems = 0;

        for (let j = 0; j < itemCount; j++) {
          const price = Math.floor(Math.random() * 1000) + 100;
          const quantity = Math.floor(Math.random() * 3) + 1;
          totalAmount += price * quantity;
          totalItems += quantity;

          orderDetails.push({
            id: `item-${i}-${j}`,
            name: `商品 ${j + 1} ${Array(5)
              .fill(0)
              .map(() =>
                String.fromCharCode(Math.floor(Math.random() * 26) + 97)
              )
              .join("")}`,
            price: price,
            quantity: quantity,
            imageUrl: `https://via.placeholder.com/80x80?text=Item+${j + 1}`
          });
        }

        // 隨機訂單狀態
        const status = Math.floor(Math.random() * 4) + 1;

        // 隨機生成訂單備註和運輸備註
        const shippingNotesOptions = [
          "請在上班時間送達",
          "週末不在家，請提前聯繫",
          "請送貨到警衛室，謝謝！",
          "大樓需要事先預約，請提前聯繫。聯絡方式：警衛室 02-1234-5678",
          ""
        ];

        const orderNotesOptions = [
          "有贈品請一併寄送",
          "請確認包裝完好再出貨",
          "這是送給朋友的禮物，希望包裝美觀一些",
          "產品如有缺貨請先通知，不要直接替換其他型號",
          "這是一個非常長的訂單備註，用來測試當文字內容過長時的顯示效果。希望能夠正確處理這種情況，讓用戶可以通過提示窗查看完整內容，而不是將文字截斷顯示省略號。這對於提升用戶體驗非常重要，尤其是當用戶需要查看詳細訂單信息時。",
          ""
        ];

        // 生成訂單並設置預設為收合狀態
        const newOrder = {
          orderNumber: orderNumber,
          orderDate: orderDate.toISOString(),
          totalAmount: totalAmount,
          totalItems: totalItems,
          receiverName: "王小明",
          receiverPhone: "0912345678",
          receiverAddress: "台北市信義區松高路123號",
          paymentMethod: paymentMethod,
          details: orderDetails,
          shippingNotes:
            Math.random() > 0.5
              ? shippingNotesOptions[
                  Math.floor(Math.random() * shippingNotesOptions.length)
                ]
              : "",
          orderNotes:
            Math.random() > 0.5
              ? orderNotesOptions[
                  Math.floor(Math.random() * orderNotesOptions.length)
                ]
              : "",
          status: status,
          expanded: false // 預設收合狀態
        };

        mockOrders.push(newOrder);
      }

      this.orders = mockOrders;
    },

    // 處理搜索
    handleSearch(params) {
      this.searchParams = params;
      this.currentPage = 1; // 重置到第一頁
    },

    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
    },

    // 獲取支付方式文字
    getPaymentMethodText(method) {
      const methodMap = {
        bankTransfer: "銀行轉帳",
        creditCard: "信用卡",
        mobilePay: "行動支付"
      };
      return methodMap[method] || method;
    },

    // 獲取訂單狀態文字
    getOrderStatusText(status) {
      const option = this.orderStatusOptions.find(opt => opt.value === status);
      return option ? option.label : "未知狀態";
    },

    // 獲取訂單狀態顏色類型
    getOrderStatusType(status) {
      const option = this.orderStatusOptions.find(opt => opt.value === status);
      return option ? option.type : "";
    },

    // 切換訂單展開/收合狀態
    toggleOrderExpand(order) {
      // 使用Vue的響應式特性直接更新expanded屬性
      this.$set(order, "expanded", !order.expanded);
    },

    // 打開客服對話框
    openCustomerService(order) {
      this.currentServiceOrder = order;
      this.customerServiceVisible = true;
    },

    // 分頁處理
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
    },

    handleCurrentChange(val) {
      this.currentPage = val;
    },

    // 繼續購物 (已移除但保留方法供未來使用)
    goToShopping() {
      this.$router.push("/shop");
    }
  }
};
</script>

<style lang="scss" scoped>
// 變量定義
$primary-color: #1890ff;
$success-color: #52c41a;
$warning-color: #faad14;
$danger-color: #ff4d4f;
$border-radius: 8px;
$box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

// 字體大小
$font-size-s: 14px;
$font-size-base: 16px;
$font-size-lg: 18px;
$font-size-xl: 24px;

.consumer-orders {
  width: 100%;
  padding: 16px;
  background-color: #f7f8fa;
  min-height: 100vh;

  // 頁面標題區域
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;

    .title-container {
      display: flex;
      align-items: center;
    }

    .title-icon {
      font-size: 28px;
      color: $primary-color;
      margin-right: 12px;
    }

    .page-title {
      font-size: $font-size-xl;
      color: #303133;
      margin: 0;
      font-weight: 600;
    }
  }

  // 搜索區域
  .search-section {
    margin-bottom: 16px;
    padding: 16px;
  }

  // 訂單列表區域
  .orders-list {
    margin-top: 20px;

    // 空數據顯示
    .empty-orders {
      background-color: #fff;
      border-radius: $border-radius;
      padding: 40px 0;
      box-shadow: $box-shadow;
    }

    // 訂單卡片列表
    .order-cards {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    // 訂單卡片
    .order-card {
      background-color: #fff;
      border-radius: $border-radius;
      overflow: hidden;
      box-shadow: $box-shadow;

      // 訂單頭部 (添加收合功能和樣式)
      .order-header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        padding: 12px 16px;
        background-color: #f8f9fc;
        border-bottom: 1px solid #ebeef5;
        cursor: pointer;
        transition: background-color 0.3s;
        position: relative;

        &:hover {
          background-color: #ecf5ff;
        }

        .order-number {
          flex: 2;
          font-weight: 600;
          color: $primary-color;

          .label {
            color: #606266;
            font-weight: normal;
            margin-right: 5px;
          }
        }

        .order-date {
          flex: 2;

          .label {
            color: #909399;
            margin-right: 5px;
          }
        }

        .expand-icon {
          flex: 0 0 30px;
          text-align: center;
          color: #909399;
          transition: transform 0.3s;

          i {
            font-size: 16px;
          }
        }
      }

      // 訂單內容區
      .order-content {
        padding: 16px;
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        border-bottom: 1px solid #ebeef5;

        // 商品列表容器
        .product-list-container {
          flex: 3;
          min-width: 300px;
          display: flex;
          flex-direction: column;

          .section-title {
            font-size: $font-size-base;
            margin: 0 0 8px 0;
            color: #303133;
            font-weight: 600;
          }

          // 商品列表卷軸區域
          .product-list-scrollable {
            max-height: 320px;
            overflow-y: auto;
            border: 1px solid #ebeef5;
            border-radius: 4px;
            padding: 0 8px;

            // 卷軸樣式
            &::-webkit-scrollbar {
              width: 6px;
            }

            &::-webkit-scrollbar-track {
              background: #f5f7fa;
              border-radius: 3px;
            }

            &::-webkit-scrollbar-thumb {
              background: #c0c4cc;
              border-radius: 3px;
            }

            &::-webkit-scrollbar-thumb:hover {
              background: #909399;
            }

            // Firefox 卷軸
            scrollbar-width: thin;
            scrollbar-color: #c0c4cc #f5f7fa;
          }

          // 商品數量顯示
          .product-count {
            margin-top: 8px;
            color: #606266;
            font-size: $font-size-s;
            text-align: right;
          }

          .product-item {
            display: flex;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #f0f0f0;

            &:last-child {
              border-bottom: none;
            }

            .product-image {
              width: 60px;
              height: 60px;
              margin-right: 12px;
              border-radius: 4px;
              overflow: hidden;

              img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
            }

            .product-info {
              flex: 1;
              overflow: hidden;

              .product-name {
                font-size: $font-size-base;
                margin-bottom: 5px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .product-price {
                color: #606266;
                font-size: $font-size-s;
              }
            }

            .product-subtotal {
              width: 100px;
              text-align: right;
              color: $danger-color;
              font-weight: 500;
            }
          }
        }

        // 訂單信息區
        .order-info {
          flex: 2;
          min-width: 250px;

          // 信息分區
          .info-section {
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 1px solid #f0f0f0;

            &:last-child {
              border-bottom: none;
              margin-bottom: 0;
              padding-bottom: 0;
            }

            .section-title {
              font-size: $font-size-base;
              margin: 0 0 8px 0;
              color: #303133;
              font-weight: 600;
            }

            .info-content {
              .info-item {
                margin-bottom: 6px;
                display: flex;

                &:last-child {
                  margin-bottom: 0;
                }

                .info-label {
                  width: 80px;
                  color: #909399;
                  flex-shrink: 0;
                }

                .info-value {
                  flex: 1;
                  color: #606266;

                  &.total-amount {
                    color: $danger-color;
                    font-weight: 600;
                  }
                }

                // 多行文本
                .multiline-text {
                  white-space: pre-wrap;
                  word-break: break-word;
                  position: relative;

                  &.has-tooltip {
                    border-bottom: 1px dashed #c0c4cc;
                    cursor: help;
                  }

                  &:hover {
                    color: $primary-color;
                  }
                }
              }
            }
          }
        }
      }

      // 訂單底部
      .order-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background-color: #f8f9fc;

        .order-summary {
          .label {
            color: #606266;
            margin-right: 5px;

            &.total {
              margin-left: 16px;
              font-weight: 600;
            }
          }

          .value {
            margin-right: 16px;

            &.total {
              color: $danger-color;
              font-weight: 600;
            }
          }
        }

        .order-actions {
          display: flex;
          gap: 8px;
        }
      }
    }
  }

  // 分頁器
  .order-pagination {
    margin-top: 20px;
  }

  // 返回頂部按鈕樣式
  .back-to-top {
    width: 40px;
    height: 40px;
    background-color: $primary-color;
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);

    i {
      font-size: 20px;
    }
  }
}

/* 響應式調整 */
@media (max-width: 768px) {
  .consumer-orders {
    padding: 12px;

    .page-header {
      flex-direction: column;
      align-items: flex-start;

      .title-container {
        margin-bottom: 12px;
      }
    }

    .search-section {
      padding: 12px;
    }

    .orders-list {
      .order-card {
        .order-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          position: relative;
          padding-right: 40px; // 為展開圖標預留空間

          .expand-icon {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
          }
        }

        .order-content {
          flex-direction: column;

          .product-list-container,
          .order-info {
            width: 100%;
          }

          .product-list-container {
            .product-list-scrollable {
              max-height: 280px;
            }

            .product-item {
              .product-image {
                width: 50px;
                height: 50px;
              }

              .product-name {
                font-size: $font-size-s;
              }
            }
          }
        }

        .order-footer {
          flex-direction: column;
          gap: 10px;

          .order-summary {
            width: 100%;
          }

          .order-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .consumer-orders {
    padding: 8px;

    .search-section {
      padding: 10px;
      margin-bottom: 10px;
    }

    .orders-list {
      .order-card {
        .order-header {
          padding: 10px;
          padding-right: 36px;

          .expand-icon {
            right: 10px;
          }
        }

        .order-content {
          padding: 10px;

          .product-list-container {
            .product-list-scrollable {
              max-height: 240px;
            }

            .product-item {
              .product-image {
                width: 40px;
                height: 40px;
              }

              .product-subtotal {
                width: 80px;
              }
            }
          }

          .info-section {
            .info-item {
              flex-direction: column;
              margin-bottom: 10px;

              .info-label {
                width: 100%;
                margin-bottom: 4px;
              }
            }
          }
        }

        .order-footer {
          padding: 10px;

          .order-summary {
            display: flex;
            flex-wrap: wrap;

            .label,
            .value {
              margin-right: 8px;

              &.total {
                margin-left: 0;
                margin-top: 5px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
