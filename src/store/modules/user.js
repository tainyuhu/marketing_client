import { login, logout, getInfo } from "@/api/user";
import { getToken, setToken, removeToken } from "@/utils/auth";
import { resetRouter } from "@/router";

const getDefaultState = () => {
  return {
    token: getToken(),
    name: "",
    avatar: "",
    perms: [],
    roles: [],
    date_joined: "",

    // LINE 帳號綁定相關
    is_line_bound: false,
    line_id: null,
    line_bind_time: null,
    line_profile: null,

    // 使用者基本資料
    username: "",
    email: "",
    phone: "",
    gender: "",
    nickname: "",
    birthday: "",
    address: "",

    // 擴充欄位
    mailing_address_1: "",
    mailing_address_2: ""
  };
};

const state = getDefaultState();

const mutations = {
  RESET_STATE: state => {
    Object.assign(state, getDefaultState());
  },
  SET_TOKEN: (state, token) => {
    state.token = token;
  },
  SET_NAME: (state, name) => {
    state.name = name;
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar;
  },
  SET_PERMS: (state, perms) => {
    state.perms = perms;
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles;
  },
  SET_DATE_JOINED: (state, joinedTime) => {
    state.date_joined = joinedTime;
  },
  SET_LINE_BOUND: (state, isBound) => {
    state.is_line_bound = isBound;
  },
  SET_LINE_ID: (state, lineId) => {
    state.line_id = lineId;
  },
  SET_LINE_BIND_TIME: (state, bindTime) => {
    state.line_bind_time = bindTime;
  },
  SET_LINE_PROFILE: (state, profile) => {
    state.line_profile = profile;
  },
  SET_USERNAME: (state, username) => {
    state.username = username;
  },
  SET_EMAIL: (state, email) => {
    state.email = email;
  },
  SET_PHONE: (state, phone) => {
    state.phone = phone;
  },
  SET_GENDER: (state, gender) => {
    state.gender = gender;
  },
  SET_NICKNAME: (state, nickname) => {
    state.nickname = nickname;
  },
  SET_BIRTHDAY: (state, birthday) => {
    state.birthday = birthday;
  },
  SET_ADDRESS: (state, address) => {
    state.address = address;
  },

  SET_MAILING_ADDRESS_1: (state, address) => {
    state.mailing_address_1 = address;
  },
  SET_MAILING_ADDRESS_2: (state, address) => {
    state.mailing_address_2 = address;
  }
};

const actions = {
  login({ commit }, userInfo) {
    const { username, password } = userInfo;
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password })
        .then(response => {
          const { data } = response;
          commit("SET_TOKEN", data.access);
          setToken(data.access);
          resolve(response);
        })
        .catch(reject);
    });
  },
  loginWithTokens({ commit }, tokens) {
    return new Promise((resolve, reject) => {
      commit("SET_TOKEN", tokens.access_token);
      setToken(tokens.access_token);
      this.dispatch("user/getInfo")
        .then(resolve)
        .catch(reject);
    });
  },
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token)
        .then(response => {
          const { data } = response;
          if (!data) return reject("驗證失敗，請重新登入");

          const {
            perms,
            name,
            avatar,
            username,
            email,
            phone,
            gender,
            nickname,
            birthday,
            address,
            date_joined,
            is_line_bound,
            line_id,
            line_bind_time,
            line_profile,

            mailing_address_1,
            mailing_address_2,
            roles
          } = data;

          if (!perms || perms.length <= 0) return reject("沒有任何權限!");

          commit("SET_PERMS", perms);
          commit("SET_ROLES", roles);
          commit("SET_NAME", name);
          commit("SET_AVATAR", avatar);
          commit("SET_USERNAME", username);
          commit("SET_EMAIL", email);
          commit("SET_PHONE", phone);
          commit("SET_GENDER", gender);
          commit("SET_NICKNAME", nickname);
          commit("SET_BIRTHDAY", birthday);
          commit("SET_ADDRESS", address);
          commit("SET_DATE_JOINED", date_joined);
          commit("SET_LINE_BOUND", is_line_bound);
          commit("SET_LINE_ID", line_id);
          commit("SET_LINE_BIND_TIME", line_bind_time);
          commit("SET_LINE_PROFILE", line_profile);

          commit("SET_MAILING_ADDRESS_1", mailing_address_1);
          commit("SET_MAILING_ADDRESS_2", mailing_address_2);

          resolve(data);
        })
        .catch(reject);
    });
  },
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token)
        .then(() => {
          removeToken();
          resetRouter();
          commit("RESET_STATE");
          resolve();
        })
        .catch(reject);
    });
  },
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken();
      commit("RESET_STATE");
      resolve();
    });
  },
  updateUserInfo({ commit }, userInfo) {
    return new Promise(resolve => {
      Object.entries(userInfo).forEach(([key, value]) => {
        const mutation = "SET_" + key.toUpperCase();
        if (mutations[mutation]) commit(mutation, value);
      });
      resolve(userInfo);
    });
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
