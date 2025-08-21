import React from "react";

interface FilterBarProps {
  tools: string[];
  selectedTools: string[];
  onToolToggle: (tool: string) => void;
  onClearFilters: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  tools,
  selectedTools,
  onToolToggle,
  onClearFilters,
}) => {
  return (
    <div className="mb-8 p-6 bg-gray-50 rounded-lg">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Filter by Tools
          </h3>
          {selectedTools.length > 0 && (
            <button
              onClick={onClearFilters}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear all filters
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {tools.map((tool) => {
            const isSelected = selectedTools.includes(tool);
            return (
              <button
                key={tool}
                onClick={() => onToolToggle(tool)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {tool}
              </button>
            );
          })}
        </div>

        {selectedTools.length > 0 && (
          <p className="text-sm text-gray-600">
            Filtering by: {selectedTools.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
