<template>
  <el-dialog
    :title="isEdit ? '編輯售後案件' : '新增售後案件'"
    :visible.sync="dialogVisible"
    width="750px"
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
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本資料" name="basic">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="售後單號" prop="orderNumber">
                <el-input
                  v-model="formData.orderNumber"
                  placeholder="系統自動生成"
                  disabled
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="原訂單編號" prop="originalOrderId">
                <el-input
                  v-model="formData.originalOrderId"
                  placeholder="請輸入原訂單編號"
                  :disabled="isEdit"
                >
                  <el-button
                    slot="append"
                    icon="el-icon-search"
                    @click="searchOrder"
                    :disabled="isEdit"
                  ></el-button>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="客戶名稱" prop="customerName">
                <el-input
                  v-model="formData.customerName"
                  placeholder="請輸入客戶名稱"
                  :disabled="isEdit"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="聯絡方式" prop="contactPhone">
                <el-input
                  v-model="formData.contactPhone"
                  placeholder="請輸入聯絡方式"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="訂單總金額" prop="orderTotal">
                <el-input-number
                  v-model="formData.orderTotal"
                  :precision="0"
                  :min="0"
                  controls-position="right"
                  style="width: 100%"
                  :disabled="isEdit"
                ></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="申請日期" prop="applyDate">
                <el-date-picker
                  v-model="formData.applyDate"
                  type="date"
                  placeholder="選擇申請日期"
                  style="width: 100%"
                  :disabled="isEdit"
                ></el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="優先級" prop="priority">
                <el-select
                  v-model="formData.priority"
                  placeholder="請選擇優先級"
                  style="width: 100%"
                >
                  <el-option
                    v-for="option in priorityOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  >
                    <el-tag
                      :type="option.type"
                      size="small"
                      effect="dark"
                      style="margin-right: 10px"
                    >
                      {{ option.label }}
                    </el-tag>
                    {{ option.label }}
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="處理狀態" prop="status">
                <el-select
                  v-model="formData.status"
                  placeholder="請選擇處理狀態"
                  style="width: 100%"
                >
                  <el-option
                    v-for="option in statusOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  >
                    <el-tag
                      :type="option.type"
                      size="small"
                      style="margin-right: 10px"
                    >
                      {{ option.label }}
                    </el-tag>
                    {{ option.label }}
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="處理人員" prop="processor">
                <el-input
                  v-model="formData.processor"
                  placeholder="請輸入處理人員"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="預計完成日期" prop="expectedCompletionDate">
                <el-date-picker
                  v-model="formData.expectedCompletionDate"
                  type="date"
                  placeholder="選擇預計完成日期"
                  style="width: 100%"
                ></el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
        </el-tab-pane>

        <el-tab-pane label="問題與處理方式" name="problem">
          <el-form-item label="問題類型" prop="problemType">
            <el-select
              v-model="formData.problemType"
              placeholder="請選擇問題類型"
              style="width: 100%"
              :disabled="isEdit"
            >
              <el-option
                v-for="option in problemTypeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="處理方式" prop="processingMethod">
            <el-select
              v-model="formData.processingMethod"
              placeholder="請選擇處理方式"
              style="width: 100%"
            >
              <el-option
                v-for="option in processingMethodOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="問題簡述" prop="problemSummary">
            <el-input
              v-model="formData.problemSummary"
              type="textarea"
              :rows="3"
              placeholder="請簡述問題"
              :disabled="isEdit"
            ></el-input>
          </el-form-item>

          <el-form-item label="處理備註" prop="processingRemarks">
            <el-input
              v-model="formData.processingRemarks"
              type="textarea"
              :rows="3"
              placeholder="請輸入處理備註"
            ></el-input>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        儲存
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "AfterSalesCaseDialog",

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => ({})
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    priorityOptions: {
      type: Array,
      default: () => []
    },
    problemTypeOptions: {
      type: Array,
      default: () => []
    },
    processingMethodOptions: {
      type: Array,
      default: () => []
    },
    statusOptions: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      dialogVisible: false,
      activeTab: "basic",
      formData: {
        orderNumber: "",
        originalOrderId: "",
        customerName: "",
        contactPhone: "",
        orderTotal: 0,
        applyDate: new Date(),
        priority: "中",
        problemType: "",
        processingMethod: "",
        status: "待處理",
        processor: "",
        lastUpdateTime: new Date(),
        expectedCompletionDate: "",
        processingRemarks: "",
        problemSummary: ""
      },
      submitting: false,
      rules: {
        originalOrderId: [
          { required: true, message: "請輸入原訂單編號", trigger: "blur" }
        ],
        customerName: [
          { required: true, message: "請輸入客戶名稱", trigger: "blur" }
        ],
        contactPhone: [
          { required: true, message: "請輸入聯絡方式", trigger: "blur" }
        ],
        orderTotal: [
          { required: true, message: "請輸入訂單總金額", trigger: "blur" }
        ],
        applyDate: [
          { required: true, message: "請選擇申請日期", trigger: "change" }
        ],
        priority: [
          { required: true, message: "請選擇優先級", trigger: "change" }
        ],
        problemType: [
          { required: true, message: "請選擇問題類型", trigger: "change" }
        ],
        processingMethod: [
          { required: true, message: "請選擇處理方式", trigger: "change" }
        ],
        status: [
          { required: true, message: "請選擇處理狀態", trigger: "change" }
        ],
        processor: [
          { required: true, message: "請輸入處理人員", trigger: "blur" }
        ],
        problemSummary: [
          { required: true, message: "請簡述問題", trigger: "blur" }
        ]
      }
    };
  },

  watch: {
    visible(val) {
      this.dialogVisible = val;
    },
    data: {
      handler(val) {
        if (val && Object.keys(val).length > 0) {
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

        // 確保日期格式正確
        if (
          this.formData.applyDate &&
          typeof this.formData.applyDate === "string"
        ) {
          this.formData.applyDate = new Date(this.formData.applyDate);
        }
        if (
          this.formData.expectedCompletionDate &&
          typeof this.formData.expectedCompletionDate === "string"
        ) {
          this.formData.expectedCompletionDate = new Date(
            this.formData.expectedCompletionDate
          );
        }
        if (
          this.formData.lastUpdateTime &&
          typeof this.formData.lastUpdateTime === "string"
        ) {
          this.formData.lastUpdateTime = new Date(this.formData.lastUpdateTime);
        }
      } else {
        // 如果是新建模式
        this.resetForm();
      }
    },

    resetForm() {
      this.formData = {
        orderNumber: "",
        originalOrderId: "",
        customerName: "",
        contactPhone: "",
        orderTotal: 0,
        applyDate: new Date(),
        priority: "中",
        problemType: "",
        processingMethod: "",
        status: "待處理",
        processor: this.$store.state.user
          ? this.$store.state.user.username
          : "",
        lastUpdateTime: new Date(),
        expectedCompletionDate: "",
        processingRemarks: "",
        problemSummary: ""
      };

      if (this.$refs.form) {
        this.$refs.form.resetFields();
      }
    },

    handleClosed() {
      this.resetForm();
      this.activeTab = "basic";
    },

    // 搜尋訂單
    searchOrder() {
      if (!this.formData.originalOrderId) {
        this.$message.warning("請先輸入訂單編號");
        return;
      }

      this.$emit("search-order", this.formData.originalOrderId, orderData => {
        if (orderData) {
          // 自動填充訂單相關資訊
          this.formData.customerName =
            orderData.customerName || this.formData.customerName;
          this.formData.contactPhone =
            orderData.contactPhone || this.formData.contactPhone;
          this.formData.orderTotal =
            orderData.orderTotal || this.formData.orderTotal;
        }
      });
    },

    // 表單提交
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          // 如果驗證失敗，切換到相應的標籤頁
          const errorFields = this.$refs.form.fields.filter(
            field => field.validateState === "error"
          );
          if (errorFields.length > 0) {
            const fieldName = errorFields[0].prop;

            // 根據欄位名切換到相應的頁籤
            if (
              [
                "problemType",
                "processingMethod",
                "problemSummary",
                "processingRemarks"
              ].includes(fieldName)
            ) {
              this.activeTab = "problem";
            } else {
              this.activeTab = "basic";
            }
          }

          return;
        }

        this.submitting = true;

        // 準備提交數據
        const submitData = JSON.parse(JSON.stringify(this.formData));

        // 保留子表格數據，但不在對話框中編輯
        if (this.data && this.data.problemDetails) {
          submitData.problemDetails = this.data.problemDetails;
        }

        if (this.data && this.data.returnExchangeDetails) {
          submitData.returnExchangeDetails = this.data.returnExchangeDetails;
        }

        // 發送到父元件
        setTimeout(() => {
          this.$emit("save", submitData);
          this.submitting = false;
        }, 500);
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

::v-deep .el-input-number .el-input__inner {
  text-align: left;
}

::v-deep .el-form-item__label {
  font-weight: 500;
}

::v-deep .el-tabs__item {
  font-size: 14px;
  font-weight: 500;
}

::v-deep .el-tabs__content {
  padding-top: 20px;
}

::v-deep .el-input.is-disabled .el-input__inner,
::v-deep .el-textarea.is-disabled .el-textarea__inner,
::v-deep .el-select.is-disabled .el-input__inner,
::v-deep .el-input-number.is-disabled .el-input__inner {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
  cursor: not-allowed;
}
</style>
