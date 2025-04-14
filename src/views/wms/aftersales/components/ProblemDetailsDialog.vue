<template>
  <el-dialog
    :title="isEdit ? '編輯問題反應詳情' : '新增問題反應詳情'"
    :visible.sync="dialogVisible"
    width="650px"
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
      <el-form-item label="問題反應類型" prop="problemType">
        <el-select
          v-model="formData.problemType"
          placeholder="請選擇問題反應類型"
          style="width: 100%"
          @change="handleProblemTypeChange"
        >
          <el-option value="商品問題" label="商品問題"></el-option>
          <el-option value="非商品問題" label="非商品問題"></el-option>
          <el-option value="其他" label="其他"></el-option>
        </el-select>
      </el-form-item>

      <template v-if="formData.problemType === '商品問題'">
        <el-form-item label="問題商品ID" prop="productId">
          <el-input
            v-model="formData.productId"
            placeholder="請輸入問題商品ID"
          ></el-input>
        </el-form-item>

        <el-form-item label="商品名稱" prop="productName">
          <el-input
            v-model="formData.productName"
            placeholder="請輸入商品名稱"
          ></el-input>
        </el-form-item>

        <el-form-item label="品號" prop="productCode">
          <el-input
            v-model="formData.productCode"
            placeholder="請輸入品號"
          ></el-input>
        </el-form-item>

        <el-form-item label="規格" prop="specification">
          <el-input
            v-model="formData.specification"
            placeholder="請輸入規格"
          ></el-input>
        </el-form-item>

        <el-form-item label="購買數量" prop="purchaseQuantity">
          <el-input-number
            v-model="formData.purchaseQuantity"
            :min="1"
            :max="999"
            controls-position="right"
          ></el-input-number>
        </el-form-item>

        <el-form-item label="問題數量" prop="problemQuantity">
          <el-input-number
            v-model="formData.problemQuantity"
            :min="1"
            :max="formData.purchaseQuantity || 999"
            controls-position="right"
          ></el-input-number>
        </el-form-item>

        <el-form-item label="商品問題類型" prop="productIssueType">
          <el-select
            v-model="formData.productIssueType"
            placeholder="請選擇商品問題類型"
            style="width: 100%"
          >
            <el-option
              v-for="option in productIssueTypes"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            ></el-option>
          </el-select>
        </el-form-item>
      </template>

      <template v-else-if="formData.problemType === '非商品問題'">
        <el-form-item label="問題類型" prop="productIssueType">
          <el-select
            v-model="formData.productIssueType"
            placeholder="請選擇問題類型"
            style="width: 100%"
          >
            <el-option
              v-for="option in nonProductIssueTypes"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            ></el-option>
          </el-select>
        </el-form-item>
      </template>

      <el-form-item label="問題詳細描述" prop="problemDescription">
        <el-input
          v-model="formData.problemDescription"
          type="textarea"
          :rows="4"
          placeholder="請詳細描述問題"
        ></el-input>
      </el-form-item>

      <el-form-item label="問題發現時間" prop="problemDiscoveryTime">
        <el-date-picker
          v-model="formData.problemDiscoveryTime"
          type="datetime"
          placeholder="選擇問題發現時間"
          format="yyyy-MM-dd HH:mm"
          value-format="yyyy-MM-dd HH:mm:ss"
          style="width: 100%"
        ></el-date-picker>
      </el-form-item>

      <el-form-item label="問題照片/影片">
        <el-upload
          ref="upload"
          action="#"
          :auto-upload="false"
          :file-list="fileList"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :before-upload="beforeUpload"
          :on-preview="handlePreview"
          list-type="picture-card"
          multiple
        >
          <i class="el-icon-plus"></i>
          <div class="el-upload__tip" slot="tip">
            支援圖片格式: jpg, jpeg, png, gif (不超過5MB)
            <br />支援影片格式: mp4, mov (不超過20MB)
          </div>
        </el-upload>
      </el-form-item>
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
  name: "ProblemDetailsDialog",

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
    productIssueTypes: {
      type: Array,
      default: () => []
    },
    nonProductIssueTypes: {
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
        problemType: "商品問題",
        productId: "",
        productName: "",
        productCode: "",
        specification: "",
        purchaseQuantity: 1,
        problemQuantity: 1,
        productIssueType: "",
        problemDescription: "",
        problemDiscoveryTime: "",
        evidenceFiles: []
      },
      fileList: [],
      isEdit: false,
      submitting: false,
      rules: {
        problemType: [
          { required: true, message: "請選擇問題反應類型", trigger: "change" }
        ],
        productId: [
          { required: true, message: "請輸入問題商品ID", trigger: "blur" }
        ],
        productName: [
          { required: true, message: "請輸入商品名稱", trigger: "blur" }
        ],
        productIssueType: [
          { required: true, message: "請選擇問題類型", trigger: "change" }
        ],
        problemDescription: [
          { required: true, message: "請詳細描述問題", trigger: "blur" }
        ],
        problemDiscoveryTime: [
          {
            required: true,
            message: "請選擇問題發現時間",
            trigger: "change"
          }
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

        // 確保caseId
        if (!this.formData.orderNumber && this.orderNumber) {
          this.formData.orderNumber = this.orderNumber;
        }

        // 處理檔案列表
        this.fileList = [];
        if (
          this.formData.evidenceFiles &&
          this.formData.evidenceFiles.length > 0
        ) {
          this.fileList = this.formData.evidenceFiles.map(file => ({
            name: file.name,
            url: file.url,
            type: file.type,
            size: file.size,
            uid:
              file.uid ||
              Date.now() +
                Math.random()
                  .toString(36)
                  .substr(2, 10)
          }));
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
        problemType: "商品問題",
        productId: "",
        productName: "",
        productCode: "",
        specification: "",
        purchaseQuantity: 1,
        problemQuantity: 1,
        productIssueType: "",
        problemDescription: "",
        problemDiscoveryTime: "",
        evidenceFiles: []
      };
      this.fileList = [];

      if (this.$refs.form) {
        this.$refs.form.resetFields();
      }
    },

    handleProblemTypeChange(val) {
      // 切換問題類型時重置問題種類
      this.formData.productIssueType = "";
    },

    // 檔案相關處理
    handleFileChange(file, fileList) {
      this.fileList = fileList;
    },

    handleFileRemove(file, fileList) {
      this.fileList = fileList;
    },

    beforeUpload(file) {
      // 這裡可以添加文件類型和大小的檢查
      const isImage = file.type.indexOf("image/") !== -1;
      const isVideo = file.type.indexOf("video/") !== -1;

      if (!isImage && !isVideo) {
        this.$message.error("只能上傳圖片或影片格式檔案!");
        return false;
      }

      const isImageLt5M = isImage && file.size / 1024 / 1024 < 5;
      const isVideoLt20M = isVideo && file.size / 1024 / 1024 < 20;

      if (isImage && !isImageLt5M) {
        this.$message.error("圖片大小不能超過 5MB!");
        return false;
      }

      if (isVideo && !isVideoLt20M) {
        this.$message.error("影片大小不能超過 20MB!");
        return false;
      }

      return true;
    },

    handlePreview(file) {
      // 檔案預覽處理
      if (file.url) {
        this.$emit("file-preview", [file]);
      }
    },

    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return;
        }

        this.submitting = true;

        // 準備提交數據
        const submitData = { ...this.formData };

        // 處理上傳檔案
        submitData.evidenceFiles = this.fileList.map(file => ({
          name: file.name,
          url: file.url || (file.raw ? URL.createObjectURL(file.raw) : ""), // 假設後端處理上傳，這裡暫時生成一個本地URL
          type: file.type || (file.raw && file.raw.type ? file.raw.type : ""),
          size: file.size || (file.raw && file.raw.size ? file.raw.size : 0),
          uploadTime: new Date().toISOString(),
          uid: file.uid
        }));

        // 移除不必要的欄位，如果非商品問題不需要商品相關欄位
        if (submitData.problemType !== "商品問題") {
          submitData.productId = "";
          submitData.productName = "";
          submitData.productCode = "";
          submitData.specification = "";
          submitData.purchaseQuantity = null;
          submitData.problemQuantity = null;
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

::v-deep .el-upload--picture-card {
  width: 100px;
  height: 100px;
  line-height: 100px;
}

::v-deep .el-upload-list--picture-card .el-upload-list__item {
  width: 100px;
  height: 100px;
}

::v-deep .el-upload__tip {
  font-size: 12px;
  line-height: 1.4;
  margin-top: 8px;
  color: #909399;
}
</style>
