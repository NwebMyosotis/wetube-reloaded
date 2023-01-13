import User from "../models/User.js";
import fetch from "cross-fetch";
import bcrypt from "bcrypt";
import Video from "../models/Video.js";

export const getJoin = (req, res) => {
  return res.render("join", { pageTitle: "Join" });
};

export const postJoin = async (req, res) => {
  const { email, username, password, password2, name, location } = req.body;
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle: "Join",
      errorMessage: "This username/email is already taken.",
    });
  }
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle: "Join",
      errorMessage: "Password confirmation does not match.",
    });
  }
  try {
    await User.create({
      email,
      username,
      password,
      name,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle: "Join",
      errorMessage: error._message,
    });
  }
};

export const getLogin = (req, res) => {
  return res.render("login", { pageTitle: "Login" });
};

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle: "Login",
      errorMessage: "An account with this username does not exists.",
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle: "Login",
      errorMessage: "Wrong password",
    });
  }
  console.log("🆗 LOG USER IN! COMMING SOON!");
  req.session.loggedIn = true;
  req.session.user = user;
  req.flash("success", "Login Success.");
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  //config를 통해 url을 만드는 역할을 하는 컨트롤러
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT, // 어떤 OAuth Apps을 사용할 것인지
    allow_signup: false, // 깃허브에 새로 가입하는 걸 허가할 것인지
    scope: "read:user user:email", // 실제로 무엇을 할 것인지 (무슨 정보를 가져올 것인지)
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

// user가 깃허브에서 돌아오면 ?code=_____를 얻게됨, 유저가 인증을 승인했다고 깃허브에서 알려주는 것
export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      //fetch는 url에서 정보를 읽어들이는 함수
      method: "POST", // 기본값은 GET이고, GET이면 url로 부터 콘텐츠가 다운로드 됨
      headers: {
        Accept: "application/json", // 이 부분이 없으면 github가 text로 응답함
      },
    })
  ).json(); //fetch는 단독으로는 사용할 수 없고 응답을 텍스트나 json 등으로 변환해야함. 여기서는 json.
  if ("access_token" in tokenRequest) {
    // 깃 허브는 우리에게 access_token을 제공, github api와 상호작용하는데 사용됨.
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com"; //api키가 반복되기에 따로 선언한 것
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        //user 정보를 받기 위해 요청함
        //GET해야하기에 method는 생략해도 됨
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    // console.log(userData);
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        //user:email을 불러옴 (email array)
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      // (나중에 notification을 설정해줄 것임. 깃 허브로 로그인했다는 걸 안내하는 것.)
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email }); //해당 이메일이 있는 객체가 DB에 있는지 찾음
    if (!user) {
      // DB에 회원정보 생성
      user = await User.create({
        email: emailObj.email,
        socialOnly: true,
        username: userData.login,
        password: "",
        name: userData.name,
        location: userData.location,
        avatarUrl: userData.avatar_url,
      });
    }
    //로그인 구현
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const startKakaoLogin = (req, res) => {
  const baseUrl = "https://kauth.kakao.com/oauth/authorize";
  const config = {
    client_id: "7ad1342c4ad133b59e89bb0955585168",
    redirect_uri: `http://localhost:4000/users/kakao/finish`,
    response_type: "code",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishKakaoLogin = async (req, res) => {
  const baseUrl = "https://kauth.kakao.com/oauth/token";
  const config = {
    grant_type: "authorization_code",
    client_id: "7ad1342c4ad133b59e89bb0955585168",
    redirect_uri: `http://localhost:4000/users/kakao/finish`,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
    })
  ).json();
  // console.log(tokenRequest);

  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://kapi.kakao.com";
    const userData = await (
      await fetch(`${apiUrl}/v2/user/me`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();
    // console.log("userData", userData);

    const username = userData.kakao_account.profile.nickname;
    const userEmail = userData.kakao_account.email;

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      user = await User.create({
        email: userEmail,
        socialOnly: true,
        username,
        password: "",
        name: username,
        avatarUrl: userData.kakao_account.profile.rofile_image_url,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "User Profile" });
};

export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, username, email, location },
    file,
  } = req;

  const usernameCheck = username !== req.session.user.username;
  const emailCheck = email !== req.session.user.email;
  const socialOnlyCheck = req.session.user.socialOnly;
  const findUsername = await User.exists({ username });
  const findEmail = await User.exists({ email });
  if (usernameCheck && findUsername) {
    return res.render("edit-profile", {
      pageTitle: "Edit Profile",
      errorMessage: "This username is already taken.",
    });
  } else if (emailCheck && findEmail) {
    if (socialOnlyCheck === false) {
      return res.render("edit-profile", {
        pageTitle: "Edit Profile",
        errorMessage: "This email is already taken.",
      });
    }
  }
  if (emailCheck && socialOnlyCheck === true) {
    return res.render("edit-profile", {
      pageTitle: "Edit Profile",
      errorMessage: "Social account can't change email",
    });
  }
  const upadateUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      name,
      username,
      email,
      location,
    },
    { new: true }
  );
  req.session.user = upadateUser;
  return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    req.flash("error", "Can't change password");
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};

export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPasswordConfirm },
  } = req;
  const user = await User.findById(_id);
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect",
    });
  }
  if (newPassword !== newPasswordConfirm) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The password does not match the confirmation",
    });
  }
  user.password = newPassword;
  await user.save();
  req.flash("info", "Password updated");
  return res.redirect("/users/logout");
};

export const logout = (req, res) => {
  //로그아웃. 세션제거.
  req.session.user = null;
  res.locals.loggedInUser = req.session.user;
  req.session.loggedIn = false;
  req.flash("info", "Bye Bye");
  return res.redirect("/");
};

export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  });
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User Not Found" });
  }
  return res.render("users/profile", { pageTitle: user.name, user });
};
