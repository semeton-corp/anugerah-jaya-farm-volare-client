import React from "react";

const PageNotificationsCard = ({ description }) => {
  return (
    <div>
      <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4  rounded">
        <p className="flex items-center">
          <span className="mr-2 text-lg">⚠️</span>
          {description}
        </p>
      </div>
    </div>
  );
};

export default PageNotificationsCard;
