import { useState } from "react";
import { useForm } from "react-hook-form";

function App() {
  const [submissions, setSubmissions] = useState([]);
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const getMessage = (score) => {
    if (score > 90) return "Tuyệt vời!";
    if (score >= 70) return "Chúc mừng!";
    return "Cần cố gắng hơn";
  };
  const onSubmit = (data) => {
    const newSubmission = {
      score: Number(data.score),
      time: Number(data.time),
      id: Date.now(),
    };
    const updated = [...submissions, newSubmission].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.time - b.time;
    });
    setSubmissions(updated);
    setMessage(getMessage(newSubmission.score));
    reset();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center p-4">
      <div className="w-full flex items-start justify-center gap-10">
        <form
          className="bg-white shadow-md rounded-[10px] px-8 pt-6 pb-8 mb-4 w-[400px]"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h2 className="text-xl font-bold mb-4">Nộp bài</h2>
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

        <div className="w-full max-w-md">
          <h3 className="text-lg font-bold mb-4 text-blue-700">
            Bảng xếp hạng
          </h3>
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full bg-white rounded-lg">
              <thead>
                <tr className="bg-blue-100">
                  <th className="py-3 px-4 border-b rounded-tl-lg text-center">
                    #
                  </th>
                  <th className="py-3 px-4 border-b text-center">Điểm</th>
                  <th className="py-3 px-4 border-b rounded-tr-lg text-center">
                    Thời gian (giây)
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
                      {s.score}
                    </td>
                    <td className="py-2 px-4 border-b text-center">{s.time}</td>
                  </tr>
                ))}
                {submissions.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-4 px-4 text-center text-gray-500"
                    >
                      Chưa có bài nộp nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
