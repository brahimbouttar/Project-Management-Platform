interface TaskLabelsProps {
  labels: string[];
}

const TaskLabels = ({ labels }: TaskLabelsProps) => {
  if (!labels || labels.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {labels.map((label) => (
        <span
          key={label}
          className="rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700"
        >
          {label}
        </span>
      ))}
    </div>
  );
};

export default TaskLabels;
