"use client";
import { useState, useEffect } from "react";
import styles from "./NewsGrid.module.css";
import { motion } from "framer-motion";

const newsCategories = [
  { id: "all", label: "All" },
  { id: "announcements", label: "Announcements" },
  { id: "updates", label: "Updates" },
  { id: "events", label: "Events" },
];

// Sample news data
const sampleNews = [
  {
    id: 1,
    title: "New Math Course Available",
    excerpt:
      "Explore our latest advanced calculus course now open for enrollment.",
    category: "announcements",
    image: "/assets/images/math-course.jpg",
    date: "2 days ago",
    featured: true,
  },
  {
    id: 2,
    title: "Physics Study Group",
    excerpt: "Join our weekly physics study group every Wednesday at 7 PM.",
    category: "events",
    image: "/assets/images/physics-group.jpg",
    date: "1 week ago",
    featured: false,
  },
  {
    id: 3,
    title: "Platform Update",
    excerpt:
      "We've improved the forums with new features and better performance.",
    category: "updates",
    image: "/assets/images/platform-update.jpg",
    date: "3 days ago",
    featured: true,
  },
  {
    id: 4,
    title: "Chemistry Lab Workshop",
    excerpt: "Hands-on workshop for advanced organic chemistry techniques.",
    category: "events",
    image: "/assets/images/chemistry-lab.jpg",
    date: "5 days ago",
    featured: false,
  },
  {
    id: 5,
    title: "New Grading System",
    excerpt: "Important changes to the grading system starting next semester.",
    category: "announcements",
    image: "/assets/images/grading.jpg",
    date: "1 day ago",
    featured: false,
  },
  {
    id: 6,
    title: "Mobile App Launch",
    excerpt: "Our new mobile app is now available on iOS and Android.",
    category: "updates",
    image: "/assets/images/mobile-app.jpg",
    date: "4 days ago",
    featured: false,
  },
];

const NewsCard = ({ news, index }) => {
  return (
    <motion.div
      className={`${styles.newsCard} ${news.featured ? styles.featured : ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{
        y: -5,
        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
        transition: { duration: 0.2 },
      }}
    >
      <div className={styles.cardImageContainer}>
        <div
          className={styles.cardImage}
          style={{ backgroundImage: `url(/api/placeholder/300/200)` }}
        />
        <div className={styles.cardCategory}>{news.category}</div>
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{news.title}</h3>
        <p className={styles.cardExcerpt}>{news.excerpt}</p>
        <div className={styles.cardMeta}>
          <span className={styles.cardDate}>{news.date}</span>
          <span className={styles.cardReadMore}>Read more</span>
        </div>
      </div>
    </motion.div>
  );
};

export default function NewsGrid({ customizable = true }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [newsItems, setNewsItems] = useState(sampleNews);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [layout, setLayout] = useState("grid"); // grid, compact, expanded

  useEffect(() => {
    if (activeCategory === "all") {
      setNewsItems(sampleNews);
    } else {
      setNewsItems(
        sampleNews.filter((news) => news.category === activeCategory)
      );
    }
  }, [activeCategory]);

  const toggleCustomization = () => {
    setIsCustomizing(!isCustomizing);
  };

  const changeLayout = (newLayout) => {
    setLayout(newLayout);
  };

  // Customize category filters animation
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className={styles.newsGridContainer}>
      <div className={styles.newsHeader}>
        <h2 className={styles.newsTitle}>Latest News & Updates</h2>

        {customizable && (
          <motion.button
            className={styles.customizeButton}
            onClick={toggleCustomization}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isCustomizing ? "Done" : "Customize"}
          </motion.button>
        )}
      </div>

      {isCustomizing && (
        <motion.div
          className={styles.customizationPanel}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.customizationOptions}>
            <div className={styles.optionGroup}>
              <span>Layout:</span>
              <div className={styles.layoutButtons}>
                <button
                  className={`${styles.layoutButton} ${
                    layout === "grid" ? styles.active : ""
                  }`}
                  onClick={() => changeLayout("grid")}
                >
                  Grid
                </button>
                <button
                  className={`${styles.layoutButton} ${
                    layout === "compact" ? styles.active : ""
                  }`}
                  onClick={() => changeLayout("compact")}
                >
                  Compact
                </button>
                <button
                  className={`${styles.layoutButton} ${
                    layout === "expanded" ? styles.active : ""
                  }`}
                  onClick={() => changeLayout("expanded")}
                >
                  Expanded
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        className={styles.categoryFilters}
        variants={container}
        initial="hidden"
        animate="show"
      >
        {newsCategories.map((category) => (
          <motion.button
            key={category.id}
            className={`${styles.categoryButton} ${
              activeCategory === category.id ? styles.active : ""
            }`}
            onClick={() => setActiveCategory(category.id)}
            variants={item}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category.label}
          </motion.button>
        ))}
      </motion.div>

      <div className={`${styles.newsGrid} ${styles[layout]}`}>
        {newsItems.map((news, index) => (
          <NewsCard key={news.id} news={news} index={index} />
        ))}
      </div>
    </div>
  );
}
