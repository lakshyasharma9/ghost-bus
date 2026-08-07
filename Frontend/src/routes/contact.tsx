import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supportAPI } from "@/lib/api-client";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — GhostBus Support" },
      { name: "description", content: "Get in touch with GhostBus support team. We're here to help with any questions about ghost production, track purchases, or technical issues." },
    ],
  }),
  component: ContactPage,
});

const USER_TYPES = ["Buyer", "Seller", "Visitor", "Other"];

const CATEGORIES = [
  { value: "GENERAL_INQUIRY", label: "General Inquiry" },
  { value: "TECHNICAL_SUPPORT", label: "Technical Support" },
  { value: "BILLING_PAYMENT", label: "Billing & Payment" },
  { value: "ACCOUNT_ISSUE", label: "Account Issue" },
  { value: "TRACK_ISSUE", label: "Track Issue" },
  { value: "LEGAL_COPYRIGHT", label: "Legal & Copyright" },
  { value: "SELLER_SUPPORT", label: "Seller Support" },
  { value: "BUG_REPORT", label: "Bug Report" },
  { value: "FEATURE_REQUEST", label: "Feature Request" },
  { value: "OTHER", label: "Other" },
];

const PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

function ContactPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: "",
    company: "",
    userType: user ? (user.role === "SELLER" ? "Seller" : "Buyer") : "Visitor",
    subject: "",
    category: "GENERAL_INQUIRY",
    priority: "MEDIUM",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }

    if (!formData.subject.trim() || formData.subject.trim().length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      const response = await supportAPI.createTicket(formData);
      setTicketNumber(response.data.data.ticketNumber);
      setSubmitted(true);
      toast.success("Support ticket submitted successfully!");
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.response?.data?.message || "Failed to submit ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container-app pt-12 pb-24 max-w-2xl mx-auto">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-green-100 grid place-items-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight mb-3">Thank You!</h1>
            <p className="text-lg text-muted-foreground">Your support ticket has been submitted successfully.</p>
          </div>
          <div className="p-6 bg-card border border-border rounded-2xl">
            <div className="label-eyebrow mb-2">Ticket Number</div>
            <div className="text-2xl font-bold text-primary">{ticketNumber}</div>
            <p className="text-sm text-muted-foreground mt-3">
              We've received your message and will respond within 24-48 hours. Please save this ticket number for future reference.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate({ to: "/" })} variant="outline">
              Back to Home
            </Button>
            {user && (
              <Button onClick={() => navigate({ to: "/account" })}>
                View My Tickets
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app pt-12 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="label-eyebrow mb-3">Support</div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have a question or need assistance? Fill out the form below and our support team will get back to you within 24-48 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-10">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="p-6 bg-card border border-border rounded-2xl">
              <Mail className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Email</h3>
              <a href="mailto:support@ghostbus.audio" className="text-sm text-muted-foreground hover:text-primary">
                support@ghostbus.audio
              </a>
            </div>

            <div className="p-6 bg-accent rounded-2xl">
              <AlertCircle className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-semibold text-sm mb-1">Response Time</h3>
              <p className="text-xs text-muted-foreground">
                We typically respond within 24-48 hours. Urgent tickets are prioritized.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="p-5 md:p-8 bg-card border border-border rounded-2xl space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    placeholder="John Doe"
                    className={errors.fullName ? "border-destructive" : ""}
                  />
                  {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="john@example.com"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+1 (234) 567-8900"
                  />
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <Label htmlFor="company">Company / Organization</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>

              {/* User Type */}
              <div className="space-y-2">
                <Label htmlFor="userType">I am a *</Label>
                <Select value={formData.userType} onValueChange={(val) => handleChange("userType", val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  placeholder="Brief description of your inquiry"
                  className={errors.subject ? "border-destructive" : ""}
                />
                {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(val) => handleChange("category", val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level *</Label>
                  <Select value={formData.priority} onValueChange={(val) => handleChange("priority", val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((pri) => (
                        <SelectItem key={pri.value} value={pri.value}>
                          {pri.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Message / Description *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  placeholder="Please provide as much detail as possible about your inquiry..."
                  rows={6}
                  className={errors.message ? "border-destructive" : ""}
                />
                {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                <p className="text-xs text-muted-foreground">{formData.message.length} / 5000 characters</p>
              </div>

              {/* Submit Button */}
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Support Ticket
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By submitting this form, you agree to our <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
