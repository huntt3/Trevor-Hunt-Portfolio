import React, { useState, useEffect, useMemo } from "react";
import ProjectCard from "./ProjectCard";
import FilterBar from "./FilterBar";
import type { ProjectData } from "../types/project";

const Portfolio: React.FC = () => {
  const [projectData, setProjectData] = useState<ProjectData>({});
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/projectWebsites.json");
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data: ProjectData = await response.json();
        setProjectData(data);
      } catch (err) {
        setError("Failed to load projects");
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Get all projects from all categories
  const allProjects = useMemo(() => {
    return Object.values(projectData).flat();
  }, [projectData]);

  // Get all unique tools
  const allTools = useMemo(() => {
    const toolsSet = new Set<string>();
    allProjects.forEach((project) => {
      project.toolsUsed.forEach((tool) => toolsSet.add(tool));
    });
    return Array.from(toolsSet).sort();
  }, [allProjects]);

  // Filter projects based on selected tools
  const filteredProjects = useMemo(() => {
    if (selectedTools.length === 0) {
      return allProjects;
    }

    return allProjects.filter((project) =>
      selectedTools.some((tool) => project.toolsUsed.includes(tool))
    );
  }, [allProjects, selectedTools]);

  const handleToolToggle = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const handleClearFilters = () => {
    setSelectedTools([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Trevor Hunt</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome to my portfolio!
          </p>
        </header>

        <FilterBar
          tools={allTools}
          selectedTools={selectedTools}
          onToolToggle={handleToolToggle}
          onClearFilters={handleClearFilters}
        />

        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredProjects.length} of {allProjects.length} projects
            {selectedTools.length > 0 && (
              <span> filtered by: {selectedTools.join(", ")}</span>
            )}
          </p>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={`${project.title}-${index}`}
                project={project}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              No projects found matching your selected filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
