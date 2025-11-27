import React from "react";
import { FunnelIcon } from "@heroicons/react/24/outline";

const FILTER_LEVELS = [6, 5, 4, 3, 2, 1, 0];

export default function ActiveFilters({ filters, currentRound }) {
  const filtersToShow = filters.slice(0, FILTER_LEVELS[currentRound]);
  const removedFilters = filters.slice(FILTER_LEVELS[currentRound]);

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
        <FunnelIcon className="w-5 h-5 text-gray-800" strokeWidth={1.1} />
        <span>Active Filters ({filtersToShow.length})</span>
      </div>

      {filtersToShow.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {filtersToShow.map((filter, index) => (
            <div
              key={index}
              className="p-2 bg-red-50 border border-red-200 rounded-md text-xs"
            >
              <div className="font-medium text-red-800">{filter.name}</div>
              <div className="text-red-600">{filter.description}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
          <div className="font-medium">🎉 No filters applied!</div>
          <div className="text-xs mt-1">
            The audio is completely clear. Final chance to guess!
          </div>
        </div>
      )}

      {removedFilters.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-gray-500 mb-2">Removed filters:</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {removedFilters.map((filter, index) => (
              <div
                key={index}
                className="p-2 bg-green-50 border border-green-200 rounded-md text-xs opacity-60"
              >
                <div className="font-medium text-green-700 line-through">
                  {filter.name}
                </div>
                <div className="text-green-600 text-xs">
                  {filter.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
