// File: app/components/PartnersSection.js
import Image from "next/image";
import styles from "./PartnersSection.module.css";

import AWS from "../assets/images/partners/AWS.svg";
import BRD from "../assets/images/partners/BRD.svg";
import CMS from "../assets/images/partners/CMS.svg";
import EGT from "../assets/images/partners/EGT.svg";
import KCL from "../assets/images/partners/KCL.svg";
import Moterra from "../assets/images/partners/Moterra.svg";
import Pioneer from "../assets/images/partners/Pioneer.svg";
import Shipleys from "../assets/images/partners/Shipleys.svg";
import TC from "../assets/images/partners/TC.svg";
import THW from "../assets/images/partners/THW.svg";

export default function PartnersSection() {
  const partners = [
    { name: "AWS", logo: AWS },
    { name: "BRD", logo: BRD },
    { name: "CMS", logo: CMS },
    { name: "EGT", logo: EGT },
    { name: "KCL", logo: KCL },
    { name: "Moterra", logo: Moterra },
    { name: "Pioneer", logo: Pioneer },
    { name: "Shipleys", logo: Shipleys },
    { name: "TC", logo: TC },
    { name: "THW", logo: THW },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>
          Together...
          <br />
          We Are Transforming Cancer
          <br />
          Treatment For Everyone
        </h2>

        <div className={styles.partnersGrid}>
          {partners.map((partner, index) => (
            <div key={index} className={styles.partnerItem}>
              <Image
                src={partner.logo}
                alt={partner.name}
                width={140}
                height={60}
                className={styles.partnerLogo}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
