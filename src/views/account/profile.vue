<template>
  <div class="app-container">
    <!-- 基本資料 -->
    <el-card>
      <template #header>
        <el-row type="flex" justify="space-between" align="middle">
          <el-col :span="12">
            <h2 class="el-card__title">基本資料</h2>
          </el-col>
          <el-col :span="12" style="text-align: right">
            <el-button
              type="primary"
              size="small"
              @click="submitForm"
              :loading="loading"
            >
              儲存變更
            </el-button>
          </el-col>
        </el-row>
      </template>

      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        :label-width="device === 'mobile' ? 'auto' : '120px'"
        :label-position="device === 'mobile' ? 'top' : 'right'"
        size="small"
      >
        <el-row :gutter="device === 'mobile' ? 0 : 20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="帳號" prop="username">
              <el-input v-model="form.username" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="device === 'mobile' ? 0 : 20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="暱稱" prop="nickname">
              <el-input v-model="form.nickname"></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="性別" prop="gender">
              <el-radio-group v-model="form.gender">
                <el-radio label="male">男</el-radio>
                <el-radio label="female">女</el-radio>
                <el-radio label="other">其他</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="device === 'mobile' ? 0 : 20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="Email" prop="email">
              <el-input v-model="form.email"></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="手機號碼" prop="phone">
              <el-input v-model="form.phone"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="device === 'mobile' ? 0 : 20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="身份證字號" prop="idNumber">
              <el-input v-model="form.idNumber"></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="生日" prop="birthday">
              <el-date-picker
                v-model="form.birthday"
                type="date"
                style="width: 100%"
                value-format="yyyy-MM-dd"
                placeholder="選擇日期"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 地址管理標題與按鈕 -->
        <el-row
          type="flex"
          justify="space-between"
          align="middle"
          style="margin: 30px 0"
        >
          <el-col :xs="12" :sm="12">
            <span class="section-title">地址管理</span>
          </el-col>
          <el-col :xs="12" :sm="12" style="text-align: right">
            <el-button
              type="primary"
              size="small"
              @click="addNewAddress"
              icon="el-icon-plus"
            >
              新增地址
            </el-button>
          </el-col>
        </el-row>

        <!-- 地址列表 -->
        <div v-for="(address, index) in form.addresses" :key="index">
          <el-card shadow="hover" class="address-card">
            <template #header>
              <el-row type="flex" justify="space-between" align="middle">
                <span>地址 #{{ index + 1 }}</span>
                <el-button
                  type="danger"
                  size="mini"
                  @click="removeAddress(index)"
                  icon="el-icon-delete"
                >
                  刪除
                </el-button>
              </el-row>
            </template>

            <el-row :gutter="device === 'mobile' ? 0 : 20">
              <el-col :xs="24" :sm="8">
                <el-form-item
                  :label="'地址類型'"
                  :prop="'addresses.' + index + '.type'"
                >
                  <el-select v-model="address.type" style="width: 100%">
                    <el-option label="住家" value="home"></el-option>
                    <el-option label="公司" value="company"></el-option>
                    <el-option label="其他" value="other"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="16">
                <el-form-item
                  :label="'郵遞區號'"
                  :prop="'addresses.' + index + '.postalCode'"
                >
                  <el-input v-model="address.postalCode"></el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item
              :label="'詳細地址'"
              :prop="'addresses.' + index + '.fullAddress'"
            >
              <el-input
                type="textarea"
                v-model="address.fullAddress"
                rows="2"
              ></el-input>
            </el-form-item>
          </el-card>
        </div>
      </el-form>
    </el-card>

    <!-- Line 帳號綁定 -->
    <el-card class="card-margin">
      <template #header>
        <el-row type="flex" justify="space-between" align="middle">
          <h2 class="el-card__title">Line 帳號綁定 {{ isLineBound }}</h2>
        </el-row>
      </template>
      <el-row type="flex" align="middle" justify="center" :gutter="20">
        <el-col :xs="24" :sm="16">
          <div class="line-binding-status">
            <div class="line-status-info">
              <i :class="lineBindingIconClass"></i>
              <div class="line-status-text">
                <h3>Line 帳號{{ isLineBound ? '已綁定' : '未綁定' }}</h3>
                <p v-if="isLineBound">綁定時間：{{ lineBindingInfo.bindingDate }}</p>
                <p v-if="isLineBound">Line 用戶名：{{ lineBindingInfo.lineUsername }}</p>
                <p v-if="!isLineBound">綁定 Line 帳號可享有更多便利的服務</p>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8" style="text-align: center">
          <el-button
            :type="isLineBound ? 'danger' : 'primary'"
            @click="handleLineBinding"
            :icon="isLineBound ? 'el-icon-close' : 'el-icon-connection'"
            class="line-button"
          >
            {{ isLineBound ? '解除綁定' : '綁定 Line 帳號' }}
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 密碼設定 -->
    <el-card class="card-margin">
      <template #header>
        <el-row type="flex" justify="space-between" align="middle">
          <h2 class="el-card__title">密碼設定</h2>
        </el-row>
      </template>
      <el-row>
        <el-col :span="24">
          <el-button
            type="primary"
            @click="goToChangePassword"
            icon="el-icon-lock"
            class="change-password-button"
          >
            修改密碼
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 帳號資訊 -->
    <el-card class="card-margin">
      <template #header>
        <el-row type="flex" justify="space-between" align="middle">
          <h2 class="el-card__title">帳號資訊</h2>
        </el-row>
      </template>

      <el-row :gutter="device === 'mobile' ? 10 : 20">
        <el-col :xs="24" :sm="8">
          <el-card shadow="never" class="info-card">
            <template #header>
              <el-row type="flex" align="middle" class="info-header">
                <i class="el-icon-date"></i>
                <span>加入時間</span>
              </el-row>
            </template>
            <div class="info-content">{{ accountInfo.joinDate }}</div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="8">
          <el-card shadow="never" class="info-card">
            <template #header>
              <el-row type="flex" align="middle" class="info-header">
                <i class="el-icon-user"></i>
                <span>帳號狀態</span>
              </el-row>
            </template>
            <div class="info-content">
              <el-tag
                :type="accountInfo.status === '正常' ? 'success' : 'danger'"
              >
                {{ accountInfo.status }}
              </el-tag>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="8">
          <el-card shadow="never" class="info-card">
            <template #header>
              <el-row type="flex" align="middle" class="info-header">
                <i class="el-icon-connection"></i>
                <span>LINE綁定狀態</span>
              </el-row>
            </template>
            <div class="info-content">
              <el-tag
                :type="accountInfo.lineStatus === '已綁定' ? 'success' : 'info'"
              >
                {{ accountInfo.lineStatus }}
              </el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- Line 綁定對話框 -->
    <el-dialog
      :title="isLineBound ? '解除 Line 綁定' : 'Line 帳號綁定'"
      :visible.sync="lineDialogVisible"
      width="360px"
      center
    >
      <div v-if="!isLineBound" class="line-login-container">
        <div class="line-qrcode">
          <img src="/api/placeholder/200/200" alt="Line QR Code" />
        </div>
        <p class="line-login-text">請使用 Line 掃描上方 QR Code 進行綁定</p>
        <p class="line-login-note">或點擊下方按鈕使用 Line 帳號登入</p>
        <el-button type="success" class="line-login-button">
          <i class="line-icon"></i> 使用 Line 登入
        </el-button>
      </div>
      <div v-else class="line-unbind-container">
        <p class="line-unbind-text">確定要解除 Line 帳號綁定嗎？</p>
        <p class="line-unbind-note">解除綁定後，將無法使用 Line 進行快速登入</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="lineDialogVisible = false">{{ isLineBound ? '取消' : '稍後再說' }}</el-button>
        <el-button v-if="isLineBound" type="danger" @click="unbindLine">確認解除綁定</el-button>
        <el-button v-else type="primary" @click="bindLine">確認綁定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { get_line_binding_url, unbind_line_account } from "@/api/line_login";
export default {
  name: "UserProfile",
  data() {
    return {
      loading: false,
      form: {
        username: "",
        name: "",
        nickname: "",
        gender: "",
        email: "",
        phone: "",
        idNumber: "",
        birthday: "",
        addresses: []
      },
      rules: {
        name: [
          { required: true, message: "請輸入姓名", trigger: "blur" },
          { min: 2, max: 20, message: "長度在 2 到 20 個字符", trigger: "blur" }
        ],
        email: [
          { required: true, message: "請輸入郵箱地址", trigger: "blur" },
          { type: "email", message: "請輸入正確的郵箱地址", trigger: "blur" }
        ],
        phone: [
          { required: true, message: "請輸入手機號碼", trigger: "blur" },
          {
            pattern: /^09\d{8}$/,
            message: "請輸入正確的手機號碼格式",
            trigger: "blur"
          }
        ],
        idNumber: [
          { required: true, message: "請輸入身份證字號", trigger: "blur" },
          {
            pattern: /^[A-Z][12]\d{8}$/,
            message: "請輸入正確的身份證字號格式",
            trigger: "blur"
          }
        ],
        birthday: [
          { required: true, message: "請選擇生日", trigger: "change" }
        ],
        nickname: [{ required: true, message: "請輸入暱稱", trigger: "blur" }],
        gender: [{ required: true, message: "請選擇性別", trigger: "change" }]
      },
      accountInfo: {
        joinDate: "2024-01-01",
        status: "正常",
        lineStatus: "已綁定"
      },
      
      isLineBound: true,
      lineDialogVisible: false,
      lineBindingInfo: {
        bindingDate: "2024-02-15",
        lineUsername: "User_LINE"
      }
    };
  },
  computed: {
    lineBindingIconClass() {
      return this.isLineBound 
        ? "el-icon-check line-icon-bound" 
        : "el-icon-warning-outline line-icon-unbound";
    }
  },
  created() {
    this.fetchUserData();
  },
  methods: {
    fetchUserData() {
      // 模擬API調用
      setTimeout(() => {
        this.form = {
          username: "user123",
          name: "測試用戶",
          nickname: "小測",
          gender: "male",
          email: "test@example.com",
          phone: "0912345678",
          idNumber: "A123456789",
          birthday: "1990-01-01",
          addresses: [
            {
              type: "home",
              postalCode: "100",
              fullAddress: "台北市中正區忠孝東路一段1號"
            }
          ]
        };
        
      }, 100);
    },
    addNewAddress() {
      this.form.addresses.push({
        type: "home",
        postalCode: "",
        fullAddress: ""
      });
    },
    removeAddress(index) {
      this.$confirm("確定要刪除這個地址嗎？", "提示", {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.form.addresses.splice(index, 1);
          this.$message.success("地址已刪除");
        })
        .catch(() => {});
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.loading = true;
          // 模擬API調用
          setTimeout(() => {
            this.loading = false;
            this.$message.success("保存成功");
          }, 1000);
        } else {
          this.$message.error("請檢查表單是否填寫正確");
          return false;
        }
      });
    },
    goToChangePassword() {
      this.$router.push("/changepassword");
    },
    handleLineBinding() {
      if(this.isLineBound) {
        this.lineDialogVisible = true;
      } 
      else {
        this.bindLine()
      }
    },


    bindLine(){
        return new Promise((resolve, reject) => {
          get_line_binding_url()
            .then(response => {
              const { data } = response;
              
              // 成功取得 Line 登入網址
              const login_url = data['login_url']; // 取得 Line 登入網址
              if(login_url) {
                window.location.href = login_url;
              }
              else {
                throw new Error('No login URL received');
              }
              
              resolve(data);
            })
            .catch(error => {
              reject(error);
            });
      });
    },

    unbindLine() {
      return new Promise((resolve, reject) => {
          unbind_line_account()
            .then(response => {
              const { data } = response;
              console.log(data)
              resolve(data);
            })
            .catch(error => {
              reject(error);
            });
      });
    }
  }
};
</script>

<style>
.app-container {
  padding: 20px;
  background-color: #f5f7fa;
}

.el-card__title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.card-margin {
  margin-top: 20px;
}

.change-password-button {
  width: 100%;
  margin: 0;
  padding: 12px 20px;
  font-size: 14px;
}

.info-card {
  margin-bottom: 20px;
}

.info-header {
  padding: 0;
}

.info-header i {
  font-size: 18px;
  margin-right: 8px;
  color: #409eff;
}

.info-header span {
  font-size: 14px;
  color: #606266;
}

.info-content {
  text-align: center;
  padding: 20px 0;
}

.address-card {
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08) !important;
}

/* Line 綁定相關樣式 */
.line-binding-status {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px;
}

.line-status-info {
  display: flex;
  align-items: center;
}

.line-status-info i {
  font-size: 40px;
  margin-right: 20px;
}

.line-icon-bound {
  color: #4caf50;
}

.line-icon-unbound {
  color: #909399;
}

.line-status-text h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 500;
}

.line-status-text p {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
}

.line-button {
  min-width: 160px;
  margin-top: 10px;
}

.line-login-container {
  text-align: center;
  padding: 20px 0;
}

.line-qrcode {
  margin: 0 auto 20px;
  width: 200px;
  height: 200px;
}

.line-login-text {
  margin: 10px 0;
  font-size: 16px;
  font-weight: 500;
}

.line-login-note {
  margin: 10px 0 20px;
  color: #909399;
  font-size: 14px;
}

.line-login-button {
  background-color: #06C755;
  color: #fff;
  width: 80%;
  margin: 0 auto;
  border: none;
}

.line-login-button:hover,
.line-login-button:focus {
  background-color: #05b64d;
  border-color: #05b64d;
  color: #fff;
}

.line-icon {
  display: inline-block;
  width: 18px;
  height: 18px;
  background-color: #fff;
  border-radius: 50%;
  margin-right: 5px;
  vertical-align: middle;
}

.line-unbind-container {
  text-align: center;
  padding: 20px 0;
}

.line-unbind-text {
  font-size: 16px;
  margin-bottom: 10px;
}

.line-unbind-note {
  font-size: 14px;
  color: #F56C6C;
}

@media screen and (max-width: 768px) {
  .app-container {
    padding: 10px;
  }

  .el-card {
    margin-bottom: 10px;
  }

  .el-card__body {
    padding: 15px;
  }

  .el-form-item {
    margin-bottom: 12px;
  }

  .el-input__inner {
    height: 40px;
    line-height: 40px;
  }

  .el-button {
    padding: 10px 15px;
  }

  .info-card {
    margin-bottom: 10px;
  }

  .address-card {
    margin-bottom: 15px;
  }

  .change-password-button {
    padding: 12px;
    font-size: 14px;
  }

  .info-content {
    padding: 12px 0;
  }
  
  .line-binding-status {
    padding: 5px;
  }
  
  .line-status-info i {
    font-size: 30px;
    margin-right: 10px;
  }
  
  .line-button {
    width: 100%;
    margin-top: 15px;
  }
}
</style>