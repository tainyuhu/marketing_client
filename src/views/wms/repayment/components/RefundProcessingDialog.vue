<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="isEdit ? '編輯退款處理' : '退款處理詳情'"
    width="700px"
    :before-close="handleClose"
    :close-on-click-modal="false"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="120px"
      size="small"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="退款單號" prop="id">
            <el-input v-model="form.id" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="關聯退貨單號" prop="refundOrderId">
            <el-input v-model="form.refundOrderId" disabled></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="原始訂單編號" prop="originalOrderId">
            <el-input v-model="form.originalOrderId" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客戶名稱" prop="customerName">
            <el-input v-model="form.customerName" disabled></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="聯絡電話" prop="contactPhone">
            <el-input v-model="form.contactPhone" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="申請日期" prop="applyDate">
            <el-date-picker
              v-model="form.applyDate"
              type="date"
              placeholder="選擇日期"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              disabled
            ></el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">退款詳情</el-divider>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="退款金額" prop="refundAmount">
            <el-input-number
              v-model="form.refundAmount"
              :min="0"
              :precision="0"
              :step="100"
              :disabled="!canEditAmount"
              style="width: 100%;"
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="退款方式" prop="refundMethod">
            <el-select
              v-model="form.refundMethod"
              placeholder="請選擇退款方式"
              style="width: 100%;"
              @change="handleRefundMethodChange"
            >
              <el-option
                v-for="item in refundMethods"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 銀行資訊（僅當退款方式為銀行轉帳時顯示） -->
      <div v-if="form.refundMethod === 'bank_transfer'">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="銀行" prop="bankCode">
              <el-select
                v-model="form.bankCode"
                placeholder="請選擇銀行"
                style="width: 100%;"
              >
                <el-option
                  v-for="item in banks"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="戶名" prop="bankAccountName">
              <el-input
                v-model="form.bankAccountName"
                placeholder="請輸入戶名"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="帳號" prop="bankAccount">
              <el-input
                v-model="form.bankAccount"
                placeholder="請輸入銀行帳號"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 第三方支付資訊（僅當退款方式為第三方支付退款時顯示） -->
      <div v-if="form.refundMethod === 'third_party'">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="支付平台" prop="thirdPartyPlatform">
              <el-select
                v-model="form.thirdPartyPlatform"
                placeholder="請選擇支付平台"
                style="width: 100%;"
              >
                <el-option label="Line Pay" value="line_pay"></el-option>
                <el-option label="街口支付" value="jko_pay"></el-option>
                <el-option label="Apple Pay" value="apple_pay"></el-option>
                <el-option label="Google Pay" value="google_pay"></el-option>
                <el-option label="台灣Pay" value="taiwan_pay"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="交易編號" prop="thirdPartyTransactionId">
              <el-input
                v-model="form.thirdPartyTransactionId"
                placeholder="請輸入原交易編號"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 信用卡資訊（僅當退款方式為信用卡退款時顯示） -->
      <div v-if="form.refundMethod === 'credit_card'">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="交易編號" prop="creditCardTransactionId">
              <el-input
                v-model="form.creditCardTransactionId"
                placeholder="請輸入信用卡交易編號"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="卡號後四碼" prop="creditCardLastFour">
              <el-input
                v-model="form.creditCardLastFour"
                placeholder="請輸入卡號後四碼"
                maxlength="4"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <el-divider content-position="left">處理狀態</el-divider>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="處理狀態" prop="status">
            <el-select
              v-model="form.status"
              placeholder="請選擇處理狀態"
              style="width: 100%;"
              @change="handleStatusChange"
            >
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
                :disabled="
                  item.value === 'completed' || item.value === 'cancelled'
                "
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="處理人員" prop="processor">
            <el-input
              v-model="form.processor"
              :disabled="!isCurrentUserProcessor"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="預計退款日期" prop="scheduledDate">
            <el-date-picker
              v-model="form.scheduledDate"
              type="date"
              placeholder="選擇日期"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              :disabled="form.status !== 'scheduled'"
              :picker-options="datePickerOptions"
              style="width: 100%;"
            ></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="實際退款日期" prop="completedDate">
            <el-date-picker
              v-model="form.completedDate"
              type="date"
              placeholder="選擇日期"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              disabled
              style="width: 100%;"
            ></el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="備註" prop="remark">
        <el-input
          type="textarea"
          v-model="form.remark"
          placeholder="請輸入備註"
          :rows="4"
        ></el-input>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="submitForm" :loading="submitting">
        確 定
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: "RefundProcessingDialog",

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => ({})
    },
    refundMethods: {
      type: Array,
      default: () => []
    },
    banks: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      isEdit: false,
      submitting: false,
      form: {
        id: "",
        refundOrderId: "",
        originalOrderId: "",
        customerName: "",
        contactPhone: "",
        applyDate: "",
        refundAmount: 0,
        refundMethod: "",
        bankCode: "",
        bankAccount: "",
        bankAccountName: "",
        thirdPartyPlatform: "",
        thirdPartyTransactionId: "",
        creditCardTransactionId: "",
        creditCardLastFour: "",
        status: "",
        processor: "",
        scheduledDate: "",
        completedDate: "",
        remark: ""
      },
      rules: {
        refundAmount: [
          { required: true, message: "請輸入退款金額", trigger: "blur" },
          { type: "number", min: 0, message: "金額不能小於0", trigger: "blur" }
        ],
        refundMethod: [
          { required: true, message: "請選擇退款方式", trigger: "change" }
        ],
        // 銀行轉帳相關驗證
        bankCode: [
          {
            required: true,
            message: "請選擇銀行",
            trigger: "change",
            validator: (rule, value, callback) => {
              if (this.form.refundMethod === "bank_transfer" && !value) {
                callback(new Error("請選擇銀行"));
              } else {
                callback();
              }
            }
          }
        ],
        bankAccount: [
          {
            validator: (rule, value, callback) => {
              if (this.form.refundMethod === "bank_transfer" && !value) {
                callback(new Error("請輸入銀行帳號"));
              } else {
                callback();
              }
            },
            trigger: "blur"
          }
        ],
        bankAccountName: [
          {
            validator: (rule, value, callback) => {
              if (this.form.refundMethod === "bank_transfer" && !value) {
                callback(new Error("請輸入戶名"));
              } else {
                callback();
              }
            },
            trigger: "blur"
          }
        ],
        // 第三方支付相關驗證
        thirdPartyPlatform: [
          {
            validator: (rule, value, callback) => {
              if (this.form.refundMethod === "third_party" && !value) {
                callback(new Error("請選擇支付平台"));
              } else {
                callback();
              }
            },
            trigger: "change"
          }
        ],
        thirdPartyTransactionId: [
          {
            validator: (rule, value, callback) => {
              if (this.form.refundMethod === "third_party" && !value) {
                callback(new Error("請輸入交易編號"));
              } else {
                callback();
              }
            },
            trigger: "blur"
          }
        ],
        // 信用卡相關驗證
        creditCardTransactionId: [
          {
            validator: (rule, value, callback) => {
              if (this.form.refundMethod === "credit_card" && !value) {
                callback(new Error("請輸入信用卡交易編號"));
              } else {
                callback();
              }
            },
            trigger: "blur"
          }
        ],
        status: [
          { required: true, message: "請選擇處理狀態", trigger: "change" }
        ],
        processor: [
          { required: true, message: "請輸入處理人員", trigger: "blur" }
        ],
        scheduledDate: [
          {
            validator: (rule, value, callback) => {
              if (this.form.status === "scheduled" && !value) {
                callback(new Error("請選擇預計退款日期"));
              } else {
                callback();
              }
            },
            trigger: "change"
          }
        ]
      },

      // 日期選擇器配置
      datePickerOptions: {
        disabledDate(date) {
          return date < new Date();
        }
      },

      // 狀態選項
      statusOptions: [
        { value: "pending", label: "待處理", type: "warning" },
        { value: "processing", label: "處理中", type: "primary" },
        { value: "scheduled", label: "已排程", type: "info" },
        { value: "completed", label: "已完成", type: "success" },
        { value: "cancelled", label: "已取消", type: "danger" }
      ]
    };
  },

  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit("update:visible", val);
      }
    },

    // 判斷是否可以編輯金額
    canEditAmount() {
      return (
        this.form.status === "pending" || this.form.status === "processing"
      );
    },

    // 判斷當前用戶是否是處理人員
    isCurrentUserProcessor() {
      var currentUser = "";
      if (this.$store.state.user && this.$store.state.user.username) {
        currentUser = this.$store.state.user.username;
      }
      return !this.form.processor || this.form.processor === currentUser;
    }
  },

  watch: {
    visible(val) {
      if (val && this.data) {
        this.initForm();
      }
    }
  },

  methods: {
    // 初始化表單
    initForm() {
      this.isEdit = !!this.data.id;

      if (this.isEdit) {
        // 編輯模式，使用傳入的數據
        this.form = Object.assign(
          {},
          this.form,
          JSON.parse(JSON.stringify(this.data))
        );

        // 解析銀行信息（如果存在）
        if (typeof this.form.bankInfo === "string") {
          try {
            const bankInfo = JSON.parse(this.form.bankInfo);
            this.form.bankCode = bankInfo.bankCode || "";
            this.form.bankAccount = bankInfo.bankAccount || "";
            this.form.bankAccountName = bankInfo.bankAccountName || "";
          } catch (e) {
            console.error("解析銀行信息失敗:", e);
          }
        }

        // 解析第三方支付信息（如果存在）
        if (typeof this.form.thirdPartyInfo === "string") {
          try {
            const thirdPartyInfo = JSON.parse(this.form.thirdPartyInfo);
            this.form.thirdPartyPlatform = thirdPartyInfo.platform || "";
            this.form.thirdPartyTransactionId =
              thirdPartyInfo.transactionId || "";
          } catch (e) {
            console.error("解析第三方支付信息失敗:", e);
          }
        }

        // 解析信用卡信息（如果存在）
        if (typeof this.form.creditCardInfo === "string") {
          try {
            const creditCardInfo = JSON.parse(this.form.creditCardInfo);
            this.form.creditCardTransactionId =
              creditCardInfo.transactionId || "";
            this.form.creditCardLastFour = creditCardInfo.lastFour || "";
          } catch (e) {
            console.error("解析信用卡信息失敗:", e);
          }
        }
      } else {
        // 新增模式，使用默認值
        this.form = {
          id: "",
          refundOrderId: "",
          originalOrderId: "",
          customerName: "",
          contactPhone: "",
          applyDate: "",
          refundAmount: 0,
          refundMethod: "",
          bankCode: "",
          bankAccount: "",
          bankAccountName: "",
          thirdPartyPlatform: "",
          thirdPartyTransactionId: "",
          creditCardTransactionId: "",
          creditCardLastFour: "",
          status: "pending",
          processor:
            this.$store.state.user && this.$store.state.user.username
              ? this.$store.state.user.username
              : "",
          scheduledDate: "",
          completedDate: "",
          remark: ""
        };
      }
    },

    // 退款方式變更處理
    handleRefundMethodChange(method) {
      // 清空相關字段，避免表單驗證錯誤
      if (method !== "bank_transfer") {
        this.form.bankCode = "";
        this.form.bankAccount = "";
        this.form.bankAccountName = "";
      }

      if (method !== "third_party") {
        this.form.thirdPartyPlatform = "";
        this.form.thirdPartyTransactionId = "";
      }

      if (method !== "credit_card") {
        this.form.creditCardTransactionId = "";
        this.form.creditCardLastFour = "";
      }
    },

    // 狀態變更處理
    handleStatusChange(status) {
      if (status === "scheduled" && !this.form.scheduledDate) {
        // 狀態變為已排程，但未設置預計日期，則默認設為明天
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        this.form.scheduledDate = this.formatDate(tomorrow);
      }

      if (status !== "scheduled") {
        // 如果不是已排程狀態，清空預計日期
        this.form.scheduledDate = "";
      }
    },

    // 格式化日期
    formatDate(date) {
      if (!date) return "";

      const d = new Date(date);
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const day = d
        .getDate()
        .toString()
        .padStart(2, "0");

      return `${year}-${month}-${day}`;
    },

    // 關閉對話框
    handleClose() {
      if (this.$refs.form) {
        this.$refs.form.resetFields();
      }
      this.dialogVisible = false;
    },

    // 提交表單
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          this.$message.warning("請檢查表單內容");
          return;
        }

        this.submitting = true;

        try {
          // 處理銀行信息
          let bankInfo = null;
          if (this.form.refundMethod === "bank_transfer") {
            bankInfo = {
              bankCode: this.form.bankCode,
              bankAccount: this.form.bankAccount,
              bankAccountName: this.form.bankAccountName
            };
          }

          // 處理第三方支付信息
          let thirdPartyInfo = null;
          if (this.form.refundMethod === "third_party") {
            thirdPartyInfo = {
              platform: this.form.thirdPartyPlatform,
              transactionId: this.form.thirdPartyTransactionId
            };
          }

          // 處理信用卡信息
          let creditCardInfo = null;
          if (this.form.refundMethod === "credit_card") {
            creditCardInfo = {
              transactionId: this.form.creditCardTransactionId,
              lastFour: this.form.creditCardLastFour
            };
          }

          // 組裝提交數據
          const submitData = {
            id: this.form.id,
            refundOrderId: this.form.refundOrderId,
            originalOrderId: this.form.originalOrderId,
            customerName: this.form.customerName,
            contactPhone: this.form.contactPhone,
            applyDate: this.form.applyDate,
            refundAmount: this.form.refundAmount,
            refundMethod: this.form.refundMethod,
            bankInfo: bankInfo ? JSON.stringify(bankInfo) : null,
            thirdPartyInfo: thirdPartyInfo
              ? JSON.stringify(thirdPartyInfo)
              : null,
            creditCardInfo: creditCardInfo
              ? JSON.stringify(creditCardInfo)
              : null,
            status: this.form.status,
            processor: this.form.processor,
            scheduledDate: this.form.scheduledDate,
            completedDate: this.form.completedDate,
            remark: this.form.remark
          };

          // 提交到父組件處理
          this.$emit("save", submitData);
        } catch (error) {
          console.error("表單提交處理錯誤:", error);
          this.$message.error("表單提交失敗");
        } finally {
          this.submitting = false;
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.el-form {
  max-height: 65vh;
  overflow-y: auto;
  padding-right: 10px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #dcdfe6;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background-color: #f5f7fa;
  }
}

.el-divider {
  margin: 20px 0;
}

.refund-amount {
  color: #f56c6c;
  font-weight: 500;
}
</style>
