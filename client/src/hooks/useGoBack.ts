/**
 * 안전한 뒤로가기 훅
 * - 브라우저 히스토리가 있으면 window.history.back() 호출
 * - 히스토리가 없거나 1 이하이면 fallback URL로 이동
 */
import { useCallback } from "react";
import { useLocation } from "wouter";

export function useGoBack(fallback: string = "/") {
  const [, navigate] = useLocation();

  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate(fallback);
    }
  }, [navigate, fallback]);

  return goBack;
}
