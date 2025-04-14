<template>
  <div class="shipping-address">
    <h2 class="section-title">填寫收貨地址</h2>

    <el-form
      :model="addressForm"
      :rules="rules"
      ref="addressForm"
      label-width="100px"
      class="address-form"
    >
      <!-- 收件人姓名 -->
      <el-form-item label="收件人" prop="name">
        <el-input
          v-model="addressForm.name"
          placeholder="請輸入收件人姓名"
        ></el-input>
      </el-form-item>

      <!-- 聯絡電話 -->
      <el-form-item label="聯絡電話" prop="phone">
        <el-input
          v-model="addressForm.phone"
          placeholder="請輸入聯絡電話"
        ></el-input>
      </el-form-item>

      <!-- 詳細地址 -->
      <el-form-item label="收貨地址" prop="address">
        <el-input
          type="textarea"
          v-model="addressForm.address"
          :rows="3"
          placeholder="請輸入完整收貨地址"
        >
        </el-input>
      </el-form-item>

      <!-- 郵政編碼 -->
      <el-form-item label="郵政編碼" prop="postalCode">
        <el-input
          v-model="addressForm.postalCode"
          placeholder="請輸入郵政編碼（選填）"
        ></el-input>
      </el-form-item>

      <!-- 配送備註 -->
      <el-form-item label="配送備註" prop="notes">
        <el-input
          type="textarea"
          v-model="addressForm.notes"
          :rows="2"
          placeholder="配送相關備註信息（選填）"
        >
        </el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "ShippingAddress",

  props: {
    address: {
      type: Object,
      default: () => ({
        name: "",
        phone: "",
        address: "",
        postalCode: "",
        notes: ""
      })
    }
  },

  data() {
    return {
      addressForm: {
        name: this.address.name,
        phone: this.address.phone,
        address: this.address.address,
        postalCode: this.address.postalCode,
        notes: this.address.notes
      },
      // 表單驗證規則
      rules: {
        name: [
          { required: true, message: "請輸入收件人姓名", trigger: "blur" },
          { min: 2, max: 20, message: "長度在 2 到 20 個字符", trigger: "blur" }
        ],
        phone: [
          { required: true, message: "請輸入聯絡電話", trigger: "blur" },
          {
            pattern: /^[0-9+\-\s]{8,}$/,
            message: "請輸入有效的電話號碼",
            trigger: "blur"
          }
        ],
        address: [
          { required: true, message: "請輸入收貨地址", trigger: "blur" },
          { min: 5, message: "地址不能少於 5 個字符", trigger: "blur" }
        ],
        postalCode: [
          {
            pattern: /^[0-9]{3,6}$/,
            message: "請輸入有效的郵政編碼",
            trigger: "blur"
          }
        ]
      }
    };
  },

  watch: {
    // 監聽父組件傳入的地址變化
    address: {
      handler(newVal) {
        // 避免循環更新，只在深度不同時才更新
        if (JSON.stringify(this.addressForm) !== JSON.stringify(newVal)) {
          this.addressForm = { ...newVal };
        }
      },
      deep: true,
      immediate: true // 確保初始加載時也會執行
    },

    // 監聽表單數據變化，增加防抖
    addressForm: {
      handler(newVal) {
        // 使用 this.$nextTick 確保 DOM 更新後再觸發事件
        this.$nextTick(() => {
          this.$emit("update-address", { ...newVal });
        });
      },
      deep: true
    }
  },

  methods: {
    // 驗證表單
    validate() {
      return new Promise(resolve => {
        this.$refs.addressForm.validate(valid => {
          resolve(valid);
        });
      });
    },

    // 重置表單
    resetForm() {
      this.$refs.addressForm.resetFields();
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
$transition: all 0.3s ease;

// 字體大小
$font-size-s: 14px;
$font-size-base: 18px;
$font-size-lg: 20px;

.shipping-address {
  width: 100%;
}

.section-title {
  font-size: $font-size-lg;
  color: #303133;
  margin: 0 0 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.address-form {
  max-width: 700px;
}

.no-margin {
  margin-bottom: 0;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .el-form-item {
    margin-bottom: 18px;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: $font-size-base;
  }

  .el-form {
    padding-right: 16px;
  }
}
</style>
