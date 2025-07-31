import type React from "react";
import { useScore } from "../useScore";

const ScoreDisplay: React.FC = () => {
  const { streak, correctScore, totalScore, accuracy } = useScore();

  let displayAccuracy = "-";
  if (accuracy !== null) {
    displayAccuracy = Math.round(accuracy) + "%";
  }

  const stats = [
    { title: "Total", value: totalScore },
    { title: "Correct", value: correctScore },
    { title: "Accuracy", value: displayAccuracy },
    { title: "Streak", value: streak },
  ];

  const widthPercentagePerStat = (1 / stats.length) * 100;
  const widthString = `${widthPercentagePerStat}%`;

  return (
    <div className="mx-auto flex w-2/3 max-w-[800px] justify-around">
      {stats.map((stat, index) => (
        <Stat
          key={index}
          title={stat.title}
          value={stat.value}
          width={widthString}
        />
      ))}
    </div>
  );
};

const Stat: React.FC<{
  title: string; // The title of the stat
  value: string | number; // The value of the stat, can be a string or number
  width: string; // The width of the stat container -- necessary to keep stats from moving when values change
}> = ({ title, value, width }) => {
  return (
    <div className={`stats w-[${width}]`}>
      <div className="stat flex flex-col items-center">
        <div className="stat-title text-lg">{title}</div>
        <div className="stat-value text-4xl">{value}</div>
      </div>
    </div>
  );
};

export default ScoreDisplay;
