<template>
  <div class="activities-section">
    <!-- 區塊標題 -->
    <div class="section-header">
      <h2>活動專區</h2>
    </div>

    <!-- 活動網格區域 -->
    <div class="activity-grid">
      <!-- 載入中狀態 -->
      <template v-if="loadingActivities && activities.length === 0">
        <div
          v-for="i in 8"
          :key="`activity-skeleton-${i}`"
          class="activity-skeleton"
        >
          <el-skeleton animated>
            <template #template>
              <div class="skeleton-card">
                <el-skeleton-item
                  variant="image"
                  style="height: 120px"
                ></el-skeleton-item>
                <div style="padding: 12px">
                  <el-skeleton-item
                    variant="h3"
                    style="width: 80%"
                  ></el-skeleton-item>
                  <div
                    style="display: flex; align-items: center; margin-top: 12px"
                  >
                    <el-skeleton-item
                      variant="text"
                      style="margin-right: 16px; width: 30%"
                    ></el-skeleton-item>
                    <el-skeleton-item
                      variant="text"
                      style="width: 50%"
                    ></el-skeleton-item>
                  </div>
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>
      </template>

      <!-- 實際活動卡片 -->
      <div
        v-for="activity in activities"
        :key="`activity-${activity.id}`"
        class="activity-card"
        @click="viewActivityDetail(activity.id)"
      >
        <!-- 活動圖片容器 -->
        <div class="activity-image">
          <img :src="activity.image_url" :alt="activity.name" loading="lazy" />

          <!-- 標籤疊加層 -->
          <div class="activity-overlays">
            <!-- 標籤組 -->
            <div class="tags-group">
              <!-- 剩餘時間標籤 -->
              <div class="time-tag" v-if="activity.remainingDays <= 3">
                <el-tag type="danger" effect="dark" size="mini">
                  <i class="el-icon-time"></i> 剩餘
                  {{ activity.remainingDays }} 天
                </el-tag>
              </div>

              <!-- 熱門標籤 -->
              <div class="popular-tag" v-if="activity.isPopular">
                <el-tag type="warning" effect="dark" size="mini">
                  <i class="el-icon-star-on"></i> 熱門
                </el-tag>
              </div>

              <!-- 新活動標籤 -->
              <div class="new-tag" v-if="isNewActivity(activity.startDate)">
                <el-tag type="success" effect="dark" size="mini">
                  <i class="el-icon-new"></i> 新上線
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 活動內容 -->
        <div class="activity-content">
          <h3 class="activity-title" :title="activity.name">
            {{ activity.name }}
          </h3>

          <!-- 活動進度條 -->
          <div class="activity-progress">
            <div class="progress-header">
              <span class="progress-text">銷售進度</span>
              <span class="progress-percentage">{{ activity.progress }}%</span>
            </div>
            <el-progress
              :percentage="activity.progress"
              :color="getProgressColor(activity.progress)"
              :stroke-width="4"
              :show-text="false"
            ></el-progress>
          </div>

          <!-- 活動日期 -->
          <div class="activity-dates two-line">
            <i class="el-icon-date"></i>
            <div class="date-lines">
              <span>開始時間：{{ formatDate(activity.start_date) }}</span>
              <span>結束時間：{{ formatDate(activity.end_date) }}</span>
            </div>
          </div>

          <!-- 查看提示 -->
          <div class="view-more">
            開始購物 <i class="el-icon-arrow-right"></i>
          </div>
        </div>
      </div>

      <!-- 空數據提示 -->
      <el-empty
        v-if="activities.length === 0 && !loadingActivities"
        description="暫無活動"
        :image-size="120"
      >
        <template #description>
          <p>目前沒有符合條件的活動</p>
        </template>
      </el-empty>
    </div>

    <!-- 分頁器 -->
    <div class="pagination-container" v-show="totalActivities > 0">
      <el-pagination
        background
        layout="prev, pager, next"
        :current-page.sync="currentPage"
        :page-size="pageSize"
        :total="totalActivities"
        @current-change="handlePageChange"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
import { formatDate, getProgressColor } from "@/utils/format";

export default {
  name: "ActivitiesSection",

  props: {
    // 活動列表
    activities: {
      type: Array,
      default: () => []
    },

    // 活動總數 (用於分頁)
    totalActivities: {
      type: Number,
      default: 0
    },

    // 載入中狀態
    loadingActivities: {
      type: Boolean,
      default: false
    },

    // 當前頁碼
    activityPage: {
      type: Number,
      default: 1
    },

    // 每頁顯示數量
    activityLimit: {
      type: Number,
      default: 12
    }
  },

  data() {
    return {
      currentPage: this.activityPage
    };
  },

  computed: {
    // 每頁活動數量
    pageSize() {
      return this.activityLimit;
    }
  },

  watch: {
    // 監聽父組件傳入的頁碼變化
    activityPage(newVal) {
      this.currentPage = newVal;
    }
  },

  methods: {
    // 處理分頁變化
    handlePageChange(page) {
      if (this.currentPage !== page) {
        this.currentPage = page;
        this.$emit("page-change", page);
      }
    },

    // 查看活動詳情
    viewActivityDetail(activityId) {
      this.$emit("activity-click", activityId);
    },

    // 判斷是否為新活動（7天內）
    isNewActivity(startDate) {
      const now = new Date();
      const start = new Date(startDate);
      const diffTime = Math.abs(now - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    },

    // 引用公共格式化函數
    formatDate,
    getProgressColor
  }
};
</script>

<style lang="scss" scoped>
// 變量定義
$primary-color: #1890ff;
$success-color: #52c41a;
$warning-color: #faad14;
$danger-color: #ff4d4f;
$border-radius: 8px;
$box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
$transition: all 0.3s ease;

// 字體大小
$font-size-xs: 12px;
$font-size-s: 14px;
$font-size-base: 16px;
$font-size-lg: 18px;
$font-size-xl: 22px;

/* 活動區塊 */
.activities-section {
  margin-bottom: 30px;
  background: #fff;
  border-radius: $border-radius;
  box-shadow: $box-shadow;
  padding: 20px;
}

/* 區塊標題 */
.section-header {
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: $font-size-xl;
  color: #303133;
  margin: 0;
  position: relative;
  padding-left: 12px;
  font-weight: 600;
}

.section-header h2:before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background-color: $primary-color;
  border-radius: 2px;
}

/* 活動網格布局 */
.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
  min-height: 180px;
}

/* 活動卡片 */
.activity-card {
  border-radius: $border-radius;
  overflow: hidden;
  background: white;
  box-shadow: $box-shadow;
  transition: $transition;
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid rgba(0, 0, 0, 0.05);
  max-height: 320px;
}

.activity-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.activity-card:active {
  transform: scale(0.98);
}

/* 活動圖片 */
.activity-image {
  position: relative;
  height: 0;
  padding-bottom: 52%;
  overflow: hidden;
}

.activity-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.activity-card:hover .activity-image img {
  transform: scale(1.05);
}

/* 活動信息層 */
.activity-overlays {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  pointer-events: none;
}

.tags-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.time-tag,
.popular-tag,
.new-tag {
  margin-bottom: 0;
}

/* 活動內容 */
.activity-content {
  padding: 10px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.activity-title {
  font-size: $font-size-base;
  margin: 0 0 10px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #303133;
  transition: color 0.3s;
}

/* 進度條區域 */
.activity-progress {
  margin-bottom: 10px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.progress-text {
  font-size: $font-size-xs;
  color: #606266;
}

.progress-percentage {
  font-size: $font-size-xs;
  font-weight: 600;
  color: #303133;
}

/* 日期顯示 */
.activity-dates {
  font-size: $font-size-xs;
  color: #909399;
  display: flex;
  align-items: center;
  margin-top: auto;
  padding-top: 8px;
  word-break: keep-all;
  white-space: normal;
  line-height: 1.4;
}

.activity-dates.two-line {
  flex-direction: row;
  align-items: flex-start;

  .date-lines {
    display: flex;
    flex-direction: column;
    line-height: 1.4;
  }

  i {
    margin-right: 6px;
    margin-top: 2px;
  }

  span {
    white-space: nowrap;
  }
}

/* 查看詳情提示 */
.view-more {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: $font-size-xs;
  color: #909399;
  transition: $transition;
  white-space: nowrap;
  margin-top: 8px;
}

.view-more i {
  margin-left: 2px;
  transition: transform 0.3s;
}

.activity-card:hover .view-more i {
  transform: translateX(2px);
}

/* 骨架屏 */
.activity-skeleton {
  border-radius: $border-radius;
  overflow: hidden;
  height: 280px;
}

.skeleton-card {
  border-radius: $border-radius;
  overflow: hidden;
  height: 100%;
}

/* 分頁容器 */
.pagination-container {
  text-align: center;
  margin-top: 20px;
}

/* 響應式設計 */
@media (max-width: 992px) {
  .activity-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}

@media (max-width: 768px) {
  .activities-section {
    padding: 15px;
  }

  .section-header h2 {
    font-size: $font-size-lg;
  }

  .activity-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 10px;
  }

  .activity-title {
    font-size: $font-size-s;
  }
}

@media (max-width: 480px) {
  .activity-grid {
    grid-template-columns: 1fr;
  }

  .activity-dates {
    flex-direction: column;
    align-items: flex-start;
  }

  .progress-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
