import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GENRES } from "@/lib/mock-data";

export const Route = createFileRoute("/account/mailing")({
  component: Mailing,
});

const NOTIFICATION_PREFS = [
  "Updates from labels you're following",
  "Updates from your favorite tracks",
  "New Arrivals",
  "Offers & Discounts",
  "Tips & Tricks",
  "Reminders",
  "New Features",
  "FAQ",
  "Feature Spotlight",
];

function Mailing() {
  const [userType, setUserType] = useState("Buyer");
  const [notifications, setNotifications] = useState<string[]>(NOTIFICATION_PREFS);
  const [genres, setGenres] = useState<string[]>(GENRES);

  const toggleNotification = (pref: string) => {
    setNotifications((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const toggleGenre = (genre: string) => {
    setGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mailing</h1>
        <button className="h-10 px-6 rounded-full bg-primary text-primary-foreground font-medium hover:bg-[--color-primary-hover] transition">
          Save Changes
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
        {/* User Type */}
        <div>
          <label className="block text-sm font-medium mb-2">User Type</label>
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            className="w-48 h-10 px-4 rounded-xl border border-border bg-background"
          >
            <option>Buyer</option>
            <option>Seller</option>
            <option>Both</option>
          </select>
        </div>

        {/* Notification Preferences */}
        <div>
          <h3 className="font-semibold mb-3">
            I am interested in these categories (all/none)
          </h3>
          <div className="space-y-2">
            {NOTIFICATION_PREFS.map((pref) => (
              <label key={pref} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.includes(pref)}
                  onChange={() => toggleNotification(pref)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm">{pref}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Genre Preferences */}
        <div>
          <h3 className="font-semibold mb-3">
            I am interested in these genres (all/none)
          </h3>
          <div className="grid md:grid-cols-2 gap-2">
            {GENRES.map((genre) => (
              <label key={genre} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={genres.includes(genre)}
                  onChange={() => toggleGenre(genre)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm">{genre}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
