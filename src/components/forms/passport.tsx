import React, { useState, useEffect } from "react";

// shadcn/ui components (assumes these are available in your project)
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils"; // utility to combine classes (shadcn pattern)

// Small helper to preview images
const fileToDataUrl = (file: File) =>
  new Promise<string | null>((resolve) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });

export default function PassportUploadForm({
  onSuccess,
}: {
  onSuccess?: (data: any) => void;
}) {
  const [form, setForm] = useState({
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
  const [themeDark, setThemeDark] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (passportPhoto) fileToDataUrl(passportPhoto).then(setPassportPreview);
    else setPassportPreview(null);
  }, [passportPhoto]);

  useEffect(() => {
    if (signatureFile) fileToDataUrl(signatureFile).then(setSignaturePreview);
    else setSignaturePreview(null);
  }, [signatureFile]);

  // simple validation helper
  const validate = () => {
    if (
      !form.passport_type ||
      !form.country_code ||
      !form.passport_number ||
      !form.full_name
    ) {
      setError(
        "Please fill required passport fields: type, country code, number and full name."
      );
      return false;
    }

    // passport photo and signature recommended
    return true;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setError(null);
  };

  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (f: File | null) => void
  ) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      // small client-side validation (size < 5MB)
      if (f.size > 5 * 1024 * 1024) {
        setError("File too large. Max 5MB allowed.");
        return setter(null);
      }
      const allowed = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowed.includes(f.type)) {
        setError("Invalid file type. Only JPG/PNG allowed.");
        return setter(null);
      }
      setter(f);
      setError(null);
    } else {
      setter(null);
    }
  };

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const fd = new FormData();

      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, String(v));
      });

      if (passportPhoto) fd.append("passport_photo", passportPhoto);
      if (signatureFile) fd.append("signature", signatureFile);

      const res = await fetch("/api/passport", {
        method: "POST",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err?.message || "Upload failed");
      }

      const data = await res.json();
      setSubmitting(false);
      setError(null);
      if (onSuccess) onSuccess(data);
      alert("Passport uploaded successfully");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <div className={cn("w-full max-w-3xl mx-auto p-4")}>
      <Card>
        <CardHeader>
          <CardTitle>Passport Upload</CardTitle>
        </CardHeader>

        <form onSubmit={submit}>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Passport Type</Label>
                <Input
                  name="passport_type"
                  value={form.passport_type}
                  onChange={handleChange}
                  placeholder="e.g. Ordinary"
                  required
                />
              </div>

              <div>
                <Label>Country Code</Label>
                <Input
                  name="country_code"
                  value={form.country_code}
                  onChange={handleChange}
                  placeholder="e.g. IND"
                  required
                />
              </div>

              <div>
                <Label>Passport Number</Label>
                <Input
                  name="passport_number"
                  value={form.passport_number}
                  onChange={handleChange}
                  placeholder="Passport number"
                  required
                />
              </div>

              <div>
                <Label>Full Name (as on passport)</Label>
                <Input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Full name"
                  required
                />
              </div>

              <div>
                <Label>Nationality</Label>
                <Input
                  name="nationality"
                  value={form.nationality}
                  onChange={handleChange}
                  placeholder="Nationality"
                />
              </div>

              <div>
                <Label>Sex</Label>
                <Select
                  onValueChange={(v) => setForm((s) => ({ ...s, sex: v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  name="date_of_birth"
                  value={form.date_of_birth}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Place of Birth</Label>
                <Input
                  name="place_of_birth"
                  value={form.place_of_birth}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Date of Issue</Label>
                <Input
                  type="date"
                  name="date_of_issue"
                  value={form.date_of_issue}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Date of Expiry</Label>
                <Input
                  type="date"
                  name="date_of_expiry"
                  value={form.date_of_expiry}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Place of Issue</Label>
                <Input
                  name="place_of_issue"
                  value={form.place_of_issue}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Father's Name</Label>
                <Input
                  name="father_name"
                  value={form.father_name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Spouse Name</Label>
                <Input
                  name="spouse_name"
                  value={form.spouse_name}
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-2">
                <Label>Address</Label>
                <Textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Passport Photo (JPG/PNG)</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFile(e, setPassportPhoto)}
                />
                {passportPreview && (
                  <div className="mt-2">
                    <Avatar>
                      <img
                        src={passportPreview}
                        alt="passport preview"
                        className="object-cover w-32 h-32 rounded"
                      />
                    </Avatar>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label>Signature (JPG/PNG)</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFile(e, setSignatureFile)}
                />
                {signaturePreview && (
                  <div className="mt-2">
                    <img
                      src={signaturePreview}
                      alt="signature preview"
                      className="object-contain w-48 h-20 border rounded"
                    />
                  </div>
                )}
              </div>
            </div>

            {error && <div className="text-sm text-rose-600 mt-4">{error}</div>}
          </CardContent>

          <CardFooter className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Choose files up to 5MB. JPG/PNG only.
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => window.location.reload()}
                disabled={submitting}
              >
                Reset
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Uploading..." : "Upload Passport"}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
