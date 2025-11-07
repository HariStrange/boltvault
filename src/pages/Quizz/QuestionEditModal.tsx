import React, { useState } from "react";
import { X, Plus, Trash2, Upload } from "lucide-react";
import api from "../../lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

const QuestionEditModal = ({ question, onClose, onSaved }) => {
  const [text, setText] = useState(question.question_text || "");
  const [existingImage, setExistingImage] = useState(
    question.question_image_url
  );
  const [newImageFile, setNewImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [options, setOptions] = useState(
    question.options?.map((o) => ({
      id: o.id,
      text: o.option_text,
      isCorrect: o.is_correct,
    })) || []
  );

  const updateOption = (idx, field, value) => {
    const arr = [...options];
    if (field === "isCorrect")
      arr.forEach((opt, i) => (opt.isCorrect = i === idx));
    else arr[idx][field] = value;
    setOptions(arr);
  };

  const addOption = () =>
    setOptions([...options, { id: Date.now(), text: "", isCorrect: false }]);

  const removeOption = (idx) => {
    if (options.length <= 2) return toast.error("Minimum 2 options required");
    setOptions(options.filter((_, i) => i !== idx));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    if (!text.trim()) return toast.error("Question text required!");
    try {
      const form = new FormData();
      form.append("question_text", text);
      if (newImageFile) form.append("question_image", newImageFile);
      await api.put(`/api/questions/question/${question.id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await api.put(`/api/options/question/${question.id}/options`, {
        options: options.map((o) => ({
          id: o.id,
          option_text: o.text,
          is_correct: o.isCorrect,
        })),
      });
      toast.success("Updated successfully!");
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="border-b p-4">
          <DialogTitle>Edit Question</DialogTitle>
          {/* <DialogClose asChild>
            <X className="cursor-pointer" />
          </DialogClose> */}
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] p-4 space-y-4">
          <label className="font-semibold text-primary-foreground">
            Question Text
          </label>
          <textarea
            className="w-full mt-2 border p-2 rounded"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <label className="font-semibold text-primary-foreground">
            Question Image
          </label>
          <div className="space-y-2 flex mt-2 justify-center gap-2">
            {existingImage && !preview && (
              <img
                src={`http://localhost:3000/uploads/quizzes/${existingImage}?t=${Date.now()}`}
                className="w-40 h-40 object-cover rounded"
              />
            )}
            {preview && (
              <img src={preview} className="w-40 h-40 object-cover rounded" />
            )}

            <label className="w-full border-2 border-dashed border-ring rounded-lg flex flex-col items-center justify-center p-4 cursor-pointer">
              <div className="bg-primary/20 flex items-center justify-center p-2 rounded-full mb-2">
                <Upload className=" text-primary" />
              </div>
              <span className="text-primary">Choose Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          <h3 className="font-semibold mb-3 mt-3">Options</h3>
          {options.map((opt, idx) => (
            <div key={opt.id} className="flex gap-3 items-center">
              <Input
                value={opt.text}
                onChange={(e) => updateOption(idx, "text", e.target.value)}
                className="m-2"
              />
              <input
                type="radio"
                checked={opt.isCorrect}
                onChange={() => updateOption(idx, "isCorrect", true)}
              />
              <Trash2
                className="text-red-500 cursor-pointer"
                onClick={() => removeOption(idx)}
                size={18}
              />
            </div>
          ))}

          <Button
            variant="ghost"
            className="bg-muted ml-2 hover:bg-primary text-primary-foreground gap-1"
            onClick={addOption}
          >
            <Plus size={16} /> Add Option
          </Button>
        </ScrollArea>
        <div className="border-t p-4 flex justify-end gap-2">
          <Button onClick={submit}>Save</Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionEditModal;
