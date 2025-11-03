import React, { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import api from "../../lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Toaster } from "sonner";

interface SetCreationProps {
  onSetCreated: () => void;
}

const SetCreation: React.FC<SetCreationProps> = ({ onSetCreated }) => {
  const [setName, setSetName] = useState("");
  const [category, setCategory] = useState("driver");
  const [isLoading, setIsLoading] = useState(false);

  const roles = ["driver", "welder", "student"];

  const addSet = async () => {
    if (!setName.trim()) {
      toast.error("Set name is required");
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/api/question-sets", { set_name: setName, category });
      toast.success("Set Created Successfully!");
      setSetName("");
      setCategory("driver");
      onSetCreated();
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error(error.response?.data?.error || "Failed to create set");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=" mx-auto bg-background rounded-2xl shadow-lg dark:border border-border p-6">
      <h2 className="text-2xl font-bold text-primary-foreground mb-6">
        Create Question Set
      </h2>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-primary-foreground mb-2">
            Set Name
          </label>
          <input
            type="text"
            placeholder="Driver Test Set A"
            value={setName}
            onChange={(e) => setSetName(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2 placeholder:text-muted-foreground border border-border rounded-lg outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-foreground mb-2">
            Category (Role)
          </label>
          <Select value={category} onValueChange={setCategory} disabled={isLoading}>
            <SelectTrigger className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button
          onClick={addSet}
          disabled={isLoading || !setName.trim()}
          className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary transition-colors font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Save Set
            </>
          )}
        </button>
      </div>

      <Toaster />
    </div>
  );
};

export default SetCreation;