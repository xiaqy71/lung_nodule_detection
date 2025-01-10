import { useState } from "react";
import { Button, TextInput } from "flowbite-react";
import { HiMail } from "react-icons/hi";
import { RiLockPasswordLine } from "react-icons/ri";
import { CiUser } from "react-icons/ci";
import apiClient from "../api";
import { useNavigate } from "react-router";
import validator from "validator";

export default function Login() {
  const [fullname, setFullname] = useState(undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [repeatPasswordError, setRepeatPasswordError] = useState("");
  const [emailColor, setEmailColor] = useState("gray");
  const [passwordColor, setPasswordColor] = useState("gray");
  const [repeatPasswordColor, setRepeatPasswordColor] = useState("gray");
  // const [tip, setTip] = useState("");

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

  const validateRepeatPassword = (e) => {
    const repeatPassword = e.target.value;
    if (repeatPassword === password) {
      setRepeatPasswordError("密码一致");
      setRepeatPasswordColor("success");
    } else {
      setRepeatPasswordError("密码不一致");
      setRepeatPasswordColor("failure");
    }
  }

  const handleClick = async () => {
    if (
      emailColor === "failure" ||
      passwordColor === "failure" ||
      repeatPasswordColor === "failure"
    ) {
      return;
    }

    try {
      const response = await apiClient.post("/api/v1/users/signup", {
        email: email,
        password: password,
        full_name: fullname,
      });
      if (response.status === 200) {
        // 跳转到登录页面
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
      const response = error.response;
      if (response.data.detail[0]["type"] === "string_too_short") {
        setPasswordError("密码长度至少为6");
        setPasswordColor("failure");
      } else if (
        response.data.detail ===
        "The user with this email already exists in the system."
      ) {
        setEmailError("邮箱已存在");
        setEmailColor("failure");
      }
    }
  };

  const signupForm = () => {
    return (
      <div>
      <form
        className="flex flex-col gap-4 max-w-sm mx-auto my-28 border-2 shadow-sm rounded-md p-8"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className="mx-auto text-2xl my-10">肺部结节检测系统</div>
        {/* <div className="text-center text-red-600">{tip}</div> */}
        <div>
          <TextInput
            id="fullname"
            type="text"
            value={fullname}
            icon={CiUser}
            placeholder="fullname[optional]"
            onChange={(e) => {
              setFullname(e.target.value);
            }}
            color="gray"
          />
        </div>
        <div>
          <TextInput
            id="email"
            type="email"
            value={email}
            icon={HiMail}
            placeholder="admin@example.com"
            onChange={(e) => {
              setEmail(e.target.value);
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
        <div>
          <TextInput
            id="repeat-password"
            type="password"
            value={repeatPassword}
            icon={RiLockPasswordLine}
            placeholder="Repeat Password"
            onChange={(e) => {
              setRepeatPassword(e.target.value);
              validateRepeatPassword(e);
            }}
            color={repeatPasswordColor}
            helperText={repeatPasswordError}
            required
            shadow
          />
        </div>

        <Button onClick={handleClick} type="submit" color="blue">
          注册
        </Button>
        <a href="/login" className="text-blue-600 text-sm">
          已有账号，立即登录
        </a>
      </form>
      </div>
    );
  };

  return <>{signupForm()}</>;
}
