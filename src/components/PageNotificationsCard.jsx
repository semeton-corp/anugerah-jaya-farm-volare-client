import { AlertTriangle } from "lucide-react";
import React from "react";

const PageNotificationsCard = ({ description }) => {
  return (
    <div>
      <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4  rounded">
        <p className="flex items-center">
          <AlertTriangle className="w-5 h-5 mr-3 text-yellow-600" />
          {description}
        </p>
      </div>
    </div>
  );
};

export default PageNotificationsCard;
