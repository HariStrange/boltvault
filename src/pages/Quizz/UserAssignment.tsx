import React, { useState, useEffect } from "react";
import { Users, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";
import api from "../../lib/api";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  is_verified: boolean;
}

interface QuestionSet {
  id: number;
  set_name: string;
  category: string;
}

interface Assignment {
  set_id: number;
  set_name: string;
}

const UserAssignment: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [sets, setSets] = useState<QuestionSet[]>([]);
  const [assignments, setAssignments] = useState<{ [key: number]: Assignment }>({});
  const [selectedRole, setSelectedRole] = useState<string>("driver");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingSets, setIsLoadingSets] = useState(false);
  const [assigningUserId, setAssigningUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchSets();
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchAssignments();
  }, [selectedRole]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await api.get(
        `/api/users/admin/all-users?role=${selectedRole}`
      );
      setUsers(response.data.users || []);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to fetch users");
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchSets = async () => {
    setIsLoadingSets(true);
    try {
      const response = await api.get("/api/question-sets");
      setSets(response.data.data || []);
    } catch (err: any) {
      toast.error("Failed to fetch sets");
      setSets([]);
    } finally {
      setIsLoadingSets(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await api.get(`/api/quizz/assigned?category=${selectedRole}`);
      const assignMap: { [key: number]: Assignment } = {};
      response.data.data.forEach((a: { user_id: number; question_set_id: number; set_name: string }) => {
        assignMap[a.user_id] = { set_id: a.question_set_id, set_name: a.set_name };
      });
      setAssignments(assignMap);
    } catch (err: any) {
      console.error("Failed to fetch assignments:", err);
    }
  };

  const assignSetToUser = async (userId: number) => {
    setAssigningUserId(userId);

    const isAssigned = !!assignments[userId];
    try {
      const response = await api.post("/api/quizz/assign-set", {
        user_id: userId,
        category: selectedRole,
      });

      const newSetId = response.data.assigned.question_set_id;
      const newSet = sets.find((s) => s.id === newSetId);
      if (newSet) {
        setAssignments((prev) => ({
          ...prev,
          [userId]: { set_id: newSetId, set_name: newSet.set_name },
        }));
      }

      toast.success(isAssigned ? "Question set re-assigned successfully!" : "Question set assigned successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to assign question set");
    } finally {
      setAssigningUserId(null);
    }
  };

  const availableSetsForRole = sets.filter(
    (set) => set.category === selectedRole
  );

  return (
    <div className="w-full mx-auto">
      <div className="bg-background rounded-2xl shadow-lg p-4 sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-primary-foreground mb-2 flex items-center gap-2 text-wrap">
            <Users className="w-6 h-6" />
            Assign Question Sets to Users
          </h2>
          <p className="text-primary-foreground text-wrap">
            Select a role and assign random question sets to users
          </p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center flex-wrap gap-2 sm:gap-0">
          <label className="block text-sm font-medium text-muted-foreground">
            Filter by Role:
          </label>
          <div className="flex gap-2 w-full sm:w-auto">
            {["driver", "welder", "student"].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all flex-1 sm:flex-none cursor-pointer ${
                  selectedRole === role
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-primary/80 hover:text-primary-foreground"
                }`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 p-4 bg-muted border border-border rounded-lg">
          <p className="text-sm text-primary-foreground text-wrap">
            <strong className="text-primary">Available sets for {selectedRole} :</strong>{" "}
            {isLoadingSets ? (
              <span className="text-primary">Loading...</span>
            ) : availableSetsForRole.length > 0 ? (
              <span>
                {availableSetsForRole.length} set(s) (
                {availableSetsForRole.map((s) => s.set_name).join(", ")})
              </span>
            ) : (
              <span className="text-destructive">
                No sets available. Create a set for this role first!
              </span>
            )}
          </p>
        </div>

        {isLoadingUsers ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-primary">Loading users...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 bg-muted rounded-lg">
            <Users className="w-16 h-16 mx-auto text-primary mb-4" />
            <h3 className="text-lg font-semibold text-primary-foreground mb-2">
              No {selectedRole}s found
            </h3>
            <p className="text-destructive">
              There are no verified users with the {selectedRole} role.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => {
              const userAssignment = assignments[user.id];
              const isAssigned = !!userAssignment;
              return (
                <div
                  key={user.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg hover:border-ring transition-colors gap-3 sm:gap-0"
                >
                  <div className="flex items-center gap-3 mb-3 sm:mb-0">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground font-semibold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-primary-foreground truncate">
                        {user.name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.is_verified
                            ? "bg-primary text-primary-foreground"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {user.is_verified ? "Verified" : "Unverified"}
                      </span>
                      {isAssigned && (
                        <span className="text-xs text-muted-foreground">
                          Assigned: {userAssignment.set_name}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => assignSetToUser(user.id)}
                      disabled={
                        assigningUserId === user.id ||
                        availableSetsForRole.length === 0
                      }
                      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto ${
                        availableSetsForRole.length === 0
                          ? "bg-muted text-muted-foreground cursor-not-allowed"
                          : "bg-primary text-primary-foreground shadow-md hover:shadow-lg"
                      }`}
                    >
                      {assigningUserId === user.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Assigning...
                        </>
                      ) : (
                        isAssigned ? "Re-assign Set" : "Assign Set"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Toaster />
    </div>
  );
};

export default UserAssignment;