<template>
    <div class="line-callback-container">
      <div class="callback-wrapper">
        <el-card class="callback-card" shadow="always">
          <!-- LINE Icon on top of the card -->
          <div class="line-icon-wrapper">
            <div class="line-icon-circle">
              <i class="el-icon-chat-line-square"></i>
            </div>
          </div>
  
          <h2 class="card-title">{{ pageTitle }}</h2>
  
          <div class="card-content">
            <el-alert
              v-if="error"
              :title="status"
              type="error"
              :closable="false"
              show-icon
            ></el-alert>
            <p v-else class="status-text">{{ status }}</p>
  
            <div v-if="loading" class="loading-wrapper">
              Loading
              <!-- <el-loading type="primary" :fullscreen="false"></el-loading> -->
            </div>
          </div>
  
          <div v-if="!loading" class="card-actions">
            <el-button
              type="primary"
              @click="navigateTo(returnPath)"
              class="return-button"
            >
              <i class="el-icon-arrow-left"></i>
              {{ returnBtnText }}
            </el-button>
          </div>
        </el-card>
      </div>
    </div>
  </template>
  
  <script>
import { exchange_line_login_token } from "@/api/line_login";
import { setToken } from "@/utils/auth";
  export default {
    name: "LineLoginCallback",
    data() {
      return {
        status: "處理中...",
        loading: true,
        error: false,
        hasProcessed: false
      };
    },
    computed: {
      // 判斷當前模式
      mode() {
        return this.$route.query.mode || "login";
      },
      isLoginMode() {
        return this.mode === "login";
      },
      pageTitle() {
        return this.isLoginMode ? "LINE 登入" : "LINE 帳號綁定";
      },
      returnPath() {
        return this.isLoginMode ? "/login" : "profile/account";
      },
      returnBtnText() {
        return this.isLoginMode ? "返回登入頁面" : "返回個人資料頁面";
      }
    },
    created() {
      this.handleCallback();
    },
    methods: {
      navigateTo(path) {
        this.$router.replace(path);
      },
      async handleCallback() {
        // 防止重複處理
        if (this.hasProcessed) return;
        this.hasProcessed = true;
  
        // 從 URL 查詢參數中獲取令牌和模式
        const tempToken = this.$route.query.temp_token;
  
        // 設定適當的狀態消息
        const actionText = this.isLoginMode ? "登入" : "綁定";
  
        // 確認要有臨時令牌
        if (!tempToken) {
          this.status = `${actionText}失敗: 未收到臨時令牌`;
          this.error = true;
          this.loading = false;
          return;
        }
  
        // 交換臨時令牌
        try {
          const response = await exchange_line_login_token({
            temp_token: tempToken,
          });
          
          // 登入使用
          if (this.isLoginMode) {
            this.status = "登入成功，正在跳轉...";
            
            // 取得 TOKEN
            const accessToken = response.data.access_token;
            const refreshToken = response.data.refresh_token;

            // 登入模式 - 儲存令牌並初始化認證
            this.$store.commit("user/SET_TOKEN", accessToken);
            setToken(accessToken);
      
            // // 登入後，立即獲取用戶資料
            try {
              await this.$store.dispatch("user/getInfo");
              
              // 導引向首頁
              this.$router.replace("/");
              
              // this.$message({
              //   message: "登入成功！",
              //   type: "success",
              //   duration: 3000
              // });
            } 
            catch (error) {
              console.error("初始化認證狀態時出錯:", error);
              this.status = "登入成功，但獲取用戶資料失敗";
              this.error = true;
              // this.$message({
              //   message: "LINE 帳號登入失敗",
              //   type: "error",
              //   duration: 3000
              // });
              // this.$router.replace("/");
            }
          }
          // 綁定帳號使用
          else {
            this.status = "LINE 帳號綁定成功，正在跳轉...";
            // this.$message({
            //   message: "LINE 帳號綁定成功",
            //   type: "success",
            //   duration: 3000
            // });
  
            // // 如果取消綁定的是當前用戶，則重新初始化身份驗證
            // this.$store.dispatch("auth/fetchUserInfo"); // 更新 Vuex 中的用戶資料
  
            // // 跳轉到個人資料頁面
            // this.$router.replace("/my/profile");
          }
        } 
        catch (error) {
          this.status = error.message || "交換臨時令牌失敗";
          this.error = true;
          // this.$message({
          //   message: "LINE 帳號綁定失敗",
          //   type: "error",
          //   duration: 3000
          // });
        } finally {
          this.loading = false;
        }
      }
    }
  };
  </script>
  
  <style>
  .line-callback-container {
    min-height: 100vh;
    background-color: #f5f7fa;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  }
  
  .callback-wrapper {
    width: 100%;
    max-width: 450px;
    position: relative;
  }
  
  .callback-card {
    border-radius: 8px;
    overflow: visible;
    position: relative;
    padding: 16px;
    margin-top: 30px;
  }
  
  .line-icon-wrapper {
    position: absolute;
    top: -28px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
  }
  
  .line-icon-circle {
    width: 56px;
    height: 56px;
    background-color: #06C755;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .line-icon-circle i {
    font-size: 28px;
    color: white;
  }
  
  .card-title {
    text-align: center;
    font-weight: bold;
    margin-top: 30px;
    margin-bottom: 20px;
    font-size: 18px;
    color: #303133;
  }
  
  .card-content {
    text-align: center;
    padding: 10px 0 20px;
    min-height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  .status-text {
    color: #606266;
    margin: 16px 0;
    font-size: 14px;
  }
  
  .loading-wrapper {
    margin: 20px 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .card-actions {
    text-align: center;
    padding-bottom: 10px;
  }
  
  .return-button {
    background-color: #06C755;
    border-color: #06C755;
    color: white;
    padding: 10px 20px;
    border-radius: 8px;
  }
  
  .return-button:hover,
  .return-button:focus {
    background-color: #05b64d;
    border-color: #05b64d;
  }
  
  .el-loading-spinner .circular {
    width: 40px;
    height: 40px;
  }
  
  /* El-alert 樣式調整 */
  .el-alert {
    width: 100%;
    margin: 10px 0;
  }
  
  @media screen and (max-width: 768px) {
    .line-callback-container {
      padding: 10px;
    }
    
    .callback-card {
      padding: 10px;
    }
    
    .card-title {
      margin-top: 25px;
      font-size: 16px;
    }
    
    .status-text {
      margin: 10px 0;
    }
    
    .return-button {
      padding: 8px 15px;
      font-size: 14px;
    }
  }
  </style>