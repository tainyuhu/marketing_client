<template>
  <div class="shipping-address">
    <h2 class="section-title">填寫收貨地址</h2>

    <!-- 載入狀態 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else>
      <!-- 如果有用戶地址資料，顯示選擇區域 -->
      <div v-if="hasAddressOptions" class="address-options">
        <h3 class="sub-title">選擇預設地址</h3>
        <el-radio-group
          v-model="selectedAddressType"
          @change="handleAddressTypeChange"
        >
          <el-radio v-if="userInfo.address" label="address">常用地址</el-radio>
          <el-radio v-if="userInfo.mailing_address_1" label="mailing_address_1"
            >通訊地址一</el-radio
          >
          <el-radio v-if="userInfo.mailing_address_2" label="mailing_address_2"
            >通訊地址二</el-radio
          >
          <el-radio label="custom">填寫新地址</el-radio>
        </el-radio-group>
      </div>

      <el-form
        :model="addressForm"
        :rules="rules"
        ref="addressForm"
        label-width="100px"
        class="address-form"
        :class="{ 'mt-20': hasAddressOptions }"
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
        <el-form-item label="郵遞區號" prop="postalCode">
          <el-input
            v-model="addressForm.postalCode"
            placeholder="請輸入郵遞區號（選填）"
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
  </div>
</template>

<script>
import { getInfo } from "@/api/user"; // 引入獲取用戶資訊的API
import { Message } from "element-ui"; // 引入Message组件

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
    },
    isMobile: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      loading: true,
      userInfo: null,
      selectedAddressType: "custom", // 默認使用自定義地址
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
        ]
      }
    };
  },

  computed: {
    // 判斷是否有地址選項
    hasAddressOptions() {
      return (
        this.userInfo &&
        (this.userInfo.address ||
          this.userInfo.mailing_address_1 ||
          this.userInfo.mailing_address_2)
      );
    }
  },

  created() {
    // 頁面創建時獲取用戶資訊
    this.fetchUserInfo();
  },

  watch: {
    // 監聽父組件傳入的地址變化
    address: {
      handler(newVal) {
        // 避免循環更新，只在深度不同時才更新
        if (JSON.stringify(this.addressForm) !== JSON.stringify(newVal)) {
          this.addressForm = { ...newVal };

          // 如果填入了地址，將選擇模式改為自定義
          if (newVal.address) {
            this.selectedAddressType = "custom";
          }
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
    // 獲取用戶資訊
    async fetchUserInfo() {
      try {
        const response = await getInfo();

        if (response && response.data) {
          this.userInfo = response.data;

          // 如果用戶資料中有姓名和電話，預先填入
          if (!this.addressForm.name && this.userInfo.name) {
            this.addressForm.name = this.userInfo.name;
          }

          if (!this.addressForm.phone && this.userInfo.phone) {
            this.addressForm.phone = this.userInfo.phone;
          }

          // 如果有常用地址，默認選中它
          if (this.userInfo.address) {
            this.selectedAddressType = "address";
            this.addressForm.address = this.userInfo.address;
          } else if (this.userInfo.mailing_address_1) {
            this.selectedAddressType = "mailing_address_1";
            this.addressForm.address = this.userInfo.mailing_address_1;
          } else if (this.userInfo.mailing_address_2) {
            this.selectedAddressType = "mailing_address_2";
            this.addressForm.address = this.userInfo.mailing_address_2;
          }
        }
      } catch (error) {
        console.error("獲取用戶資訊失敗:", error);
        Message({
          message: "獲取用戶資訊失敗，請手動填寫地址",
          type: "warning",
          duration: 3000
        });
      } finally {
        this.loading = false;
      }
    },

    // 處理地址類型變更
    handleAddressTypeChange(type) {
      switch (type) {
        case "address":
          this.addressForm.address = this.userInfo.address;
          break;
        case "mailing_address_1":
          this.addressForm.address = this.userInfo.mailing_address_1;
          break;
        case "mailing_address_2":
          this.addressForm.address = this.userInfo.mailing_address_2;
          break;
        case "custom":
          // 如果選擇自定義地址，清空當前地址欄位讓用戶填寫
          this.addressForm.address = "";
          break;
      }

      // 每次變更地址類型都通知父組件
      this.$emit("update-address", { ...this.addressForm });
    },

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

      // 重置選擇的地址類型
      if (this.userInfo) {
        if (this.userInfo.address) {
          this.selectedAddressType = "address";
          this.addressForm.address = this.userInfo.address;
        } else if (this.userInfo.mailing_address_1) {
          this.selectedAddressType = "mailing_address_1";
          this.addressForm.address = this.userInfo.mailing_address_1;
        } else if (this.userInfo.mailing_address_2) {
          this.selectedAddressType = "mailing_address_2";
          this.addressForm.address = this.userInfo.mailing_address_2;
        } else {
          this.selectedAddressType = "custom";
        }
      } else {
        this.selectedAddressType = "custom";
      }
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

.sub-title {
  font-size: $font-size-base;
  color: #303133;
  margin: 0 0 15px;
  font-weight: 500;
}

.address-options {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: $border-radius;
  border: 1px solid #ebeef5;
}

.address-form {
  max-width: 700px;
}

.loading-container {
  padding: 20px;
  margin-bottom: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.no-margin {
  margin-bottom: 0;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .el-form-item {
    margin-bottom: 18px;
  }

  .address-options {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: $font-size-base;
  }

  .sub-title {
    font-size: $font-size-s;
  }

  .el-form {
    padding-right: 16px;
  }

  .el-radio-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .el-radio {
    margin-left: 0 !important;
    margin-bottom: 6px;
  }
}
</style>
