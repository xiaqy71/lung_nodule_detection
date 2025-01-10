import { useLocation, useNavigate } from "react-router";
import MyNavbar from "../components/navbar";
import { Button, TextInput } from "flowbite-react";
import { RiLockPasswordLine } from "react-icons/ri";
import { useEffect, useState } from "react";
import apiClient from "../api";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordColor, setPasswordColor] = useState("gray");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [repeatPasswordError, setRepeatPasswordError] = useState("");
  const [repeatPasswordColor, setRepeatPasswordColor] = useState("gray");
  const [status, setStatus] = useState(null);
  const [timer, setTimer] = useState(0);

  const tipClass = status ? "text-green-500" : "text-red-500";

  const navigate = useNavigate();
  const location = useLocation();
  const queryParam = new URLSearchParams(location.search);
  const token = queryParam.get("token");

  useEffect(() => {
    if (!token) {
      navigate("/recover-password");
    }
  });

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

  const handleClick = async () => {
    if (passwordColor === "failure" || repeatPasswordColor === "failure") {
      return;
    }

    // json格式
    const params = {
      token: token,
      new_password: password,
    };

    try {
      const response = await apiClient.post("/api/v1/reset-password", params);
      if (response.status === 200) {
        setStatus(true);
        let count = 3;
        setTimer(count);
        const interval = setInterval(() => {
          count--;
          setTimer(count);
          if (count === 0) {
            clearInterval(interval);
            navigate("/login");
          }
        }, 1000);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <MyNavbar></MyNavbar>
      <div className="flex flex-col gap-4 max-w-sm mx-auto my-28 border-2 shadow-sm rounded-md p-8">
        <div className="mx-auto text-2xl my-10">肺部结节检测系统</div>
        <div className={`text-center text-sm ${tipClass}`}>
          {status === null
            ? ""
            : status
            ? `密码已重置， ${timer}秒后跳转到登录页面`
            : "重置密码失败，请重试"}
        </div>
        <div>
          <TextInput
            id="password"
            type="password"
            value={password}
            icon={RiLockPasswordLine}
            placeholder="New Password"
            onChange={(e) => {
              setPassword(e.target.value);
              validatePassword(e);
            }}
            color={passwordColor}
            helperText={passwordError}
            required
          ></TextInput>
        </div>
        <div>
          <TextInput
            id="repeat-password"
            type="password"
            value={repeatPassword}
            icon={RiLockPasswordLine}
            placeholder="Repeat New Password"
            onChange={(e) => {
              setRepeatPassword(e.target.value);
              if (e.target.value === password) {
                setRepeatPasswordError("密码一致");
                setRepeatPasswordColor("success");
              } else {
                setRepeatPasswordError("密码不一致");
                setRepeatPasswordColor("failure");
              }
            }}
            color={repeatPasswordColor}
            helperText={repeatPasswordError}
            required
          ></TextInput>
        </div>
        <Button color="blue" onClick={handleClick}>
          重置密码
        </Button>
      </div>
    </>
  );
}
