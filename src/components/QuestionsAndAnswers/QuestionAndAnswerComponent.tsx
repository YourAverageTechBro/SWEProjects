import QuestionBox from "~/components/QuestionsAndAnswers/QuestionBox";

type Props = {
  instructionsId: string;
};
export default function QuestionAndAnswerComponent({ instructionsId }: Props) {
  return (
    <div>
      {" "}
      <QuestionBox instructionsId={instructionsId} />{" "}
    </div>
  );
}
