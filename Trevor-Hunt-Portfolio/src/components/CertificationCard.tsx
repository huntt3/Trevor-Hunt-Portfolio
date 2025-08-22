import React from "react";
import type { Certification } from "../types/project";

interface CertificationCardProps {
  certification: Certification;
}

const CertificationCard: React.FC<CertificationCardProps> = ({
  certification,
}) => {
  // Handler for card click
  const handleCardClick = () => {
    window.open(certification.link, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-transparent hover:border-green-400 transform hover:scale-105 transition-transform duration-200 cursor-pointer"
      tabIndex={0}
      role="button"
      aria-label={`View ${certification.title}`}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleCardClick();
      }}
    >
      {certification.image && (
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          <img
            src={certification.image}
            alt={certification.title}
            className="max-h-40 max-w-full object-contain mx-auto"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
          {!certification.image && (
            <span className="text-gray-400">No image available</span>
          )}
        </div>
      )}

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {certification.title}
        </h3>

        {certification.description && (
          <p className="text-gray-600 mb-4 line-clamp-3">
            {certification.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {certification.toolsUsed.map((tool, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium"
            >
              {tool}
            </span>
          ))}
        </div>

        <a
          href={certification.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          View Credential
        </a>
      </div>
    </div>
  );
};

export default CertificationCard;
