import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBrain,
  faChartLine,
  faClock,
  faFire,
  faTrophy,
  faLightbulb,
} from '@fortawesome/free-solid-svg-icons';
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import styles from './LearningHeader.module.css';

export default function LearningHeader({ studyHistory, masteryStats }) {
  const [streak, setStreak] = useState(0);
  const [todayStats, setTodayStats] = useState({
    cardsStudied: 0,
    studyTime: 0,
    averageRating: 0,
  });

  useEffect(() => {
    if (studyHistory) {
      // Calculate streak
      const today = new Date().toISOString().split('T')[0];
      let currentStreak = 0;
      let currentDate = new Date();

      for (let i = studyHistory.length - 1; i >= 0; i--) {
        const sessionDate = studyHistory[i].date.split('T')[0];
        if (sessionDate === currentDate.toISOString().split('T')[0]) {
          currentStreak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
      setStreak(currentStreak);

      // Calculate today's stats
      const todaySessions = studyHistory.filter(
        session => session.date.startsWith(today)
      );
      
      if (todaySessions.length > 0) {
        const totalCards = todaySessions.reduce((sum, session) => sum + session.cardsStudied, 0);
        const totalTime = todaySessions.reduce((sum, session) => sum + session.studyTimeSeconds, 0);
        const avgRating = todaySessions.reduce((sum, session) => sum + session.averageRating, 0) / todaySessions.length;

        setTodayStats({
          cardsStudied: totalCards,
          studyTime: Math.floor(totalTime / 60), // Convert to minutes
          averageRating: avgRating,
        });
      }
    }
  }, [studyHistory]);

  // Generate data for the learning curve
  const learningData = studyHistory?.slice(-7).map(session => ({
    date: new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    retention: session.averageRating * 20, // Convert 0-5 rating to 0-100%
    cards: session.cardsStudied,
  })) || [];

  return (
    <div className={styles.header}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <FontAwesomeIcon icon={faBrain} className={styles.statIcon} />
          <div className={styles.statContent}>
            <div className={styles.statValue}>{Math.round(masteryStats?.masteryPercentage || 0)}%</div>
            <div className={styles.statLabel}>Overall Mastery</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <FontAwesomeIcon icon={faFire} className={styles.statIcon} />
          <div className={styles.statContent}>
            <div className={styles.statValue}>{streak}</div>
            <div className={styles.statLabel}>Day Streak</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <FontAwesomeIcon icon={faClock} className={styles.statIcon} />
          <div className={styles.statContent}>
            <div className={styles.statValue}>{todayStats.studyTime}m</div>
            <div className={styles.statLabel}>Today's Study Time</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <FontAwesomeIcon icon={faTrophy} className={styles.statIcon} />
          <div className={styles.statContent}>
            <div className={styles.statValue}>{todayStats.cardsStudied}</div>
            <div className={styles.statLabel}>Cards Studied Today</div>
          </div>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>
            <FontAwesomeIcon icon={faChartLine} className={styles.chartIcon} />
            Learning Progress
          </h3>
          <div className={styles.chartLegend}>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#4285F4' }} />
              <span>Retention Rate</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#34A853' }} />
              <span>Cards Studied</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={learningData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4285F4" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4285F4" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorCards" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34A853" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#34A853" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" orientation="left" stroke="#4285F4" />
            <YAxis yAxisId="right" orientation="right" stroke="#34A853" />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(24, 27, 44, 0.8)', borderRadius: '8px', border: 'none' }}
              formatter={(value, name) => [
                name === 'retention' ? `${Math.round(value)}%` : value,
                name === 'retention' ? 'Retention Rate' : 'Cards Studied'
              ]}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="retention"
              stroke="#4285F4"
              fillOpacity={1}
              fill="url(#colorRetention)"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="cards"
              stroke="#34A853"
              fillOpacity={1}
              fill="url(#colorCards)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.insightsContainer}>
        <h3 className={styles.insightsTitle}>
          <FontAwesomeIcon icon={faLightbulb} className={styles.insightsIcon} />
          Learning Insights
        </h3>
        <div className={styles.insightsGrid}>
          <div className={styles.insightCard}>
            <div className={styles.insightValue}>
              {Math.round(masteryStats?.averageRetention || 0)}%
            </div>
            <div className={styles.insightLabel}>Current Retention Rate</div>
          </div>
          <div className={styles.insightCard}>
            <div className={styles.insightValue}>
              {masteryStats?.masteredCards || 0}
            </div>
            <div className={styles.insightLabel}>Mastered Cards</div>
          </div>
          <div className={styles.insightCard}>
            <div className={styles.insightValue}>
              {masteryStats?.learningCards || 0}
            </div>
            <div className={styles.insightLabel}>Cards in Progress</div>
          </div>
        </div>
      </div>
    </div>
  );
} 