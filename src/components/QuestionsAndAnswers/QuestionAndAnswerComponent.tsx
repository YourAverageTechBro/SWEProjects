import QuestionBox from "~/components/QuestionsAndAnswers/QuestionBox";
import QuestionsList from "~/components/QuestionsAndAnswers/QuestionsList";

type Props = {
  instructionsId: string;
};
export default function QuestionAndAnswerComponent({ instructionsId }: Props) {
  return (
    <div>
      {" "}
      <QuestionBox instructionsId={instructionsId} />{" "}
      <div className="mt-4 border-t border-gray-400"></div>
      <QuestionsList instructionsId={instructionsId} />
    </div>
  );
}
