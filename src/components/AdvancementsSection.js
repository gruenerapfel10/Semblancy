// File: app/components/AdvancementsSection.js
import Image from "next/image";
import styles from "./AdvancementsSection.module.css";
import ellipse1 from "../assets/images/ellipse1.png";
import ellipse2 from "../assets/images/ellipse2.png";

export default function AdvancementsSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <div className={styles.textContent}>
            <h2 className={styles.title}>
              Pioneering
              <br />
              Advancements
            </h2>

            <p className={styles.highlight}>
              Our protein-based nanoparticle
              <br />
              delivery systems responds to...
            </p>

            <p className={styles.description}>
              ATP and pH for precise drug release, ensuring targeted
              <br />
              efficacy while minimizing side effects.
            </p>

            <p className={styles.description}>
              With disease-specific targeting mechanisms, versatile drug
              <br />
              loading for therapeutics like Doxorubicin, and atomic-level
              <br />
              structural precision, our technology enables enhanced
              <br />
              engineering for superior cancer treatment.
            </p>

            <div className={styles.stats}>
              <div className={styles.statItem}>
                <h2
                  className={styles.statNumber}
                  style={{ color: "var(--kredirel-dark-blue)" }}
                >
                  90<span>%</span>
                </h2>
                <p className={styles.statText}>
                  of medicine do not reach tumours
                </p>
              </div>

              <div className={styles.statItem}>
                <h2
                  className={styles.statNumber}
                  style={{ color: "var(--kredirel-dark-blue)" }}
                >
                  16M<span>+</span>
                </h2>
                <p className={styles.statText}>
                  Experience significant side effects
                </p>
              </div>
            </div>
          </div>

          <div className={styles.imageContent}>
            <div className={styles.imageContainer}>
              <Image
                src={ellipse1}
                alt="Scientist working with microscope"
                className={styles.scientistImage}
              />

              <div className={styles.moleculeContainer}>
                <Image
                  src={ellipse2}
                  alt="Molecular structure"
                  className={styles.moleculeImage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
