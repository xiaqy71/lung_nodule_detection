import { useState } from "react";
import { Button, Checkbox, Label, TextInput } from "flowbite-react";
import { HiMail } from "react-icons/hi";
import { RiLockPasswordLine } from "react-icons/ri";
import { useNavigate } from "react-router";

import apiClient, { setToken } from "../api";
import validator from "validator";
import MyNavbar from "../components/navbar";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordColor, setPasswordColor] = useState("gray");
  const [emailColor, setEmailColor] = useState("gray");
  const [tip, setTip] = useState("");

  const navigate = useNavigate();

  const validateEmail = (e) => {
    const email = e.target.value;

    if (validator.isEmail(email)) {
      setEmailError("邮箱格式正确");
      setEmailColor("success");
    } else {
      setEmailError("邮箱格式错误");
      setEmailColor("failure");
    }
  };

  const validatePassword = (e) => {
    const password = e.target.value;

    if (password.length >= 6) {
      setPasswordError("密码格式正确");
      setPasswordColor("success");
    } else {
      setPasswordError("密码长度至少为6");
      setPasswordColor("failure");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (emailColor === "failure" || passwordColor === "failure") {
      return;
    }

    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);

    try {
      const response = await apiClient.post(
        "/api/v1/login/access-token",
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (response.data.access_token) {
        setToken(response.data.access_token, response.data.expires_in);
        navigate("/detection");
      }
    } catch (error) {
      const response = error.response;
      if (response.data?.detail === "Incorrect email or password") {
        setEmailColor("failure");
        setEmailError("");
        setPasswordColor("failure");
        setPasswordError("");
        setTip("邮箱或密码错误");
      }
      console.error(error);
    }
  };

  const loginForm = () => {
    return (
      <form
        className="flex flex-col gap-4 max-w-sm mx-auto my-28 border-2 shadow-sm rounded-md p-8"
        onSubmit={handleSubmit}
      >
        <div className="mx-auto text-2xl my-10">肺部结节检测系统</div>
        <div className="text-center text-red-600">{tip}</div>
        <div>
          <TextInput
            id="email"
            type="email"
            value={username}
            icon={HiMail}
            placeholder="admin@example.com"
            onChange={(e) => {
              setUsername(e.target.value);
              validateEmail(e);
            }}
            color={emailColor}
            helperText={emailError}
            required
          />
        </div>
        <div>
          <TextInput
            id="password"
            type="password"
            value={password}
            icon={RiLockPasswordLine}
            placeholder="Password"
            onChange={(e) => {
              setPassword(e.target.value);
              validatePassword(e);
            }}
            color={passwordColor}
            helperText={passwordError}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember">记住我</Label>
          </div>
          <a className="text-blue-600 text-sm" href="/recover-password">
            忘记密码
          </a>
        </div>
        <Button type="submit" color="blue">
          登录
        </Button>
        <div className="flex flex-center justify-between">
          <a href="/signup" className="text-blue-600 text-sm">
            还没有账号，立即注册
          </a>
          <a href="/detection" className="text-blue-600 text-sm">
            立即试用
          </a>
        </div>
      </form>
    );
  };

  return (
    <>
      <MyNavbar></MyNavbar>
      {loginForm()}
    </>
  );
}
