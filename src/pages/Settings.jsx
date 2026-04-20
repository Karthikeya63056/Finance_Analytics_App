import React from "react";

export const Settings = () => {
  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="grid gap-6">
        <div className="surface-card rounded-[32px] p-8">
          <h2 className="text-2xl font-semibold text-gray-100">Settings</h2>
          <p className="mt-3 max-w-2xl text-gray-400">
            Customize your experience, manage notifications, and configure
            spending alerts. This section is designed to keep the product
            feeling personal and secure.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="surface-card rounded-[32px] p-8">
            <h3 className="text-lg font-semibold text-gray-100">
              Notifications
            </h3>
            <p className="mt-3 text-gray-400">
              Enable updates for budget limits, recurring payments, and summary
              reminders directly to your inbox.
            </p>
          </div>
          <div className="surface-card rounded-[32px] p-8">
            <h3 className="text-lg font-semibold text-gray-100">Security</h3>
            <p className="mt-3 text-gray-400">
              Manage your app access, session controls, and data backup
              preferences in a single place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
