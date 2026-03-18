import { useLocation } from "wouter";
import SurveyOverlay from "@/components/SurveyOverlay";

const EMBED_URL = "https://soozipland-j3tut3mq.manus.space/";

export default function StylingRequestEmbed() {
  const [, navigate] = useLocation();

  return (
    <SurveyOverlay
      url={EMBED_URL}
      title="스타일링 신청서 작성"
      onClose={() => navigate("/styling")}
    />
  );
}
