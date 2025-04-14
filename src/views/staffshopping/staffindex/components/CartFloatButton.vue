<template>
  <div class="cart-float" v-if="cartCount > 0" @click="openCart">
    <el-badge :value="cartCount" class="cart-badge">
      <i class="el-icon-shopping-cart-2"></i>
    </el-badge>
    <span>去結算</span>
  </div>
</template>

<script>
export default {
  name: "CartFloatButton",

  props: {
    // 購物車商品數量
    cartCount: {
      type: Number,
      default: 0
    }
  },

  methods: {
    // 打開購物車
    openCart() {
      this.$emit("open-cart");
    }
  }
};
</script>

<style lang="scss" scoped>
// 變量定義
$primary-color: #1890ff;
$box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
$transition: all 0.3s ease;

/* 購物車浮窗 */
.cart-float {
  position: fixed;
  right: 20px;
  bottom: 20px;
  background: $primary-color;
  color: white;
  padding: 10px 18px;
  border-radius: 24px;
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  z-index: 99;
  transition: $transition;
}

.cart-float:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.4);
}

.cart-float i {
  font-size: 20px;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .cart-float {
    right: 16px;
    bottom: 16px;
    padding: 8px 16px;
  }
}
</style>
