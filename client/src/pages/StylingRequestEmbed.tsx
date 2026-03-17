/**
 * StylingRequestEmbed - 이전에는 soozipland iframe을 임베드했으나,
 * 이제는 내부 신청서 페이지(/styling/request)로 리다이렉트합니다.
 */
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function StylingRequestEmbed() {
  const [, navigate] = useLocation();

  useEffect(() => {
    navigate("/styling/request", { replace: true });
  }, [navigate]);

  return null;
}
