import React, { useState, useEffect } from 'react';
import {
  ExpandableSection,
  TextInput,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  Checkbox,
  Button,
  ButtonVariant,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  FormGroup,
  ChipGroup,
  Chip,
  DatePicker,
  TimePicker,
  TimePickerInput,
  Divider,
  Title,
  Badge
} from '@patternfly/react-core';
import {
  SearchIcon,
  FilterIcon,
  TimesIcon,
  CalendarIcon,
  TagIcon,
  DatabaseIcon,
  UserIcon,
  KeyIcon
} from '@patternfly/react-icons';
import { SecretReferenceFilter } from '../../types/secrets';

interface SecretFiltersProps {
  filter: SecretReferenceFilter;
  onFilterChange: (filter: SecretReferenceFilter) => void;
  onClearFilters: () => void;
  providers: Array<{ id: string; name: string; type: string }>;
  namespaces: string[];
  projects: string[];
  teams: string[];
  categories: string[];
}

const SecretFilters: React.FC<SecretFiltersProps> = ({
  filter,
  onFilterChange,
  onClearFilters,
  providers,
  namespaces,
  projects,
  teams,
  categories
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilter, setLocalFilter] = useState<SecretReferenceFilter>(filter);
  const [searchQuery, setSearchQuery] = useState(filter.name || '');
  const [selectedProviders, setSelectedProviders] = useState<string[]>(filter.providerId ? [filter.providerId] : []);
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>(filter.namespace ? [filter.namespace] : []);
  const [selectedProjects, setSelectedProjects] = useState<string[]>(filter.project ? [filter.project] : []);
  const [selectedTeams, setSelectedTeams] = useState<string[]>(filter.team ? [filter.team] : []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(filter.category ? [filter.category] : []);
  const [selectedClassifications, setSelectedClassifications] = useState<string[]>(filter.classification ? [filter.classification] : []);
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>(filter.environment ? [filter.environment] : []);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(filter.priority ? [filter.priority] : []);
  const [selectedTags, setSelectedTags] = useState<string[]>(filter.tags || []);

  // Date picker states
  const [createdAfterDate, setCreatedAfterDate] = useState<string>('');
  const [createdBeforeDate, setCreatedBeforeDate] = useState<string>('');
  const [updatedAfterDate, setUpdatedAfterDate] = useState<string>('');
  const [updatedBeforeDate, setUpdatedBeforeDate] = useState<string>('');
  const [lastRotatedAfterDate, setLastRotatedAfterDate] = useState<string>('');
  const [lastRotatedBeforeDate, setLastRotatedBeforeDate] = useState<string>('');

  useEffect(() => {
    setLocalFilter(filter);
    setSearchQuery(filter.name || '');
    setSelectedProviders(filter.providerId ? [filter.providerId] : []);
    setSelectedNamespaces(filter.namespace ? [filter.namespace] : []);
    setSelectedProjects(filter.project ? [filter.project] : []);
    setSelectedTeams(filter.team ? [filter.team] : []);
    setSelectedCategories(filter.category ? [filter.category] : []);
    setSelectedClassifications(filter.classification ? [filter.classification] : []);
    setSelectedEnvironments(filter.environment ? [filter.environment] : []);
    setSelectedPriorities(filter.priority ? [filter.priority] : []);
    setSelectedTags(filter.tags || []);
  }, [filter]);

  const updateFilter = (updates: Partial<SecretReferenceFilter>) => {
    const newFilter = { ...localFilter, ...updates };
    setLocalFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateFilter({ name: value || undefined });
  };

  const handleProviderChange = (selection: string) => {
    const newProviders = selectedProviders.includes(selection)
      ? selectedProviders.filter(p => p !== selection)
      : [...selectedProviders, selection];
    
    setSelectedProviders(newProviders);
    updateFilter({ providerId: newProviders.length === 1 ? newProviders[0] : undefined });
  };

  const handleNamespaceChange = (selection: string) => {
    const newNamespaces = selectedNamespaces.includes(selection)
      ? selectedNamespaces.filter(n => n !== selection)
      : [...selectedNamespaces, selection];
    
    setSelectedNamespaces(newNamespaces);
    updateFilter({ namespace: newNamespaces.length === 1 ? newNamespaces[0] : undefined });
  };

  const handleProjectChange = (selection: string) => {
    const newProjects = selectedProjects.includes(selection)
      ? selectedProjects.filter(p => p !== selection)
      : [...selectedProjects, selection];
    
    setSelectedProjects(newProjects);
    updateFilter({ project: newProjects.length === 1 ? newProjects[0] : undefined });
  };

  const handleTeamChange = (selection: string) => {
    const newTeams = selectedTeams.includes(selection)
      ? selectedTeams.filter(t => t !== selection)
      : [...selectedTeams, selection];
    
    setSelectedTeams(newTeams);
    updateFilter({ team: newTeams.length === 1 ? newTeams[0] : undefined });
  };

  const handleCategoryChange = (selection: string) => {
    const newCategories = selectedCategories.includes(selection)
      ? selectedCategories.filter(c => c !== selection)
      : [...selectedCategories, selection];
    
    setSelectedCategories(newCategories);
    updateFilter({ category: newCategories.length === 1 ? newCategories[0] : undefined });
  };

  const handleClassificationChange = (selection: string) => {
    const newClassifications = selectedClassifications.includes(selection)
      ? selectedClassifications.filter(c => c !== selection)
      : [...selectedClassifications, selection];
    
    setSelectedClassifications(newClassifications);
    updateFilter({ classification: newClassifications.length === 1 ? newClassifications[0] : undefined });
  };

  const handleEnvironmentChange = (selection: string) => {
    const newEnvironments = selectedEnvironments.includes(selection)
      ? selectedEnvironments.filter(e => e !== selection)
      : [...selectedEnvironments, selection];
    
    setSelectedEnvironments(newEnvironments);
    updateFilter({ environment: newEnvironments.length === 1 ? newEnvironments[0] : undefined });
  };

  const handlePriorityChange = (selection: string) => {
    const newPriorities = selectedPriorities.includes(selection)
      ? selectedPriorities.filter(p => p !== selection)
      : [...selectedPriorities, selection];
    
    setSelectedPriorities(newPriorities);
    updateFilter({ priority: newPriorities.length === 1 ? newPriorities[0] : undefined });
  };

  const handleTagChange = (selection: string) => {
    const newTags = selectedTags.includes(selection)
      ? selectedTags.filter(t => t !== selection)
      : [...selectedTags, selection];
    
    setSelectedTags(newTags);
    updateFilter({ tags: newTags.length > 0 ? newTags : undefined });
  };

  const handleDateChange = (field: string, value: string) => {
    updateFilter({ [field]: value || undefined });
  };

  const clearFilters = () => {
    setLocalFilter({});
    setSearchQuery('');
    setSelectedProviders([]);
    setSelectedNamespaces([]);
    setSelectedProjects([]);
    setSelectedTeams([]);
    setSelectedCategories([]);
    setSelectedClassifications([]);
    setSelectedEnvironments([]);
    setSelectedPriorities([]);
    setSelectedTags([]);
    setCreatedAfterDate('');
    setCreatedBeforeDate('');
    setUpdatedAfterDate('');
    setUpdatedBeforeDate('');
    setLastRotatedAfterDate('');
    setLastRotatedBeforeDate('');
    onClearFilters();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filter.name) count++;
    if (filter.providerId) count++;
    if (filter.namespace) count++;
    if (filter.project) count++;
    if (filter.team) count++;
    if (filter.category) count++;
    if (filter.classification) count++;
    if (filter.environment) count++;
    if (filter.priority) count++;
    if (filter.tags && filter.tags.length > 0) count++;
    if (filter.createdAfter) count++;
    if (filter.createdBefore) count++;
    if (filter.updatedAfter) count++;
    if (filter.updatedBefore) count++;
    if (filter.lastRotatedAfter) count++;
    if (filter.lastRotatedBefore) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="secret-filters">
      <ExpandableSection
        toggleText={
          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
            <FilterIcon />
                         <h4>Filters</h4>
            {activeFilterCount > 0 && (
              <Badge variant="read">{activeFilterCount}</Badge>
            )}
          </Flex>
        }
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
        className="pf-v5-u-mb-md"
      >
        <div className="pf-v5-u-p-md">
          {/* Search and Basic Filters */}
          <Grid hasGutter>
            <GridItem span={6}>
              <FormGroup label="Search">
                <TextInput
                  id="search-input"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search secret names and descriptions..."
                  iconVariant="search"
                />
              </FormGroup>
            </GridItem>
            <GridItem span={6}>
              <FormGroup label="Provider">
                                 <Select
                   variant="checkbox"
                   selections={selectedProviders}
                   onSelect={(event, selection) => handleProviderChange(selection as string)}
                   placeholderText="Select providers"
                 >
                  {providers.map(provider => (
                    <SelectOption key={provider.id} value={provider.id}>
                      {provider.name} ({provider.type})
                    </SelectOption>
                  ))}
                </Select>
              </FormGroup>
            </GridItem>
            <GridItem span={6}>
              <FormGroup label="Namespace">
                                 <Select
                   variant="checkbox"
                   selections={selectedNamespaces}
                   onSelect={(event, selection) => handleNamespaceChange(selection as string)}
                   placeholderText="Select namespaces"

                 >
                  {namespaces.map(namespace => (
                    <SelectOption key={namespace} value={namespace}>
                      {namespace}
                    </SelectOption>
                  ))}
                </Select>
              </FormGroup>
            </GridItem>
            <GridItem span={6}>
              <FormGroup label="Project">
                                 <Select
                   variant="checkbox"
                   selections={selectedProjects}
                   onSelect={(event, selection) => handleProjectChange(selection as string)}
                   placeholderText="Select projects"

                 >
                  {projects.map(project => (
                    <SelectOption key={project} value={project}>
                      {project}
                    </SelectOption>
                  ))}
                </Select>
              </FormGroup>
            </GridItem>
          </Grid>

          <Divider className="pf-v5-u-my-lg" />

          {/* Metadata Filters */}
          <Title headingLevel="h5" className="pf-v5-u-mb-md">
            <TagIcon className="pf-v5-u-mr-sm" />
            Metadata Filters
          </Title>
          
          <Grid hasGutter>
            <GridItem span={6}>
              <FormGroup label="Category">
                                 <Select
                   variant="checkbox"
                   selections={selectedCategories}
                   onSelect={(event, selection) => handleCategoryChange(selection as string)}
                   placeholderText="Select categories"

                 >
                  {categories.map(category => (
                    <SelectOption key={category} value={category}>
                      {category}
                    </SelectOption>
                  ))}
                </Select>
              </FormGroup>
            </GridItem>
            <GridItem span={6}>
              <FormGroup label="Team">
                                 <Select
                   variant="checkbox"
                   selections={selectedTeams}
                   onSelect={(event, selection) => handleTeamChange(selection as string)}
                   placeholderText="Select teams"

                 >
                  {teams.map(team => (
                    <SelectOption key={team} value={team}>
                      {team}
                    </SelectOption>
                  ))}
                </Select>
              </FormGroup>
            </GridItem>
            <GridItem span={6}>
              <FormGroup label="Classification">
                                 <Select
                   variant="checkbox"
                   selections={selectedClassifications}
                   onSelect={(event, selection) => handleClassificationChange(selection as string)}
                   placeholderText="Select classifications"

                 >
                  <SelectOption value="public">Public</SelectOption>
                  <SelectOption value="internal">Internal</SelectOption>
                  <SelectOption value="confidential">Confidential</SelectOption>
                  <SelectOption value="restricted">Restricted</SelectOption>
                  <SelectOption value="secret">Secret</SelectOption>
                </Select>
              </FormGroup>
            </GridItem>
            <GridItem span={6}>
              <FormGroup label="Environment">
                                 <Select
                   variant="checkbox"
                   selections={selectedEnvironments}
                   onSelect={(event, selection) => handleEnvironmentChange(selection as string)}
                   placeholderText="Select environments"

                 >
                  <SelectOption value="development">Development</SelectOption>
                  <SelectOption value="staging">Staging</SelectOption>
                  <SelectOption value="production">Production</SelectOption>
                  <SelectOption value="testing">Testing</SelectOption>
                </Select>
              </FormGroup>
            </GridItem>
            <GridItem span={6}>
              <FormGroup label="Priority">
                                 <Select
                   variant="checkbox"
                   selections={selectedPriorities}
                   onSelect={(event, selection) => handlePriorityChange(selection as string)}
                   placeholderText="Select priorities"

                 >
                  <SelectOption value="low">Low</SelectOption>
                  <SelectOption value="medium">Medium</SelectOption>
                  <SelectOption value="high">High</SelectOption>
                  <SelectOption value="critical">Critical</SelectOption>
                </Select>
              </FormGroup>
            </GridItem>
            <GridItem span={6}>
              <FormGroup label="Tags">
                                 <Select
                   variant="checkbox"
                   selections={selectedTags}
                   onSelect={(event, selection) => handleTagChange(selection as string)}
                   placeholderText="Select tags"

                 >
                  <SelectOption value="database">Database</SelectOption>
                  <SelectOption value="api">API</SelectOption>
                  <SelectOption value="credentials">Credentials</SelectOption>
                  <SelectOption value="certificates">Certificates</SelectOption>
                  <SelectOption value="keys">Keys</SelectOption>
                </Select>
              </FormGroup>
            </GridItem>
          </Grid>

          <Divider className="pf-v5-u-my-lg" />

          {/* Date Filters */}
          <Title headingLevel="h5" className="pf-v5-u-mb-md">
            <CalendarIcon className="pf-v5-u-mr-sm" />
            Date Filters
          </Title>
          
          <Grid hasGutter>
            <GridItem span={6}>
                             <FormGroup label="Created After">
                 <DatePicker
                   value={createdAfterDate}
                   onChange={(value) => {
                     setCreatedAfterDate(value);
                     handleDateChange('createdAfter', value);
                   }}
                   placeholder="MM/DD/YYYY"
                 />
               </FormGroup>
            </GridItem>
            <GridItem span={6}>
                             <FormGroup label="Created Before">
                 <DatePicker
                   value={createdBeforeDate}
                   onChange={(value) => {
                     setCreatedBeforeDate(value);
                     handleDateChange('createdBefore', value);
                   }}
                   placeholder="MM/DD/YYYY"
                 />
               </FormGroup>
            </GridItem>
            <GridItem span={6}>
              <FormGroup label="Updated After">
                <DatePicker
                  value={updatedAfterDate}
                  onChange={(value) => {
                    setUpdatedAfterDate(value);
                    handleDateChange('updatedAfter', value);
                  }}
                  placeholder="MM/DD/YYYY"
                />
              </FormGroup>
            </GridItem>
            <GridItem span={6}>
              <FormGroup label="Updated Before">
                <DatePicker
                  value={updatedBeforeDate}
                  onChange={(value) => {
                    setUpdatedBeforeDate(value);
                    handleDateChange('updatedBefore', value);
                  }}
                  placeholder="MM/DD/YYYY"
                />
              </FormGroup>
            </GridItem>
            <GridItem span={6}>
              <FormGroup label="Last Rotated After">
                <DatePicker
                  value={lastRotatedAfterDate}
                  onChange={(value) => {
                    setLastRotatedAfterDate(value);
                    handleDateChange('lastRotatedAfter', value);
                  }}
                  placeholder="MM/DD/YYYY"
                />
              </FormGroup>
            </GridItem>
            <GridItem span={6}>
              <FormGroup label="Last Rotated Before">
                <DatePicker
                  value={lastRotatedBeforeDate}
                  onChange={(value) => {
                    setLastRotatedBeforeDate(value);
                    handleDateChange('lastRotatedBefore', value);
                  }}
                  placeholder="MM/DD/YYYY"
                />
              </FormGroup>
            </GridItem>
          </Grid>

          {/* Action Buttons */}
          <div className="pf-v5-u-mt-lg">
            <Flex gap={{ default: 'gapMd' }}>
              <Button
                variant={ButtonVariant.secondary}
                onClick={clearFilters}
                icon={<TimesIcon />}
              >
                Clear All Filters
              </Button>
              <Button
                variant={ButtonVariant.primary}
                onClick={() => setIsExpanded(false)}
              >
                Apply Filters
              </Button>
            </Flex>
          </div>
        </div>
      </ExpandableSection>
    </div>
  );
};

export default SecretFilters;
