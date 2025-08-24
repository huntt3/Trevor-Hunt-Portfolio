import React, { useState, useEffect, useMemo, useRef } from "react";
import ProjectCard from "./ProjectCard";
import CertificationCard from "./CertificationCard";
import FilterBar from "./FilterBar";
import Pagination from "./Pagination";
import type { ProjectData, CertificationData } from "../types/project";

const Portfolio: React.FC = () => {
  // Pagination configuration - responsive items per page
  const useResponsiveItemsPerPage = () => {
    const [itemsPerPage, setItemsPerPage] = useState(6);

    useEffect(() => {
      const updateItemsPerPage = () => {
        const width = window.innerWidth;
        if (width < 768) {
          // Mobile: fewer items to reduce scrolling
          setItemsPerPage(4);
        } else if (width < 1024) {
          // Tablet: moderate amount
          setItemsPerPage(6);
        } else {
          // Desktop: more items since we have more space
          setItemsPerPage(9);
        }
      };

      updateItemsPerPage();
      window.addEventListener("resize", updateItemsPerPage);
      return () => window.removeEventListener("resize", updateItemsPerPage);
    }, []);

    return itemsPerPage;
  };

  const itemsPerPage = useResponsiveItemsPerPage();

  // Pagination state
  const [currentProjectPage, setCurrentProjectPage] = useState(1);
  const [currentCertificationPage, setCurrentCertificationPage] = useState(1);

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
    const response = await fetch("huntt3_Pt1Lab5.txt");
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
          fetch("projectWebsites.json"),
          fetch("certifications.json"),
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

  // Pagination calculations for projects
  const totalProjectPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentProjectPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProjects.slice(startIndex, endIndex);
  }, [filteredProjects, currentProjectPage, itemsPerPage]);

  // Pagination calculations for certifications
  const totalCertificationPages = Math.ceil(
    filteredCertifications.length / itemsPerPage
  );
  const paginatedCertifications = useMemo(() => {
    const startIndex = (currentCertificationPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCertifications.slice(startIndex, endIndex);
  }, [filteredCertifications, currentCertificationPage, itemsPerPage]);

  const handleToolToggle = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
    // Reset to first page when filters change
    setCurrentProjectPage(1);
    setCurrentCertificationPage(1);
  };

  const handleClearFilters = () => {
    setSelectedTools([]);
    // Reset to first page when clearing filters
    setCurrentProjectPage(1);
    setCurrentCertificationPage(1);
  };

  // Pagination handlers
  const handleProjectPageChange = (page: number) => {
    setCurrentProjectPage(page);
    // Scroll to top of projects section for better UX
    const projectsSection = document.getElementById("projects-section");
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCertificationPageChange = (page: number) => {
    setCurrentCertificationPage(page);
    // Scroll to top of certifications section for better UX
    const certificationsSection = document.getElementById(
      "certifications-section"
    );
    if (certificationsSection) {
      certificationsSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
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
        <section id="projects-section" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Featured Projects
          </h2>

          <div className="mb-6">
            <p className="text-gray-600">
              Showing {Math.min(itemsPerPage, filteredProjects.length)} of{" "}
              {filteredProjects.length} projects
              {filteredProjects.length !== allProjects.length && (
                <span> (filtered from {allProjects.length} total)</span>
              )}
              {selectedTools.length > 0 && (
                <span className="block sm:inline">
                  {" "}
                  filtered by: {selectedTools.join(", ")}
                </span>
              )}
            </p>
          </div>

          {filteredProjects.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProjects.map((project, index) => (
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
                            href="Capsim.xlsx"
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

              {/* Projects Pagination */}
              {totalProjectPages > 1 && (
                <Pagination
                  currentPage={currentProjectPage}
                  totalPages={totalProjectPages}
                  onPageChange={handleProjectPageChange}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredProjects.length}
                />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                No projects found matching your selected filters.
              </p>
            </div>
          )}
        </section>

        {/* Certifications Section */}
        <section id="certifications-section" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Certifications
          </h2>

          <div className="mb-6">
            <p className="text-gray-600">
              Showing {Math.min(itemsPerPage, filteredCertifications.length)} of{" "}
              {filteredCertifications.length} certifications
              {filteredCertifications.length !== allCertifications.length && (
                <span> (filtered from {allCertifications.length} total)</span>
              )}
              {selectedTools.length > 0 && (
                <span className="block sm:inline">
                  {" "}
                  filtered by: {selectedTools.join(", ")}
                </span>
              )}
            </p>
          </div>

          {filteredCertifications.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedCertifications.map((certification, index) => (
                  <CertificationCard
                    key={`certification-${certification.title}-${index}`}
                    certification={certification}
                  />
                ))}
              </div>

              {/* Certifications Pagination */}
              {totalCertificationPages > 1 && (
                <Pagination
                  currentPage={currentCertificationPage}
                  totalPages={totalCertificationPages}
                  onPageChange={handleCertificationPageChange}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredCertifications.length}
                />
              )}
            </>
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
