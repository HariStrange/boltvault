import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import api from "../../lib/api";
import SetCreation from "./SetsCreation";
import QuestionCreation from "./QuestionCreation";
import QuestionSetsList from "./QuestionSetsList";
import UserAssignment from "./UserAssignment";

interface QuestionSet {
  id: number;
  set_name: string;
  category: string;
  created_at: string;
}

const QuizAdminPage: React.FC = () => {
  const [sets, setSets] = useState<QuestionSet[]>([]);
  const [activeTab, setActiveTab] = useState("sets");
  const [isLoadingSets, setIsLoadingSets] = useState(true);
  const [error, setError] = useState("");

  const loadSets = async () => {
    setIsLoadingSets(true);
    setError("");
    try {
      const res = await api.get("/api/question-sets");
      setSets(res.data.data || []);
    } catch (error: any) {
      if (error.response?.status === 401) {
        setError("Session expired. Please login.");
      } else {
        setError(error.response?.data?.error || "Failed to load sets");
      }
      setSets([]);
    } finally {
      setIsLoadingSets(false);
    }
  };

  useEffect(() => {
    loadSets();
  }, []);

  const tabs = [
    { id: "sets", label: "View Sets" },
    { id: "create-set", label: "Create Set" },
    { id: "create-question", label: "Add Question" },
    { id: "assign", label: "Assign to Users" },
  ];

  return (
    <div className="container space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold text-foreground">
        Quiz Management System
      </h1>
      <p className="text-muted-foreground mt-2">
        Welcome to the admin Quizz control panel
      </p>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {isLoadingSets ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mr-3" />
          <span className="text-gray-600 text-lg">Loading sets...</span>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-8 bg-muted rounded-lg p-2 shadow-md">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-2 rounded-md cursor-pointer font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-secondary-foreground shadow-md"
                    : "bg-secondary text-secondary-foreground/70 hover:bg-primary/90"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {activeTab === "sets" && (
              <QuestionSetsList sets={sets} onRefresh={loadSets} />
            )}
            {activeTab === "create-set" && (
              <SetCreation onSetCreated={loadSets} />
            )}
            {activeTab === "create-question" && (
              <QuestionCreation sets={sets} onQuestionCreated={loadSets} />
            )}
            {activeTab === "assign" && <UserAssignment />}
          </div>
        </>
      )}
    </div>
  );
};

export default QuizAdminPage;
