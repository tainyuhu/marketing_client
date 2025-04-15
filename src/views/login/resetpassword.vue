<template>
  <div class="login-container">
    <el-form
      ref="resetForm"
      :model="formData"
      :rules="formRules"
      class="login-form"
      label-position="left"
    >
      <div class="title-container">
        <h3 class="title">{{ stepTitles[currentStep] }}</h3>
      </div>

      <!-- Step 1: 工號輸入 -->
      <template v-if="currentStep === 1">
        <el-form-item prop="employeeId">
          <div class="input-label">請輸入工號</div>
          <span class="svg-container">
            <svg-icon icon-class="user" />
          </span>
          <el-input
            ref="employeeId"
            v-model="formData.employeeId"
            placeholder="請輸入工號"
            name="employeeId"
            type="text"
          />
        </el-form-item>
        <el-button
          :loading="loading"
          type="primary"
          class="submit-button"
          @click="handleStep1"
        >
          {{ loading ? "處理中..." : "下一步" }}
        </el-button>
      </template>

      <!-- Step 2: 驗證碼輸入 -->
      <template v-if="currentStep === 2">
        <div class="verification-info">
          <p>驗證碼已發送至您的LINE帳號</p>
          <p v-if="countdown > 0" class="countdown">
            {{ countdown }}秒後可重新發送
          </p>
          <el-button v-else type="text" @click="resendCode">
            重新發送驗證碼
          </el-button>
        </div>
        <el-form-item prop="verificationCode">
          <div class="input-label">請輸入驗證碼</div>
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            ref="verificationCode"
            v-model="formData.verificationCode"
            placeholder="請輸入6位數驗證碼"
            maxlength="6"
          />
        </el-form-item>
        <el-button
          :loading="loading"
          type="primary"
          class="submit-button"
          @click="handleStep2"
        >
          {{ loading ? "驗證中..." : "驗證" }}
        </el-button>
      </template>

      <!-- Step 3: 設置新密碼 -->
      <template v-if="currentStep === 3">
        <el-form-item prop="newPassword">
          <div class="input-label">請輸入新密碼</div>
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            ref="newPassword"
            v-model="formData.newPassword"
            placeholder="請輸入新密碼"
            type="password"
          />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <div class="input-label">請確認新密碼</div>
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            v-model="formData.confirmPassword"
            placeholder="請再次輸入新密碼"
            type="password"
          />
        </el-form-item>
        <el-button
          :loading="loading"
          type="primary"
          class="submit-button"
          @click="handleStep3"
        >
          {{ loading ? "處理中..." : "確認修改" }}
        </el-button>
      </template>

      <div class="back-to-login">
        <el-button type="text" @click="backToLogin">返回登入</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import { validatePassword } from "@/utils/validate";
import { sendVerificationCode, verifyCode, resetPassword } from "@/api/user";

export default {
  name: "ResetPassword",
  data() {
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.formData.newPassword) {
        callback(new Error("兩次輸入的密碼不一致"));
      } else {
        callback();
      }
    };
    return {
      currentStep: 1,
      loading: false,
      countdown: 0,
      timer: null,
      resetToken: "",
      formData: {
        employeeId: "",
        verificationCode: "",
        newPassword: "",
        confirmPassword: ""
      },
      stepTitles: {
        1: "重設密碼",
        2: "驗證碼確認",
        3: "設定新密碼"
      },
      formRules: {
        employeeId: [
          { required: true, message: "請輸入工號", trigger: "blur" }
        ],
        verificationCode: [
          { required: true, message: "請輸入驗證碼", trigger: "blur" },
          { len: 6, message: "驗證碼必須為6位數字", trigger: "blur" },
          {
            pattern: /^\d{6}$/,
            message: "驗證碼必須為6位數字",
            trigger: "blur"
          }
        ],
        newPassword: [
          { required: true, message: "請輸入新密碼", trigger: "blur" },
          { validator: validatePassword, trigger: "blur" }
        ],
        confirmPassword: [
          { required: true, message: "請確認新密碼", trigger: "blur" },
          { validator: validateConfirmPassword, trigger: "blur" }
        ]
      }
    };
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  },
  methods: {
    startCountdown() {
      this.countdown = 60;
      if (this.timer) {
        clearInterval(this.timer);
      }
      this.timer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          clearInterval(this.timer);
        }
      }, 1000);
    },
    async handleStep1() {
      try {
        await this.$refs.resetForm.validate(valid => {
          if (!valid) {
            throw new Error("請檢查輸入是否正確");
          }
        });

        this.loading = true;

        // 發送驗證碼
        const response = await sendVerificationCode(this.formData.employeeId);

        if (response.data.success) {
          this.currentStep = 2;
          this.startCountdown();
          this.$message.success("驗證碼已發送至您的LINE帳號");
        } else {
          throw new Error(response.data.message || "發送失敗");
        }
      } catch (error) {
        console.error("發送驗證碼錯誤:", error);
        this.$message.error(error.message || "發送失敗，請重試");
      } finally {
        this.loading = false;
      }
    },
    async handleStep2() {
      try {
        await this.$refs.resetForm.validate(valid => {
          if (!valid) {
            throw new Error("請檢查輸入是否正確");
          }
        });

        this.loading = true;

        // 驗證碼確認
        const response = await verifyCode({
          employeeId: this.formData.employeeId,
          code: this.formData.verificationCode
        });

        if (response.data.success) {
          // 保存重設密碼所需的 token
          this.resetToken = response.data.token;
          this.currentStep = 3;
          this.$message.success("驗證成功");
        } else {
          throw new Error(response.data.message || "驗證失敗");
        }
      } catch (error) {
        console.error("驗證碼確認錯誤:", error);
        this.$message.error(error.message || "驗證失敗，請重試");
      } finally {
        this.loading = false;
      }
    },
    async handleStep3() {
      try {
        await this.$refs.resetForm.validate(valid => {
          if (!valid) {
            throw new Error("請檢查輸入是否正確");
          }
        });

        this.loading = true;

        // 重設密碼
        const response = await resetPassword({
          token: this.resetToken,
          newPassword: this.formData.newPassword
        });

        if (response.data.success) {
          this.$message.success("密碼重設成功");
          setTimeout(() => {
            this.backToLogin();
          }, 1500);
        } else {
          throw new Error(response.data.message || "重設失敗");
        }
      } catch (error) {
        console.error("重設密碼錯誤:", error);
        this.$message.error(error.message || "重設失敗，請重試");
      } finally {
        this.loading = false;
      }
    },
    async resendCode() {
      if (this.countdown > 0) return;
      await this.handleStep1();
    },
    backToLogin() {
      this.$router.push("/login");
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";

.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: $navy-blue;

  .login-form {
    width: 100%;
    max-width: 460px;
    padding: 35px;
    margin: 20px;
    background: rgba($white, 0.1);
    border-radius: 10px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }

  .title-container {
    .title {
      font-size: 26px;
      color: $white;
      text-align: center;
      font-weight: 600;
      margin-bottom: 30px;
    }
  }

  .input-label {
    color: $white;
    font-size: 14px;
    margin-bottom: 8px;
  }

  .verification-info {
    text-align: center;
    margin-bottom: 20px;
    color: $white;

    p {
      margin-bottom: 10px;
    }

    .el-button--text {
      color: $gold;

      &:disabled {
        color: rgba($white, 0.5);
      }
    }
  }

  .svg-container {
    color: $gold;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
    text-align: center;
    font-size: 16px;
  }

  .submit-button {
    width: 100%;
    margin-top: 10px;
    padding: 12px 15px;
    font-size: 16px;
    border-radius: 4px;
    background: $gold;
    border-color: $gold;
    color: $navy-blue;

    &:hover {
      opacity: 0.9;
    }
  }

  .back-to-login {
    text-align: center;
    margin-top: 20px;

    .el-button--text {
      color: $white;
      font-size: 14px;

      &:hover {
        color: $gold;
      }
    }
  }
}

.el-form-item {
  ::v-deep .el-input__inner {
    background: transparent;
    border: 1px solid rgba($white, 0.1);
    color: $white;

    &:-webkit-autofill {
      -webkit-box-shadow: 0 0 0 1000px $navy-blue inset !important;
      -webkit-text-fill-color: $white !important;
    }

    &::placeholder {
      color: rgba($white, 0.5);
    }
  }

  ::v-deep .el-form-item__error {
    color: $red;
  }
}

// 響應式設計
@media (max-width: 768px) {
  .login-container {
    .login-form {
      margin: 10px;
      padding: 20px;
    }
  }
}
</style>
