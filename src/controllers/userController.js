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
  console.log("๐ LOG USER IN! COMMING SOON!");
  req.session.loggedIn = true;
  req.session.user = user;
  req.flash("success", "Login Success.");
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  //config๋ฅผ ํตํด url์ ๋ง๋๋ ์ญํ ์ ํ๋ ์ปจํธ๋กค๋ฌ
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT, // ์ด๋ค OAuth Apps์ ์ฌ์ฉํ  ๊ฒ์ธ์ง
    allow_signup: false, // ๊นํ๋ธ์ ์๋ก ๊ฐ์ํ๋ ๊ฑธ ํ๊ฐํ  ๊ฒ์ธ์ง
    scope: "read:user user:email", // ์ค์ ๋ก ๋ฌด์์ ํ  ๊ฒ์ธ์ง (๋ฌด์จ ์ ๋ณด๋ฅผ ๊ฐ์ ธ์ฌ ๊ฒ์ธ์ง)
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

// user๊ฐ ๊นํ๋ธ์์ ๋์์ค๋ฉด ?code=_____๋ฅผ ์ป๊ฒ๋จ, ์ ์ ๊ฐ ์ธ์ฆ์ ์น์ธํ๋ค๊ณ  ๊นํ๋ธ์์ ์๋ ค์ฃผ๋ ๊ฒ
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
      //fetch๋ url์์ ์ ๋ณด๋ฅผ ์ฝ์ด๋ค์ด๋ ํจ์
      method: "POST", // ๊ธฐ๋ณธ๊ฐ์ GET์ด๊ณ , GET์ด๋ฉด url๋ก ๋ถํฐ ์ฝํ์ธ ๊ฐ ๋ค์ด๋ก๋ ๋จ
      headers: {
        Accept: "application/json", // ์ด ๋ถ๋ถ์ด ์์ผ๋ฉด github๊ฐ text๋ก ์๋ตํจ
      },
    })
  ).json(); //fetch๋ ๋จ๋์ผ๋ก๋ ์ฌ์ฉํ  ์ ์๊ณ  ์๋ต์ ํ์คํธ๋ json ๋ฑ์ผ๋ก ๋ณํํด์ผํจ. ์ฌ๊ธฐ์๋ json.
  if ("access_token" in tokenRequest) {
    // ๊น ํ๋ธ๋ ์ฐ๋ฆฌ์๊ฒ access_token์ ์ ๊ณต, github api์ ์ํธ์์ฉํ๋๋ฐ ์ฌ์ฉ๋จ.
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com"; //apiํค๊ฐ ๋ฐ๋ณต๋๊ธฐ์ ๋ฐ๋ก ์ ์ธํ ๊ฒ
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        //user ์ ๋ณด๋ฅผ ๋ฐ๊ธฐ ์ํด ์์ฒญํจ
        //GETํด์ผํ๊ธฐ์ method๋ ์๋ตํด๋ ๋จ
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    console.log(userData);
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        //user:email์ ๋ถ๋ฌ์ด (email array)
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      // (๋์ค์ notification์ ์ค์ ํด์ค ๊ฒ์. ๊น ํ๋ธ๋ก ๋ก๊ทธ์ธํ๋ค๋ ๊ฑธ ์๋ดํ๋ ๊ฒ.)
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email }); //ํด๋น ์ด๋ฉ์ผ์ด ์๋ ๊ฐ์ฒด๊ฐ DB์ ์๋์ง ์ฐพ์
    if (!user) {
      // DB์ ํ์์ ๋ณด ์์ฑ
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
    //๋ก๊ทธ์ธ ๊ตฌํ
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
  console.log(tokenRequest);

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
    console.log("userData", userData);

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
  //๋ก๊ทธ์์. ์ธ์์ ๊ฑฐ.
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
