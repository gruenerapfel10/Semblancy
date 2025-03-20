// components/templates/SkillPageTemplate.js
"use client";

import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faInfo,
  faTrophy,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";

export default function SkillPageTemplate({
  skillId,
  title,
  description,
  aboutContent,
  gameComponent,
  achievements = [],
  history = [],
}) {
  const [activeTab, setActiveTab] = React.useState("about");

  return (
    <div className="skill-page-container">
      <div className="header">
        <div className="flex items-center mb-4">
          <Link
            href="/dashboard/skills"
            className="mr-4 text-brand-color hover:underline flex items-center"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Skills
          </Link>
        </div>

        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-color to-purple-600">
          {title}
        </h1>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">{gameComponent}</div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md">
            <div className="tab-navigation border-b">
              <div className="flex">
                <button
                  className={`tab-button py-3 px-4 flex items-center ${
                    activeTab === "about"
                      ? "border-b-2 border-brand-color font-semibold"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("about")}
                >
                  <FontAwesomeIcon icon={faInfo} className="mr-2" />
                  About
                </button>
                <button
                  className={`tab-button py-3 px-4 flex items-center ${
                    activeTab === "achievements"
                      ? "border-b-2 border-brand-color font-semibold"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("achievements")}
                >
                  <FontAwesomeIcon icon={faTrophy} className="mr-2" />
                  Achievements
                </button>
                <button
                  className={`tab-button py-3 px-4 flex items-center ${
                    activeTab === "history"
                      ? "border-b-2 border-brand-color font-semibold"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("history")}
                >
                  <FontAwesomeIcon icon={faHistory} className="mr-2" />
                  History
                </button>
              </div>
            </div>

            <div className="tab-content p-6">
              {activeTab === "about" && (
                <div className="about-content">{aboutContent}</div>
              )}

              {activeTab === "achievements" && (
                <div className="achievements-content">
                  <h2 className="text-xl font-bold mb-4">Your Achievements</h2>

                  {achievements.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        Complete game sessions to earn achievements
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {achievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className={`achievement-item flex items-center p-3 rounded-md ${
                            achievement.achieved ? "bg-green-50" : "bg-gray-50"
                          }`}
                        >
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                              achievement.achieved
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            <span className="text-lg">
                              {achievement.icon || "🏆"}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {achievement.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {achievement.description}
                            </p>

                            {!achievement.achieved &&
                              achievement.progress !== undefined && (
                                <div className="mt-1">
                                  <div className="w-full bg-gray-200 h-1.5 rounded-full">
                                    <div
                                      className="bg-brand-color h-1.5 rounded-full"
                                      style={{
                                        width: `${achievement.progress}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {achievement.progress}% complete
                                  </p>
                                </div>
                              )}

                            {achievement.achieved && (
                              <p className="text-xs text-green-600 mt-1">
                                Achieved on{" "}
                                {new Date(
                                  achievement.dateAchieved
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "history" && (
                <div className="history-content">
                  <h2 className="text-xl font-bold mb-4">Your Game History</h2>

                  {history.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        Play games to see your history
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {history.map((session) => (
                        <div
                          key={session.id}
                          className="history-item border rounded-md p-3"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                              {new Date(session.date).toLocaleDateString()}
                            </span>
                            <span
                              className={`text-sm font-semibold px-2 py-1 rounded ${getGradeColor(
                                session.grade
                              )}`}
                            >
                              {session.grade}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span>Score: {session.score}</span>
                            <span className="text-sm">
                              {session.correct}/{session.total} correct
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function for grade colors
function getGradeColor(grade) {
  switch (grade) {
    case "A*":
      return "bg-purple-100 text-purple-800";
    case "A":
      return "bg-blue-100 text-blue-800";
    case "B":
      return "bg-cyan-100 text-cyan-800";
    case "C":
      return "bg-green-100 text-green-800";
    case "D":
      return "bg-yellow-100 text-yellow-800";
    case "E":
      return "bg-orange-100 text-orange-800";
    case "U":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
