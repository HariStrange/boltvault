import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  X,
  FileImage,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Shield,
  Camera,
  Edit3,
} from "lucide-react";

const API_BASE = "http://localhost:3000";

interface PassportFormData {
  passport_type: string;
  country_code: string;
  passport_number: string;
  full_name: string;
  nationality: string;
  sex: string;
  date_of_birth: string;
  place_of_birth: string;
  date_of_issue: string;
  date_of_expiry: string;
  place_of_issue: string;
  father_name: string;
  spouse_name: string;
  address: string;
}

interface PassportUploadFormProps {
  onSuccess?: (data: any) => void;
  initialData?: any;
}

export default function PassportUploadForm({
  onSuccess,
  initialData,
}: PassportUploadFormProps) {
  const [form, setForm] = useState<PassportFormData>({
    passport_type: "",
    country_code: "",
    passport_number: "",
    full_name: "",
    nationality: "",
    sex: "",
    date_of_birth: "",
    place_of_birth: "",
    date_of_issue: "",
    date_of_expiry: "",
    place_of_issue: "",
    father_name: "",
    spouse_name: "",
    address: "",
  });

  const [passportPhoto, setPassportPhoto] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [passportPreview, setPassportPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDraggingPassport, setIsDraggingPassport] = useState(false);
  const [isDraggingSignature, setIsDraggingSignature] = useState(false);

  const passportPhotoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        passport_type: initialData.passport_type || "",
        country_code: initialData.country_code || "",
        passport_number: initialData.passport_number || "",
        full_name: initialData.full_name || "",
        nationality: initialData.nationality || "",
        sex: initialData.sex || "",
        date_of_birth: initialData.date_of_birth?.split("T")[0] || "",
        place_of_birth: initialData.place_of_birth || "",
        date_of_issue: initialData.date_of_issue?.split("T")[0] || "",
        date_of_expiry: initialData.date_of_expiry?.split("T")[0] || "",
        place_of_issue: initialData.place_of_issue || "",
        father_name: initialData.father_name || "",
        spouse_name: initialData.spouse_name || "",
        address: initialData.address || "",
      });

      if (initialData.passport_photo)
        setPassportPreview(
          `${API_BASE}/uploads/passports/${initialData.passport_photo}`
        );
      if (initialData.signature)
        setSignaturePreview(
          `${API_BASE}/uploads/passports/${initialData.signature}`
        );
    }
  }, [initialData]);

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    });

  useEffect(() => {
    if (passportPhoto) fileToDataUrl(passportPhoto).then(setPassportPreview);
  }, [passportPhoto]);

  useEffect(() => {
    if (signatureFile) fileToDataUrl(signatureFile).then(setSignaturePreview);
  }, [signatureFile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setError("File too large (max 5MB).");
      return;
    }
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(f.type)) {
      setError("Only JPG/PNG images are allowed.");
      return;
    }
    setter(f);
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent, field: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (field === "passport") setIsDraggingPassport(true);
    else setIsDraggingSignature(true);
  };

  const handleDragLeave = (e: React.DragEvent, field: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (field === "passport") setIsDraggingPassport(false);
    else setIsDraggingSignature(false);
  };

  const handleDrop = (
    e: React.DragEvent,
    setter: React.Dispatch<React.SetStateAction<File | null>>,
    field: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (field === "passport") setIsDraggingPassport(false);
    else setIsDraggingSignature(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File too large (max 5MB).");
      return;
    }
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG/PNG images are allowed.");
      return;
    }
    setter(file);
    setError(null);
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    setUploadProgress(10);

    const token = localStorage.getItem("token");
    const fd = new FormData();

    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (passportPhoto) fd.append("passport_photo", passportPhoto);
    if (signatureFile) fd.append("signature", signatureFile);

    const url = initialData
      ? `${API_BASE}/api/passport/me`
      : `${API_BASE}/api/passport`;
    const method = initialData ? "PUT" : "POST";

    try {
      setUploadProgress(40);
      const res = await fetch(url, {
        method,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });

      setUploadProgress(80);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || "Failed to submit");
      }

      const data = await res.json();
      setUploadProgress(100);
      setSuccess(true);

      setTimeout(() => {
        onSuccess?.(data);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setUploadProgress(0);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card rounded-2xl p-8 shadow-2xl animate-in zoom-in duration-500 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-30" />
              <div className="relative bg-linear-to-br from-green-400 to-emerald-500 rounded-full p-4">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground">Success!</h3>
            <p className="text-muted-foreground">
              {initialData
                ? "Passport updated successfully"
                : "Passport uploaded successfully"}
            </p>
          </div>
        </div>
      )}

      <div className="bg-background rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="relative bg-linear-to-br from-primary/80 via-primary to-primary p-6 sm:p-8 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="hidden md:block absolute top-0 right-0 w-64 h-64 bg-card/5 rounded-full blur-3xl" />
          <div className="hidden md:block absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

          <div className="relative flex items-center gap-4">
            <div className="bg-card/10 backdrop-blur-xl rounded-2xl p-4 border border-border">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                {initialData ? "Update Passport" : "Upload Passport"}
              </h2>
              <p className="text-blue-100 mt-1">
                Secure and encrypted passport information management
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in slide-in-from-top duration-300">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">Error</p>
                <p className="text-destructive/80 text-sm">{error}</p>
              </div>
            </div>
          )}

          {submitting && uploadProgress > 0 && (
            <div className="mb-6 animate-in slide-in-from-top duration-300">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-primary">
                  Uploading...
                </span>
                <span className="text-sm font-bold text-primary">
                  {uploadProgress}%
                </span>
              </div>
              <div className="h-2 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-primary/80 via-primary/90 to-primary rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="group">
              <label className="block text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                Passport Type
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="passport_type"
                value={form.passport_type}
                onChange={handleChange}
                placeholder="e.g., Ordinary, Diplomatic"
                required
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring focus:border-ring focus:border-transparent outline-none transition-all bg-background group-hover:border-ring"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                Country Code
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="country_code"
                value={form.country_code}
                onChange={handleChange}
                placeholder="e.g., IND, USA"
                maxLength={3}
                required
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring focus:border-ring focus:border-transparent outline-none transition-all bg-background focus:bg-background group-hover:border-border uppercase"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                Passport Number
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="passport_number"
                value={form.passport_number}
                onChange={handleChange}
                placeholder="Enter passport number"
                required
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring focus:border-ring focus:border-transparent outline-none transition-all bg-background focus:bg-background group-hover:border-border"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                Full Name
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="As on passport"
                required
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring focus:border-ring focus:border-transparent outline-none transition-all bg-background focus:bg-background group-hover:border-border"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-muted-foreground mb-2">
                Nationality
              </label>
              <input
                type="text"
                name="nationality"
                value={form.nationality}
                onChange={handleChange}
                placeholder="e.g., Indian"
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring focus:border-ring focus:border-transparent outline-none transition-all bg-background focus:bg-background group-hover:border-border"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-muted-foreground mb-2">
                Sex
              </label>
              <select
                name="sex"
                value={form.sex}
                onChange={handleChange as any}
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring focus:border-ring focus:border-transparent outline-none transition-all bg-background focus:bg-background group-hover:border-border cursor-pointer"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-muted-foreground mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring focus:border-ring focus:border-transparent outline-none transition-all bg-background focus:bg-background group-hover:border-border"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-muted-foreground mb-2">
                Place of Birth
              </label>
              <input
                type="text"
                name="place_of_birth"
                value={form.place_of_birth}
                onChange={handleChange}
                placeholder="City, Country"
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring focus:border-ring focus:border-transparent outline-none transition-all bg-background focus:bg-background group-hover:border-border"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-muted-foreground mb-2">
                Date of Issue
              </label>
              <input
                type="date"
                name="date_of_issue"
                value={form.date_of_issue}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring focus:border-ring focus:border-transparent outline-none transition-all bg-background focus:bg-background group-hover:border-border"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-muted-foreground mb-2">
                Date of Expiry
              </label>
              <input
                type="date"
                name="date_of_expiry"
                value={form.date_of_expiry}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring focus:border-ring focus:border-transparent outline-none transition-all bg-background focus:bg-background group-hover:border-border"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-muted-foreground mb-2">
                Place of Issue
              </label>
              <input
                type="text"
                name="place_of_issue"
                value={form.place_of_issue}
                onChange={handleChange}
                placeholder="City, Country"
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring focus:border-ring focus:border-transparent outline-none transition-all bg-background focus:bg-background group-hover:border-border"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-muted-foreground mb-2">
                Father's Name
              </label>
              <input
                type="text"
                name="father_name"
                value={form.father_name}
                onChange={handleChange}
                placeholder="Enter father's name"
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring focus:border-ring focus:border-transparent outline-none transition-all bg-background focus:bg-background group-hover:border-border"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-muted-foreground mb-2">
                Spouse Name
              </label>
              <input
                type="text"
                name="spouse_name"
                value={form.spouse_name}
                onChange={handleChange}
                placeholder="If applicable"
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring focus:border-ring focus:border-transparent outline-none transition-all bg-background focus:bg-background group-hover:border-border"
              />
            </div>

            <div className="md:col-span-2 group">
              <label className="block text-sm font-semibold text-muted-foreground mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter full address"
                rows={3}
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring focus:border-ring focus:border-transparent outline-none transition-all bg-background focus:bg-background group-hover:border-border resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Passport Photo
              </label>
              <div
                onDragOver={(e) => handleDragOver(e, "passport")}
                onDragLeave={(e) => handleDragLeave(e, "passport")}
                onDrop={(e) => handleDrop(e, setPassportPhoto, "passport")}
                onClick={() => passportPhotoInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center cursor-pointer transition-all duration-300 ${
                  isDraggingPassport
                    ? "border-ring bg-blue-50 scale-105"
                    : "border-border bg-linear-to-br from-muted to-background hover:border-ring hover:shadow-lg"
                }`}
              >
                <input
                  ref={passportPhotoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFile(e, setPassportPhoto)}
                  className="hidden"
                />
                {passportPreview ? (
                  <div className="relative group">
                    <img
                      src={passportPreview}
                      alt="Passport preview"
                      className="w-32 h-32 sm:w-40 sm:h-40 object-cover mx-auto rounded-xl border-4 border-card shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPassportPhoto(null);
                        setPassportPreview(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition shadow-lg opacity-0 group-hover:opacity-100 z-40 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-all flex items-center justify-center">
                      <Edit3 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-4">
                    <div className="bg-primary/20 rounded-full p-4 mb-3">
                      <FileImage className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">
                      Click or drag to upload
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG (max 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Signature
              </label>
              <div
                onDragOver={(e) => handleDragOver(e, "signature")}
                onDragLeave={(e) => handleDragLeave(e, "signature")}
                onDrop={(e) => handleDrop(e, setSignatureFile, "signature")}
                onClick={() => signatureInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center cursor-pointer transition-all duration-300 ${
                  isDraggingSignature
                    ? "border-ring bg-blue-50 scale-105"
                    : "border-border bg-linear-to-br from-muted to-background hover:border-ring hover:shadow-lg"
                }`}
              >
                <input
                  ref={signatureInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFile(e, setSignatureFile)}
                  className="hidden"
                />
                {signaturePreview ? (
                  <div className="relative group">
                    <img
                      src={signaturePreview}
                      alt="Signature preview"
                      className="w-full h-24 sm:h-32 object-contain mx-auto rounded-xl border-4 border-card shadow-lg bg-card p-2"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSignatureFile(null);
                        setSignaturePreview(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition shadow-lg opacity-0 group-hover:opacity-100 z-40 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-all flex items-center justify-center">
                      <Edit3 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-4">
                    <div className="bg-primary/20 rounded-full p-4 mb-3">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">
                      Click or drag to upload
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG (max 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border flex  justify-center">
            {/* <button
              type="button"
              onClick={() => window.location.reload()}
              disabled={submitting}
              className="flex-1 px-6 py-3.5 border-2 border-border text-muted-foreground rounded-xl font-semibold hover:bg-background hover:border-border disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Cancel
            </button> */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-3.5 bg-linear-to-r from-primary/80 via-primary/90 to-primary text-foreground rounded-xl font-semibold hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {initialData ? "Updating..." : "Uploading..."}
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    {initialData ? "Update Passport" : "Upload Passport"}
                  </>
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
