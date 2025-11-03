import React, { useEffect, useState } from "react";
import {
  FileCheck2,
  Loader2,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Shield,
  ChevronRight,
  Download,
  RefreshCw,
  SignatureIcon,
} from "lucide-react";
import PassportUploadForm from "@/components/forms/passport";

const API_URL = "http://localhost:3000/api/passport";

const PassportUploadPage: React.FC = () => {
  const [passport, setPassport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchPassport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPassport(data.passport);
      } else {
        setPassport(null);
      }
    } catch (err) {
      console.error("Fetch passport failed:", err);
      setPassport(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPassport();
  }, [refresh]);

  const handleDelete = async () => {
    if (!passport?.id) return;

    try {
      const res = await fetch(`${API_URL}/${passport.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPassport(null);
        setEditMode(false);
        setDeleteConfirm(false);
      }
    } catch {
      alert("Error deleting passport");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-60-to-br from-muted to-background">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20" />
            <div className="relative bg-linear-to-br from-blue-500 to-cyan-500 rounded-full p-4">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          </div>
          <p className="mt-4 text-muted-foreground font-medium">
            Loading passport details...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-in slide-in-from-top duration-500">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            Passport Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your passport information securely and efficiently
          </p>
        </div>

        {/* No Passport - Show Upload Form */}
        {!passport && !editMode && (
          <div className="animate-in fade-in slide-in-from-bottom duration-700">
            <PassportUploadForm
              onSuccess={() => {
                setRefresh((r) => r + 1);
              }}
            />
          </div>
        )}

        {/* Passport Exists - Show Details */}
        {passport && !editMode && (
          <div className="animate-in fade-in slide-in-from-bottom duration-700">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-card rounded-2xl p-6 shadow-lg border border-border hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      Status
                    </p>
                    <p className="text-2xl font-bold text-chart-1 mt-1">
                      Active
                    </p>
                  </div>
                  <div className="bg-chart-1/20 rounded-full p-3">
                    <Shield className="w-6 h-6 text-chart-1" />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-lg border border-border hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      Expires
                    </p>
                    <p className="text-2xl font-bold text-chart-2 mt-1">
                      {passport.date_of_expiry
                        ? new Date(passport.date_of_expiry).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "N/A"}
                    </p>
                  </div>
                  <div className="bg-chart-2/20 rounded-full p-3">
                    <Calendar className="w-6 h-6 text-chart-2" />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-lg border border-border hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      Country
                    </p>
                    <p className="text-2xl font-bold text-chart-3 mt-1 uppercase">
                      {passport.country_code || "N/A"}
                    </p>
                  </div>
                  <div className="bg-chart-3/20 rounded-full p-3">
                    <MapPin className="w-6 h-6 text-chart-3" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Passport Card */}
            <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
              {/* Card Header */}
              <div className="relative bg-linear-to-br from-primary/80 via-primary/90 to-primary p-4 sm:p-6 md:p-8">
                <div className="absolute inset-0 bg-grid-white/10 " />
                <div className="hidden md:block absolute top-0 right-0 w-64 h-64 bg-card/5 rounded-full blur-3xl" />
                <div className="relative flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 sm:gap-0">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 w-full sm:w-auto text-center sm:text-left">
                    {passport.passport_photo && (
                      <img
                        src={`http://localhost:3000/uploads/passports/${passport.passport_photo}`}
                        alt="passport"
                        className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl border-4 border-foreground shadow-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1 md:mt-3">
                      <h2 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
                        {passport.full_name}
                      </h2>
                      <p className="text-secondary-foreground mt-1 flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base">
                        <FileCheck2 className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          {passport.passport_type} Passport
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="text-center sm:text-right min-w-0 flex-1 sm:flex-none">
                    <p className="text-secondary-foreground text-xs sm:text-sm">
                      Passport Number
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground mt-1 truncate">
                      {passport.passport_number}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <User className="w-5 h-5 text-chart-1" />
                      Personal Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                          Nationality
                        </p>
                        <p className="text-foreground font-medium mt-1">
                          {passport.nationality || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                          Sex
                        </p>
                        <p className="text-foreground font-medium mt-1">
                          {passport.sex || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                          Date of Birth
                        </p>
                        <p className="text-foreground font-medium mt-1">
                          {passport.date_of_birth
                            ? new Date(
                                passport.date_of_birth
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                          Place of Birth
                        </p>
                        <p className="text-foreground font-medium mt-1">
                          {passport.place_of_birth || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Passport Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-chart-2" />
                      Passport Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                          Date of Issue
                        </p>
                        <p className="text-foreground font-medium mt-1">
                          {passport.date_of_issue
                            ? new Date(
                                passport.date_of_issue
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                          Date of Expiry
                        </p>
                        <p className="text-foreground font-medium mt-1">
                          {passport.date_of_expiry
                            ? new Date(
                                passport.date_of_expiry
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                          Place of Issue
                        </p>
                        <p className="text-foreground font-medium mt-1">
                          {passport.place_of_issue || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Family Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <User className="w-5 h-5 text-chart-3" />
                      Family Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                          Father's Name
                        </p>
                        <p className="text-foreground font-medium mt-1">
                          {passport.father_name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                          Spouse Name
                        </p>
                        <p className="text-foreground font-medium mt-1">
                          {passport.spouse_name || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2 lg:col-span-3 space-y-4">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-chart-4" />
                      Address
                    </h3>
                    <p className="text-muted-foreground">
                      {passport.address || "No address provided"}
                    </p>
                  </div>

                  {/* Signature */}
                  {passport.signature && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <h3 className="text-lg font-bold text-foreground gap-2 flex items-center mb-3">
                        <SignatureIcon className="w-5 h-5 text-chart-5" />
                        Signature
                      </h3>
                      <div className="bg-background rounded-xl p-4 sm:p-6 border-2 border-border inline-block">
                        <img
                          src={`http://localhost:3000/uploads/passports/${passport.signature}`}
                          alt="signature"
                          className="h-16 sm:h-20 object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="bg-background px-4 sm:px-8 py-6 border-t border-border flex flex-col sm:flex-row justify-between items-stretch sm:items-center">
                <div className="text-sm text-muted-foreground mb-3 sm:mb-0">
                  Last updated:{" "}
                  {new Date(
                    passport.updated_at || passport.created_at
                  ).toLocaleDateString()}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setRefresh((r) => r + 1)}
                    className="w-full sm:w-auto px-4 py-2.5 border-2 border-border text-muted-foreground rounded-xl font-semibold hover:bg-card hover:border-border transition-all flex items-center gap-2 justify-center"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                  <button
                    onClick={() => setEditMode(true)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-primary text-foreground rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 justify-center"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-linear-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Mode */}
        {editMode && (
          <div className="animate-in fade-in slide-in-from-bottom duration-700">
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground font-medium flex items-center gap-2 transition"
              >
                ← Back to View
              </button>
            </div>
            <PassportUploadForm
              initialData={passport}
              onSuccess={() => {
                setEditMode(false);
                setRefresh((r) => r + 1);
              }}
            />
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-card rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 animate-in zoom-in duration-300">
              <div className="text-center">
                <div className="bg-red-100 rounded-full p-4 inline-block mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Delete Passport?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Are you sure you want to delete your passport record? This
                  action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="flex-1 px-6 py-3 border-2 border-border text-muted-foreground rounded-xl font-semibold hover:bg-background transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-6 py-3 bg-linear-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PassportUploadPage;
