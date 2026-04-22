import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  getHourlyDistribution,
  getDayOfWeekDistribution,
  getMonthlyDistribution,
} from '../utils/dataProcessing';

const P1_COLOR = '#1DB954';
const P2_COLOR = '#E91E63';

export default function PatternCharts({ data1, data2, label1, label2 }) {
  const hourly1 = data1 ? getHourlyDistribution(data1) : null;
  const hourly2 = data2 ? getHourlyDistribution(data2) : null;

  const daily1 = data1 ? getDayOfWeekDistribution(data1) : null;
  const daily2 = data2 ? getDayOfWeekDistribution(data2) : null;

  const monthly1 = data1 ? getMonthlyDistribution(data1) : null;
  const monthly2 = data2 ? getMonthlyDistribution(data2) : null;

  // Merge data for comparison charts
  const mergeData = (arr1, arr2, key) => {
    if (!arr1) return arr2?.map((d) => ({ ...d, p2: d.proportion })) || [];
    if (!arr2) return arr1.map((d) => ({ ...d, p1: d.proportion }));
    return arr1.map((d, i) => ({
      ...d,
      p1: d.proportion,
      p2: arr2[i]?.proportion || 0,
    }));
  };

  const hourlyMerged = mergeData(hourly1, hourly2, 'hour');
  const dailyMerged = mergeData(daily1, daily2, 'day');
  const monthlyMerged = mergeData(monthly1, monthly2, 'month');

  const showComparison = data1 && data2;

  return (
    <div className="pattern-charts">
      <div className="chart-container">
        <h3>Hourly Listening Pattern</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hourlyMerged} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="hour"
              tick={{ fill: '#999' }}
              tickFormatter={(h) => `${h}:00`}
            />
            <YAxis tick={{ fill: '#999' }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
              formatter={(value) => `${(value * 100).toFixed(1)}%`}
            />
            {showComparison && <Legend />}
            {(data1 || !data2) && (
              <Bar
                dataKey="p1"
                name={label1 || 'Person 1'}
                fill={P1_COLOR}
                opacity={0.85}
              />
            )}
            {data2 && (
              <Bar
                dataKey="p2"
                name={label2 || 'Person 2'}
                fill={P2_COLOR}
                opacity={0.85}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>Day of Week Pattern</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyMerged} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="day" tick={{ fill: '#999' }} />
            <YAxis tick={{ fill: '#999' }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
              formatter={(value) => `${(value * 100).toFixed(1)}%`}
            />
            {showComparison && <Legend />}
            {(data1 || !data2) && (
              <Bar dataKey="p1" name={label1 || 'Person 1'} fill={P1_COLOR} opacity={0.85} />
            )}
            {data2 && (
              <Bar dataKey="p2" name={label2 || 'Person 2'} fill={P2_COLOR} opacity={0.85} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>Monthly Pattern</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyMerged} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="month" tick={{ fill: '#999' }} />
            <YAxis tick={{ fill: '#999' }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
              formatter={(value) => `${(value * 100).toFixed(1)}%`}
            />
            {showComparison && <Legend />}
            {(data1 || !data2) && (
              <Bar dataKey="p1" name={label1 || 'Person 1'} fill={P1_COLOR} opacity={0.85} />
            )}
            {data2 && (
              <Bar dataKey="p2" name={label2 || 'Person 2'} fill={P2_COLOR} opacity={0.85} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
