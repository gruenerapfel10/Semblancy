import React from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import styles from './Analytics.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBrain,
  faChartLine,
  faClock,
  faCalendarAlt,
  faTachometerAlt,
  faMedal
} from '@fortawesome/free-solid-svg-icons';

const COLORS = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#8E44AD', '#E67E22'];

export const ForgettingCurveChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className={styles.emptyChart}>No data available</div>;
  }

  // Format data for better visualization
  const formattedData = data.filter((item, index) => index % 3 === 0 || index === data.length - 1);

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>
        <FontAwesomeIcon icon={faBrain} className={styles.chartIcon} />
        Forgetting Curve Projection
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={formattedData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4285F4" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#4285F4" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="day" 
            label={{ value: 'Days', position: 'insideBottomRight', offset: -10 }}
            tickFormatter={(day) => day === 0 ? 'Today' : `Day ${day}`}
          />
          <YAxis 
            domain={[0, 100]} 
            tickFormatter={(value) => `${value}%`}
            label={{ value: 'Retention', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value) => [`${Math.round(value)}%`, 'Memory Retention']}
            labelFormatter={(day) => day === 0 ? 'Today' : `Day ${day}`}
            contentStyle={{ backgroundColor: 'rgba(24, 27, 44, 0.8)', borderRadius: '8px', border: 'none' }}
          />
          <Area 
            type="monotone" 
            dataKey="retention" 
            stroke="#4285F4" 
            fillOpacity={1} 
            fill="url(#colorRetention)" 
            strokeWidth={2}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className={styles.chartDescription}>
        This shows your projected memory retention over time based on the Ebbinghaus forgetting curve.
      </p>
    </div>
  );
};

export const LearningProgressChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className={styles.emptyChart}>No progress data available</div>;
  }

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>
        <FontAwesomeIcon icon={faChartLine} className={styles.chartIcon} />
        Retention Progress
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          />
          <YAxis 
            domain={[0, 100]} 
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            formatter={(value) => [`${Math.round(value)}%`, 'Average Retention']}
            labelFormatter={(date) => new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            contentStyle={{ backgroundColor: 'rgba(24, 27, 44, 0.8)', borderRadius: '8px', border: 'none' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="retention" 
            stroke="#34A853" 
            strokeWidth={2}
            dot={{ stroke: '#34A853', strokeWidth: 2, r: 4, fill: '#34A853' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className={styles.chartDescription}>
        Shows your average retention rate over time, tracking your learning progress.
      </p>
    </div>
  );
};

export const MasteryDistributionChart = ({ masteredCards, learningCards, newCards }) => {
  const data = [
    { name: 'Mastered', value: masteredCards, color: '#34A853' },
    { name: 'Learning', value: learningCards, color: '#FBBC05' },
    { name: 'New', value: newCards, color: '#4285F4' }
  ].filter(item => item.value > 0);

  if (data.length === 0) {
    return <div className={styles.emptyChart}>No cards in this deck</div>;
  }

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>
        <FontAwesomeIcon icon={faMedal} className={styles.chartIcon} />
        Mastery Distribution
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.1)" strokeWidth={1} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [value, 'Cards']}
            contentStyle={{ backgroundColor: 'rgba(24, 27, 44, 0.8)', borderRadius: '8px', border: 'none' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <div className={styles.statValue} style={{ color: '#34A853' }}>{masteredCards}</div>
          <div className={styles.statLabel}>Mastered</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue} style={{ color: '#FBBC05' }}>{learningCards}</div>
          <div className={styles.statLabel}>Learning</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue} style={{ color: '#4285F4' }}>{newCards}</div>
          <div className={styles.statLabel}>New</div>
        </div>
      </div>
    </div>
  );
};

export const StudyScheduleChart = ({ schedule }) => {
  if (!schedule || schedule.length === 0) {
    return <div className={styles.emptyChart}>No scheduled reviews</div>;
  }

  // Format data for better display
  const data = schedule.map(item => ({
    date: new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
    cards: item.dueCards,
    dateObj: new Date(item.date)
  }));

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>
        <FontAwesomeIcon icon={faCalendarAlt} className={styles.chartIcon} />
        Upcoming Review Schedule
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="date"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            allowDecimals={false}
            label={{ value: 'Cards Due', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value) => [value, 'Cards Due']}
            contentStyle={{ backgroundColor: 'rgba(24, 27, 44, 0.8)', borderRadius: '8px', border: 'none' }}
          />
          <Bar 
            dataKey="cards" 
            fill={(data) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isToday = data.dateObj.setHours(0, 0, 0, 0) === today.getTime();
              return isToday ? '#4285F4' : '#8E44AD';
            }}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <p className={styles.chartDescription}>
        Your optimized study schedule for the upcoming week based on the forgetting curve.
      </p>
    </div>
  );
};

export const StudyStatsPanel = ({ stats }) => {
  return (
    <div className={styles.statsPanel}>
      <div className={styles.statCard}>
        <FontAwesomeIcon icon={faTachometerAlt} className={styles.statIcon} />
        <div className={styles.statContent}>
          <div className={styles.statValue}>{Math.round(stats.masteryPercentage)}%</div>
          <div className={styles.statLabel}>Overall Mastery</div>
        </div>
      </div>
      
      <div className={styles.statCard}>
        <FontAwesomeIcon icon={faBrain} className={styles.statIcon} />
        <div className={styles.statContent}>
          <div className={styles.statValue}>{Math.round(stats.averageRetention)}%</div>
          <div className={styles.statLabel}>Current Retention</div>
        </div>
      </div>
      
      <div className={styles.statCard}>
        <FontAwesomeIcon icon={faClock} className={styles.statIcon} />
        <div className={styles.statContent}>
          <div className={styles.statValue}>{stats.totalStudyTime} min</div>
          <div className={styles.statLabel}>Total Study Time</div>
        </div>
      </div>
    </div>
  );
};

export default function FlashcardAnalytics({ deckData, studyHistory }) {
  const { mastery, progress, schedule } = deckData;
  
  return (
    <div className={styles.analyticsContainer}>
      <StudyStatsPanel stats={{
        masteryPercentage: mastery.masteryPercentage,
        averageRetention: mastery.averageRetention,
        totalStudyTime: progress.totalStudyTime
      }} />
      
      <div className={styles.chartsGrid}>
        <ForgettingCurveChart data={mastery.retentionByDay} />
        <MasteryDistributionChart 
          masteredCards={mastery.masteredCards}
          learningCards={mastery.learningCards}
          newCards={mastery.newCards}
        />
        <LearningProgressChart data={progress.averageRetentionTrend} />
        <StudyScheduleChart schedule={schedule} />
      </div>
    </div>
  );
} 