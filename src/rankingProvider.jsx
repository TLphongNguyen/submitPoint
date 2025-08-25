import { useEffect, useReducer } from "react";
import RankingContext from "./rankingContext";
import { rankingReducer, initialState } from "./rankingContext";

function RankingProvider({ children }) {
  const [state, dispatch] = useReducer(rankingReducer, initialState);

  useEffect(() => {
    dispatch({ type: "LOAD_START" });
    setTimeout(() => {
      try {
        const data = JSON.parse(localStorage.getItem("submissions")) || [];
        dispatch({ type: "LOAD_SUCCESS", payload: data });
      } catch (error) {
        dispatch({
          type: "LOAD_ERROR",
          payload: "Lỗi tải dữ liệu!, " + error.message,
        });
      }
    }, 1000);
  }, []);

  return (
    <RankingContext.Provider value={{ state, dispatch }}>
      {children}
    </RankingContext.Provider>
  );
}
export default RankingProvider;
