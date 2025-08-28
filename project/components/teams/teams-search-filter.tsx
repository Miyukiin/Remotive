import { Filter, Search } from "lucide-react";
import { FC } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

type TeamsSearchFilterProps = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterOption: string;
  setFilterOption: (value: string) => void;
};

const filterOptions = ["Ascending (A-Z)", "Descending (Z-A)", "Newest First", "Oldest First"] as const;

const TeamsSearchFilter: FC<TeamsSearchFilterProps> = ({
  searchTerm,
  setSearchTerm,
  filterOption,
  setFilterOption,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-payne's_gray-500 dark:text-french_gray-400"
          size={16}
        />
        <Input
          type="text"
          placeholder="Search for a team..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="justify-start sm:justify-center">
            <Filter size={16} className="mr-2 h-4 w-4" />
            Filter by: {filterOption}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {filterOptions.map((option) => (
            <DropdownMenuItem key={option} onClick={() => setFilterOption(option)}>
              {option}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TeamsSearchFilter;
