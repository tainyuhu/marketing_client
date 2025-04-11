import request from "@/utils/request";

// 取得 LINE Login 的 URL
export function get_line_login_url() {
  return request({
    url: "/line_login/url/?mode=login",
    method: "get",
  });
}

// 取得 LINE Login 的 URL (綁定用)
export function get_line_binding_url() {
  return request({
    url: "/line_login/url/?mode=binding",
    method: "get",
  });
}

// 取得 LINE Login 的 資料的TOKEN
export function exchange_line_login_token(data) {
  return request({
    url: "/line_login/exchange-temp-token/",
    method: "post",
    data
  });
}

// 解除綁定 LINE Login 的 URL
export function unbind_line_account() {
  return request({
    url: "/line_login/unbind-account/",
    method: "post",
  });
}
