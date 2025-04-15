<template>
  <div class="login-container">
    <!-- LOGO 區域 -->
    <div class="logo-container">
      <img src="@/assets/logo/sunny_logo.png" alt="LOGO" class="logo" />
    </div>

    <el-form
      ref="loginForm"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
      auto-complete="on"
      label-position="left"
    >
      <div class="title-container">
        <h3 class="title">企業員工專屬團購平台</h3>
      </div>

      <!-- 帳號輸入 -->
      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          v-model="loginForm.username"
          placeholder="帳號"
          name="username"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>

      <!-- 密碼輸入 -->
      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          :key="passwordType"
          ref="password"
          v-model="loginForm.password"
          :type="passwordType"
          placeholder="密碼"
          name="password"
          tabindex="2"
          auto-complete="on"
          @keyup.enter.native="handleLogin"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon
            :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"
          />
        </span>
      </el-form-item>

      <!-- 登入按鈕 -->
      <el-button
        :loading="loading"
        class="login-button"
        @click.native.prevent="handleLogin"
        >登入</el-button
      >

      <!-- 額外功能按鈕 -->
      <div class="extra-buttons">
        <el-button class="line-button" @click="handleLineLogin"
          >LINE 登入</el-button
        >
        <div class="extra-actions">
          <el-button class="first-login-button" @click="handleForgetPassword"
            >忘記密碼</el-button
          >
        </div>
      </div>
    </el-form>
  </div>
</template>

<script>
import { get_line_login_url } from "@/api/line_login";
export default {
  name: "Login",
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value.length < 4) {
        callback(new Error("密碼長度有誤"));
      } else {
        callback();
      }
    };
    return {
      loginForm: {
        username: "",
        password: ""
      },
      loginRules: {
        username: [{ required: true, trigger: "blur", message: "請輸入帳號" }],
        password: [
          {
            required: true,
            trigger: "blur",
            validator: validatePassword,
            message: "請輸入密碼"
          }
        ]
      },
      loading: false,
      passwordType: "password",
      redirect: undefined
    };
  },
  methods: {
    showPwd() {
      this.passwordType = this.passwordType === "password" ? "" : "password";
      this.$nextTick(() => {
        this.$refs.password.focus();
      });
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true;
          this.$store
            .dispatch("user/login", this.loginForm)
            .then(response => {
              console.log(response);
              if (response.data.need_change_password) {
                // 如果需要更改密碼，跳轉到更改密碼頁面
                this.$router.replace("/changepassword");
              } else {
                // 否則跳轉到原定的重定向頁面或首頁
                this.$router.replace({ path: this.redirect || "/" });
              }
              this.loading = false;
            })
            .catch(() => {
              this.loading = false;
            });
        } else {
          console.log("輸入錯誤，請重新輸入!");
          return false;
        }
      });
    },
    handleLineLogin() {
      return new Promise((resolve, reject) => {
        get_line_login_url()
          .then(response => {
            const { data } = response;

            // 成功取得 Line 登入網址
            const login_url = data["login_url"]; // 取得 Line 登入網址
            if (login_url) {
              window.location.href = login_url;
            } else {
              throw new Error("No login URL received");
            }

            resolve(data);
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    handleForgetPassword() {
      sessionStorage.setItem("resetPasswordAccess", "true");
      this.$router.replace("/resetpassword");
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";

.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 20px;
  background-color: $navy-blue;
  overflow: hidden;
  position: relative;

  .logo-container {
    margin-bottom: 20px;
    text-align: center;

    .logo {
      width: 300px;
      height: auto;
    }
  }

  .login-form {
    position: relative;
    width: 100%;
    max-width: 400px;
    padding: 20px;
    background-color: rgba($white, 0.1);
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .title-container .title {
    font-size: 24px;
    color: $white;
    text-align: center;
    font-weight: bold;
    margin-bottom: 20px;
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $gold;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .show-pwd {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 16px;
    color: $gold;
    cursor: pointer;
  }

  .login-button {
    width: 100%;
    height: 45px;
    background-color: $gold;
    color: $navy-blue;
    font-weight: bold;
    border: 2px solid $gold;
    border-radius: 5px;
    margin-bottom: 20px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: darken($gold, 10%);
      color: $white;
    }
  }

  .extra-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .line-button {
      background-color: #00c300;
      color: $white;
      width: 100%;
      height: 45px;
      font-weight: bold;
      border: none;
      border-radius: 5px;
      cursor: pointer;

      &:hover {
        background-color: darken(#00c300, 10%);
      }
    }

    .extra-actions {
      display: flex;
      justify-content: center;
      .first-login-button {
        margin: 2pt;
        width: 100%;
        height: 40px;
        font-weight: bold;
        border-radius: 5px;
        background-color: $navy-blue;
        color: $white;
        cursor: pointer;

        &:hover {
          background-color: $navy-blue-hover;
        }
      }
    }
  }
}
</style>
