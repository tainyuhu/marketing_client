<template>
  <div class="combined-search" :class="[`size-${size}`, { compact }]">
    <div class="search-container" :class="{ 'with-time': showTimeSearch }">
      <search-box
        ref="searchBox"
        v-model="searchText"
        v-bind="searchBoxProps"
        @input="handleSearchInput"
        @clear="handleSearchClear"
        @field-change="handleFieldChange"
        @enter-press="handleEnterPress"
      />

      <time-search
        v-if="showTimeSearch"
        ref="timeSearch"
        v-model="dateRange"
        v-bind="timeSearchProps"
        @change="handleTimeChange"
        @clear="handleTimeClear"
      />

      <div v-if="showSearchButton" class="search-button-container">
        <el-button
          type="primary"
          :size="size"
          :icon="searchButtonIcon"
          @click="handleSearch"
        >
          {{ searchButtonText }}
        </el-button>
      </div>
    </div>

    <!-- 搜索標籤區域 -->
    <div
      v-if="showTags && (hasActiveSearch || hasActiveTime)"
      class="search-tags"
    >
      <el-tag
        v-if="hasActiveSearch"
        closable
        :size="tagSize"
        @close="clearSearch"
      >
        {{ tagSearchText }}
      </el-tag>
      <el-tag v-if="hasActiveTime" closable :size="tagSize" @close="clearTime">
        {{ tagTimeText }}
      </el-tag>
    </div>
  </div>
</template>

<script>
import SearchBox from "./index";
import TimeSearch from "./TimeSearch";
import { formatDate } from "@/utils/date";

export default {
  name: "CombinedSearch",

  components: {
    SearchBox,
    TimeSearch
  },

  props: {
    // General props
    size: {
      type: String,
      default: "small"
    },
    compact: {
      type: Boolean,
      default: false
    },

    // SearchBox related props
    searchValue: {
      type: String,
      default: ""
    },
    fields: {
      type: Array,
      default: () => []
    },
    showFields: {
      type: Boolean,
      default: false
    },
    searchPlaceholder: {
      type: String,
      default: "搜尋..."
    },
    searchDebounce: {
      type: Number,
      default: 300
    },
    allFieldsLabel: {
      type: String,
      default: "全部欄位"
    },
    fieldSelectPlaceholder: {
      type: String,
      default: "選擇欄位"
    },

    // TimeSearch related props
    showTimeSearch: {
      type: Boolean,
      default: true
    },
    timeValue: {
      type: Array,
      default: () => []
    },
    timeShortcuts: {
      type: Boolean,
      default: true
    },
    startPlaceholder: {
      type: String,
      default: "開始日期"
    },
    endPlaceholder: {
      type: String,
      default: "結束日期"
    },

    // Search button props
    showSearchButton: {
      type: Boolean,
      default: false
    },
    searchButtonText: {
      type: String,
      default: "搜尋"
    },
    searchButtonIcon: {
      type: String,
      default: "el-icon-search"
    },

    // Control immediate search
    immediateSearch: {
      type: Boolean,
      default: true
    },

    // 搜索標籤顯示配置
    showTags: {
      type: Boolean,
      default: false
    },
    dateFormat: {
      type: String,
      default: "yyyy/MM/dd"
    }
  },

  data() {
    return {
      searchText: this.searchValue,
      dateRange: this.timeValue,
      selectedField: "",
      lastSearchParams: null
    };
  },

  computed: {
    searchBoxProps() {
      return {
        placeholder: this.searchPlaceholder,
        fields: this.fields,
        showFields: this.showFields,
        debounce: this.immediateSearch ? this.searchDebounce : 0,
        size: this.size,
        allFieldsLabel: this.allFieldsLabel,
        fieldSelectPlaceholder: this.fieldSelectPlaceholder
      };
    },

    timeSearchProps() {
      return {
        shortcuts: this.timeShortcuts,
        size: this.size,
        startPlaceholder: this.startPlaceholder,
        endPlaceholder: this.endPlaceholder
      };
    },

    searchParams() {
      return {
        keyword: this.searchText,
        field: this.selectedField,
        dateRange: this.dateRange
      };
    },

    hasActiveSearch() {
      return !!this.searchText;
    },

    hasActiveTime() {
      return Array.isArray(this.dateRange) && this.dateRange.length === 2;
    },

    tagSize() {
      return this.size === "medium" ? "small" : "mini";
    },

    tagSearchText() {
      if (!this.selectedField || !this.searchText)
        return "搜尋: " + this.searchText;

      var fieldObj = this.fields.find(
        function(f) {
          return f.prop === this.selectedField;
        }.bind(this)
      );

      var fieldLabel = fieldObj ? fieldObj.label : this.selectedField;
      return fieldLabel + ": " + this.searchText;
    },

    tagTimeText() {
      if (!Array.isArray(this.dateRange) || this.dateRange.length !== 2)
        return "";

      const start = formatDate(this.dateRange[0], this.dateFormat);
      const end = formatDate(this.dateRange[1], this.dateFormat);
      return `日期: ${start} 至 ${end}`;
    }
  },

  watch: {
    searchValue(val) {
      this.searchText = val;
    },

    timeValue(val) {
      this.dateRange = val;
    }
  },

  methods: {
    // Search box methods
    handleSearchInput(value) {
      if (this.immediateSearch && !this.showSearchButton) {
        this.emitSearch();
      }
    },

    handleSearchClear() {
      this.searchText = "";
      if (this.immediateSearch) {
        this.emitSearch();
      }
    },

    handleFieldChange(field) {
      this.selectedField = field;
      if (this.immediateSearch && this.searchText) {
        this.emitSearch();
      }
    },

    // Time search methods
    handleTimeChange(value) {
      if (this.immediateSearch && !this.showSearchButton) {
        this.emitSearch();
      }
    },

    handleTimeClear() {
      this.dateRange = [];
      if (this.immediateSearch) {
        this.emitSearch();
      }
    },

    // Tag methods
    clearSearch() {
      if (this.$refs.searchBox) {
        this.$refs.searchBox.clear();
      }
      this.emitSearch();
    },

    clearTime() {
      if (this.$refs.timeSearch) {
        this.$refs.timeSearch.clear();
      }
      this.emitSearch();
    },

    // General methods
    handleSearch() {
      this.emitSearch();
    },

    emitSearch() {
      this.lastSearchParams = { ...this.searchParams };
      this.$emit("search", this.searchParams);
    },

    clear() {
      if (this.$refs.searchBox) {
        this.$refs.searchBox.clear();
      }

      if (this.$refs.timeSearch) {
        this.$refs.timeSearch.clear();
      }

      this.emitSearch();
    },

    focus() {
      if (this.$refs.searchBox) {
        this.$refs.searchBox.focus();
      }
    },

    // 提供預設搜索條件方法
    setDefaults(defaults = {}) {
      if (defaults.keyword !== undefined) {
        this.searchText = defaults.keyword;
      }

      if (defaults.field !== undefined) {
        this.selectedField = defaults.field;
      }

      if (defaults.dateRange !== undefined) {
        this.dateRange = defaults.dateRange;
      }

      // 是否要立即執行搜索
      if (defaults.search) {
        this.$nextTick(() => {
          this.emitSearch();
        });
      }
    },

    handleEnterPress(value) {
      this.emitSearch();
    }
  }
};
</script>

<style lang="scss">
// 變量定義
$primary-color: #1890ff;
$border-radius: 4px;
$transition-duration: 0.3s;
$mobile-breakpoint: 768px;
$small-mobile-breakpoint: 480px;

// 手機上點擊區域的最小尺寸
$min-touch-target: 44px;

/* 確保日期選擇器在手機上正確顯示 */
.el-picker-panel.el-date-range-picker {
  position: fixed !important; /* 使用fixed確保正確顯示 */
  z-index: 2100 !important; /* 提高層級，確保不被其他元素覆蓋 */
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  margin: 0 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;

  /* 在手機上調整大小 */
  @media screen and (max-width: 768px) {
    width: 95vw !important;
    max-width: 580px !important;

    /* 確保雙月份顯示在手機上的適配 */
    .el-picker-panel__body {
      min-width: 95% !important;
    }

    /* 如果空間不夠，可以考慮縮小日期表格 */
    .el-date-table {
      font-size: 12px !important;
    }

    /* 優化快捷選項顯示 */
    .el-picker-panel__sidebar {
      width: 110px !important;
      min-width: 110px !important;
    }
  }

  /* 在特小螢幕上可能需要垂直堆疊月份顯示 */
  @media screen and (max-width: 480px) {
    .el-picker-panel__body {
      display: flex !important;
      flex-direction: column !important;
    }

    .el-date-range-picker__content {
      float: none !important;
      width: 100% !important;
      margin-bottom: 10px !important;
    }
  }
}

/* 修復圖標垂直對齊問題 */
.el-date-editor .el-input__prefix,
.el-date-editor .el-input__suffix {
  display: flex !important;
  align-items: center !important;
  height: 100% !important;
  top: 0 !important;
}

.el-date-editor .el-input__icon {
  line-height: normal !important;
  height: auto !important;
}

/* 確保日期範圍選擇器在手機上全寬顯示 */
@media screen and (max-width: 768px) {
  .el-date-editor.el-date-editor--daterange {
    width: 100% !important;
  }

  /* 確保日期選擇點擊區域足夠大 */
  .el-date-table td .cell {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    height: 30px !important;
    width: 30px !important;
  }
}

/* 確保日期選擇器在點擊輸入框時能夠正確顯示 */
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
  position: relative !important;
  z-index: 1 !important;
}

/* 創建遮罩防止下層元素被點擊 */
.v-modal {
  z-index: 2050 !important; /* 確保在日期選擇器下方，但在其他元素上方 */
}

.combined-search {
  width: 100%;
  transition: all $transition-duration;

  // 搜索容器
  .search-container {
    display: flex;
    align-items: stretch;
    gap: 12px;
    flex-wrap: wrap;
    width: 100%;

    // 日期搜索的特殊佈局
    &.with-time {
      @media (min-width: $mobile-breakpoint) {
        flex-wrap: nowrap;
      }

      @media (max-width: #{$mobile-breakpoint - 1}) {
        .time-search-section {
          margin-top: 8px;
        }
      }
    }

    // 搜索框部分
    .search-box {
      flex: 1;
      min-width: 180px;

      @media (max-width: #{$small-mobile-breakpoint}) {
        width: 100%;
        min-width: 100%;
      }

      // 增強手機上輸入框的適配性
      .el-input__inner {
        @media (max-width: $mobile-breakpoint) {
          height: $min-touch-target;
          line-height: $min-touch-target;
          font-size: 16px; // 防止iOS自動放大
          padding-left: 12px;
          padding-right: 12px;
        }
      }

      // 調整下拉選擇器在手機上的體驗
      .el-select {
        @media (max-width: $mobile-breakpoint) {
          width: 100%;
          margin-bottom: 8px;

          .el-input__inner {
            height: $min-touch-target;
            line-height: $min-touch-target;
          }
        }
      }
    }

    // 日期搜索部分
    .time-search-section {
      @media (min-width: $mobile-breakpoint) {
        min-width: 300px;
        flex: 0 0 auto;
      }

      @media (max-width: #{$mobile-breakpoint - 1}) {
        width: 100%;
      }

      // 日期選擇器在手機上的增強
      .el-date-editor {
        @media (max-width: $mobile-breakpoint) {
          width: 100% !important;

          .el-input__inner {
            height: $min-touch-target;
            line-height: $min-touch-target;
            padding-left: 30px;
            font-size: 14px;
          }

          /* FIX: 修正圖標垂直置中問題 */
          .el-input__prefix,
          .el-input__suffix {
            display: flex;
            align-items: center;
            height: 100%;
            top: 0;
          }

          .el-input__icon {
            line-height: normal;
            height: auto;
          }

          .el-range-separator {
            line-height: $min-touch-target;
          }
        }

        // 超小屏幕優化
        @media (max-width: $small-mobile-breakpoint) {
          .el-range-input {
            font-size: 12px;
          }

          .el-range-separator {
            padding: 0 3px;
          }
        }
      }
    }

    // 搜索按鈕容器
    .search-button-container {
      margin-left: auto;

      @media (max-width: $mobile-breakpoint) {
        width: 100%;
        margin-left: 0;
        margin-top: 8px;

        .el-button {
          width: 100%;
          height: $min-touch-target;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;

          i {
            margin-right: 8px;
          }
        }
      }
    }
  }

  // 緊湊模式調整
  &.compact {
    .search-container {
      gap: 8px;

      @media (max-width: $mobile-breakpoint) {
        gap: 6px;
      }

      .search-box,
      .time-search-section {
        min-width: auto;
      }
    }
  }

  // 標籤區域優化
  .search-tags {
    margin-top: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    // 手機上標籤的優化
    @media (max-width: $mobile-breakpoint) {
      margin-top: 10px;

      .el-tag {
        height: 28px;
        line-height: 26px;
        border-radius: $border-radius;
        padding: 0 8px;

        .el-tag__close {
          right: -4px;
          width: 20px;
          height: 20px;
          line-height: 20px;

          &:hover {
            background-color: rgba(0, 0, 0, 0.1);
            color: inherit;
          }
        }
      }
    }

    // 超小屏幕標籤優化
    @media (max-width: $small-mobile-breakpoint) {
      .el-tag {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        box-sizing: border-box;
      }
    }
  }

  // 不同尺寸模式
  &.size-medium {
    .search-tags {
      margin-top: 16px;

      @media (max-width: #{$mobile-breakpoint}) {
        margin-top: 12px;
      }
    }

    .search-container {
      gap: 16px;

      @media (max-width: #{$mobile-breakpoint}) {
        gap: 10px;
      }

      .search-button-container .el-button {
        @media (max-width: #{$mobile-breakpoint}) {
          height: 48px;
        }
      }
    }
  }

  // 關注狀態增強
  .is-focus {
    .el-input__inner {
      border-color: $primary-color;
    }
  }
}
</style>
