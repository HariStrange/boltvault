import React, { useState } from "react";
import {
  Loader2,
  RefreshCw,
  Package,
  ArrowLeft,
  Eye,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../lib/api"; // Assuming this is the API client path; adjust if needed

interface QuestionSet {
  id: number;
  set_name: string;
  category: string;
  created_at: string;
}

interface Question {
  id: number;
  question_set_id: number;
  question_text: string | null;
  question_image_url: string | null;
  question_type: string;
  options: Array<{
    id: number;
    option_text: string;
    is_correct: boolean;
  }> | null;
}

interface QuestionSetsListProps {
  sets: QuestionSet[];
  onRefresh: () => void;
}

const QuestionSetsList: React.FC<QuestionSetsListProps> = ({
  sets,
  onRefresh,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const refreshList = async () => {
    setIsLoading(true);
    try {
      await onRefresh();
    } finally {
      setIsLoading(false);
    }
  };

  const viewQuestions = async (id: number) => {
    setLoadingQuestions(true);
    try {
      const response = await api.get(`/api/quizz/set/${id}/questions`);
      setQuestions(response.data.questions || []);
      setSelectedSetId(id);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to fetch questions");
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const deleteSet = async (id: number) => {
    toast("Delete this question set?", {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await api.delete(`/api/question-sets/${id}`);
            toast.success("Question set deleted successfully");
            await onRefresh();
            if (selectedSetId === id) {
              backToList();
            }
          } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to delete question set");
          }
        },
      },
      cancel: {
        label: "Cancel",
      },
    });
  };

  const backToList = () => {
    setSelectedSetId(null);
    setQuestions([]);
  };

  if (selectedSetId !== null) {
    const selectedSet = sets.find((set) => set.id === selectedSetId);
    return (
      <div className="mx-auto bg-background rounded-2xl shadow-lg p-6 dark:border border-border">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={backToList}
            className="px-4 py-2 border border-border rounded-lg hover:bg-primary transition-colors font-medium text-primary-foreground flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sets
          </button>
          <h2 className="text-sm font-bold text-secondary-foreground">
            Questions for: {selectedSet?.set_name}
          </h2>
        </div>

        {loadingQuestions ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-primary-foreground">
              Loading questions...
            </span>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12 bg-muted rounded-lg">
            <Package className="w-16 h-16 mx-auto text-primary-foreground mb-4" />
            <h3 className="text-lg font-semibold text-muted mb-2">
              No questions added yet
            </h3>
            <p className="text-muted-foreground">
              Add questions to this set to view them here!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question) => (
              <div
                key={question.id}
                className="border border-border rounded-lg p-6 bg-background"
              >
                <div className="mb-4">
                  <h4 className="font-semibold text-primary text-xl mb-2">
                    Question {questions.indexOf(question) + 1}
                  </h4>
                  {question.question_text && (
                    <p className="text-primary-foreground mb-4">
                      {question.question_text}
                    </p>
                  )}
                  {question.question_image_url && (
                    <img
                      src={`http://localhost:3000/uploads/quizzes/${question.question_image_url}`}
                      alt="Question image"
                      className="max-w-full h-auto rounded-lg mb-4"
                    />
                  )}
                </div>
                {question.options && question.options.length > 0 ? (
                  <ul className="space-y-2">
                    {question.options.map((option) => (
                      <li
                        key={option.id}
                        className={`p-3 rounded-lg border flex items-center gap-3 text-primary-foreground group hover:text-primary-foreground justify-between ${
                          option.is_correct
                            ? "bg-background border-ring text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                            : "bg-muted/50 border-border text-primary-foreground"
                        }`}
                      >
                        {option.option_text}
                        {option.is_correct && (
                          <span className="font-medium text-primary">
                            <CheckCircle2 />
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground italic">
                    No options added yet.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className=" mx-auto bg-background rounded-2xl shadow-lg p-6 dark:border border-border">
      <div className="flex items-center justify-between mb-6 ">
        <h2 className="text-2xl font-bold text-secondary-foreground">
          Created Question Sets
        </h2>
        <button
          onClick={refreshList}
          disabled={isLoading}
          className="px-4 py-2 border border-border rounded-lg hover:bg-primary transition-colors font-medium text-primary-foreground flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Refresh
        </button>
      </div>

      {sets.length === 0 ? (
        <div className="text-center py-12 bg-background  rounded-lg">
          <Package className="w-16 h-16 mx-auto text-primary-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted mb-2">
            No sets created yet
          </h3>
          <p className="text-muted">Head to "Create Set" tab to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sets.map((set) => (
            <div
              key={set.id}
              className="flex justify-between items-center p-4 border border-border rounded-lg hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-primary-foreground text-lg">
                  {set.set_name}
                </h3>
                <div className="flex items-center gap-5 mt-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                    {set.category}
                  </span>
                  <span className="text-sm text-primary-foreground/70 ">
                    Created: {new Date(set.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-primary-foreground/70">
                  ID: {set.id}
                </div>
                <button
                  onClick={() => viewQuestions(set.id)}
                  className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-1 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => deleteSet(set.id)}
                  className="px-3 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors font-medium flex items-center gap-1 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionSetsList;
