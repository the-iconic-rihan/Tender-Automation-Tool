import React from "react";
import "../../../../assets/css/ProcessingTimeGraph.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";
import { useSelector } from "react-redux";
import { convertHoursToMins } from "../../../../utils/dateFormats";

const ProcessingTimeGraph = () => {
  const admin = useSelector((state) => state.admin);

  const data = admin.processingTimeData;

  return (
    <div className="processing-card">
      <p className="prc-card-header">Average Processing Time</p>
      <div className="prc-graph-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <defs>
              <linearGradient
                id="green-gradient"
                gradientTransform="rotate(90)"
              >
                <stop offset="0%" stopColor="#6DBF57"></stop>
                <stop offset="16.5%" stopColor="#62B95A"></stop>
                <stop offset="100%" stopColor="#0F8A73"></stop>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="0 -1" />
            <YAxis
              interval={0}
              tick={<CustomYTick x={0} y={0} />}
              id="test-id" domain={[0, 10]}>
              <Label
                content={<VerticalYAxisLabel axisLabel="Time in hours" />}
                position="insideLeft"
              />
            </YAxis>
            {data.length > 0 && <Tooltip content={<CustomTooltip />} />}
            <Bar
              dataKey="average_time"
              fill={`url(#green-gradient)`}
              minPointSize={5}
              maxBarSize={20}
            />
            <XAxis
              dataKey="group_name"
              interval={0}
              tick={<CustomXTick x={0} y={0} />}
            >
              <Label
                value="Number of Pages"
                fill="#186daa"
                fontSize={16}
                fontWeight={600}
                offset={-5}
                position="insideBottom"
              />
            </XAxis>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProcessingTimeGraph;

const VerticalYAxisLabel = ({ axisLabel }) => (
  <g>
    <text
      x={0}
      y={0}
      dy={16}
      dx={-60}
      textAnchor="end"
      fill="#186daa"
      transform="rotate(-90)"
      fontSize={16}
      height="100%"
      fontWeight={600}
    >
      {axisLabel}
    </text>
  </g>
);

const CustomTooltip = ({ active, payload }) => {
  if (active) {
    return (
      <div className="prcss-time-graph-custom-tooltip">
        <span className="label">
          {payload[0] ? convertHoursToMins(payload[0]?.value) : "-"}
        </span>
      </div>
    );
  }

  return null;
};

const CustomYTick = ({ x, y, payload }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        fill="#666"
        fontSize={12}
        fontWeight={600}
        transform="rotate(0)"
      >
        {payload.value}
      </text>
    </g>
  )
}

const CustomXTick = ({ x, y, payload }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="middle"
        fill="#666"
        fontSize={12}
        fontWeight={600}
        transform="rotate(0)"
      >
        {payload.value}
      </text>
    </g>
  );
};
