import MyNavbar from "../components/navbar";
import { Button, FileInput, Label } from "flowbite-react";
import { useState } from "react";
import { RxLightningBolt } from "react-icons/rx";
import apiClient from "../api";

export default function Detection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);

  const handleFileName = (fileName) => {
    if (fileName.length > 20) {
      return fileName.slice(0, 20) + "...";
    }
    return fileName;
  };

  const handleClick = async () => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      const url = localStorage.getItem("token")
        ? "/api/v1/detection"
        : "/api/v1/detection/guest";
      const response = await apiClient.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const data = await response.data;
      if (data.status === "success") {
        setDetectionResult(data);
      }
      console.log(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <MyNavbar page={"detection"} />
      <div className="container mx-auto mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="order-2 lg:order-1">
            <h1 className="text-3xl font-semibold text-center mb-4">预测结果</h1>
            {!detectionResult && (
              <p className="text-center text-gray-500 dark:text-gray-400">
                请上传一张图片进行检测
              </p>
            )}
            {detectionResult && (
              <div className="border-2 rounded-md p-4 mb-4 shadow-md">
                <div className="flex items-center justify-start mb-2">
                  <p>检测耗时: {detectionResult.detections.Speed.toFixed(2)}ms</p>
                  <RxLightningBolt className="w-4 h-4 text-yellow-200 ml-2" />
                </div>
                <p className="mb-2">结节数量: {detectionResult.detections.Nodules.length}</p>
                {detectionResult.detections.Nodules.map((nodule, index) => (
                  <div key={index} className="border-2 rounded-md p-2 my-2">
                    <p>结节 {index + 1}</p>
                    <p>位置: ({nodule.x.toFixed(2)}, {nodule.y.toFixed(2)})</p>
                    <p>大小: ({nodule.width.toFixed(2)}, {nodule.height.toFixed(2)})</p>
                    <p>置信度: {nodule.confidence.toFixed(2)}</p>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center">
                    <p className="mb-2">上传图片</p>
                    <img src={detectionResult.rawUrl} alt="raw picture" className="w-full h-auto" />
                  </div>
                  <div className="text-center">
                    <p className="mb-2">预测标注图</p>
                    <img src={detectionResult.detections.AnnotatedUrl} alt="annotated picture" className="w-full h-auto" />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="order-1 lg:order-2">
            <div className="flex flex-col items-center justify-center mb-4">
              <Label
                htmlFor="dropzone-file"
                className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
              >
                <div className="flex flex-col items-center justify-center pb-6 pt-5">
                  <svg
                    className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">点击上传</span> 或拖拽到此处
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    仅支持PNG (MAX. 800x400px)
                  </p>
                </div>
                <FileInput
                  id="dropzone-file"
                  className="hidden"
                  onChange={(e) => {
                    console.log(e.target.files[0]);
                    setSelectedFile(e.target.files[0]);
                  }}
                />
              </Label>
            </div>
            <div className="flex justify-between items-center">
              {selectedFile && (
                <>
                  <div className="flex items-center gap-2">
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt=""
                      className="w-12 h-12"
                    />
                    {handleFileName(selectedFile.name)}
                  </div>
                  <Button
                    size="sm"
                    color="red"
                    isProcessing={isProcessing}
                    onClick={handleClick}
                  >
                    开始检测
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
