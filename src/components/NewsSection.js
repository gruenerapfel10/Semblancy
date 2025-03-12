"use client";
import Image from "next/image";

import Link from "next/link";
import styles from "./NewsSection.module.css";

// Import news images directly from assets
import News1 from "../assets/images/news/news-1.png";
import News2 from "../assets/images/news/news-2.png";
import News3 from "../assets/images/news/news-3.png";

export default function NewsSection() {
  const newsItems = [
    {
      id: 1,
      title:
        "Latest paper from the UK life cryo-EM structure of RecA/h family of bacterial actin homologues forms a 3-stranded helical structure.",
      date: "25th February 2023",
      image: News1,
      link: "/news/1",
    },
    {
      id: 2,
      title:
        "We have been short-listed for a UK start-up award, in the MedTech and HealthTech category! Thanks to startupwards.uk for the recognition!",
      date: "8th March 2023",
      image: News2,
      link: "/news/2",
    },
    {
      id: 3,
      title:
        "General announcement: Excited to join the AI in Health Accelerator Programme! Over the next few months, we'll be working closely with...",
      date: "17th May 2023",
      image: News3,
      link: "/news/3",
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Latest News</h2>
          <Link href="/news" className={styles.viewAllBtn}>
            VIEW MORE
          </Link>
        </div>

        <div className={styles.newsGrid}>
          {newsItems.map((item) => (
            <div key={item.id} className={styles.newsCard}>
              <div className={styles.imageContainer}>
                <Image
                  src={item.image}
                  alt={item.title}
                  width={320}
                  height={220}
                  className={styles.newsImage}
                />
              </div>

              <div className={styles.newsContent}>
                <p className={styles.newsDate}>{item.date}</p>
                <h3 className={styles.newsTitle}>{item.title}</h3>
                <Link href={item.link} className={styles.readMoreBtn}>
                  <span>READ MORE</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}