<template>
  <div class="bank-info-display">
    <div class="bank-info-content">
      <div v-if="parsedInfo" class="bank-info-items">
        <div
          v-for="(item, index) in infoItems"
          :key="index"
          class="bank-info-item"
        >
          <div class="item-label">{{ item.label }}：</div>
          <div class="item-value">{{ item.value }}</div>
          <el-tooltip
            :content="`複製${item.label}`"
            placement="top"
            :open-delay="300"
          >
            <el-button
              type="text"
              class="copy-button"
              @click="copyText(item.value, item.label)"
            >
              <i class="el-icon-document-copy"></i>
            </el-button>
          </el-tooltip>
        </div>
      </div>
      <div v-else class="bank-info-empty">{{ bankInfo || "-" }}</div>
    </div>
    <div class="bank-info-actions">
      <el-tooltip content="複製所有資訊" placement="top" :open-delay="300">
        <el-button
          type="text"
          size="mini"
          icon="el-icon-document-copy"
          @click="copyAllInfo"
          :disabled="!parsedInfo"
        >
          複製全部
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script>
export default {
  name: "BankInfoDisplay",
  props: {
    bankInfo: {
      type: [String, Object],
      default: null
    },
    bankOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      copySuccess: false,
      lastCopied: ""
    };
  },
  computed: {
    parsedInfo() {
      if (!this.bankInfo) return null;

      if (typeof this.bankInfo === "object") {
        return this.bankInfo;
      }

      try {
        return JSON.parse(this.bankInfo);
      } catch (e) {
        console.error("解析銀行資訊失敗:", e);
        return null;
      }
    },

    infoItems() {
      if (!this.parsedInfo) return [];

      const bankName = this.getBankName(this.parsedInfo.bankCode);

      return [
        { label: "銀行代號", value: this.parsedInfo.bankCode || "-" },
        { label: "銀行名稱", value: bankName || "-" },
        { label: "銀行帳號", value: this.parsedInfo.bankAccount || "-" },
        { label: "戶名", value: this.parsedInfo.bankAccountName || "-" }
      ];
    }
  },
  methods: {
    getBankName(bankCode) {
      if (!bankCode) return "";

      const bank = this.bankOptions.find(bank => bank.value === bankCode);
      return bank ? bank.label : bankCode;
    },

    copyText(text, label) {
      if (!text || text === "-") return;

      this.lastCopied = label;
      this.execCommandCopy(text);
    },

    copyAllInfo() {
      if (!this.parsedInfo) return;

      const bankName = this.getBankName(this.parsedInfo.bankCode);

      // 格式化要複製的文本
      const textToCopy =
        `銀行代號：${this.parsedInfo.bankCode || "-"}\n` +
        `銀行名稱：${bankName || "-"}\n` +
        `銀行帳號：${this.parsedInfo.bankAccount || "-"}\n` +
        `戶名：${this.parsedInfo.bankAccountName || "-"}`;

      this.lastCopied = "所有銀行資訊";
      this.execCommandCopy(textToCopy);
    },

    execCommandCopy(text) {
      try {
        // 創建一個臨時文本區域
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // 設置樣式確保元素在視口之外，但仍然在頁面中
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        textArea.style.opacity = "0";

        // 對於移動設備的支持
        textArea.contentEditable = true;
        textArea.readOnly = false;

        // 添加到 DOM
        document.body.appendChild(textArea);

        // 選中文本
        textArea.focus();
        textArea.select();

        // 對於移動裝置
        textArea.setSelectionRange(0, text.length);

        // 執行複製命令
        const successful = document.execCommand("copy");

        // 從 DOM 移除臨時元素
        document.body.removeChild(textArea);

        if (successful) {
          this.showCustomToast(`已複製${this.lastCopied}`, "success");
        } else {
          this.showCustomToast("複製失敗，請手動複製", "error");
        }
      } catch (err) {
        console.error("複製失敗:", err);
        this.showCustomToast("複製失敗，請手動複製", "error");
      }
    },

    showCustomToast(message, type = "success") {
      // 檢查是否已存在 toast，如果有則先移除
      const existingToast = document.getElementById("bank-info-toast");
      if (existingToast) {
        document.body.removeChild(existingToast);
      }

      // 創建 toast 元素
      const toast = document.createElement("div");
      toast.id = "bank-info-toast";
      toast.textContent = message;

      // 設置樣式
      toast.style.position = "fixed";
      toast.style.bottom = "20px";
      toast.style.left = "50%";
      toast.style.transform = "translateX(-50%)";
      toast.style.backgroundColor = type === "success" ? "#67C23A" : "#F56C6C";
      toast.style.color = "white";
      toast.style.padding = "10px 20px";
      toast.style.borderRadius = "4px";
      toast.style.zIndex = "9999";
      toast.style.fontSize = "14px";
      toast.style.boxShadow = "0 2px 12px rgba(0, 0, 0, 0.1)";
      toast.style.opacity = "1";
      toast.style.transition = "opacity 0.3s";

      // 添加到頁面
      document.body.appendChild(toast);

      // 設置淡出和移除
      setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 300);
      }, 2000);
    }
  }
};
</script>

<style lang="scss" scoped>
.bank-info-display {
  width: 100%;

  .bank-info-content {
    margin-bottom: 5px;
  }

  .bank-info-items {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .bank-info-item {
    display: flex;
    align-items: center;
    line-height: 1.4;
    position: relative;

    &:hover {
      background-color: #f5f7fa;
    }

    .item-label {
      flex: 0 0 70px;
      font-size: 13px;
      color: #606266;
    }

    .item-value {
      flex: 1;
      font-size: 13px;
      color: #303133;
      margin-right: 5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .copy-button {
      opacity: 0;
      transition: opacity 0.2s;
      padding: 2px 5px;
      margin-left: auto;

      i {
        font-size: 14px;
      }
    }

    &:hover .copy-button {
      opacity: 1;
    }
  }

  .bank-info-empty {
    color: #909399;
    font-style: italic;
    min-height: 20px;
  }

  .bank-info-actions {
    margin-top: 5px;
    display: flex;
    justify-content: flex-end;

    .el-button {
      font-size: 12px;

      i {
        margin-right: 3px;
      }
    }
  }
}

/* 為表格中使用添加樣式 */
:deep(.el-table) .bank-info-display {
  padding: 0 5px;

  .bank-info-items {
    gap: 2px;
  }
}

/* 適應暗色主題 */
.dark-theme {
  .bank-info-item {
    &:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }

    .item-label {
      color: #a7a9bc;
    }

    .item-value {
      color: #e1e1e1;
    }
  }

  .bank-info-empty {
    color: #878791;
  }
}
</style>
