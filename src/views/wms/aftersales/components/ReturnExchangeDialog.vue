<template>
  <el-dialog
    :title="isEdit ? '編輯退換貨處理明細' : '新增退換貨處理明細'"
    :visible.sync="dialogVisible"
    width="700px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form
      ref="form"
      :model="formData"
      :rules="rules"
      label-width="120px"
      size="small"
    >
      <el-form-item label="處理單號" prop="processingId">
        <el-input
          v-model="formData.processingId"
          placeholder="系統自動生成"
          disabled
          v-if="isEdit"
        ></el-input>
        <el-input
          v-model="formData.processingId"
          placeholder="系統自動生成，可不填"
          disabled
          v-else
        ></el-input>
      </el-form-item>

      <el-form-item label="處理類型" prop="processingType">
        <el-select
          v-model="formData.processingType"
          placeholder="請選擇處理類型"
          style="width: 100%"
          @change="handleProcessingTypeChange"
        >
          <el-option value="退貨" label="退貨"></el-option>
          <el-option value="換貨" label="換貨"></el-option>
          <el-option value="補寄" label="補寄"></el-option>
          <el-option value="退款" label="退款"></el-option>
          <el-option value="折讓" label="折讓"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="處理狀態" prop="returnExchangeStatus">
        <el-select
          v-model="formData.returnExchangeStatus"
          placeholder="請選擇處理狀態"
          style="width: 100%"
        >
          <el-option
            v-for="option in statusOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item
        label="退款金額"
        v-if="showRefundAmount"
        prop="refundAmount"
      >
        <el-input-number
          v-model="formData.refundAmount"
          :precision="0"
          :step="100"
          :min="0"
          controls-position="right"
          style="width: 200px"
        ></el-input-number>
        <span class="amount-label">元</span>
      </el-form-item>

      <el-form-item label="處理商品明細">
        <div class="items-table-wrapper">
          <el-table
            :data="formData.items || []"
            border
            style="width: 100%"
            size="small"
          >
            <el-table-column
              label="商品名稱"
              prop="productName"
              min-width="200"
            >
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.productName"
                  placeholder="請輸入商品名稱"
                  size="small"
                ></el-input>
              </template>
            </el-table-column>

            <el-table-column label="規格" prop="specification" width="120">
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.specification"
                  placeholder="規格"
                  size="small"
                ></el-input>
              </template>
            </el-table-column>

            <el-table-column label="數量" prop="quantity" width="100">
              <template slot-scope="scope">
                <el-input-number
                  v-model="scope.row.quantity"
                  :min="1"
                  :max="999"
                  controls-position="right"
                  size="small"
                  style="width: 90px"
                ></el-input-number>
              </template>
            </el-table-column>

            <el-table-column
              label="單價"
              prop="price"
              width="120"
              v-if="showItemPrice"
            >
              <template slot-scope="scope">
                <el-input-number
                  v-model="scope.row.price"
                  :min="0"
                  :precision="0"
                  controls-position="right"
                  size="small"
                  style="width: 110px"
                ></el-input-number>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="70" fixed="right">
              <template slot-scope="scope">
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  @click="removeItem(scope.$index)"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="add-item-btn">
            <el-button
              type="primary"
              size="small"
              @click="addItem"
              icon="el-icon-plus"
            >
              添加商品
            </el-button>
          </div>
        </div>
      </el-form-item>

      <el-form-item
        label="運送方式"
        v-if="showShippingMethod"
        prop="shippingMethod"
      >
        <el-select
          v-model="formData.shippingMethod"
          placeholder="請選擇運送方式"
          style="width: 100%"
        >
          <el-option value="宅配" label="宅配"></el-option>
          <el-option value="店到店" label="店到店"></el-option>
          <el-option value="自取" label="自取"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item
        label="追蹤號碼"
        v-if="showTrackingNumber"
        prop="trackingNumber"
      >
        <el-input
          v-model="formData.trackingNumber"
          placeholder="請輸入物流追蹤號碼"
        ></el-input>
      </el-form-item>

      <el-form-item
        label="預計出貨日期"
        v-if="showShippingDate"
        prop="estimatedShippingDate"
      >
        <el-date-picker
          v-model="formData.estimatedShippingDate"
          type="date"
          placeholder="選擇預計出貨日期"
          style="width: 100%"
        ></el-date-picker>
      </el-form-item>

      <el-form-item
        label="退款方式"
        v-if="showRefundMethod"
        prop="refundMethod"
      >
        <el-select
          v-model="formData.refundMethod"
          placeholder="請選擇退款方式"
          style="width: 100%"
        >
          <el-option value="原付款方式退回" label="原付款方式退回"></el-option>
          <el-option value="銀行轉帳" label="銀行轉帳"></el-option>
          <el-option value="現金" label="現金"></el-option>
          <el-option value="商店禮券" label="商店禮券"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="備註" prop="remarks">
        <el-input
          v-model="formData.remarks"
          type="textarea"
          :rows="3"
          placeholder="請輸入處理備註"
        ></el-input>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting"
        >儲存</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "ReturnExchangeDialog",

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => ({})
    },
    orderNumber: {
      type: String,
      default: ""
    },
    statusOptions: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      dialogVisible: false,
      formData: {
        id: null,
        orderNumber: "",
        processingId: "",
        processingType: "退貨",
        returnExchangeStatus: "待處理",
        refundAmount: 0,
        shippingMethod: "",
        trackingNumber: "",
        estimatedShippingDate: "",
        refundMethod: "",
        remarks: "",
        items: []
      },
      isEdit: false,
      submitting: false,
      rules: {
        processingType: [
          { required: true, message: "請選擇處理類型", trigger: "change" }
        ],
        returnExchangeStatus: [
          { required: true, message: "請選擇處理狀態", trigger: "change" }
        ],
        refundAmount: [
          {
            required: true,
            message: "請輸入退款金額",
            trigger: "blur",
            validator: (rule, value, callback) => {
              if (this.showRefundAmount && (!value && value !== 0)) {
                callback(new Error("請輸入退款金額"));
              } else {
                callback();
              }
            }
          }
        ],
        shippingMethod: [
          {
            required: true,
            message: "請選擇運送方式",
            trigger: "change",
            validator: (rule, value, callback) => {
              if (this.showShippingMethod && !value) {
                callback(new Error("請選擇運送方式"));
              } else {
                callback();
              }
            }
          }
        ],
        refundMethod: [
          {
            required: true,
            message: "請選擇退款方式",
            trigger: "change",
            validator: (rule, value, callback) => {
              if (this.showRefundMethod && !value) {
                callback(new Error("請選擇退款方式"));
              } else {
                callback();
              }
            }
          }
        ]
      }
    };
  },

  computed: {
    // 根據處理類型動態顯示不同欄位
    showRefundAmount() {
      return ["退款", "退貨", "折讓"].includes(this.formData.processingType);
    },

    showShippingMethod() {
      return ["換貨", "補寄"].includes(this.formData.processingType);
    },

    showTrackingNumber() {
      return (
        ["換貨", "補寄"].includes(this.formData.processingType) &&
        this.formData.returnExchangeStatus !== "待處理"
      );
    },

    showShippingDate() {
      return ["換貨", "補寄"].includes(this.formData.processingType);
    },

    showRefundMethod() {
      return ["退款", "退貨", "折讓"].includes(this.formData.processingType);
    },

    showItemPrice() {
      return ["退款", "退貨", "折讓"].includes(this.formData.processingType);
    }
  },

  watch: {
    visible(val) {
      this.dialogVisible = val;
    },
    data: {
      handler(val) {
        if (val && Object.keys(val).length > 0) {
          this.isEdit = !!val.id;
          this.initFormData();
        }
      },
      immediate: true
    },
    dialogVisible(val) {
      this.$emit("update:visible", val);
    }
  },

  methods: {
    initFormData() {
      if (this.data && Object.keys(this.data).length > 0) {
        // 深度複製避免相互影響
        this.formData = JSON.parse(JSON.stringify(this.data));

        // 確保 orderNumber
        if (!this.formData.orderNumber && this.orderNumber) {
          this.formData.orderNumber = this.orderNumber;
        }

        // 確保 items 數組初始化
        if (!this.formData.items || !Array.isArray(this.formData.items)) {
          this.formData.items = [];
        }
      } else {
        // 如果是新建模式
        this.resetForm();
      }
    },

    resetForm() {
      this.formData = {
        id: null,
        orderNumber: this.orderNumber,
        processingId: "",
        processingType: "退貨",
        returnExchangeStatus: "待處理",
        refundAmount: 0,
        shippingMethod: "",
        trackingNumber: "",
        estimatedShippingDate: "",
        refundMethod: "",
        remarks: "",
        items: []
      };

      if (this.$refs.form) {
        this.$refs.form.resetFields();
      }
    },

    handleProcessingTypeChange(val) {
      // 切換處理類型時，重置相關欄位
      if (["換貨", "補寄"].includes(val)) {
        this.formData.refundAmount = 0;
        this.formData.refundMethod = "";
      } else if (["退款", "退貨", "折讓"].includes(val)) {
        this.formData.shippingMethod = "";
        this.formData.trackingNumber = "";
        this.formData.estimatedShippingDate = "";
      }
    },

    // 商品明細相關方法
    addItem() {
      if (!this.formData.items) {
        this.formData.items = [];
      }

      this.formData.items.push({
        id: null,
        productName: "",
        specification: "",
        quantity: 1,
        price: 0
      });
    },

    removeItem(index) {
      this.formData.items.splice(index, 1);
    },

    validateItems() {
      // 驗證商品明細
      if (!this.formData.items || this.formData.items.length === 0) {
        this.$message.warning("請至少添加一個商品明細");
        return false;
      }

      for (let i = 0; i < this.formData.items.length; i++) {
        const item = this.formData.items[i];
        if (!item.productName) {
          this.$message.warning(`第 ${i + 1} 個商品明細的商品名稱不能為空`);
          return false;
        }
      }

      return true;
    },

    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return;
        }

        // 驗證商品明細
        if (!this.validateItems()) {
          return;
        }

        this.submitting = true;

        // 準備提交數據
        const submitData = { ...this.formData };

        // 自動計算總金額（如果需要）
        if (this.showItemPrice && this.showRefundAmount) {
          const calculatedTotal = this.formData.items.reduce((sum, item) => {
            return sum + item.price * item.quantity;
          }, 0);

          // 如果用戶沒有手動輸入退款金額，則使用計算值
          if (!submitData.refundAmount) {
            submitData.refundAmount = calculatedTotal;
          }
        }

        // 通知父元件提交數據
        setTimeout(() => {
          this.$emit("save", submitData);
          this.submitting = false;
        }, 500);
      });
    },

    handleClosed() {
      this.resetForm();
    }
  }
};
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.items-table-wrapper {
  margin-bottom: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.add-item-btn {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

.amount-label {
  margin-left: 8px;
  color: #606266;
}

::v-deep .el-input-number .el-input__inner {
  text-align: left;
}
</style>
