import { useState, useContext, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import RankingContext from "./rankingContext";

function App() {
  const { state, dispatch } = useContext(RankingContext);
  const [message, setMessage] = useState("");
  const { submissions, loading } = state;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [permission, setPermission] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
      };

      setPermission(true);
    } catch (err) {
      console.log(err);
      alert("Trình duyệt từ chối quyền micro");
    }
  };

  const startRecording = async () => {
    if (!permission) await requestPermission();
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "recording") {
      chunksRef.current = [];
      mr.start();
      setRecording(true);
    }
  };

  const stopRecording = () => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state === "recording") {
      mr.stop();
      setRecording(false);
    }
  };

  useEffect(() => {
    dispatch({ type: "LOAD_SUBMISSIONS" });
  }, [dispatch]);

  const getMessage = (score) => {
    if (score > 90) return "Tuyệt vời!";
    if (score >= 70) return "Chúc mừng!";
    return "Cần cố gắng hơn";
  };

  const onSubmit = (data) => {
    if (!audioBlob) {
      alert("Bạn cần ghi âm trước khi nộp.");
      return;
    }
    const newSubmission = {
      name: data.name,
      score: Number(data.score),
      time: Number(data.time),
      audioUrl: audioURL,
      id: Date.now(),
    };
    dispatch({ type: "ADD_SUBMISSION", payload: newSubmission });
    setMessage(getMessage(newSubmission.score));
    reset();
    setAudioBlob(null);
    setAudioURL(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <h1 className="text-3xl font-bold mb-6">Nộp bài kiểm tra</h1>
      <div className="w-full p-[60px] max-w-7xl mx-auto py-10 flex flex-col items-center md:flex-row md:items-start justify-center gap-10 border border-solid border-[#ccc] rounded-2xl bg-white shadow">
        <form
          className="w-full max-w-md bg-white shadow-md rounded-2xl px-6 pt-6 pb-8 mb-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h2 className="text-xl font-bold mb-4">Nộp bài</h2>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Tên :</label>
            <input
              type="text"
              {...register("name", {
                required: "Vui lòng nhập tên.",
                maxLength: { value: 50, message: "Tên quá dài." },
                minLength: { value: 2, message: "Vui lòng nhập tên phù hợp." },
              })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            />
            {errors.name && (
              <div className="text-red-500 mt-1">{errors.name.message}</div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Điểm (0-100):</label>
            <input
              type="number"
              {...register("score", {
                required: "Vui lòng nhập điểm.",
                min: { value: 0, message: "Điểm tối thiểu là 0." },
                max: { value: 100, message: "Điểm tối đa là 100." },
              })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            />
            {errors.score && (
              <div className="text-red-500 mt-1">{errors.score.message}</div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Thời gian (giây):
            </label>
            <input
              type="number"
              {...register("time", {
                required: "Vui lòng nhập thời gian.",
                min: { value: 0, message: "Thời gian phải là số dương." },
              })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            />
            {errors.time && (
              <div className="text-red-500 mt-1">{errors.time.message}</div>
            )}
          </div>

          <div className="mb-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={recording ? stopRecording : startRecording}
              className={`${
                recording ? "bg-red-500" : "bg-green-500"
              } text-white py-2 px-4 rounded`}
            >
              {recording ? "⏹️ Dừng ghi âm" : "🎙️ Bắt đầu ghi âm"}
            </button>
            {audioURL && (
              <audio controls src={audioURL} className="w-full mt-2" />
            )}
          </div>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-auto cursor-pointer"
          >
            Nộp bài
          </button>

          {message && (
            <div className="mt-4 text-lg font-semibold animate-bounce text-green-600">
              {message}
            </div>
          )}
        </form>
        <div className="w-full ">
          <h3 className="text-lg font-bold mb-4 text-blue-700">
            Bảng xếp hạng
          </h3>
          <div className="overflow-x-auto rounded-lg shadow">
            {loading ? (
              <div className="py-10 text-center text-gray-500 text-lg animate-pulse">
                Đang tải dữ liệu...
              </div>
            ) : (
              <table className="min-w-full bg-white rounded-lg">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="py-3 px-4 border-b rounded-tl-lg text-center">
                      #
                    </th>
                    <th className="py-3 px-4 border-b text-center">Tên</th>
                    <th className="py-3 px-4 border-b text-center">Điểm</th>
                    <th className="py-3 px-4 border-b text-center">
                      Thời gian
                    </th>
                    <th className="py-3 px-4 border-b rounded-tr-lg text-center">
                      Nghe
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s, idx) => (
                    <tr
                      key={s.id}
                      className={
                        idx === 0
                          ? "bg-yellow-200 font-bold animate-pulse"
                          : idx % 2 === 0
                          ? "bg-gray-50 hover:bg-blue-50 transition"
                          : "bg-white hover:bg-blue-50 transition"
                      }
                    >
                      <td className="py-2 px-4 border-b text-center">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {s.name}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {s.score}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {s.time}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {s.audioUrl && <audio controls src={s.audioUrl} />}
                      </td>
                    </tr>
                  ))}
                  {submissions.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-4 px-4 text-center text-gray-500"
                      >
                        Chưa có bài nộp nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
