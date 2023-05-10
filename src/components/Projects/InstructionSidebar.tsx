type Props = {
  projectInstructionTitles: { id: string; title: string }[];
};
export default function InstructionSidebar({
  projectInstructionTitles,
}: Props) {
  return (
    <div>
      {" "}
      {projectInstructionTitles.map((entry, index) => {
        return (
          <div key={entry.id} className={"border p-4 text-lg font-bold"}>
            {index + 1}. {entry.title}
          </div>
        );
      })}
    </div>
  );
}
