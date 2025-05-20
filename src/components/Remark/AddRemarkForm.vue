<!-- components/Remark/AddRemarkForm.vue -->
<template>
  <div class="add-remark-container">
    <el-form
      :model="remarkForm"
      ref="remarkForm"
      :rules="remarkRules"
      class="remark-form"
    >
      <el-form-item prop="content">
        <el-input
          type="textarea"
          :rows="5"
          placeholder="請輸入備註內容..."
          v-model="remarkForm.content"
          maxlength="500"
          show-word-limit
        ></el-input>
      </el-form-item>

      <div class="upload-preview-wrapper">
        <div class="upload-header">
          <span>上傳圖片</span>
          <span class="upload-tip">可上傳 JPG/PNG 圖片檔，單檔不超過 5MB</span>
        </div>

        <el-upload
          action="#"
          list-type="picture-card"
          :auto-upload="false"
          :file-list="fileList"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :on-preview="handleFilePreview"
          :before-upload="beforeFileUpload"
          multiple
          class="mobile-upload"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
      </div>

      <div class="remark-options">
        <el-checkbox v-model="remarkForm.is_pinned">
          <i class="el-icon-top"></i> 固定此備註
        </el-checkbox>
        <el-checkbox v-model="remarkForm.is_important">
          <i class="el-icon-star-on"></i> 標記為重要
        </el-checkbox>
      </div>

      <div class="form-actions">
        <el-button
          type="primary"
          @click="submitForm"
          :loading="submitting"
          round
          class="submit-button"
        >
          新增備註
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "AddRemarkForm",

  props: {
    // 提交中狀態
    submitting: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      // 表單數據
      remarkForm: {
        content: "",
        is_pinned: false,
        is_important: false
      },

      // 表單驗證規則
      remarkRules: {
        content: [
          { required: true, message: "請輸入備註內容", trigger: "blur" },
          {
            min: 2,
            max: 500,
            message: "長度在 2 到 500 個字符",
            trigger: "blur"
          }
        ]
      },

      // 上傳的文件列表
      fileList: []
    };
  },

  methods: {
    // 提交表單
    submitForm() {
      this.$refs.remarkForm.validate(valid => {
        if (!valid) return;

        // 準備要提交的數據
        const remarkData = {
          content: this.remarkForm.content,
          is_pinned: this.remarkForm.is_pinned,
          is_important: this.remarkForm.is_important,
          files: this.fileList.map(file => file.raw)
        };

        // 發送表單提交事件
        this.$emit("submit", remarkData);
      });
    },

    // 檔案上傳前檢查
    beforeFileUpload(file) {
      const isImage = file.type.startsWith("image/");
      const isLt5M = file.size / 1024 / 1024 < 5;

      if (!isImage) {
        this.$message.error("只能上傳圖片檔!");
      }
      if (!isLt5M) {
        this.$message.error("圖片大小不能超過 5MB!");
      }

      return isImage && isLt5M;
    },

    // 處理文件變更
    handleFileChange(file, fileList) {
      this.fileList = fileList;
    },

    // 處理文件移除
    handleFileRemove(file, fileList) {
      this.fileList = fileList;
    },

    // 處理文件預覽
    handleFilePreview(file) {
      const previewUrl = file.url || URL.createObjectURL(file.raw);
      this.$emit("preview-image", { url: previewUrl });
    },

    // 重置表單
    resetForm() {
      this.remarkForm = {
        content: "",
        is_pinned: false,
        is_important: false
      };
      this.fileList = [];

      if (this.$refs.remarkForm) {
        this.$refs.remarkForm.resetFields();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.add-remark-container {
  background: #ffffff;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 400px;

  .form-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;

    .back-button {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      cursor: pointer;
      color: #333;
    }

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }
  }

  .remark-form {
    overflow-y: auto;
    padding: 16px;
    flex: 1;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;

    .upload-preview-wrapper {
      margin-bottom: 24px;

      .upload-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        font-size: 14px;
        color: #606266;

        .upload-tip {
          font-size: 12px;
          color: #909399;
        }
      }

      .mobile-upload {
        ::v-deep .el-upload--picture-card {
          width: 88px;
          height: 88px;
          line-height: 88px;
        }

        ::v-deep .el-upload-list--picture-card .el-upload-list__item {
          width: 88px;
          height: 88px;
        }
      }
    }

    .remark-options {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 24px;

      .el-checkbox {
        display: flex;
        align-items: center;
        margin-right: 0;

        ::v-deep .el-checkbox__label {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }

    .form-actions {
      margin-top: 16px;
      padding-bottom: 16px;

      .submit-button {
        width: 100%;
        height: 44px;
        font-size: 16px;
      }
    }
  }
}

// 移動端適配
@media (max-width: 768px) {
  .add-remark-container {
    .remark-form {
      padding: 16px 12px;

      .remark-options {
        flex-direction: column;
        gap: 12px;
      }
    }
  }
}

// 對話框樣式
::v-deep .el-dialog__body {
  padding: 0 !important;
}

// textarea樣式優化
::v-deep .el-textarea__inner {
  resize: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.5;
  min-height: 120px;
}

// 表單元素間距
::v-deep .el-form-item {
  margin-bottom: 20px;
}

// 優化上傳組件樣式
::v-deep .el-upload--picture-card {
  border-radius: 8px;
  border: 1px dashed #d9d9d9;
  background-color: #fafafa;
  transition: border-color 0.3s;

  &:hover {
    border-color: #1890ff;
  }

  i {
    color: #8c8c8c;
    font-size: 28px;
  }
}

// 優化複選框樣式
::v-deep .el-checkbox__inner {
  border-radius: 4px;
}

// 按鈕樣式優化
::v-deep .el-button--primary {
  background-color: #1890ff;
  border-color: #1890ff;

  &:hover,
  &:focus {
    background-color: #40a9ff;
    border-color: #40a9ff;
  }

  &:active {
    background-color: #096dd9;
    border-color: #096dd9;
  }
}
</style>
