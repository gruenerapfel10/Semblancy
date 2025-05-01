"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./forums.module.css";
import ForumsListing from "../../../components/Forums/ForumsListing";
import TopicView from "../../../components/Forums/TopicView";

export default function ForumsPage() {
  const searchParams = useSearchParams();
  const topicId = searchParams.get("topicId");
  const [showTopic, setShowTopic] = useState(false);
  const [currentTopicId, setCurrentTopicId] = useState(null);

  useEffect(() => {
    if (topicId) {
      setCurrentTopicId(topicId);
      setShowTopic(true);
    } else {
      setShowTopic(false);
      setCurrentTopicId(null);
    }
  }, [topicId]);

  const handleBack = () => {
    // Replace URL without the topicId parameter
    const url = window.location.pathname;
    window.history.pushState({}, "", url);
    setShowTopic(false);
    setCurrentTopicId(null);
  };

  return (
    <div className={styles.forumPageContainer}>
      {showTopic && currentTopicId ? (
        <TopicView topicId={currentTopicId} onBack={handleBack} />
      ) : (
        <ForumsListing />
      )}
    </div>
  );
}
