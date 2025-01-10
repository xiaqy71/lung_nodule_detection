import { HiMail } from "react-icons/hi";
import { Button, TextInput } from "flowbite-react";
import { useState } from "react";
import validator from "validator";
import apiClient from "../api";
import MyNavbar from "../components/navbar";

export default function RecoveryPassword() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailColor, setEmailColor] = useState("gray");
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState(null);

  const tipClass = status ? "text-green-500" : "text-red-500";

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

  const handleClick = async () => {
    if (emailColor === "failure") {
      return;
    }
    // 路径参数
    setIsProcessing(true);
    try {
      const response = await apiClient.post(
        `/api/v1/password-recovery/${email}`
      );
      if (response.status === 200) {
        setStatus(true);
      }
    } catch (error) {
      setStatus(false);
      console.log(error);
    } finally {
      setIsProcessing(false);
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
            ? "重置邮件已发送，请查收"
            : "发送邮件失败，请重试"}
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

        <Button color="blue" onClick={handleClick} isProcessing={isProcessing}>
          发送重置邮件{" "}
        </Button>
      </div>
    </>
  );
}
