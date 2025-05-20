<!-- components/Remark/RemarkList.vue -->
<template>
  <div class="timeline-container" v-loading="loading">
    <el-timeline v-if="remarks.length > 0">
      <el-timeline-item
        v-for="(remark, index) in remarks"
        :key="remark.id || index"
        :timestamp="formatDate(remark.create_time)"
        :type="getTimelineItemType(remark)"
        :color="getTimelineItemColor(remark)"
        size="large"
      >
        <div
          class="timeline-card"
          :class="{
            'is-important': remark.is_important,
            'is-pinned': remark.is_pinned
          }"
        >
          <div class="timeline-header">
            <div class="header-main">
              <span class="author">{{ remark.created_by_name }}</span>
              <el-tag size="mini" :type="getRemarkTagType(remark)" round>
                {{ getRemarkTagText(remark) }}
              </el-tag>
            </div>

            <!-- 備註操作選單 -->
            <div class="remark-actions" v-if="canManage">
              <el-dropdown
                trigger="click"
                @command="cmd => handleRemarkAction(cmd, remark)"
                placement="bottom-end"
              >
                <i class="el-icon-more"></i>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="pin" v-if="!remark.is_pinned">
                    <i class="el-icon-top"></i> 固定備註
                  </el-dropdown-item>
                  <el-dropdown-item command="unpin" v-else>
                    <i class="el-icon-bottom"></i> 取消固定
                  </el-dropdown-item>
                  <el-dropdown-item
                    command="important"
                    v-if="!remark.is_important"
                  >
                    <i class="el-icon-star-on"></i> 標記為重要
                  </el-dropdown-item>
                  <el-dropdown-item command="unimportant" v-else>
                    <i class="el-icon-star-off"></i> 取消重要標記
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    <i class="el-icon-delete"></i> 刪除備註
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>

          <div class="timeline-content">
            <p>{{ remark.content }}</p>

            <!-- 圖片預覽網格 -->
            <image-grid
              v-if="remark.images && remark.images.length > 0"
              :images="remark.images"
              @view-image="(img, index) => viewImage(remark.images, img, index)"
            ></image-grid>
          </div>
        </div>
      </el-timeline-item>
    </el-timeline>

    <!-- 空狀態提示 -->
    <div v-else-if="!loading" class="empty-state">
      <div class="empty-icon">
        <i class="el-icon-chat-line-square"></i>
      </div>
      <div class="empty-text">暫無備註記錄</div>
    </div>

    <!-- 加載更多 -->
    <div v-if="hasMore && !loading && remarks.length > 0" class="load-more">
      <el-button type="text" @click="$emit('load-more')">
        加載更多 <i class="el-icon-arrow-down"></i>
      </el-button>
    </div>
  </div>
</template>

<script>
import { formatDate } from "@/utils/date";
import ImageGrid from "./ImageGrid.vue";

export default {
  name: "RemarkList",

  components: {
    ImageGrid
  },

  props: {
    // 備註列表
    remarks: {
      type: Array,
      default: () => []
    },

    // 加載狀態
    loading: {
      type: Boolean,
      default: false
    },

    // 是否有更多備註可加載
    hasMore: {
      type: Boolean,
      default: false
    },

    // 是否可以管理備註（刪除、固定等）
    canManage: {
      type: Boolean,
      default: true
    }
  },

  methods: {
    formatDate,

    // 根據備註類型設置時間線項目類型
    getTimelineItemType(remark) {
      if (remark.is_important) return "danger";
      if (remark.is_pinned) return "warning";
      return "primary";
    },

    // 根據備註類型設置時間線項目顏色
    getTimelineItemColor(remark) {
      if (remark.is_important) return "#FF4D4F";
      if (remark.is_pinned) return "#FAAD14";
      return "#1890FF";
    },

    // 獲取備註標籤類型
    getRemarkTagType(remark) {
      if (remark.is_important) return "danger";
      if (remark.is_pinned) return "warning";
      return "info";
    },

    // 獲取備註標籤文字
    getRemarkTagText(remark) {
      if (remark.is_important) return "重要";
      if (remark.is_pinned) return "固定";
      return "一般";
    },

    // 處理備註操作
    handleRemarkAction(action, remark) {
      switch (action) {
        case "pin":
          this.$emit("update-remark", { ...remark, is_pinned: true });
          break;
        case "unpin":
          this.$emit("update-remark", { ...remark, is_pinned: false });
          break;
        case "important":
          this.$emit("update-remark", { ...remark, is_important: true });
          break;
        case "unimportant":
          this.$emit("update-remark", { ...remark, is_important: false });
          break;
        case "delete":
          this.$emit("delete-remark", remark);
          break;
      }
    },

    // 查看圖片
    viewImage(images, img, index) {
      const imageList = images.map(img => img.url);
      this.$emit("view-image", {
        src: img.url,
        imageList,
        index
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.timeline-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 80px;
  -webkit-overflow-scrolling: touch;

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 16px;
    text-align: center;

    .empty-icon {
      font-size: 48px;
      color: #e0e0e0;
      margin-bottom: 16px;
    }

    .empty-text {
      color: #909399;
      margin-bottom: 24px;
      font-size: 16px;
    }
  }

  .load-more {
    text-align: center;
    margin: 20px 0;

    .el-button {
      font-size: 14px;
    }
  }

  ::v-deep .el-timeline {
    padding-left: 8px;
  }

  ::v-deep .el-timeline-item__wrapper {
    padding-left: 20px;
  }

  ::v-deep .el-timeline-item__dot {
    left: 0;
  }

  .timeline-card {
    background: #ffffff;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
    margin-bottom: 8px;
    transition: all 0.3s;

    &.is-important {
      background: #fff1f0;
      border-left: 3px solid #ff4d4f;
    }

    &.is-pinned {
      background: #fff7e6;
      border-left: 3px solid #faad14;
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .header-main {
        display: flex;
        align-items: center;
        gap: 8px;

        .author {
          font-weight: 500;
          color: #303133;
          font-size: 14px;
        }
      }

      .remark-actions {
        color: #909399;
        font-size: 18px;
        cursor: pointer;

        &:active {
          color: #1890ff;
        }
      }
    }

    .timeline-content {
      p {
        margin: 0 0 12px 0;
        white-space: pre-wrap;
        line-height: 1.6;
        color: #303133;
        font-size: 15px;
      }
    }
  }
}
</style>
