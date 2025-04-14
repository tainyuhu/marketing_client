<!-- CombinedSearch.vue -->
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

<style lang="scss" scoped>
.combined-search {
  .search-container {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;

    &.with-time {
      @media (min-width: 768px) {
        flex-wrap: nowrap;
      }
    }

    .search-box {
      flex: 1;
      min-width: 200px;
    }

    .time-search-section {
      @media (min-width: 768px) {
        min-width: 220px;
      }
      width: 100%;
    }

    .search-button-container {
      margin-left: 8px;
    }
  }

  &.compact {
    .search-container {
      gap: 8px;

      .search-box,
      .time-search-section {
        min-width: auto;
      }
    }
  }

  .search-tags {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &.size-medium {
    .search-tags {
      margin-top: 12px;
    }
  }
}
</style>
