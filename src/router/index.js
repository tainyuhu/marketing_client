import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

/* Layout */
import Layout from "@/layout";
import ShopLayout from "@/layout/ShopLayout";

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    perms: ['admin','editor']    control the page perms (you can set multiple perms)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all perms can be accessed
 */
export const constantRoutes = [
  {
    path: "/login",
    component: () => import("@/views/login/index"),
    hidden: true
  },
  {
    path: "/reset",
    component: () => import("@/views/login/reset"),
    hidden: true
  },
  {
    path: "/resetpassword",
    component: () => import("@/views/login/resetpassword"),
    hidden: true
  },
  {
    path: "/binding",
    component: () => import("@/views/login/binding"),
    hidden: true
  },
  {
    path: "/linebinding",
    component: () => import("@/views/login/linebinding"),
    hidden: true
  },
  {
    path: "/groupbuying/create",
    component: () => import("@/views/groupbuying/create"),
    hidden: true
  },
  {
    path: "/groupbuying/edit/:id",
    component: () => import("@/views/groupbuying/edit"),
    hidden: true
  },
  {
    path: "/404",
    component: () => import("@/views/404"),
    hidden: true
  },
  {
    path: "/",
    component: Layout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/dashboard/index"),
        meta: { title: "首頁", icon: "home" }
      }
    ]
  },

  {
    path: "/changepassword",
    component: Layout,
    redirect: "/changepassword",
    name: "ChangePW",
    meta: { title: "修改密碼", icon: "tree" },
    hidden: true,
    children: [
      {
        path: "",
        name: "ChangePassword",
        component: () => import("@/views/system/changepassword"),
        meta: { title: "修改密碼", noCache: true, icon: "" },
        hidden: true
      }
    ]
  }
];

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user perms
 */
export const asyncRoutes = [
  {
    path: "/marketingdashboard",
    component: Layout,
    redirect: "/marketingdashboard",
    hidden: true, //隱藏模塊
    children: [
      {
        path: "marketingdashboard",
        name: "marketingdashboard",
        component: () => import("@/views/marketingdashboard/index"),
        meta: {
          title: "儀錶板",
          icon: "dashboard",
          perms: ["marketingdashboard_manage"]
        }
      }
    ]
  },
  {
    path: "/overview",
    component: Layout,
    redirect: "/overview",
    hidden: true, //隱藏模塊
    children: [
      {
        path: "activity",
        name: "activity",
        component: () => import("@/views/overview/index"),
        meta: {
          title: "團購活動總覽",
          icon: "dashboard",
          perms: ["overview_manage"]
        }
      }
    ]
  },
  {
    path: "/orders",
    component: Layout,
    redirect: "/orders",
    hidden: true, //隱藏模塊
    children: [
      {
        path: "list",
        name: "list",
        component: () => import("@/views/orders/list"),
        meta: {
          title: "個人訂單管理",
          icon: "dashboard",
          perms: ["list_manage"]
        }
      }
    ]
  },
  {
    path: "/profile",
    component: Layout,
    redirect: "/profile",
    children: [
      {
        path: "account",
        name: "account",
        component: () => import("@/views/account/profile"),
        meta: {
          title: "帳號管理",
          icon: "dashboard",
          perms: ["profile_manage"]
        }
      }
    ]
  },

  {
    path: "/workflow",
    component: Layout,
    redirect: "/workflow/index",
    name: "workflow",
    hidden: true, //隱藏模塊
    meta: { title: "工作流", icon: "example", perms: ["workflow_manage"] },
    children: [
      {
        path: "index",
        name: "index",
        component: () => import("@/views/workflow/index"),
        meta: { title: "工作流", icon: "example", perms: ["workflow_index"] }
      },
      {
        path: "ticket",
        name: "ticket",
        component: () => import("@/views/workflow/ticket"),
        meta: {
          title: "工单管理",
          icon: "example",
          noCache: true,
          perms: ["workflow_ticket"]
        }
      },
      {
        path: "workFlowTickets",
        name: "workFlowTickets",
        component: () => import("@/views/workflow/workFlowTickets"),
        meta: { title: "工单", icon: "example", noCache: true },
        hidden: true
      },
      {
        path: "configuration",
        name: "configuration",
        component: () => import("@/views/workflow/configuration"),
        meta: { title: "工作流配置", icon: "example" },
        hidden: true
      },
      {
        path: "ticketHandle",
        name: "ticketHandle",
        component: () => import("@/views/workflow/ticketHandle"),
        meta: { title: "工单处理", icon: "example", noCache: true },
        hidden: true
      },
      {
        path: "ticketDetail",
        name: "ticketDetail",
        component: () => import("@/views/workflow/ticketDetail"),
        meta: { title: "工单详情", icon: "example", noCache: true },
        hidden: true
      }
    ]
  },
  {
    path: "/staffshopping",
    component: ShopLayout,
    redirect: "/staffshopping/staffindex",
    name: "staffshopping",
    meta: {
      title: "員工商城",
      icon: "wmsview",
      perms: ["wmsview"]
    },
    children: [
      {
        path: "staffindex",
        name: "staffindex",
        component: () => import("@/views/staffshopping/staffindex/index"),
        meta: {
          title: "首頁",
          icon: "staffindex_manage",
          perms: ["staffindex_manage"]
        }
      },
      {
        path: "activity/:id",
        name: "activityDetail",
        component: () => import("@/views/staffshopping/activity/index"),
        meta: {
          title: "活動詳情",
          activeMenu: "/staffshopping/staffindex",
          hidden: true
        }
      },
      {
        path: "product/:id",
        name: "ProductDetail",
        component: () =>
          import("@/views/staffshopping/productdetail/index.vue"),
        meta: {
          title: "商品詳情",
          activeMenu: "/staffshopping/staffindex",
          hidden: true
        }
      },
      {
        path: "cart",
        name: "shoppingCart",
        component: () => import("@/views/staffshopping/shoppingcart/index"),
        meta: {
          title: "購物車",
          activeMenu: "/staffshopping/staffindex",
          hidden: true
        }
      },
      {
        path: "orderlist",
        name: "shoppingOrder",
        component: () => import("@/views/staffshopping/shoppingorder/index"),
        meta: {
          title: "個人訂單管理",
          perms: ["shoppingorder_manage"]
        }
      }
    ]
  },
  {
    path: "/wms",
    component: Layout,
    redirect: "/wms/inventory",
    name: "wms",
    hidden: true,
    meta: {
      title: "總倉管理",
      icon: "wmsview",
      perms: ["wmsview"]
    },
    children: [
      {
        path: "inventory",
        name: "inventory",
        component: () => import("@/views/wms/inventory/index"),
        meta: {
          title: "庫存中控台",
          icon: "wmsinventory_manage",
          perms: ["wmsinventory_manage"]
        }
      },
      {
        path: "inventorymanage",
        name: "inventorymanage",
        component: () => import("@/views/wms/inventory/inventorymanage"),
        meta: {
          title: "庫存管理",
          icon: "inventory_manage",
          perms: ["inventory_manage"]
        }
      },
      {
        path: "ordermanagent",
        name: "ordermanagent",
        component: () => import("@/views/wms/ordermanagent/index"),
        meta: {
          title: "接單管理",
          icon: "inventory_batch_manage",
          perms: ["ordermanagent"]
        }
      },
      {
        path: "inventorybatchmanage",
        name: "inventorybatchmanage",
        component: () => import("@/views/wms/inventory/inventorybatchmanage"),
        meta: {
          title: "庫存批號管理",
          icon: "inventory_batch_manage",
          perms: ["inventory_batch_manage"]
        }
      },
      {
        path: "classification",
        name: "classification",
        component: () => import("@/views/wms/product/classification"),
        meta: {
          title: "行銷類別管理",
          icon: "tree",
          perms: ["classification_manage"]
        }
      },
      {
        path: "warehousecategory",
        name: "warehousecategory",
        component: () => import("@/views/wms/product/warehousecategory"),
        meta: {
          title: "品號類別管理",
          icon: "tree",
          perms: ["warehousecategory_manage"]
        }
      },
      {
        path: "multi-sku",
        name: "multi-sku",
        component: () => import("@/views/wms/multiSku/index"),
        meta: {
          title: "品號管理",
          icon: "list-ordered",
          perms: ["multi_sku_manage"]
        }
      },
      {
        path: "sales",
        name: "sales",
        component: () => import("@/views/wms/sales/index"),
        meta: {
          title: "訂單管理",
          icon: "shopping-basket",
          perms: ["sales_manage"]
        }
      },
      {
        path: "preorder",
        name: "preorder",
        component: () => import("@/views/wms/preorder/index"),
        meta: {
          title: "訂單預購管理",
          icon: "package-shipping",
          perms: ["preorder_manage"]
        }
      },
      {
        path: "aftersales",
        name: "aftersales",
        component: () => import("@/views/wms/aftersales/index"),
        meta: {
          title: "售後服務中心",
          icon: "shopping-cart",
          perms: ["aftersales_manage"]
        }
      },
      {
        path: "repayment",
        name: "repayment",
        component: () => import("@/views/wms/repayment/index"),
        meta: {
          title: "還款作業管理",
          icon: "shopping-cart",
          perms: ["repayment_manage"]
        }
      },
      {
        path: "returns",
        name: "returns",
        component: () => import("@/views/wms/returns/index"),
        meta: {
          title: "退貨管理",
          icon: "shopping-cart",
          perms: ["returns_manage"]
        }
      },
      {
        path: "complaint",
        name: "complaint",
        component: () => import("@/views/wms/complaint/index"),
        meta: {
          title: "客訴管理",
          icon: "shopping-cart",
          perms: ["complaint_manage"]
        }
      }
    ]
  },
  {
    path: "/groupbuying",
    component: Layout,
    redirect: "/groupbuying/index",
    name: "groupbuying",
    hidden: true, //隱藏模塊
    meta: {
      title: "團購管理",
      icon: "shopping",
      perms: ["groupbuying_manage"]
    },
    children: [
      {
        path: "index",
        name: "index",
        hidden: true, //隱藏模塊
        component: () => import("@/views/groupbuying/index.vue"),
        meta: {
          title: "活動管理",
          icon: "activity",
          perms: ["activity_manage"]
        }
      },
      {
        path: "audit",
        name: "audit",
        hidden: true, //隱藏模塊
        component: () => import("@/views/groupbuying/audit/index.vue"),
        meta: {
          title: "審核管理",
          icon: "activity",
          perms: ["audit_manage"]
        }
      },
      {
        path: "order",
        name: "order",
        hidden: true, //隱藏模塊
        component: () => import("@/views/groupbuying/order/index.vue"),
        meta: {
          title: "訂單管理",
          icon: "activity",
          perms: ["order_manage"]
        }
      }
    ]
  },
  {
    path: "/system",
    component: Layout,
    redirect: "/system/user",
    name: "System",
    meta: { title: "系统管理", icon: "system", perms: ["system_manage"] },
    children: [
      {
        path: "user",
        name: "User",
        component: () => import("@/views/system/user.vue"),
        meta: { title: "使用者管理", icon: "user", perms: ["user_manage"] }
      },
      {
        path: "organization",
        name: "Organization",
        component: () => import("@/views/system/organization"),
        meta: { title: "群組管理", icon: "tree", perms: ["org_manage"] }
      },
      {
        path: "role",
        name: "Role",
        component: () => import("@/views/system/role"),
        meta: { title: "角色管理", icon: "lock", perms: ["role_manage"] }
      },
      {
        path: "position",
        name: "Postion",
        hidden: true, //隱藏模塊
        component: () => import("@/views/system/position"),
        meta: {
          title: "職位管理",
          icon: "position",
          perms: ["position_manage"]
        }
      },
      {
        path: "dict",
        name: "Dict",
        hidden: true, //隱藏模塊
        component: () => import("@/views/system/dict"),
        meta: { title: "数据字典", icon: "example", perms: ["dict_manage"] }
      },
      {
        path: "file",
        name: "File",
        hidden: true, //隱藏模塊
        component: () => import("@/views/system/file"),
        meta: { title: "文件库", icon: "documentation", perms: ["file_room"] }
      },
      {
        path: "task",
        name: "Task",
        hidden: true, //隱藏模塊
        component: () => import("@/views/system/task"),
        meta: { title: "定时任务", icon: "list", perms: ["ptask_manage"] }
      }
    ]
  },
  {
    path: "/monitor",
    component: Layout,
    redirect: "/monitor/service",
    name: "Monitor",
    hidden: true, //隱藏模塊
    meta: { title: "系统监控", icon: "example", perms: ["monitor_set"] },
    children: [
      {
        path: "service",
        name: "service",
        component: () => import("@/views/monitor/service"),
        meta: { title: "服务监控", icon: "example", perms: ["service_manage"] }
      }
    ]
  },
  {
    path: "/develop",
    component: Layout,
    redirect: "/develop/perm",
    name: "Develop",
    meta: {
      title: "開發配置",
      icon: "example",
      perms: ["dev_set"]
    },
    children: [
      {
        path: "perm",
        name: "Perm",
        component: () => import("@/views/system/perm"),
        meta: { title: "權限菜單", icon: "example", perms: ["perm_manage"] }
      },
      {
        path: "form-gen-link",
        hidden: true, //隱藏模塊
        component: Layout,
        children: [
          {
            path: "https://jakhuang.github.io/form-generator/",
            meta: { title: "表单设计器", icon: "link", perms: ["dev_form_gen"] }
          }
        ]
      },
      {
        path: "docs",
        component: Layout,
        hidden: true, //隱藏模塊
        children: [
          {
            path: process.env.VUE_APP_BASE_API + "/docs/",
            meta: { title: "接口文档", icon: "link", perms: ["dev_docs"] }
          }
        ]
      },
      {
        path: "swagger",
        hidden: true, //隱藏模塊
        component: Layout,
        children: [
          {
            path: process.env.VUE_APP_BASE_API + "/swagger/",
            meta: { title: "Swagger文档", icon: "link", perms: ["dev_docs"] }
          }
        ]
      },
      {
        path: "admin-link",
        hidden: true, //隱藏模塊
        component: Layout,
        children: [
          {
            path: process.env.VUE_APP_BASE_API + "/admin/",
            meta: { title: "Django后台", icon: "link", perms: ["dev_admin"] }
          }
        ]
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: "*", redirect: "/404", hidden: true }
];

const createRouter = () =>
  new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
  });

const router = createRouter();

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter();
  router.matcher = newRouter.matcher; // reset router
}

export default router;
