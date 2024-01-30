import { XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart, Bar } from 'recharts';
import { LineChart, Legend, Line } from 'recharts';

export const BPlot = (props: any) => {
    const { title, plotdata, color, xTickFormatter } = props;
    return (
      <>
        <h3 className="text-white text-center">{title}</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart width={730} height={250} data={plotdata} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey="timestamp" tick={xTickFormatter} interval={0} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="q1" stackId="a" fill={color[0]} />
            <Bar dataKey="q2" stackId="a" fill={color[1]} />
            <Bar dataKey="q3" stackId="a" fill={color[2]} />
            <Bar dataKey="q4" stackId="a" fill={color[3]} />
            <Bar dataKey="q5" stackId="a" fill={color[4]} />
            <Bar dataKey="q6" stackId="a" fill={color[5]} />
          </BarChart>
        </ResponsiveContainer>
      </>
    );
  };

export const LPlot = (props: any) => {
    const { title, plotdata, color, xTickFormatter } = props;
  
    return (
      <>
        <h3 className="text-white text-center">{title}</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart width={730} height={250} data={plotdata} margin={{ top: 10, right: 30, left: 0, bottom: 0}}>
            <XAxis dataKey="timestamp" tick={xTickFormatter} interval={0} />
            <YAxis tickCount={7} domain={[0, 6]} />
            <Tooltip />
            <Legend verticalAlign='bottom' />
            <Line type="monotone" dataKey="total" stroke={color[1]} dot={true} /> 
          </LineChart>
        </ResponsiveContainer>
      </>
    );
  };