import { useEffect, useState } from "react";
import MyNavbar from "../components/navbar";
import { Pagination, Modal } from "antd";
import apiClient from "../api";
import { RxLightningBolt } from "react-icons/rx";


export default function History() {
  const [history_data, setHistoryData] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    try {
      apiClient
        .get("/api/v1/detection/history", {
          params: {
            skip: (page - 1) * pageSize,
            limit: pageSize,
          },
        })
        .then((response) => {
          setHistoryData(response.data.data);
          setCount(response.data.count);
        });
    } catch (error) {
      console.error("Failed to fetch history data: ", error);
    }
  }, [page, pageSize]);

  const showModal = (item) => {
    // setSelectedItem(item);
    setIsModalVisible(true);
    // 请求接口， 获取检测的详细信息
    try {
      apiClient
        .get(`/api/v1/detection/history/${item.id}`)
        .then((response) => {
          // 把响应中的detections反序列化为对象
          response.data.detections = JSON.parse(response.data.detections);
          setSelectedItem(response.data);
        });
    } catch (error) {
      console.error("Failed to fetch history item details: ", error);
    }
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const history_item = (item) => {
    return (
      <div
        key={item.id}
        className="container max-w-sm border-2 p-4 rounded-md shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        onClick={() => showModal(item)}
      >
        <div className="flex justify-between items-center">
          <img src={item.raw_image_url} alt="history" className="h-20 w-20 object-cover rounded-md" />
          <p className="ml-4 text-gray-600">{new Date(item.timestamp).toLocaleString()}</p>
        </div>
      </div>
    );
  };

  return (
    <>
      <MyNavbar page="history" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full mt-10 px-4">
        {history_data.map((item) => history_item(item))}
      </div>
      <div className="fixed bottom-0 w-full flex justify-center items-center p-4 bg-white bg-opacity-75 shadow-lg backdrop-filter backdrop-blur-md">
        <Pagination
          total={count}
          showSizeChanger
          showQuickJumper={false}
          showTotal={(total) => `Total ${total} items`}
          onChange={(page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
          }}
        />
      </div>
      <Modal
        title={`检测结果 ${selectedItem ? new Date(selectedItem.timestamp).toLocaleString() : ''}`}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        {selectedItem && (
          <div className="flex flex-col items-center">
            <div className="flex justify-between w-full mb-4">
              <img src={selectedItem.raw_image_url} alt="history" className="h-40 w-40 object-cover rounded-md" />
              <img src={selectedItem.annotated_image_url} alt="annotated" className="h-40 w-40 object-cover rounded-md" />
            </div>
            <div className="border-2 rounded-md p-4 mb-4 shadow-md w-full">
              <div className="flex items-center justify-start mb-2">
                <p>检测耗时: {selectedItem.detections.Speed.toFixed(2)}ms</p>
                <RxLightningBolt className="w-4 h-4 text-yellow-200 ml-2" />
              </div>
              <p className="mb-2">结节数量: {selectedItem.detections.Nodules.length}</p>
              {selectedItem.detections.Nodules.map((nodule, index) => (
                <div key={index} className="border-2 rounded-md p-2 my-2">
                  <p className="font-semibold">结节 {index + 1}</p>
                  <p>位置: ({nodule.x.toFixed(2)}, {nodule.y.toFixed(2)})</p>
                  <p>大小: ({nodule.width.toFixed(2)}, {nodule.height.toFixed(2)})</p>
                  <p>置信度: {nodule.confidence.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
