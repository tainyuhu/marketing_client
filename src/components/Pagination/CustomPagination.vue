<template>
  <div class="custom-pagination" v-if="total > 0">
    <div class="pagination-info">
      <span>共 {{ total }} 條記錄，當前顯示第 {{ displayRange }}</span>
    </div>

    <ul class="pagination-list">
      <!-- 首頁按鈕 -->
      <li :class="{ disabled: currentPage === 1 }">
        <a @click.prevent="onPageChange(1)" href="#">首頁</a>
      </li>

      <!-- 上一頁按鈕 -->
      <li :class="{ disabled: currentPage === 1 }">
        <a @click.prevent="onPageChange(currentPage - 1)" href="#">
          <i class="el-icon-arrow-left"></i>
        </a>
      </li>

      <!-- 頁碼按鈕 -->
      <template v-for="page in displayPages">
        <!-- 省略號 -->
        <li v-if="page === '...'" :key="'ellipsis_' + page" class="ellipsis">
          <span>...</span>
        </li>
        <!-- 頁碼 -->
        <li v-else :key="page" :class="{ active: currentPage === page }">
          <a @click.prevent="onPageChange(page)" href="#">{{ page }}</a>
        </li>
      </template>

      <!-- 下一頁按鈕 -->
      <li :class="{ disabled: currentPage === totalPages }">
        <a @click.prevent="onPageChange(currentPage + 1)" href="#">
          <i class="el-icon-arrow-right"></i>
        </a>
      </li>

      <!-- 末頁按鈕 -->
      <li :class="{ disabled: currentPage === totalPages }">
        <a @click.prevent="onPageChange(totalPages)" href="#">末頁</a>
      </li>
    </ul>

    <!-- 跳轉到指定頁 -->
    <div class="pagination-jumper">
      <span>跳至</span>
      <el-input
        v-model.number="jumpPage"
        size="mini"
        @keyup.enter.native="handleJump"
        :min="1"
        :max="totalPages"
        type="number"
      ></el-input>
      <span>頁</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "CustomPagination",

  props: {
    // 當前頁碼
    page: {
      type: Number,
      required: true
    },
    // 每頁條數
    limit: {
      type: Number,
      required: true
    },
    // 總記錄數
    total: {
      type: Number,
      required: true
    },
    // 最多顯示的頁碼按鈕數量
    pagerCount: {
      type: Number,
      default: 7
    }
  },

  data() {
    return {
      jumpPage: this.page
    };
  },

  computed: {
    // 當前頁碼
    currentPage() {
      return this.page;
    },

    // 總頁數
    totalPages() {
      return Math.ceil(this.total / this.limit);
    },

    // 當前顯示范圍
    displayRange() {
      const start = (this.currentPage - 1) * this.limit + 1;
      const end = Math.min(this.currentPage * this.limit, this.total);
      return `${start} - ${end} 條 / 第 ${this.currentPage} 頁`;
    },

    // 需要顯示的頁碼
    displayPages() {
      const pages = [];
      const pagerCount = this.pagerCount;
      const totalPages = this.totalPages;
      const currentPage = this.currentPage;

      // 頁碼總數小於設定的頁碼按鈕數量
      if (totalPages <= pagerCount) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 處理頁碼過多的情況，顯示部分頁碼和省略號
        const halfPagerCount = Math.floor((pagerCount - 2) / 2);

        // 當前頁靠近頁首
        if (currentPage <= halfPagerCount + 1) {
          for (let i = 1; i <= pagerCount - 1; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(totalPages);
        }
        // 當前頁靠近頁尾
        else if (currentPage >= totalPages - halfPagerCount) {
          pages.push(1);
          pages.push("...");
          for (let i = totalPages - (pagerCount - 2); i <= totalPages; i++) {
            pages.push(i);
          }
        }
        // 當前頁在中間位置
        else {
          pages.push(1);
          pages.push("...");
          for (
            let i = currentPage - halfPagerCount;
            i <= currentPage + halfPagerCount;
            i++
          ) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(totalPages);
        }
      }

      return pages;
    }
  },

  watch: {
    // 監聽外部 page 變化，更新 jumpPage
    page(newVal) {
      this.jumpPage = newVal;
    }
  },

  methods: {
    // 頁碼變更
    onPageChange(page) {
      if (page === this.currentPage || page < 1 || page > this.totalPages) {
        return;
      }

      this.$emit("update:page", page);
      this.$emit("page-change", { page, limit: this.limit });
    },

    // 處理跳轉
    handleJump() {
      let page = this.jumpPage;

      // 確保頁碼有效
      if (isNaN(page) || page <= 0) {
        page = 1;
      } else if (page > this.totalPages) {
        page = this.totalPages;
      }

      this.jumpPage = page;
      this.onPageChange(page);
    }
  }
};
</script>

<style lang="scss" scoped>
.custom-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin: 30px 0;
  font-size: 14px;
  color: #606266;

  .pagination-info {
    margin-right: 15px;
    margin-bottom: 10px;
  }

  .pagination-list {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0 15px 10px 0;

    li {
      margin: 0 5px;

      a {
        display: flex;
        justify-content: center;
        align-items: center;
        min-width: 30px;
        height: 30px;
        padding: 0 10px;
        border-radius: 3px;
        background-color: #f4f4f5;
        color: #606266;
        text-decoration: none;
        transition: all 0.3s;

        &:hover {
          color: #409eff;
          background-color: #ecf5ff;
        }
      }

      &.active a {
        background-color: #409eff;
        color: #fff;
      }

      &.disabled a {
        color: #c0c4cc;
        cursor: not-allowed;

        &:hover {
          background-color: #f4f4f5;
          color: #c0c4cc;
        }
      }

      &.ellipsis {
        display: flex;
        justify-content: center;
        align-items: center;
        min-width: 30px;
        height: 30px;
        color: #606266;
      }
    }
  }

  .pagination-jumper {
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    span {
      margin: 0 5px;
    }

    .el-input {
      width: 50px;
      margin: 0 5px;

      ::v-deep .el-input__inner {
        text-align: center;
        padding: 0 5px;
      }
    }
  }
}

@media (max-width: 768px) {
  .custom-pagination {
    flex-direction: column;

    .pagination-info,
    .pagination-list,
    .pagination-jumper {
      margin: 5px 0;
    }
  }
}
</style>
