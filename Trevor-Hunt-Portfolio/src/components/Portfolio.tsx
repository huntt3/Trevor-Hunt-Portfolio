import React, { useState, useEffect, useMemo, useRef } from "react";
import ProjectCard from "./ProjectCard";
import CertificationCard from "./CertificationCard";
import FilterBar from "./FilterBar";
import type { ProjectData, CertificationData } from "../types/project";

const Portfolio: React.FC = () => {
  const filterBarRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!filterBarRef.current) return;
      const rect = filterBarRef.current.getBoundingClientRect();
      setIsSticky(rect.top <= 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  // Load huntt3_Pt1Lab5.txt for modal
  const showFamilyTreeModal = async () => {
    const response = await fetch("/huntt3_Pt1Lab5.txt");
    const text = await response.text();
    setModalContent(text);
    setModalOpen(true);
  };

  // Show Capsim.xlsx modal
  const showCapsimModal = () => {
    setModalContent("CAPSIM_XLSX");
    setModalOpen(true);
  };
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
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Trevor Hunt's Portfolio
          </h1>
        </header>

        <div
          ref={filterBarRef}
          className={isSticky ? "sticky top-0 z-40 bg-gray-100" : ""}
        >
          <FilterBar
            tools={allTools}
            selectedTools={selectedTools}
            onToolToggle={handleToolToggle}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Projects Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Featured Projects
          </h2>

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
                  onViewFamilyTree={
                    project.title === "Family Tree Database"
                      ? showFamilyTreeModal
                      : undefined
                  }
                  onViewCapsim={
                    project.title === "Capsim Simulation"
                      ? showCapsimModal
                      : undefined
                  }
                />
              ))}
              {/* Modal for Family Tree Database and Capsim Simulation */}
              {modalOpen && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
                  onClick={() => setModalOpen(false)}
                >
                  <div
                    className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
                      onClick={() => setModalOpen(false)}
                      aria-label="Close"
                    >
                      &times;
                    </button>
                    {modalContent === "CAPSIM_XLSX" ? (
                      <>
                        <h2 className="text-2xl font-bold mb-4">
                          Capsim Simulation Excel
                        </h2>
                        <a
                          href="/Capsim.xlsx"
                          download
                          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300 mb-4"
                        >
                          Download Capsim.xlsx
                        </a>
                        <p className="text-gray-700">
                          Open the file in Excel or Google Sheets to view the
                          simulation data.
                        </p>
                      </>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold mb-4">
                          Family Tree Database SQL
                        </h2>
                        <pre className="overflow-x-auto overflow-y-auto whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded max-h-[60vh]">
                          {modalContent}
                        </pre>
                      </>
                    )}
                  </div>
                </div>
              )}
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
