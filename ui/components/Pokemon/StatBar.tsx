interface IProps {
  label: string;
  value: number | null;
}

const MAX_STAT_VALUE = 255;

const StatBar = ({ label, value }: IProps) => {
  const barWidth = value === null ? 0 : Math.min((value / MAX_STAT_VALUE) * 100, 100);

  return (
    <div>
      <div className="card-stat flex items-center gap-2 text-xs font-bold">
        <span className="w-20 shrink-0 whitespace-nowrap text-left">{label}</span>
        <div className="flex-1 bg-yellow-200/50 rounded-full h-1.5 shadow-inner">
          <div
            className="bg-gradient-to-r from-blue-300 to-blue-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${barWidth}%` }}
          />
        </div>
        <span className="w-9 shrink-0 text-right">{value === null ? "—" : value}</span>
      </div>
    </div>
  );
};

export default StatBar;
