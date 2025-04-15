import request from "@/utils/request";

export function login(data) {
  return request({
    url: "/token/",
    method: "post",
    data
  });
}

export function logout() {
  return request({
    url: "/token/black/",
    method: "get"
  });
}

export function getInfo() {
  return request({
    url: "/system/user/info/",
    method: "get"
  });
}

export function updateUserProfile(data) {
  return request({
    url: "/system/user/update_profile/",
    method: "put",
    data
  });
}

export function getUserList(query) {
  return request({
    url: "/system/user/",
    method: "get",
    params: query
  });
}

export function getUser(id) {
  return request({
    url: `/system/user/${id}/`,
    method: "get"
  });
}

export function createUser(data) {
  return request({
    url: "/system/user/",
    method: "post",
    data
  });
}

export function updateUser(id, data) {
  return request({
    url: `/system/user/${id}/`,
    method: "put",
    data
  });
}

export function deleteUser(id, data) {
  return request({
    url: `/system/user/${id}/`,
    method: "delete",
    data
  });
}

export function changePassword(data) {
  return request({
    url: "/system/user/password/",
    method: "put",
    data
  });
}

// 發送驗證碼
export function sendVerificationCode(employeeId) {
  return request({
    url: "/system/reset-password/send-code/",
    method: "post",
    data: { employeeId } // 改用 data 而不是 params
  });
}

// 驗證驗證碼
export function verifyCode(data) {
  return request({
    url: "/system/reset-password/verify-code/",
    method: "post",
    data
  });
}

// 重設密碼
export function resetPassword(data) {
  return request({
    url: "/system/reset-password/reset-password/", // 修改為正確的路徑
    method: "post",
    data
  });
}
