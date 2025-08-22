import React from "react";
import type { Project } from "../types/project";

interface ProjectCardProps {
  project: Project;
  onViewFamilyTree?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onViewFamilyTree,
}) => {
  // Handler for card click
  const handleCardClick = () => {
    if (
      project.title === "Family Tree Database" &&
      typeof onViewFamilyTree === "function"
    ) {
      onViewFamilyTree();
    } else {
      window.open(project.link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-transparent hover:border-blue-400 transform hover:scale-105 transition-transform duration-200 cursor-pointer"
      tabIndex={0}
      role="button"
      aria-label={`View ${project.title}`}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleCardClick();
      }}
    >
      {project.image && (
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
          {!project.image && (
            <span className="text-gray-400">No image available</span>
          )}
        </div>
      )}

      <div className="p-6 flex flex-col h-full">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {project.title}
        </h3>

        <p className="text-gray-600 min-h-[3.5rem] mb-2 line-clamp-3">
          {project.description || "No description available"}
        </p>

        <div className="flex-1 flex items-center">
          <div className="flex flex-wrap gap-2 w-full justify-center mb-4">
            {project.toolsUsed.map((tool, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-auto">
          {project.title === "Family Tree Database" &&
          typeof onViewFamilyTree === "function" ? (
            <button
              type="button"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300"
              onClick={(e) => {
                e.stopPropagation();
                onViewFamilyTree();
              }}
            >
              View Project
            </button>
          ) : (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              View Project
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
