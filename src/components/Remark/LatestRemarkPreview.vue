<!-- components/Remark/LatestRemarkPreview.vue -->
<template>
  <div
    class="remark-preview"
    @click="viewTimeline"
    :class="{ 'is-empty': !remark }"
  >
    <template v-if="remark">
      <div class="remark-content">
        <div class="remark-content-wrapper">
          <div v-if="isImportantOrPinned" class="remark-badge">
            <i class="el-icon-star-on"></i>
          </div>
          <p class="remark-text" :title="remark.content" ref="remarkText">
            {{ displayContent }}
          </p>
        </div>
        <div class="remark-meta">
          <span class="remark-time">{{ formattedTime }}</span>
          <span v-if="remarkCount > 1" class="remark-count"
            >+{{ remarkCount - 1 }}</span
          >
        </div>
      </div>
    </template>
    <div v-else class="no-remark">
      <i class="el-icon-edit"></i>
      <span>{{ addRemarkText }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "LatestRemarkPreview",

  props: {
    /**
     * 最新的備註對象
     */
    remark: {
      type: Object,
      default: null
    },

    /**
     * 備註總數
     */
    remarkCount: {
      type: Number,
      default: 0
    },

    /**
     * 無備註時顯示的文字
     */
    addRemarkText: {
      type: String,
      default: "添加備註"
    },

    /**
     * 最少顯示字元數
     */
    minChars: {
      type: Number,
      default: 6
    },

    /**
     * 表格模式的截斷設置
     * 根據不同的表格列寬設置不同的截斷長度
     */
    tableTruncateConfig: {
      type: Object,
      default: () => ({
        narrow: 20, // <200px (窄列)
        medium: 40, // 200-300px (中等列)
        wide: 60, // 300-400px (寬列)
        extraWide: 100 // >400px (超寬列)
      })
    }
  },

  data() {
    return {
      displayContent: "",
      cellWidth: 0,
      resizeObserver: null,
      debounceTimer: null
    };
  },

  computed: {
    /**
     * 判斷備註是否為重要或固定
     */
    isImportantOrPinned() {
      return this.remark && (this.remark.is_important || this.remark.is_pinned);
    },

    /**
     * 格式化後的時間
     */
    formattedTime() {
      if (!this.remark || !this.remark.create_time) return "";

      const date = new Date(this.remark.create_time);
      const now = new Date();

      // 如果是今天的備註，只顯示時間
      if (this.isSameDay(date, now)) {
        return this.formatDate(date, "HH:mm");
      }

      // 如果是昨天的備註，顯示"昨天"加時間
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      if (this.isSameDay(date, yesterday)) {
        return `昨天 ${this.formatDate(date, "HH:mm")}`;
      }

      // 如果是本週的備註，顯示星期幾
      if (this.isInSameWeek(date, now)) {
        const days = ["日", "一", "二", "三", "四", "五", "六"];
        return `週${days[date.getDay()]} ${this.formatDate(date, "HH:mm")}`;
      }

      // 如果是同年的備註，顯示月日時間
      if (date.getFullYear() === now.getFullYear()) {
        return this.formatDate(date, "MM/DD HH:mm");
      }

      // 其他情況，顯示完整日期時間
      return this.formatDate(date, "YYYY/MM/DD HH:mm");
    }
  },

  mounted() {
    this.$nextTick(() => {
      this.initResizeDetection();
      this.updateDisplayContent();

      // 監聽表格重新佈局事件
      this.addTableLayoutListeners();
    });
  },

  beforeDestroy() {
    this.cleanupResizeDetection();
    this.removeTableLayoutListeners();
  },

  watch: {
    remark: {
      handler: "updateDisplayContent",
      immediate: true
    },
    cellWidth() {
      this.updateDisplayContent();
    }
  },

  methods: {
    /**
     * 初始化大小變化檢測
     */
    initResizeDetection() {
      // 首先嘗試使用 ResizeObserver
      if (typeof ResizeObserver !== "undefined") {
        this.setupResizeObserver();
      } else {
        // 降級：找到父級表格單元格並監聽 window resize
        this.findTableCellWidth();
        window.addEventListener("resize", this.debounceResize);
      }
    },

    /**
     * 使用 ResizeObserver 監聽元素大小變化
     */
    setupResizeObserver() {
      const elementToObserve = this.findClosestTableCell() || this.$el;

      this.resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          if (entry.target === elementToObserve) {
            this.cellWidth = entry.contentRect.width;
          }
        }
      });

      this.resizeObserver.observe(elementToObserve);
    },

    /**
     * 查找最近的表格單元格元素
     */
    findClosestTableCell() {
      let el = this.$el;
      while (el && el.tagName !== "TD" && el.tagName !== "BODY") {
        el = el.parentElement;
      }
      return el && el.tagName === "TD" ? el : null;
    },

    /**
     * 添加表格佈局變化相關的監聽器
     */
    addTableLayoutListeners() {
      // 尋找父級表格
      const table = this.findParentTable();
      if (table) {
        // 監聽表格排序、過濾、展開等可能導致佈局變化的事件
        table.addEventListener("sort-change", this.onTableLayoutChange);
        table.addEventListener("filter-change", this.onTableLayoutChange);
        table.addEventListener("expand-change", this.onTableLayoutChange);
      }
    },

    /**
     * 移除表格佈局監聽器
     */
    removeTableLayoutListeners() {
      const table = this.findParentTable();
      if (table) {
        table.removeEventListener("sort-change", this.onTableLayoutChange);
        table.removeEventListener("filter-change", this.onTableLayoutChange);
        table.removeEventListener("expand-change", this.onTableLayoutChange);
      }
    },

    /**
     * 查找父級表格元素
     */
    findParentTable() {
      let el = this.$el;
      while (
        el &&
        !el.classList.contains("el-table") &&
        el.tagName !== "BODY"
      ) {
        el = el.parentElement;
      }
      return el && el.classList.contains("el-table") ? el : null;
    },

    /**
     * 表格佈局變化處理
     */
    onTableLayoutChange() {
      // 延遲執行以等待表格重新佈局完成
      setTimeout(() => {
        this.findTableCellWidth();
        this.updateDisplayContent();
      }, 100);
    },

    /**
     * 查找表格單元格寬度
     */
    findTableCellWidth() {
      const cell = this.findClosestTableCell();
      if (cell) {
        this.cellWidth = cell.clientWidth;
      } else if (this.$el) {
        // 降級方案：使用元素自身寬度
        this.cellWidth = this.$el.clientWidth;
      }
    },

    /**
     * 防抖動的 resize 處理
     */
    debounceResize() {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.findTableCellWidth();
      }, 200);
    },

    /**
     * 清理大小變化檢測
     */
    cleanupResizeDetection() {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", this.debounceResize);
      }
      clearTimeout(this.debounceTimer);
    },

    /**
     * 獲取當前單元格寬度對應的截斷長度
     */
    getCurrentTruncateLength() {
      const width = this.cellWidth;

      if (width < 200) {
        return this.tableTruncateConfig.narrow;
      } else if (width < 300) {
        return this.tableTruncateConfig.medium;
      } else if (width < 400) {
        return this.tableTruncateConfig.wide;
      } else {
        return this.tableTruncateConfig.extraWide;
      }
    },

    /**
     * 更新顯示的備註內容
     */
    updateDisplayContent() {
      if (!this.remark || !this.remark.content) {
        this.displayContent = "";
        return;
      }

      const maxChars = 6; // 固定顯示6個字元

      if (this.remark.content.length > maxChars) {
        this.displayContent =
          this.remark.content.substring(0, maxChars) + "...";
      } else {
        this.displayContent = this.remark.content;
      }
    },
    /**
     * 日期格式化函數
     */
    formatDate(date, format) {
      const pad = num => (num < 10 ? `0${num}` : num);

      const year = date.getFullYear();
      const month = pad(date.getMonth() + 1);
      const day = pad(date.getDate());
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());

      return format
        .replace("YYYY", year)
        .replace("MM", month)
        .replace("DD", day)
        .replace("HH", hours)
        .replace("mm", minutes);
    },

    /**
     * 判断两个日期是否是同一天
     */
    isSameDay(date1, date2) {
      return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
      );
    },

    /**
     * 判断日期是否在同一周内
     */
    isInSameWeek(date1, date2) {
      const d1 = new Date(date1);
      const d2 = new Date(date2);

      // 设置为周日为一周的开始
      const diff1 = d1.getDate() - d1.getDay();
      const diff2 = d2.getDate() - d2.getDay();

      // 计算两周的开始日期
      const startOfWeek1 = new Date(d1.setDate(diff1));
      const startOfWeek2 = new Date(d2.setDate(diff2));

      // 比较两周的开始日期是否相同
      return (
        startOfWeek1.getDate() === startOfWeek2.getDate() &&
        startOfWeek1.getMonth() === startOfWeek2.getMonth() &&
        startOfWeek1.getFullYear() === startOfWeek2.getFullYear()
      );
    },

    /**
     * 查看備註時間線
     */
    viewTimeline() {
      this.$emit("view-timeline");
    }
  }
};
</script>

<style lang="scss" scoped>
.remark-preview {
  cursor: pointer;
  padding: 8px;
  background: #ffffff;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  min-height: 60px;

  &:active {
    background: #f5f5f5;
    transform: scale(0.98);
  }

  &.is-empty {
    background: #fafafa;
    border: 1px dashed #e0e0e0;
  }

  .remark-content {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .remark-content-wrapper {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 4px;
  }

  .remark-text {
    font-size: 13px;
    line-height: 1.4;
    margin: 0;
    color: #333333;
    word-break: break-word;
    flex: 1;
  }

  .remark-badge {
    color: #ff9800;
    font-size: 14px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .remark-meta {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #909399;
    margin-top: auto;
    align-items: center;

    .remark-time {
      color: #8c8c8c;
    }

    .remark-count {
      background: #1890ff;
      color: white;
      padding: 0 6px;
      border-radius: 10px;
      font-size: 10px;
      line-height: 1.5;
    }
  }

  .no-remark {
    color: #bfbfbf;
    font-size: 13px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 100%;

    i {
      font-size: 14px;
    }
  }
}

/* 表格中的樣式優化 */
:deep(.el-table__row) .remark-preview {
  margin: -6px -8px;
  height: auto;
  min-height: 0;
  padding: 6px;
  border-radius: 4px;
}
</style>
