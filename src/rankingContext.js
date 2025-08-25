import { createContext } from "react";
const RankingContext = createContext();
export default RankingContext;
export const initialState = {
  submissions: [],
  loading: true,
  error: null,
};

export function rankingReducer(state, action) {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true, error: null };
    case "LOAD_SUCCESS":
      return { ...state, submissions: action.payload, loading: false };
    case "LOAD_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "ADD_SUBMISSION": {
      const updated = [...state.submissions, action.payload].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.time - b.time;
      });
      localStorage.setItem("submissions", JSON.stringify(updated));
      return { ...state, submissions: updated };
    }
    default:
      return state;
  }
}
