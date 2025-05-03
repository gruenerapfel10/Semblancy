"use client";
import React, { useState, useEffect, useRef } from "react";
import styles from "./Forums.module.css";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useTopics } from "@/hooks/useForums";
import { useAmplify } from "@/app/context/Providers";
import NewTopicModal from "./NewTopicModal";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// Icons
import {
  Search,
  MessageSquare,
  Eye,
  ThumbsUp,
  Clock,
  Plus,
  Lock,
  Pin,
  Filter,
  Bell,
  BellOff,
  Sparkles,
  TrendingUp,
  Users,
  Calendar,
  BarChart2,
  Hash,
  ChevronDown,
  ChevronRight,
  Star,
  Bookmark,
  RefreshCw,
  ArrowUp,
  User,
  Zap,
  Award,
  Flame as Fire,
  Activity,
  Smile,
  Heart,
  Lightbulb,
  Feather,
  Menu,
  X,
  BookOpen,
  BarChart,
  Send,
  CheckCircle,
  AlarmClock,
  Coffee,
  Trophy,
  LifeBuoy,
  UserPlus,
  RadioTower,
  LucideGift as Gift,
  Timer,
  Video,
  Vote,
  PieChart as PieChartIcon,
  Radio
} from "lucide-react";

// Background Shapes Component
const BackgroundShapes = () => {
  return (
    <div className={styles.backgroundShapes}>
      <div className={styles.shapesContainer}>
        <motion.div
          className={`${styles.shape} ${styles.circle}`}
          animate={{
            y: [0, -20, 0],
            opacity: [0.7, 1, 0.7],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className={`${styles.shape} ${styles.square}`}
          animate={{
            rotate: [0, 45, 0],
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className={`${styles.shape} ${styles.triangle}`}
          animate={{
            y: [0, 15, 0],
            opacity: [0.6, 0.9, 0.6],
            rotate: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className={`${styles.shape} ${styles.blob1}`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.8, 0.6],
            x: [0, -10, 0],
            y: [0, 10, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className={`${styles.shape} ${styles.blob2}`}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.7, 0.5],
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
};

// Reputation Badge Component
const ReputationBadge = ({ points, level }) => {
  const getLevelColor = () => {
    switch (level) {
      case "Beginner":
        return "#6c757d";
      case "Intermediate":
        return "#17a2b8";
      case "Advanced":
        return "#28a745";
      case "Expert":
        return "#ffc107";
      case "Master":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  return (
    <div
      className={styles.reputationBadge}
      style={{ backgroundColor: getLevelColor() }}
    >
      <Star size={12} />
      <span>{points}</span>
    </div>
  );
};

// Achievement Badge Component
const AchievementBadge = ({ type, count }) => {
  const getBadgeInfo = () => {
    switch (type) {
      case "helpful":
        return {
          icon: <ThumbsUp size={12} />,
          color: "#4CAF50",
          tooltip: "Helpful Responses",
        };
      case "fast":
        return {
          icon: <Zap size={12} />,
          color: "#FF9800",
          tooltip: "Fast Responder",
        };
      case "accurate":
        return {
          icon: <CheckCircle size={12} />,
          color: "#2196F3",
          tooltip: "Accurate Answers",
        };
      case "dedicated":
        return {
          icon: <Calendar size={12} />,
          color: "#9C27B0",
          tooltip: "Dedicated Contributor",
        };
      default:
        return {
          icon: <Award size={12} />,
          color: "#757575",
          tooltip: "Achievement",
        };
    }
  };

  const badge = getBadgeInfo();

  return (
    <div
      className={styles.achievementBadge}
      style={{ backgroundColor: badge.color }}
      title={`${badge.tooltip}: ${count}`}
    >
      {badge.icon}
      {count > 0 && <span>{count}</span>}
    </div>
  );
};

// User avatar component with gradient background and initials
const UserAvatar = ({ name, online, size = 34, image = null }) => {
  const initial = name ? name.charAt(0).toUpperCase() : "A";
  const colors = [
    "linear-gradient(135deg, #FF9966, #FF5E62)",
    "linear-gradient(135deg, #43CBFF, #9708CC)",
    "linear-gradient(135deg, #FFC371, #FF5F6D)",
    "linear-gradient(135deg, #4E65FF, #92EFFD)",
    "linear-gradient(135deg, #A9F1DF, #FFBBBB)",
    "linear-gradient(135deg, #7F7FD5, #86A8E7)",
  ];

  // Use user name to pick a consistent color
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;

  if (image) {
    return (
      <div
        className={`${styles.userAvatar} ${online ? styles.online : ""}`}
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          width: `${size}px`,
          height: `${size}px`,
        }}
      />
    );
  }

  return (
    <div
      className={`${styles.userAvatar} ${online ? styles.online : ""}`}
      style={{
        background: colors[colorIndex],
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${size / 2}px`,
      }}
    >
      {initial}
    </div>
  );
};

// Badge component
const Badge = ({ text, variant = "default", icon }) => {
  return (
    <div className={`${styles.badge} ${styles[variant]}`}>
      {icon}
      <span>{text}</span>
    </div>
  );
};

// Engagement Indicator component
const EngagementIndicator = ({ count, type }) => {
  const getColor = () => {
    if (count > 25) return styles.hot;
    if (count > 10) return styles.warm;
    return styles.normal;
  };

  return (
    <div className={`${styles.engagementIndicator} ${getColor()}`}>
      {type === "views" && <Eye size={14} />}
      {type === "likes" && <ThumbsUp size={14} />}
      {type === "replies" && <MessageSquare size={14} />}
      <span>{count}</span>
    </div>
  );
};

// Category Pill
const CategoryPill = ({ category, icon, active, onClick }) => (
  <button
    className={`${styles.categoryPill} ${active ? styles.active : ""}`}
    onClick={onClick}
  >
    {icon}
    <span>{category}</span>
  </button>
);

// News Carousel Component
const NewsCarousel = () => {
  const newsItems = [
    {
      title: "Final Exams Schedule Released",
      subtitle: "Check the updated schedule for next month's exams",
      image: "/api/placeholder/120/80",
      color: "linear-gradient(135deg, #FF6B6B, #FFE66D)",
    },
    {
      title: "New Study Groups Forming",
      subtitle: "Join a study group for exam preparation",
      image: "/api/placeholder/120/80",
      color: "linear-gradient(135deg, #4E65FF, #92EFFD)",
    },
    {
      title: "Campus Library Extended Hours",
      subtitle: "Library will remain open until midnight during exam week",
      image: "/api/placeholder/120/80",
      color: "linear-gradient(135deg, #A9F1DF, #FFBBBB)",
    },
    {
      title: "Student Achievement Awards",
      subtitle: "Nominations now open for annual awards ceremony",
      image: "/api/placeholder/120/80",
      color: "linear-gradient(135deg, #7F7FD5, #86A8E7)",
    },
  ];

  return (
    <div className={styles.newsCarouselContainer}>
      <div className={styles.newsCarousel}>
        {newsItems.map((item, index) => (
          <motion.div
            key={index}
            className={styles.newsCard}
            style={{
              background: item.color,
              animationDelay: `${index * 0.2}s`,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className={styles.newsCardContent}>
              <h3>{item.title}</h3>
              <p>{item.subtitle}</p>
              <div className={styles.newsCardIcon}>
                {index % 4 === 0 && <Calendar size={24} />}
                {index % 4 === 1 && <Users size={24} />}
                {index % 4 === 2 && <BookOpen size={24} />}
                {index % 4 === 3 && <Award size={24} />}
              </div>
            </div>
            <div
              className={styles.newsCardImage}
              style={{ backgroundImage: `url(${item.image})` }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Featured Topic Card Component
const FeaturedTopicCard = ({ topic, onClick }) => {
  const formattedDate = formatRelativeTime(topic.updatedAt);

  return (
    <motion.div
      className={styles.featuredTopicCard}
      onClick={onClick}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <div className={styles.featuredTopicHeader}>
        <UserAvatar
          name={topic.author}
          online={Math.random() > 0.5}
          size={40}
          image={topic.authorAvatar}
        />
        <div className={styles.featuredTopicMeta}>
          <h3>{topic.title}</h3>
          <div className={styles.featuredTopicDetails}>
            <span className={styles.author}>{topic.author}</span>
            <span className={styles.separator}>•</span>
            <span className={styles.category}>{topic.category}</span>
          </div>
        </div>
      </div>

      <p className={styles.featuredTopicPreview}>
        {topic.content
          ? topic.content.substring(0, 120) + "..."
          : "Join the discussion..."}
      </p>

      <div className={styles.featuredTopicFooter}>
        <div className={styles.featuredTopicStats}>
          <div className={styles.viewersNow}>
            <Eye size={14} />
            <span>{Math.floor(Math.random() * 10) + 2} viewing</span>
          </div>
          <EngagementIndicator count={topic.views} type="views" />
          <EngagementIndicator count={topic.likes} type="likes" />
          <EngagementIndicator count={topic.replyCount || 0} type="replies" />
        </div>
        <span className={styles.featuredTopicTime}>
          <Clock size={14} />
          {formattedDate}
        </span>
      </div>
    </motion.div>
  );
};

// Topic Card Component
const TopicCard = ({ topic, handleViewTopic, currentUser }) => {
  const isNew = new Date(topic.createdAt) > new Date(Date.now() - 86400000);
  const isHot = topic.views > 50 || topic.replyCount > 10;
  const isUserTopic = currentUser && topic.authorId === currentUser.userId;
  const viewersNow = Math.floor(Math.random() * 5);

  return (
    <motion.div
      className={`${styles.topicCard} ${
        topic.isSticky ? styles.stickyTopic : ""
      } ${topic.isLocked ? styles.lockedTopic : ""} ${
        isUserTopic ? styles.userTopic : ""
      }`}
      onClick={() => handleViewTopic(topic.id)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <div className={styles.topicCardLeft}>
        <UserAvatar
          name={topic.author}
          online={Math.random() > 0.7}
          image={topic.authorAvatar}
        />

        <div className={styles.topicCardContent}>
          <div className={styles.topicCardHeader}>
            <div className={styles.topicCardFlags}>
              {isNew && (
                <span className={styles.newFlag}>
                  <Zap size={12} />
                  NEW
                </span>
              )}
              {isHot && (
                <span className={styles.hotFlag}>
                  <Fire size={12} />
                  HOT
                </span>
              )}
              {topic.isSticky && (
                <span className={styles.pinnedFlag}>
                  <Pin size={12} />
                  PINNED
                </span>
              )}
              {topic.isLocked && (
                <span className={styles.lockedFlag}>
                  <Lock size={12} />
                  LOCKED
                </span>
              )}
              {viewersNow > 0 && (
                <span className={styles.liveFlag}>
                  <Radio size={12} />
                  {viewersNow} LIVE
                </span>
              )}
            </div>

            <h3 className={styles.topicCardTitle}>{topic.title}</h3>
          </div>

          <div className={styles.topicCardMeta}>
            <div className={styles.authorMeta}>
              <span className={styles.topicCardAuthor}>{topic.author}</span>
              <div className={styles.userBadges}>
                <ReputationBadge
                  points={Math.floor(Math.random() * 1000) + 100}
                  level="Intermediate"
                />
                <AchievementBadge
                  type="helpful"
                  count={Math.floor(Math.random() * 10) + 1}
                />
                <AchievementBadge
                  type="fast"
                  count={Math.floor(Math.random() * 5) + 1}
                />
              </div>
            </div>
            <span className={styles.separator}>•</span>
            <span className={styles.topicCardCategory}>
              <Hash size={12} />
              {topic.category.charAt(0).toUpperCase() + topic.category.slice(1)}
            </span>
            <span className={styles.separator}>•</span>
            <span className={styles.topicCardDate}>
              <Clock size={12} />
              {formatRelativeTime(topic.updatedAt)}
            </span>
          </div>

          {topic.content && (
            <p className={styles.topicCardPreview}>
              {topic.content.substring(0, 90)}
              {topic.content.length > 90 ? "..." : ""}
            </p>
          )}

          {topic.solved && (
            <div className={styles.solvedBadge}>
              <CheckCircle size={12} />
              <span>Solved</span>
              <div className={styles.responseTime}>
                <AlarmClock size={10} />
                <span>{Math.floor(Math.random() * 24) + 1}h</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.topicCardStats}>
        <div className={styles.statItem} title="Replies">
          <MessageSquare size={16} />
          <EngagementIndicator count={topic.replyCount || 0} type="replies" />
        </div>
        <div className={styles.statItem} title="Views">
          <Eye size={16} />
          <EngagementIndicator count={topic.views} type="views" />
        </div>
        <div className={styles.statItem} title="Likes">
          <ThumbsUp size={16} />
          <EngagementIndicator count={topic.likes} type="likes" />
        </div>
      </div>
    </motion.div>
  );
};

// Current Poll Component
const CurrentPoll = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [voted, setVoted] = useState(false);
  const [results, setResults] = useState([
    { option: "Every day", votes: 42 },
    { option: "2-3 times per week", votes: 78 },
    { option: "Once a week", votes: 23 },
    { option: "Rarely", votes: 14 },
  ]);

  const handleVote = () => {
    if (selectedOption !== null && !voted) {
      const updatedResults = [...results];
      updatedResults[selectedOption].votes += 1;
      setResults(updatedResults);
      setVoted(true);
    }
  };

  const totalVotes = results.reduce((sum, item) => sum + item.votes, 0);

  return (
    <div className={styles.pollCard}>
      <div className={styles.pollHeader}>
        <Vote size={18} />
        <h3>Community Poll</h3>
      </div>

      <h4>How often do you study with other students?</h4>

      {!voted ? (
        <>
          <div className={styles.pollOptions}>
            {results.map((item, index) => (
              <div
                key={index}
                className={`${styles.pollOption} ${
                  selectedOption === index ? styles.selected : ""
                }`}
                onClick={() => setSelectedOption(index)}
              >
                <div className={styles.pollRadio}>
                  {selectedOption === index && (
                    <div className={styles.pollRadioSelected} />
                  )}
                </div>
                <span>{item.option}</span>
              </div>
            ))}
          </div>

          <button
            className={styles.voteButton}
            onClick={handleVote}
            disabled={selectedOption === null}
          >
            Submit Vote
          </button>
        </>
      ) : (
        <div className={styles.pollResults}>
          {results.map((item, index) => (
            <div key={index} className={styles.pollResult}>
              <div className={styles.pollResultLabel}>
                <span>{item.option}</span>
                <span>{Math.round((item.votes / totalVotes) * 100)}%</span>
              </div>
              <div className={styles.pollResultBar}>
                <div
                  className={styles.pollResultFill}
                  style={{ width: `${(item.votes / totalVotes) * 100}%` }}
                />
              </div>
            </div>
          ))}
          <div className={styles.totalVotes}>
            {totalVotes} votes • Poll ends in 2 days
          </div>
        </div>
      )}
    </div>
  );
};

// Daily Challenge Component
const DailyChallenge = () => {
  return (
    <div className={styles.challengeCard}>
      <div className={styles.challengeHeader}>
        <Sparkles size={18} />
        <h3>Daily Challenge</h3>
      </div>

      <div className={styles.challengeContent}>
        <h4>Physics: Projectile Motion</h4>
        <p>
          A ball is thrown from a height of 20m with an initial velocity of 15
          m/s at an angle of 30° above the horizontal. Calculate its maximum
          height.
        </p>
        <div className={styles.challengeMeta}>
          <div className={styles.challengeParticipants}>
            <div className={styles.participantAvatars}>
              <UserAvatar name="John" size={24} />
              <UserAvatar name="Sarah" size={24} />
              <UserAvatar name="Mike" size={24} />
              <div className={styles.moreParticipants}>+8</div>
            </div>
            <span>11 people solved this</span>
          </div>
          <button className={styles.solveButton}>Solve Challenge</button>
        </div>
      </div>
    </div>
  );
};

// Help Needed Component
const HelpNeeded = ({ onViewTopic }) => {
  const urgentTopics = [
    {
      id: "urgent1",
      title: "Struggling with integration by parts",
      category: "mathematics",
      timeLeft: "2h",
      bounty: 50,
    },
    {
      id: "urgent2",
      title: "Help with my chemistry lab analysis",
      category: "chemistry",
      timeLeft: "4h",
      bounty: 30,
    },
  ];

  return (
    <div className={styles.helpNeededCard}>
      <div className={styles.helpNeededHeader}>
        <LifeBuoy size={18} />
        <h3>Urgent Help Needed</h3>
      </div>

      <div className={styles.urgentTopics}>
        {urgentTopics.map((topic) => (
          <div
            key={topic.id}
            className={styles.urgentTopic}
            onClick={() => onViewTopic(topic.id)}
          >
            <div className={styles.urgentTopicContent}>
              <h4>{topic.title}</h4>
              <div className={styles.urgentTopicMeta}>
                <span className={styles.urgentCategory}>{topic.category}</span>
                <div className={styles.urgentTimeLeft}>
                  <Timer size={14} />
                  <span>{topic.timeLeft} left</span>
                </div>
              </div>
            </div>
            <div className={styles.urgentBounty}>
              <Trophy size={16} />
              <span>{topic.bounty}</span>
            </div>
          </div>
        ))}
      </div>

      <button className={styles.viewAllButton}>View All Requests</button>
    </div>
  );
};

// Study Room Component
const StudyRooms = () => {
  const studyRooms = [
    {
      id: "room1",
      name: "Physics Study Group",
      participants: 4,
      maxParticipants: 6,
      topic: "Thermodynamics",
    },
    {
      id: "room2",
      name: "Math Problem Solving",
      participants: 3,
      maxParticipants: 5,
      topic: "Calculus",
    },
  ];

  return (
    <div className={styles.studyRoomsCard}>
      <div className={styles.studyRoomsHeader}>
        <Video size={18} />
        <h3>Active Study Rooms</h3>
      </div>

      <div className={styles.studyRoomsList}>
        {studyRooms.map((room) => (
          <div key={room.id} className={styles.studyRoom}>
            <div className={styles.studyRoomContent}>
              <h4>{room.name}</h4>
              <span className={styles.studyRoomTopic}>{room.topic}</span>
            </div>
            <div className={styles.studyRoomParticipants}>
              <div className={styles.participantDots}>
                {Array(room.maxParticipants)
                  .fill()
                  .map((_, i) => (
                    <div
                      key={i}
                      className={`${styles.participantDot} ${
                        i < room.participants ? styles.active : ""
                      }`}
                    />
                  ))}
              </div>
              <span>
                {room.participants}/{room.maxParticipants}
              </span>
              <button className={styles.joinRoomButton}>Join</button>
            </div>
          </div>
        ))}
      </div>

      <button className={styles.createRoomButton}>
        <Plus size={14} />
        Create Study Room
      </button>
    </div>
  );
};

// Activity Feed Item Component
const ActivityFeedItem = ({ type, user, topic, time, userAvatar }) => {
  const getIcon = () => {
    switch (type) {
      case "post":
        return <MessageSquare size={14} />;
      case "like":
        return <Heart size={14} />;
      case "join":
        return <User size={14} />;
      case "reply":
        return <Send size={14} />;
      case "solve":
        return <CheckCircle size={14} />;
      default:
        return <Activity size={14} />;
    }
  };

  return (
    <motion.div
      className={styles.activityItem}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className={styles.activityIcon}>{getIcon()}</div>
      <div className={styles.activityContent}>
        <UserAvatar name={user} size={24} image={userAvatar} />
        <p className={styles.activityText}>
          <span className={styles.activityUser}>{user}</span>
          {type === "post" && " created a topic "}
          {type === "like" && " liked "}
          {type === "join" && " joined the community"}
          {type === "reply" && " replied to "}
          {type === "solve" && " solved "}
          {type !== "join" && (
            <span className={styles.activityTopic}>{topic}</span>
          )}
        </p>
      </div>
      <span className={styles.activityTime}>{time}</span>
    </motion.div>
  );
};

// Community Metrics Component
const CommunityMetrics = () => {
  // Questions answered data
  const weeklyData = [
    { name: "Mon", value: 35 },
    { name: "Tue", value: 42 },
    { name: "Wed", value: 38 },
    { name: "Thu", value: 45 },
    { name: "Fri", value: 56 },
    { name: "Sat", value: 33 },
    { name: "Sun", value: 28 },
  ];

  // Subject distribution data
  const subjectData = [
    { name: "Math", value: 30, color: "#4b7bec" },
    { name: "Physics", value: 25, color: "#3867d6" },
    { name: "Chemistry", value: 15, color: "#45aaf2" },
    { name: "Biology", value: 12, color: "#20bf6b" },
    { name: "English", value: 10, color: "#fa8231" },
    { name: "Other", value: 8, color: "#778ca3" },
  ];

  // Response time data
  const avgResponseTime = "43 minutes";
  const responsePercentage = 92;

  return (
    <div className={styles.metricsContainer}>
      <div className={styles.metricsCard}>
        <div className={styles.metricsHeader}>
          <PieChartIcon size={18} />
          <h3>Community Metrics</h3>
        </div>

        <div className={styles.metricsGrid}>
          {/* Questions Answered Section */}
          <div className={styles.metricSection}>
            <h4>Questions Answered This Week</h4>
            <div className={styles.questionsStats}>
              <div className={styles.weeklyTotal}>
                <span className={styles.weeklyValue}>277</span>
                <span className={styles.weeklyChange}>+12% from last week</span>
              </div>
              <div className={styles.weeklyChart}>
                {weeklyData.map((day, index) => (
                  <div key={index} className={styles.weeklyBar}>
                    <div
                      className={styles.weeklyBarFill}
                      style={{ height: `${(day.value / 60) * 100}%` }}
                    />
                    <span className={styles.weeklyBarLabel}>{day.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subject Distribution Section */}
          <div className={styles.metricSection}>
            <h4>Subject Distribution</h4>
            <div className={styles.subjectDistribution}>
              <div className={styles.subjectPieChart}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.subjectLegend}>
                {subjectData.map((subject, index) => (
                  <div key={index} className={styles.legendItem}>
                    <div
                      className={styles.legendColor}
                      style={{ backgroundColor: subject.color }}
                    />
                    <span className={styles.legendLabel}>{subject.name}</span>
                    <span className={styles.legendValue}>{subject.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Response Time Section */}
          <div className={styles.metricSection}>
            <h4>Average Response Time</h4>
            <div className={styles.responseTimeStats}>
              <div className={styles.responseTimeValue}>
                <AlarmClock size={24} />
                <span>{avgResponseTime}</span>
              </div>
              <div className={styles.responsePercentage}>
                <div className={styles.percentageContainer}>
                  <div className={styles.percentageLabel}>
                    Questions Answered
                  </div>
                  <div className={styles.percentageBar}>
                    <div
                      className={styles.percentageFill}
                      style={{ width: `${responsePercentage}%` }}
                    />
                  </div>
                  <div className={styles.percentageValue}>
                    {responsePercentage}%
                  </div>
                </div>
              </div>
              <div className={styles.responseTimeTrend}>
                <div className={styles.trendIcon}>
                  <ArrowUp size={16} />
                </div>
                <span>5% faster than last month</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Top Helpers Component
const TopHelpers = () => {
  const helpers = [
    {
      name: "Sarah Johnson",
      solved: 32,
      points: 1250,
      badges: ["helpful", "accurate", "dedicated"],
      avatar: null,
    },
    {
      name: "Michael Chen",
      solved: 28,
      points: 980,
      badges: ["helpful", "fast"],
      avatar: null,
    },
    {
      name: "Aisha Patel",
      solved: 24,
      points: 870,
      badges: ["accurate", "dedicated"],
      avatar: null,
    },
  ];

  return (
    <div className={styles.topHelpersCard}>
      <div className={styles.topHelpersHeader}>
        <Trophy size={18} />
        <h3>Top Helpers This Month</h3>
      </div>

      <div className={styles.helpersList}>
        {helpers.map((helper, index) => (
          <div key={index} className={styles.helperItem}>
            <div className={styles.helperRank}>{index + 1}</div>
            <UserAvatar name={helper.name} size={36} image={helper.avatar} />
            <div className={styles.helperInfo}>
              <div className={styles.helperNameRow}>
                <span className={styles.helperName}>{helper.name}</span>
                <ReputationBadge points={helper.points} level="Advanced" />
              </div>
              <div className={styles.helperBadges}>
                {helper.badges.map((badge, i) => (
                  <AchievementBadge key={i} type={badge} />
                ))}
              </div>
            </div>
            <div className={styles.helperStats}>
              <span>{helper.solved} solved</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Success Stories Component
const SuccessStories = () => {
  const stories = [
    {
      user: "James Wilson",
      content:
        "Thanks to the help I received here, I managed to score an A in my calculus final! Special thanks to @SarahJ for the patient explanations.",
      time: "2 days ago",
      avatar: null,
    },
    {
      user: "Ling Chen",
      content:
        "The study group for organic chemistry was a life-saver. Went from barely passing to understanding the material completely!",
      time: "5 days ago",
      avatar: null,
    },
  ];

  return (
    <div className={styles.successStoriesCard}>
      <div className={styles.successStoriesHeader}>
        <Star size={18} />
        <h3>Success Stories</h3>
      </div>

      <div className={styles.storiesList}>
        {stories.map((story, index) => (
          <div key={index} className={styles.storyItem}>
            <UserAvatar name={story.user} size={40} image={story.avatar} />
            <div className={styles.storyContent}>
              <div className={styles.storyMeta}>
                <span className={styles.storyUser}>{story.user}</span>
                <span className={styles.storyTime}>{story.time}</span>
              </div>
              <p className={styles.storyText}>{story.content}</p>
              <div className={styles.storyActions}>
                <button className={styles.storyAction}>
                  <Heart size={14} />
                  <span>Like</span>
                </button>
                <button className={styles.storyAction}>
                  <MessageSquare size={14} />
                  <span>Comment</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Format date to relative time
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return `Just now`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString();
};

// Mini Profile Card
const MiniProfile = ({ user, onViewProfile }) => {
  return (
    <div className={styles.miniProfileCard}>
      <div className={styles.miniProfileHeader}>
        <UserAvatar
          name={user.name}
          size={48}
          image={user.avatar}
          online={true}
        />
        <div className={styles.miniProfileInfo}>
          <h3>{user.name}</h3>
          <div className={styles.profileBadges}>
            <ReputationBadge points={user.reputation} level={user.level} />
            {user.badges.map((badge, index) => (
              <AchievementBadge
                key={index}
                type={badge.type}
                count={badge.count}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.miniProfileStats}>
        <div className={styles.profileStat}>
          <div className={styles.statNumber}>{user.topicsCreated}</div>
          <div className={styles.statLabel}>Topics</div>
        </div>
        <div className={styles.profileStat}>
          <div className={styles.statNumber}>{user.replies}</div>
          <div className={styles.statLabel}>Replies</div>
        </div>
        <div className={styles.profileStat}>
          <div className={styles.statNumber}>{user.solved}</div>
          <div className={styles.statLabel}>Solved</div>
        </div>
      </div>

      <div className={styles.profileRank}>
        <span className={styles.rankLabel}>Current Rank:</span>
        <span className={styles.rankValue}>{user.rank}</span>
      </div>

      <button
        className={styles.viewProfileButton}
        onClick={() => onViewProfile(user.id)}
      >
        View Full Profile
      </button>
    </div>
  );
};

export default function ForumsListing() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [subscribed, setSubscribed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const searchInputRef = useRef(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [onlineUsers] = useState(Math.floor(Math.random() * 100) + 50);

  // Get topics from the hook
  const { topics, loading, error, refreshTopics, createTopic } = useTopics(
    null,
    activeCategory === "all" ? null : activeCategory
  );
  const { user, isAuthenticated } = useAmplify();

  // Mock current user profile
  const currentUser = isAuthenticated
    ? {
        id: "current-user",
        name: user?.name || "Current User",
        avatar: null,
        reputation: 550,
        level: "Intermediate",
        badges: [
          { type: "helpful", count: 5 },
          { type: "fast", count: 3 },
          { type: "dedicated", count: 1 },
        ],
        topicsCreated: 12,
        replies: 47,
        solved: 8,
        rank: "Top 10%",
      }
    : null;

  // Filter topics based on search term and active tab
  const filteredTopics = topics.filter((topic) => {
    const matchesSearch =
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (topic.content &&
        topic.content.toLowerCase().includes(searchTerm.toLowerCase()));

    // Additional filters based on active tab
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "popular")
      return matchesSearch && (topic.views > 50 || topic.likes > 10);
    if (activeTab === "latest")
      return (
        matchesSearch &&
        new Date(topic.createdAt) > new Date(Date.now() - 2 * 86400000)
      );
    if (activeTab === "unanswered")
      return matchesSearch && (!topic.replyCount || topic.replyCount === 0);

    return matchesSearch;
  });

  // Sort topics based on selected option
  const sortedTopics = [...filteredTopics].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    } else if (sortBy === "popular") {
      return b.views - a.views;
    } else if (sortBy === "mostLiked") {
      return b.likes - a.likes;
    } else if (sortBy === "mostReplies") {
      return (b.replyCount || 0) - (a.replyCount || 0);
    }
    return 0;
  });

  // Add solved property randomly to some topics
  const enhancedTopics = sortedTopics.map((topic) => ({
    ...topic,
    solved: Math.random() > 0.7,
  }));

  // Featured topics - take the most engaged ones
  const featuredTopics = [...topics]
    .sort((a, b) => {
      const aEngagement =
        (a.views || 0) + (a.likes || 0) * 2 + (a.replyCount || 0) * 3;
      const bEngagement =
        (b.views || 0) + (b.likes || 0) * 2 + (b.replyCount || 0) * 3;
      return bEngagement - aEngagement;
    })
    .slice(0, 3);

  // Mock activity feed data
  const activityFeed = [
    {
      type: "post",
      user: "JaneSmith",
      topic: "Study resources for Biology",
      time: "2m ago",
    },
    {
      type: "like",
      user: "MikeJohnson",
      topic: "Physics homework help",
      time: "5m ago",
    },
    {
      type: "solve",
      user: "AlexWong",
      topic: "Math equation solution",
      time: "10m ago",
    },
    { type: "join", user: "SarahParker", topic: "", time: "15m ago" },
    {
      type: "reply",
      user: "DavidBrown",
      topic: "Literature analysis tips",
      time: "20m ago",
    },
  ];

  // Detect scroll for showing scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCreateTopic = async (topicData) => {
    try {
      await createTopic({
        ...topicData,
        category: activeCategory === "all" ? "general" : activeCategory,
      });

      setShowNewTopicModal(false);
      refreshTopics();
    } catch (error) {
      console.error("Error creating topic:", error);
      alert(error.message || "Failed to create topic");
    }
  };

  const handleViewTopic = (topicId) => {
    router.push(`/dashboard/forums?topicId=${topicId}`);
  };

  const handleViewProfile = (userId) => {
    setActiveProfileId(userId);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Additional search functionality if needed
  };

  const focusSearch = () => {
    searchInputRef.current?.focus();
    setIsSearchFocused(true);
  };

  const categories = [
    { id: "all", label: "All Topics", icon: <Hash size={16} /> },
    { id: "mathematics", label: "Mathematics", icon: <BarChart size={16} /> },
    { id: "physics", label: "Physics", icon: <Zap size={16} /> },
    { id: "chemistry", label: "Chemistry", icon: <Sparkles size={16} /> },
    { id: "english", label: "English", icon: <BookOpen size={16} /> },
    { id: "history", label: "History", icon: <Calendar size={16} /> },
    { id: "general", label: "General", icon: <MessageSquare size={16} /> },
  ];

  const tabs = [
    { id: "all", label: "All", icon: <Hash size={16} /> },
    { id: "latest", label: "Latest", icon: <Clock size={16} /> },
    { id: "popular", label: "Popular", icon: <TrendingUp size={16} /> },
    {
      id: "unanswered",
      label: "Unanswered",
      icon: <MessageSquare size={16} />,
    },
  ];

  return (
    <div className={styles.pageContainer}>
      {/* Background Shapes */}
      <BackgroundShapes />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            className={styles.menuToggle}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className={styles.headerTitle}>
            <h1>Student Forums</h1>
            <div className={styles.activeUsersIndicator}>
              <div className={styles.pulsingDot}></div>
              <span>{onlineUsers} students online</span>
            </div>
          </div>
        </div>

        <div className={styles.headerActions}>
          <form
            onSubmit={handleSearch}
            className={`${styles.searchForm} ${
              isSearchFocused ? styles.focused : ""
            }`}
          >
            <Search
              className={styles.searchIcon}
              size={18}
              onClick={focusSearch}
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </form>

          <button
            className={`${styles.iconButton} ${
              subscribed ? styles.active : ""
            }`}
            onClick={() => setSubscribed(!subscribed)}
            title={
              subscribed
                ? "Unsubscribe from notifications"
                : "Subscribe to notifications"
            }
          >
            {subscribed ? <Bell size={18} /> : <BellOff size={18} />}
          </button>

          {isAuthenticated && (
            <div
              className={styles.userAvatarMenu}
              onClick={() => handleViewProfile("current-user")}
            >
              <UserAvatar
                name={user?.name || "User"}
                size={36}
                online
                image={user?.avatar}
              />
            </div>
          )}

          <motion.button
            className={styles.createButton}
            onClick={() =>
              isAuthenticated
                ? setShowNewTopicModal(true)
                : router.push("/login")
            }
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={16} />
            <span>New Topic</span>
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <div className={styles.mainContainer}>
        {/* Sidebar - Categories */}
        <aside
          className={`${styles.sidebar} ${
            isMobileMenuOpen ? styles.mobileOpen : ""
          }`}
        >
          {isAuthenticated && (
            <div className={styles.sidebarSection}>
              <MiniProfile
                user={currentUser}
                onViewProfile={handleViewProfile}
              />
            </div>
          )}

          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>Categories</h3>
            <div className={styles.categoryPills}>
              {categories.map((category) => (
                <CategoryPill
                  key={category.id}
                  category={category.label}
                  icon={category.icon}
                  active={activeCategory === category.id}
                  onClick={() => setActiveCategory(category.id)}
                />
              ))}
            </div>
          </div>

          {isAuthenticated && (
            <div className={styles.sidebarSection}>
              <h3 className={styles.sidebarTitle}>My Activity</h3>
              <nav className={styles.activityLinks}>
                <a className={styles.activityLink}>
                  <MessageSquare size={16} />
                  <span>My Topics</span>
                </a>
                <a className={styles.activityLink}>
                  <Eye size={16} />
                  <span>Recently Viewed</span>
                </a>
                <a className={styles.activityLink}>
                  <ThumbsUp size={16} />
                  <span>Liked Topics</span>
                </a>
                <a className={styles.activityLink}>
                  <Bookmark size={16} />
                  <span>Bookmarks</span>
                </a>
              </nav>
            </div>
          )}

          {/* Activity Feed */}
          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>
              <Activity size={16} />
              Recent Activity
            </h3>
            <div className={styles.activityFeed}>
              {activityFeed.map((activity, index) => (
                <ActivityFeedItem
                  key={index}
                  type={activity.type}
                  user={activity.user}
                  topic={activity.topic}
                  time={activity.time}
                />
              ))}
            </div>
          </div>

          {/* Daily Challenge */}
          <div className={styles.sidebarSection}>
            <DailyChallenge />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={styles.content}>
          {!searchTerm && activeCategory === "all" && activeTab === "all" && (
            <>
              {/* News Carousel */}
              <section className={styles.newsSection}>
                <h2 className={styles.sectionTitle}>
                  <RadioTower size={18} />
                  Latest Announcements
                </h2>
                <NewsCarousel />
              </section>

              {/* Community Metrics */}
              <CommunityMetrics />

              {/* Featured Discussions */}
              <section className={styles.featuredSection}>
                <h2 className={styles.sectionTitle}>
                  <Fire size={18} />
                  Featured Discussions
                </h2>
                <div className={styles.featuredGrid}>
                  {featuredTopics.map((topic) => (
                    <FeaturedTopicCard
                      key={topic.id}
                      topic={topic}
                      onClick={() => handleViewTopic(topic.id)}
                    />
                  ))}
                </div>
              </section>

              {/* Top Helpers and Success Stories */}
              <div className={styles.communitySection}>
                <div className={styles.communityRow}>
                  <TopHelpers />
                  <SuccessStories />
                </div>
              </div>

              {/* Help Needed and Study Rooms */}
              <div className={styles.communityInteractions}>
                <div className={styles.interactionsRow}>
                  <HelpNeeded onViewTopic={handleViewTopic} />
                  <StudyRooms />
                  <CurrentPoll />
                </div>
              </div>
            </>
          )}

          {/* Filters and tabs */}
          <div className={styles.contentControls}>
            <div className={styles.tabsContainer}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`${styles.tabButton} ${
                    activeTab === tab.id ? styles.activeTab : ""
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className={styles.sortControls}>
              <label htmlFor="sortBy" className={styles.sortLabel}>
                Sort by:
              </label>
              <div className={styles.selectWrapper}>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.sortSelect}
                >
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Viewed</option>
                  <option value="mostLiked">Most Liked</option>
                  <option value="mostReplies">Most Active</option>
                </select>
                <ChevronDown size={16} className={styles.selectIcon} />
              </div>
            </div>
          </div>

          {/* Topics List */}
          {loading ? (
            <div className={styles.loadingState}>
              <RefreshCw className={styles.spinnerIcon} size={24} />
              <p>Loading discussions...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <h3>Error Loading Forums</h3>
              <p>{error}</p>
              <button className={styles.retryButton} onClick={refreshTopics}>
                <RefreshCw size={16} />
                <span>Retry</span>
              </button>
            </div>
          ) : (
            <LayoutGroup>
              <section className={styles.topicsSection}>
                <AnimatePresence>
                  {enhancedTopics.length === 0 ? (
                    <motion.div
                      className={styles.emptyState}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Lightbulb size={40} />
                      <h3>No topics found</h3>
                      <p>
                        {searchTerm
                          ? `No results found for "${searchTerm}". Try a different search term.`
                          : "No topics yet in this category. Be the first to start a discussion!"}
                      </p>
                      <motion.button
                        className={styles.createEmptyButton}
                        onClick={() =>
                          isAuthenticated
                            ? setShowNewTopicModal(true)
                            : router.push("/login")
                        }
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Plus size={16} />
                        <span>Create New Topic</span>
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div
                      className={styles.topicsList}
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: {
                          transition: {
                            staggerChildren: 0.05,
                          },
                        },
                      }}
                    >
                      {enhancedTopics.map((topic) => (
                        <TopicCard
                          key={topic.id}
                          topic={topic}
                          handleViewTopic={handleViewTopic}
                          currentUser={user}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </LayoutGroup>
          )}
        </main>
      </div>

      {/* New Topic Modal */}
      <AnimatePresence>
        {showNewTopicModal && (
          <NewTopicModal
            onClose={() => setShowNewTopicModal(false)}
            onSubmit={handleCreateTopic}
            category={activeCategory === "all" ? "general" : activeCategory}
          />
        )}
      </AnimatePresence>

      {/* Profile View Modal */}
      <AnimatePresence>
        {activeProfileId && (
          <motion.div
            className={styles.profileModalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveProfileId(null)}
          >
            <motion.div
              className={styles.profileModalContent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={styles.closeProfileButton}
                onClick={() => setActiveProfileId(null)}
              >
                <X size={20} />
              </button>

              <div className={styles.profileHeader}>
                <UserAvatar
                  name={currentUser.name}
                  size={80}
                  image={currentUser.avatar}
                  online={true}
                />
                <div className={styles.profileHeaderInfo}>
                  <h2>{currentUser.name}</h2>
                  <div className={styles.profileBadgesLarge}>
                    <ReputationBadge
                      points={currentUser.reputation}
                      level={currentUser.level}
                    />
                    {currentUser.badges.map((badge, index) => (
                      <AchievementBadge
                        key={index}
                        type={badge.type}
                        count={badge.count}
                      />
                    ))}
                  </div>
                  <div className={styles.joinedDate}>
                    Member since October 2022
                  </div>
                </div>
              </div>

              <div className={styles.profileBody}>
                <div className={styles.profileStatsLarge}>
                  <div className={styles.profileStatLarge}>
                    <div className={styles.statNumberLarge}>
                      {currentUser.topicsCreated}
                    </div>
                    <div className={styles.statLabelLarge}>Topics Created</div>
                  </div>
                  <div className={styles.profileStatLarge}>
                    <div className={styles.statNumberLarge}>
                      {currentUser.replies}
                    </div>
                    <div className={styles.statLabelLarge}>Replies</div>
                  </div>
                  <div className={styles.profileStatLarge}>
                    <div className={styles.statNumberLarge}>
                      {currentUser.solved}
                    </div>
                    <div className={styles.statLabelLarge}>Problems Solved</div>
                  </div>
                  <div className={styles.profileStatLarge}>
                    <div className={styles.statNumberLarge}>24</div>
                    <div className={styles.statLabelLarge}>Helpful Votes</div>
                  </div>
                </div>

                <div className={styles.profileSections}>
                  <div className={styles.profileSection}>
                    <h3 className={styles.profileSectionTitle}>
                      <BookOpen size={18} />
                      Areas of Expertise
                    </h3>
                    <div className={styles.expertiseAreas}>
                      <div className={styles.expertiseArea}>
                        <div className={styles.expertiseLabel}>Mathematics</div>
                        <div className={styles.expertiseProgress}>
                          <div
                            className={styles.expertiseProgressFill}
                            style={{ width: "85%" }}
                          />
                        </div>
                      </div>
                      <div className={styles.expertiseArea}>
                        <div className={styles.expertiseLabel}>Physics</div>
                        <div className={styles.expertiseProgress}>
                          <div
                            className={styles.expertiseProgressFill}
                            style={{ width: "65%" }}
                          />
                        </div>
                      </div>
                      <div className={styles.expertiseArea}>
                        <div className={styles.expertiseLabel}>
                          Computer Science
                        </div>
                        <div className={styles.expertiseProgress}>
                          <div
                            className={styles.expertiseProgressFill}
                            style={{ width: "90%" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.profileSection}>
                    <h3 className={styles.profileSectionTitle}>
                      <Award size={18} />
                      Recent Achievements
                    </h3>
                    <div className={styles.achievementsList}>
                      <div className={styles.achievementItem}>
                        <div className={styles.achievementIcon}>
                          <Trophy size={16} />
                        </div>
                        <div className={styles.achievementInfo}>
                          <div className={styles.achievementName}>
                            Helpful Commenter
                          </div>
                          <div className={styles.achievementDesc}>
                            Received 10+ helpful votes on comments
                          </div>
                        </div>
                        <div className={styles.achievementDate}>5d ago</div>
                      </div>
                      <div className={styles.achievementItem}>
                        <div className={styles.achievementIcon}>
                          <Zap size={16} />
                        </div>
                        <div className={styles.achievementInfo}>
                          <div className={styles.achievementName}>
                            Quick Responder
                          </div>
                          <div className={styles.achievementDesc}>
                            Answered 5 questions within 30 minutes
                          </div>
                        </div>
                        <div className={styles.achievementDate}>2w ago</div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.profileSection}>
                    <h3 className={styles.profileSectionTitle}>
                      <MessageSquare size={18} />
                      Recent Contributions
                    </h3>
                    <div className={styles.contributionsList}>
                      <div className={styles.contributionItem}>
                        <div className={styles.contributionType}>
                          <CheckCircle size={14} />
                        </div>
                        <div className={styles.contributionInfo}>
                          <div className={styles.contributionTitle}>
                            Solved: Integration by substitution
                          </div>
                          <div className={styles.contributionStats}>
                            <span>
                              <ThumbsUp size={12} />5
                            </span>
                            <span>
                              <Eye size={12} />
                              42
                            </span>
                          </div>
                        </div>
                        <div className={styles.contributionDate}>2d ago</div>
                      </div>
                      <div className={styles.contributionItem}>
                        <div className={styles.contributionType}>
                          <MessageSquare size={14} />
                        </div>
                        <div className={styles.contributionInfo}>
                          <div className={styles.contributionTitle}>
                            Created: Physics mechanics problem
                          </div>
                          <div className={styles.contributionStats}>
                            <span>
                              <ThumbsUp size={12} />
                              12
                            </span>
                            <span>
                              <Eye size={12} />
                              87
                            </span>
                          </div>
                        </div>
                        <div className={styles.contributionDate}>1w ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            className={styles.scrollTopButton}
            onClick={scrollToTop}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
