<template>
  <div class="app-container">
    <!-- 主要內容區 -->
    <div class="profile-layout">
      <!-- 左側固定區域 - 用戶資訊卡片 -->
      <div class="profile-sidebar" :class="{ 'mobile-view': isMobile }">
        <div class="user-card">
          <div class="user-avatar">
            <img
              :src="form.avatar + '?imageView2/1/w/80/h/80'"
              class="avatar-img"
              :style="{
                width: (isMobile ? 64 : 80) + 'px',
                height: (isMobile ? 64 : 80) + 'px'
              }"
              @error="handleAvatarError"
            />
          </div>
          <div class="user-info">
            <h2 class="user-name">{{ form.name || form.username }}</h2>
            <p class="user-role">{{ form.nickname || "一般會員" }}</p>
            <div class="user-meta">
              <span class="meta-item">
                <i class="el-icon-date"></i>
                {{ date_joined }}
              </span>
              <span class="meta-item">
                <i :class="lineBindingIconClass"></i>
                <span
                  :class="[
                    'status-badge',
                    isLineBound
                      ? 'status-badge-success'
                      : 'status-badge-warning'
                  ]"
                >
                  {{ isLineBound ? "LINE已綁定" : "LINE未綁定" }}
                </span>
              </span>
            </div>
          </div>
        </div>

        <!-- 資料完整度進度條 -->
        <div class="profile-completion">
          <div class="completion-header">
            <span>資料完整度</span>
            <span>{{ profileCompletionPercentage }}%</span>
          </div>
          <el-progress
            :percentage="profileCompletionPercentage"
            :color="profileCompletionColor"
            :stroke-width="8"
          ></el-progress>
        </div>

        <!-- 快速操作區 -->
        <div class="quick-actions">
          <el-button
            type="primary"
            icon="el-icon-lock"
            class="action-button"
            @click="goToChangePassword"
          >
            修改密碼
          </el-button>
          <el-button
            :type="isLineBound ? 'danger' : 'success'"
            :icon="isLineBound ? 'el-icon-close' : 'el-icon-connection'"
            class="action-button"
            @click="handleLineBinding"
          >
            {{ isLineBound ? "解除LINE綁定" : "綁定LINE帳號" }}
          </el-button>
        </div>
      </div>

      <!-- 右側表單區域 -->
      <div class="profile-content">
        <el-tabs type="border-card" class="profile-tabs">
          <!-- 基本資料 -->
          <el-tab-pane>
            <template #label>
              <span><i class="el-icon-user"></i> 基本資料</span>
            </template>

            <el-form
              ref="form"
              :model="form"
              :rules="rules"
              :label-width="isMobile ? '90px' : '120px'"
              :label-position="isMobile ? 'top' : 'right'"
              size="medium"
              class="profile-form"
            >
              <el-form-item label="帳號" prop="username" class="form-item">
                <el-input v-model="form.username" disabled></el-input>
              </el-form-item>

              <el-form-item label="姓名" prop="name" class="form-item">
                <el-input v-model="form.name"></el-input>
              </el-form-item>

              <el-form-item label="暱稱" prop="nickname" class="form-item">
                <el-input v-model="form.nickname"></el-input>
              </el-form-item>

              <el-form-item label="性別" prop="gender" class="form-item">
                <el-radio-group v-model="form.gender">
                  <el-radio label="M">男</el-radio>
                  <el-radio label="F">女</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="Email" prop="email" class="form-item">
                <el-input v-model="form.email"></el-input>
              </el-form-item>

              <el-form-item label="手機號碼" prop="phone" class="form-item">
                <el-input v-model="form.phone"></el-input>
              </el-form-item>

              <el-form-item label="生日" prop="birthday" class="form-item">
                <el-date-picker
                  v-model="form.birthday"
                  type="date"
                  style="width: 100%"
                  value-format="yyyy-MM-dd"
                  placeholder="選擇日期"
                ></el-date-picker>
              </el-form-item>

              <div class="form-actions">
                <el-button
                  type="primary"
                  @click="submitForm"
                  :loading="loading"
                >
                  儲存變更
                </el-button>
              </div>
            </el-form>
          </el-tab-pane>

          <!-- 地址管理 -->
          <el-tab-pane>
            <template #label>
              <span><i class="el-icon-location"></i> 地址管理</span>
            </template>

            <el-form
              ref="addressForm"
              :model="form"
              :label-width="isMobile ? '90px' : '120px'"
              :label-position="isMobile ? 'top' : 'right'"
              size="medium"
              class="profile-form"
            >
              <el-form-item label="通訊地址" prop="address" class="form-item">
                <el-input v-model="form.address"></el-input>
              </el-form-item>

              <el-form-item
                label="常用地址1"
                prop="mailing_address_1"
                class="form-item"
              >
                <el-input v-model="form.mailing_address_1"></el-input>
              </el-form-item>

              <el-form-item
                label="常用地址2"
                prop="mailing_address_2"
                class="form-item"
              >
                <el-input v-model="form.mailing_address_2"></el-input>
              </el-form-item>

              <div class="form-actions">
                <el-button
                  type="primary"
                  @click="submitForm"
                  :loading="loading"
                >
                  儲存地址
                </el-button>
              </div>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <el-dialog
      :title="isLineBound ? '解除 LINE 綁定' : 'LINE 帳號綁定'"
      :visible.sync="lineDialogVisible"
      width="90%"
      :fullscreen="isMobile"
      center
      custom-class="line-dialog"
    >
      <div v-if="isLineBound" class="line-unbind-container">
        <div class="line-profile-info" v-if="lineBindingInfo.lineUsername">
          <div class="line-avatar">
            <img
              :src="lineProfilePicture + '?imageView2/1/w/80/h/80'"
              alt="LINE Avatar"
              class="line-avatar-img"
              @error="handleLineAvatarError"
            />
          </div>
          <div class="line-details">
            <h3>{{ lineBindingInfo.lineUsername }}</h3>
            <p>綁定時間：{{ lineBindingInfo.bindingDate }}</p>
          </div>
        </div>
        <div class="unbind-confirmation">
          <el-alert
            title="確定要解除 LINE 帳號綁定嗎？"
            type="warning"
            :closable="false"
            show-icon
          >
            <div class="unbind-alert-content">
              解除綁定後，將無法使用 LINE 進行快速登入
            </div>
          </el-alert>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="lineDialogVisible = false" plain>{{
          isLineBound ? "取消" : "稍後再說"
        }}</el-button>
        <el-button v-if="isLineBound" type="danger" @click="unbindLine" round>
          確認解除綁定
        </el-button>
        <el-button v-else type="primary" @click="bindLine" round>
          確認綁定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { get_line_binding_url, unbind_line_account } from "@/api/line_login";
import { getInfo, updateUserProfile } from "@/api/user";

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
        birthday: "",
        address: "",
        mailing_address_1: "",
        mailing_address_2: "",
        avatar: ""
      },
      rules: {
        name: [
          { required: true, message: "請輸入姓名", trigger: "blur" },
          { min: 2, max: 20, message: "長度在 2 到 20 個字符", trigger: "blur" }
        ],
        email: [
          { required: true, message: "請輸入信箱", trigger: "blur" },
          { type: "email", message: "請輸入正確的信箱", trigger: "blur" }
        ],
        phone: [
          { required: true, message: "請輸入手機號碼", trigger: "blur" },
          {
            pattern: /^09\d{8}$/,
            message: "請輸入正確的手機號碼格式",
            trigger: "blur"
          }
        ],
        birthday: [
          { required: true, message: "請選擇生日", trigger: "change" }
        ],
        nickname: [{ required: true, message: "請輸入暱稱", trigger: "blur" }],
        gender: [{ required: true, message: "請選擇性別", trigger: "change" }]
      },

      isLineBound: false,
      lineDialogVisible: false,
      lineBindingInfo: {
        bindingDate: "",
        lineUsername: ""
      },
      lineProfilePicture: "/media/default/avatar.png",
      date_joined: "",
      isMobile: false
    };
  },
  computed: {
    ...mapGetters(["avatar"]),
    lineBindingIconClass() {
      return this.isLineBound
        ? "el-icon-check line-icon-bound"
        : "el-icon-warning-outline line-icon-unbound";
    },
    profileCompletionPercentage() {
      const requiredFields = [
        "name",
        "nickname",
        "gender",
        "email",
        "phone",
        "birthday",
        "address"
      ];

      const filledFieldsCount = requiredFields.filter(
        field => this.form[field] && this.form[field].toString().trim() !== ""
      ).length;

      return Math.round((filledFieldsCount / requiredFields.length) * 100);
    },
    profileCompletionColor() {
      const percentage = this.profileCompletionPercentage;
      if (percentage < 40) return "#f56c6c"; // 紅色
      if (percentage < 70) return "#e6a23c"; // 橙色
      if (percentage < 90) return "#409eff"; // 藍色
      return "#67c23a"; // 綠色
    }
  },
  created() {
    this.fetchUserData();
    this.checkDevice();
    window.addEventListener("resize", this.checkDevice);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.checkDevice);
  },
  methods: {
    checkDevice() {
      this.isMobile = window.innerWidth < 768;
    },
    fetchUserData() {
      getInfo().then(response => {
        const data = response.data;

        // 寫入基本資料
        this.form = {
          username: data.username || "",
          name: data.name || "",
          nickname: data.nickname || "",
          gender: data.gender || "",
          email: data.email || "",
          phone: data.phone || "",
          birthday: data.birthday || "",
          address: data.address || "",
          mailing_address_1: data.mailing_address_1 || "",
          mailing_address_2: data.mailing_address_2 || "",
          avatar: data.avatar || "/media/default/avatar.png"
        };

        // 寫入 LINE 綁定狀態
        this.isLineBound = data.is_line_bound || false;
        this.lineBindingInfo = {
          bindingDate: data.line_bind_time || "-",
          lineUsername:
            (data.line_profile && data.line_profile.display_name) || "未提供"
        };

        // 如果有LINE頭像，設置到dialog中
        if (data.line_profile && data.line_profile.picture_url) {
          this.lineProfilePicture = data.line_profile.picture_url;
        }

        // 寫入加入時間
        this.date_joined = data.date_joined || "";
      });
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.loading = true;

          console.log(
            "即將發送的表單數據:",
            JSON.stringify(this.form, null, 2)
          );

          // 實際發送API請求更新用戶資料
          updateUserProfile(this.form)
            .then(response => {
              this.loading = false;
              this.$msgbox({
                message: "資料已成功儲存",
                type: "success",
                duration: 2000
              });

              // 更新store中的用戶資訊
              this.$store.dispatch("user/updateUserInfo", this.form);
            })
            .catch(error => {
              this.loading = false;
              this.$msgbox({
                message: "儲存失敗: " + (error.message || "未知錯誤"),
                type: "error",
                duration: 2000
              });
            });
        } else {
          this.$msgbox({
            message: "請檢查表單是否填寫正確",
            type: "error",
            duration: 2000
          });
          return false;
        }
      });
    },
    goToChangePassword() {
      this.$router.push("/changepassword");
    },
    handleLineBinding() {
      if (this.isLineBound) {
        this.lineDialogVisible = true;
      } else {
        this.bindLine();
      }
    },
    handleAvatarError(e) {
      e.target.src = "/media/default/avatar.png"; // 設置預設頭像
    },
    handleLineAvatarError(e) {
      e.target.src = "/media/default/avatar.png"; // 設置預設頭像
    },
    bindLine() {
      return new Promise((resolve, reject) => {
        get_line_binding_url()
          .then(response => {
            const { data } = response;

            // 成功取得 Line 登入網址
            const login_url = data["login_url"]; // 取得 Line 登入網址
            console.log(`Redirecting to Line login URL: ${login_url}`);
            if (login_url) {
              window.location.href = login_url;
            } else {
              throw new Error("No login URL received");
            }

            resolve(data);
          })
          .catch(error => {
            this.$msgbox({
              message: "LINE綁定失敗，請稍後再試",
              type: "error",
              duration: 2000
            });
            reject(error);
          });
      });
    },

    unbindLine() {
      return new Promise((resolve, reject) => {
        unbind_line_account()
          .then(response => {
            const { data } = response;
            this.lineDialogVisible = false;
            this.isLineBound = false;

            // 更新local狀態
            this.form.avatar = "/media/default/avatar.png";

            // 更新store
            this.$store.dispatch("user/updateUserInfo", {
              is_line_bound: false,
              avatar: "/media/default/avatar.png"
            });

            this.$msgbox({
              message: "已成功解除LINE綁定",
              type: "success",
              duration: 2000
            });
            resolve(data);
          })
          .catch(error => {
            this.$msgbox({
              message: "解除LINE綁定失敗",
              type: "error",
              duration: 2000
            });
            reject(error);
          });
      });
    }
  }
};
</script>

<style scoped>
.app-container {
  padding: 16px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 整體布局 */
.profile-layout {
  display: flex;
  gap: 20px;
  min-height: calc(100vh - 32px);
}

/* 左側固定區域 */
.profile-sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.profile-sidebar.mobile-view {
  width: 100%;
  margin-bottom: 20px;
  min-height: auto;
}

/* 用戶卡片 */
.user-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
}

.user-avatar {
  margin-bottom: 16px;
  position: relative;
  display: inline-block;
}

.avatar-img {
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 3px solid #fff;
  transition: all 0.3s ease;
}

.user-name {
  font-size: 18px;
  margin: 0 0 4px 0;
  color: #303133;
}

.user-role {
  color: #606266;
  margin: 0 0 12px 0;
  font-size: 14px;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  margin-top: auto;
}

.meta-item {
  font-size: 14px;
  color: #606266;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.line-icon-bound {
  color: #4caf50;
}

.line-icon-unbound {
  color: #909399;
}

/* 狀態徽標樣式 */
.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-left: 6px;
  text-align: center;
}

.status-badge-success {
  background-color: #e7f7ee;
  color: #4caf50;
  border: 1px solid #b7e1c4;
}

.status-badge-warning {
  background-color: #fff8e6;
  color: #e6a23c;
  border: 1px solid #f3d19e;
}

/* 資料完整度樣式 */
.profile-completion {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.completion-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
  color: #606266;
}

/* 快速操作區 */
.quick-actions {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 0 0 auto;
}

.action-button {
  width: 100%;
  transition: all 0.3s ease;
}

/* 右側內容區 */
.profile-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

/* 表單樣式 */
.profile-tabs {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.el-tabs__content {
  flex: 1;
  overflow: auto;
}

.profile-form {
  padding: 16px 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.form-item {
  margin-bottom: 20px;
}

.form-actions {
  margin-top: auto;
  padding: 30px 20px 20px 20px;
  display: flex;
  justify-content: flex-end;
}

/* LINE相關樣式 */
.line-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.line-login-container,
.line-unbind-container {
  padding: 20px 0;
}

.line-qrcode {
  margin: 0 auto 24px;
  width: 200px;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.line-login-text {
  margin: 12px 0;
  font-size: 16px;
  font-weight: 500;
}

.line-login-note {
  margin: 8px 0 24px;
  color: #909399;
  font-size: 14px;
}

.line-login-button {
  background-color: #06c755;
  color: #fff;
  width: 80%;
  margin: 0 auto;
  border: none;
  padding: 12px 20px;
  font-size: 16px;
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
  margin-right: 8px;
  vertical-align: middle;
}

.line-profile-info {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f8f8f8;
  border-radius: 8px;
  border: 1px solid #eaeaea;
}

.line-avatar {
  margin-right: 20px;
}

.line-avatar-img {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.line-details h3 {
  margin: 0 0 6px 0;
  font-size: 18px;
  color: #303133;
}

.line-details p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.unbind-confirmation {
  margin-top: 10px;
  margin-bottom: 20px;
}

.unbind-alert-content {
  margin-top: 8px;
  font-size: 14px;
  color: #996633;
}

/* 按鈕樣式調整 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding: 0 0 12px 0;
  margin-top: 5px;
}

.dialog-footer .el-button {
  margin-left: 12px;
}

.dialog-footer .el-button--danger {
  background-color: #f56c6c;
  border-color: #f56c6c;
  box-shadow: 0 2px 6px rgba(245, 108, 108, 0.2);
  font-weight: 500;
}

.dialog-footer .el-button--danger:hover {
  background-color: #d95353;
  border-color: #d95353;
}

.dialog-footer .el-button--plain {
  border-color: #dcdfe6;
  color: #606266;
}

/* 舊的和移除的LINE綁定樣式 */
.line-unbind-text {
  font-size: 16px;
  margin-bottom: 8px;
  font-weight: 500;
}

.line-unbind-note {
  font-size: 14px;
  color: #f56c6c;
}

/* 響應式設計 */
@media screen and (max-width: 768px) {
  .profile-layout {
    flex-direction: column;
    min-height: auto;
  }

  .user-card {
    flex-direction: row;
    text-align: left;
    padding: 16px;
  }

  .user-avatar {
    margin-bottom: 0;
    margin-right: 16px;
  }

  .user-info {
    flex-grow: 1;
  }

  .user-meta {
    flex-direction: row;
    gap: 16px;
    margin-top: 10px;
  }

  .quick-actions {
    flex-direction: row;
    justify-content: space-between;
    padding: 12px;
  }

  .action-button {
    width: 48%;
  }

  .form-actions {
    padding: 20px 15px 15px 15px;
    justify-content: center;
  }

  .line-qrcode {
    width: 160px;
    height: 160px;
  }

  .status-badge {
    padding: 1px 6px;
    font-size: 11px;
  }

  /* 手機版LINE解綁對話框樣式優化 */
  .line-dialog .el-dialog__body {
    padding: 15px;
  }

  .line-unbind-container {
    padding: 10px 0;
  }

  .line-profile-info {
    display: flex;
    flex-direction: row;
    align-items: center;
    text-align: left;
    padding: 15px;
    margin-bottom: 16px;
  }

  .line-avatar {
    margin-right: 16px;
    margin-bottom: 0;
  }

  .line-avatar-img {
    width: 50px;
    height: 50px;
  }

  .line-details h3 {
    font-size: 16px;
    margin-bottom: 4px;
  }

  .line-details p {
    font-size: 13px;
  }

  .unbind-confirmation {
    margin: 5px 0 15px;
  }

  .unbind-alert-content {
    font-size: 13px;
  }

  .dialog-footer {
    padding: 0 0 10px 0;
    justify-content: center;
  }

  .dialog-footer .el-button {
    margin: 0 6px;
    font-size: 14px;
    padding: 9px 15px;
  }
}
</style>
