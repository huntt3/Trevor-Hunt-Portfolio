import React, { useState, useEffect, useMemo } from "react";
import ProjectCard from "./ProjectCard";
import CertificationCard from "./CertificationCard";
import FilterBar from "./FilterBar";
import type { ProjectData, CertificationData } from "../types/project";

const Portfolio: React.FC = () => {
  const [projectData, setProjectData] = useState<ProjectData>({});
  const [certificationData, setCertificationData] = useState<CertificationData>(
    {}
  );
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsResponse, certificationsResponse] = await Promise.all([
          fetch("/projectWebsites.json"),
          fetch("/certifications.json"),
        ]);

        if (!projectsResponse.ok || !certificationsResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const projects: ProjectData = await projectsResponse.json();
        const certifications: CertificationData =
          await certificationsResponse.json();

        setProjectData(projects);
        setCertificationData(certifications);
      } catch (err) {
        setError("Failed to load data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get all projects from all categories
  const allProjects = useMemo(() => {
    return Object.values(projectData).flat();
  }, [projectData]);

  // Get all certifications from all categories
  const allCertifications = useMemo(() => {
    return Object.values(certificationData).flat();
  }, [certificationData]);

  // Get all tools and sort by number of times used (descending)
  const allTools = useMemo(() => {
    const toolCounts: Record<string, number> = {};
    allProjects.forEach((project) => {
      project.toolsUsed.forEach((tool) => {
        toolCounts[tool] = (toolCounts[tool] || 0) + 1;
      });
    });
    allCertifications.forEach((certification) => {
      certification.toolsUsed.forEach((tool) => {
        toolCounts[tool] = (toolCounts[tool] || 0) + 1;
      });
    });
    return Object.entries(toolCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([tool]) => tool);
  }, [allProjects, allCertifications]);

  // Filter projects based on selected tools
  const filteredProjects = useMemo(() => {
    if (selectedTools.length === 0) {
      return allProjects;
    }

    return allProjects.filter((project) =>
      selectedTools.some((tool) => project.toolsUsed.includes(tool))
    );
  }, [allProjects, selectedTools]);

  // Filter certifications based on selected tools
  const filteredCertifications = useMemo(() => {
    if (selectedTools.length === 0) {
      return allCertifications;
    }

    return allCertifications.filter((certification) =>
      selectedTools.some((tool) => certification.toolsUsed.includes(tool))
    );
  }, [allCertifications, selectedTools]);

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
          <p className="text-gray-600">Loading portfolio...</p>
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

        {/* Projects Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Projects</h2>

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
                  key={`project-${project.title}-${index}`}
                  project={project}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                No projects found matching your selected filters.
              </p>
            </div>
          )}
        </section>

        {/* Certifications Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Certifications
          </h2>

          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredCertifications.length} of{" "}
              {allCertifications.length} certifications
              {selectedTools.length > 0 && (
                <span> filtered by: {selectedTools.join(", ")}</span>
              )}
            </p>
          </div>

          {filteredCertifications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCertifications.map((certification, index) => (
                <CertificationCard
                  key={`certification-${certification.title}-${index}`}
                  certification={certification}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                No certifications found matching your selected filters.
              </p>
            </div>
          )}
        </section>

        {/* Clear Filters Button */}
        {selectedTools.length > 0 &&
          filteredProjects.length === 0 &&
          filteredCertifications.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                No items found matching your selected filters.
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
