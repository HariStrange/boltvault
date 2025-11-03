import React, { useState } from "react";
import { Plus, Trash2, Loader2, UploadCloud, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Toaster } from "sonner";
import api from "../../lib/api";

interface QuestionSet {
  id: number;
  set_name: string;
  category: string;
}

interface Option {
  text: string;
  isCorrect: boolean;
}

interface QuestionCreationProps {
  sets: QuestionSet[];
  onQuestionCreated: () => void;
}

const QuestionCreation: React.FC<QuestionCreationProps> = ({
  sets,
  onQuestionCreated,
}) => {
  const [questionSetId, setQuestionSetId] = useState("");
  const [question, setQuestion] = useState("");
  const [questionImage, setQuestionImage] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [options, setOptions] = useState<Option[]>([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const addQuestion = async () => {
    const formData = new FormData();
    formData.append("question_set_id", questionSetId);
    formData.append("question_text", question);
    formData.append("question_type", questionImage ? "image" : "text");
    if (questionImage) formData.append("question_image", questionImage);

    try {
      const res = await api.post("/api/questions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data.id;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to add question");
    }
  };

  const addOptionRow = () => {
    setOptions([...options, { text: "", isCorrect: false }]);
  };

  const updateOption = (index: number, field: keyof Option, value: string | boolean) => {
    const newOptions = [...options];
    if (field === "isCorrect" && value === true) {
      newOptions.forEach((opt, idx) => {
        opt.isCorrect = idx === index;
      });
    } else {
      newOptions[index] = { ...newOptions[index], [field]: value };
    }
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const saveAll = async () => {
    if (!questionSetId || !question.trim()) {
      toast.error("Set and question text are required");
      return;
    }

    if (options.length < 2 || options.some((opt) => !opt.text.trim())) {
      toast.error("At least 2 options with text required");
      return;
    }
    if (options.filter((opt) => opt.isCorrect).length !== 1) {
      toast.error("Exactly one option must be correct");
      return;
    }

    setIsLoading(true);
    try {
      const qId = await addQuestion();
      await api.post("/api/options", { question_id: qId, options });
      toast.success("Question + Options Saved Successfully!");
      setQuestion("");
      setQuestionSetId("");
      setQuestionImage(null);
      setOptions([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ]);
      onQuestionCreated();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setQuestionImage(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  return (
    <div className="mx-auto bg-background rounded-2xl border border-border shadow-lg p-6">
      <h2 className="text-2xl font-bold text-primary-foreground mb-6">
        Add Question
      </h2>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Select Set
          </label>
          <Select value={questionSetId} onValueChange={setQuestionSetId}>
            <SelectTrigger className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 outline-none cursor-pointer focus:ring-1 focus:ring-primary">
              <SelectValue placeholder="Choose a set" />
            </SelectTrigger>
            <SelectContent>
              {sets.length === 0 ? (
                <SelectItem value="" disabled>
                  No sets available – create one first!
                </SelectItem>
              ) : (
                sets.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {s.set_name} ({s.category})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Question Text
          </label>
          <textarea
            placeholder="Enter the question here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Question Image (Optional)
          </label>

          {!questionImage ? (
            <div
              className={`w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition-all flex flex-col items-center gap-2
                ${dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/60"}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={() => setDragActive(false)}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <UploadCloud className="h-10 w-10 opacity-80" />
              <p className="text-sm text-muted-foreground">
                Drag & Drop or click to browse
              </p>
            </div>
          ) : (
            <div className="relative w-fit">
              <img
                src={URL.createObjectURL(questionImage)}
                className="rounded-lg max-h-40 object-contain border shadow"
              />
              <button
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700"
                onClick={() => setQuestionImage(null)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={(e) => setQuestionImage(e.target.files?.[0] ?? null)}
            className="hidden"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Options
          </label>
          {options.map((opt, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 border border-border p-3 rounded-lg mb-3"
            >
              <input
                value={opt.text}
                onChange={(e) => updateOption(idx, "text", e.target.value)}
                placeholder={`Option ${idx + 1}`}
                className="flex-1 px-3 py-2 outline-none rounded-lg focus:ring-1 focus:ring-primary placeholder:text-muted-foreground placeholder:text-sm"
              />
              <Switch
                checked={opt.isCorrect}
                onCheckedChange={(checked) =>
                  updateOption(idx, "isCorrect", checked)
                }
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(idx)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={addOptionRow}
              className="w-full px-4 py-3 text-primary-foreground rounded-lg bg-primary transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Add Option
            </button>

            <button
              onClick={saveAll}
              disabled={isLoading}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg cursor-pointer transition-colors font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Question"
              )}
            </button>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
};

export default QuestionCreation;
