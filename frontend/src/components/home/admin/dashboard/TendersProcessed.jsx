import "../../../../assets/css/TendersProcessed.css";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useSelector } from "react-redux";

const TendersProcessed = () => {
  const adminData = useSelector((state) => state.admin);

  const data = [
    {
      name: "WWS_SPG",
      value: adminData.tenders["WWS_SPG"]["tenders"],
    },
    {
      name: "WWS_IPG",
      value: adminData.tenders["WWS_IPG"]["tenders"],
    },
    {
      name: "WWS_Services",
      value: adminData.tenders["WWS_Services"]["tenders"],
    },
  ];

  const COLORS = [
    { start: "#186DAA", end: "#4FAADD" },
    { start: "#FE5F2B", end: "#FDAF27" },
    { start: "#73C255", end: "#078575" },
  ];

  return (
    <div className="tenders-processed-container">
      <p className="tenders-processed-header">Tenders Processed</p>
      <div className="tnd-pr-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {data.map((_, index) => (
                <linearGradient key={index} id={`myGradient${index}`}>
                  <stop
                    offset="0%"
                    stopColor={COLORS[index % COLORS.length].start}
                  />
                  <stop
                    offset="100%"
                    stopColor={COLORS[index % COLORS.length].end}
                  />
                </linearGradient>
              ))}
            </defs>
            <Tooltip />

            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={0}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`url(#myGradient${index})`}
                  style={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <hr />
      <div className="tnd-pr-pc-legend-container">
        <LegendData
          fill="#186daa"
          label="WWS_SPG"
          data={adminData.tenders["WWS_SPG"]["tenders"]}
          gradient="linear-gradient(180deg, #186DAA 0%, #4FAADD 100%)"
        />

        <LegendData
          fill="#F66E42"
          label="WWS_IPG"
          data={adminData.tenders["WWS_IPG"]["tenders"]}
          gradient="linear-gradient(180deg, #FE5F2B 0%, #FDAF27 100%)"
        />

        <LegendData
          fill="#0E8974"
          label="WWS_Services"
          data={adminData.tenders["WWS_Services"]["tenders"]}
          gradient="linear-gradient(180deg, #73C255 0%, #078575 100%)"
        />
      </div>
    </div>
  );
};

export default TendersProcessed;

const LegendData = ({ fill, label, data, gradient }) => {
  return (
    <div className="tnd-pr-lg-data">
      <div className="tnd-lgd-label">
        <LegendIcon fill={fill} />
        <p>{label}</p>
      </div>
      <p
        className="fill-bg"
        style={{
          backgroundImage: `${gradient}`,
        }}
      >
        {data}
      </p>
    </div>
  );
};

const LegendIcon = ({ fill }) => (
  <svg
    width={24}
    height={25}
    viewBox="0 0 24 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10.578.935V4.45a8.147 8.147 0 0 0 1.164 16.209 8.11 8.11 0 0 0 4.878-1.622l2.487 2.486a11.589 11.589 0 0 1-7.365 2.627C5.315 24.15.105 18.94.105 12.514.105 6.48 4.698 1.518 10.578.934Zm12.743 12.743a11.584 11.584 0 0 1-2.568 6.2l-2.487-2.486a8.104 8.104 0 0 0 1.54-3.714h3.515ZM12.907.935A11.64 11.64 0 0 1 23.321 11.35h-3.516a8.151 8.151 0 0 0-6.898-6.9V.936Z"
      fill={fill}
    />
  </svg>
);
