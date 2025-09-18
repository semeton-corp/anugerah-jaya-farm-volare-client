import React from "react";
import PageNotificationsCard from "./PageNotificationsCard";

const PageNotificationsSection = ({ pageNotifications }) => {
  return (
    <div>
      <div className="max-h-72 overflow-y-auto flex flex-col gap-3">
        {pageNotifications &&
          pageNotifications.map((item, index) => (
            <PageNotificationsCard key={index} description={item.description} />
          ))}
      </div>
    </div>
  );
};

export default PageNotificationsSection;
